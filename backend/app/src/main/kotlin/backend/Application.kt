package backend

import backend.backend.response.UndoSubmissionResponse
import backend.user.*
import backend.storage.*
import java.util.concurrent.atomic.*
import java.util.*
import java.time.*
import java.io.File

import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*

import org.slf4j.event.Level

import io.ktor.server.engine.embeddedServer
import io.ktor.routing.*
import io.ktor.server.cio.*
import io.ktor.application.*
import io.ktor.features.CallLogging
import io.ktor.features.DefaultHeaders
import io.ktor.http.*
import io.ktor.features.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.serialization.*
import io.ktor.http.cio.websocket.*
import io.ktor.websocket.*
import io.ktor.auth.*
import io.ktor.http.HttpStatusCode
import io.ktor.sessions.*
import io.ktor.routing.*

import java.time.Duration
import java.time.Instant

import kotlin.collections.*

fun main(args: Array<String>): Unit = io.ktor.server.cio.EngineMain.main(args)

@Serializable
data class ErrorResponse(val message: String) {
    val type = "error"
}

fun Application.module() {
    install(CORS) {
        anyHost()
        header(HttpHeaders.AccessControlAllowHeaders)
        header(HttpHeaders.ContentType)
        header(HttpHeaders.AccessControlAllowOrigin)
    }
    install(ContentNegotiation) {
        json(Json {
            encodeDefaults = true
        })
    }
    install(CallLogging) {
        level = Level.INFO
    }
    install(WebSockets) {
        pingPeriod = Duration.ofSeconds(60) // Disabled (null) by default
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE // Disabled (max value). The connection will be closed if surpassed this length.
        masking = false
    }

    

    routing {
        val storageApi = StorageApi()
        val games = mutableMapOf<GameState, MutableStateFlow<String>>()

        GlobalScope.launch {
            while (true) {
                delay(100000)
                games.keys.removeAll{Duration.between(it.creationTime, Instant.now()).toMinutes() > 120}
            }
        }
        
        get("/") {
            call.respond("Hello user!")
        }
        get("/state/{id}") {
            val gameId = call.parameters["id"]
            val gameState = games.keys.first{ it.id == gameId }
            call.respond(gameState)
        }
        post("/login") {
            val login = call.receive<backend.request.Login>()
            call.respond(GameUser(login.name))
        }
        post("/createGame") {
            val params = call.receive<backend.request.CreateGame>()
            val gameState = GameState(params.gameName, params.user.name)
            games[gameState] = MutableStateFlow(gameState.serialize())
            call.respond(gameState)
        }
        post("/joinGame") {
            val params = call.receive<backend.request.JoinGame>()
            val gameState = games.keys.firstOrNull{ it.name == params.gameName }
            if (gameState == null)
                call.respond(ErrorResponse("Game doesn't exist"))
            else if (gameState.gameStatus != GameStatus.NotStarted)
                call.respond(ErrorResponse("Game not accepting new players ${gameState.gameStatus}"))
            else {
                if (gameState.addPlayer(params.user.name)) {
                    // Success!
                    games[gameState]?.emit(gameState.serialize())
                    call.respond(gameState)
                } else {
                    call.respond(ErrorResponse("Couldn't add player"))
                }
            }
        }
        post("/startGame") {
            val gameSettings = call.receive<backend.request.StartGame>()
            val gameState = games.keys.first{ it.id == gameSettings.gameId }
            gameState.startGame(gameSettings.settings)
            // TODO: verify gameState is notStarted, settings are ok, etc
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        post("/uploadDrawing") {
            val drawing = call.receive<backend.request.UploadDrawing>()
            val bytes = Base64.getDecoder().decode(drawing.imageData)

            // TODO: Validate image size, etc

            val gameState = games.keys.first{ it.id == drawing.gameId }
            val book = gameState.books.first { it.creator.name == drawing.bookCreator }!!
            val url = storageApi.Upload(bytes)
            gameState.addBookEntry(book, ImageBookEntry(Player(drawing.user.name), url, drawing.replayDrawings))
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        post("/uploadDescription") {
            val description = call.receive<backend.request.UploadDescription>()
            val gameState = games.keys.first{ it.id == description.gameId }
            val book = gameState.books.first { it.creator.name == description.bookCreator }
            gameState.addBookEntry(book, DescriptionBookEntry(Player(description.user.name), description.description))
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        post("/undoSubmission") {
            val params = call.receive<backend.request.UndoSubmission>()
            val gameState = games.keys.first{ it.id == params.gameId }
            val book = gameState.books.first { it.creator.name == params.bookCreator }
            if (book.entries.last()?.author?.name == params.user.name) {
                val entry = gameState.undoSubmission(book)
                call.respond(UndoSubmissionResponse(1, gameState, entry))
                games[gameState]?.emit(gameState.serialize())
            } else {
                call.respond(UndoSubmissionResponse(0, gameState))
            }
        }
        post("/startPresentation") {
            val params = call.receive<backend.request.StartPresentation>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.startPresentation()
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        post("/presentNext") {
            val params = call.receive<backend.request.PresentNext>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.presentNext()
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        post("/endGame") {
            val params = call.receive<backend.request.EndGame>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.endGame()
            games[gameState]?.emit(gameState.serialize())
            call.respond(gameState)
        }
        webSocket("/subscribe/{id}") {
            val id = call.parameters["id"]
            val gameState = games.keys.first{ it.id == id }
            val channel = games[gameState]!!
            println("Got a subscription!")
            channel.collect { json ->
                //val json = Json { encodeDefaults = true ; prettyPrint = true }.encodeToString(state)
                // println(json)
                send(json)
            }
        }
    }
}
