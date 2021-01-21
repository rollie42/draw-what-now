package backend

import backend.user.*
import backend.storage.*
import java.util.concurrent.atomic.*
import java.util.*
import java.time.*
import java.io.File

import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*
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
        val games = mutableMapOf<GameState, ConflatedBroadcastChannel<GameState>>()
        val storageApi = StorageApi()
        get("/") {
            call.respond("Hello user!")
        }
        post("/login") {
            val login = call.receive<backend.request.Login>()
            call.respond(GameUser(login.name))
        }
        post("/createGame") {
            val params = call.receive<backend.request.CreateGame>()
            val gameState = GameState(params.gameName, params.user.name)
            games[gameState] = ConflatedBroadcastChannel<GameState>()
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
                    games[gameState]?.send(gameState)
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
            games[gameState]?.send(gameState)
            call.respond(gameState)
        }
        post("/uploadDrawing") {
            val drawing = call.receive<backend.request.UploadDrawing>()
            val bytes = Base64.getDecoder().decode(drawing.imageData)
                       
            // TODO: Validate image size, etc
            
            val gameState = games.keys.first{ it.id == drawing.gameId }
            val book = gameState.books.first { it.creator.name == drawing.bookCreator }!!
            val url = storageApi.Upload(bytes)
            gameState.addBookEntry(book, ImageBookEntry(Player(drawing.user.name), url))
            games[gameState]?.send(gameState)
            call.respond(gameState)
        }
        post("/uploadDescription") {
            val description = call.receive<backend.request.UploadDescription>()
            val gameState = games.keys.first{ it.id == description.gameId }
            val book = gameState.books.first { it.creator.name == description.bookCreator }
            gameState.addBookEntry(book, DescriptionBookEntry(Player(description.user.name), description.description))
            games[gameState]?.send(gameState)
            call.respond(gameState)
        }
        post("/startPresentation") {
            val params = call.receive<backend.request.StartPresentation>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.startPresentation()
            games[gameState]?.send(gameState)
            call.respond(gameState)
        }
        post("/presentNext") {
            val params = call.receive<backend.request.PresentNext>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.presentNext()
            games[gameState]?.send(gameState)
            call.respond(gameState)       
        }
        post("/endGame") {
            val params = call.receive<backend.request.EndGame>()
            val gameState = games.keys.first{ it.id == params.gameId }
            gameState.endGame()
            games[gameState]?.send(gameState)
            call.respond(gameState)            
        }
        get("/fakeGameState") {
            val gameStateText = """{ "name": "Test Game9971", "id": "05988475-5604-4821-841d-58d8a6f6c633", "gameStatus": "PresentingSummary", "players": [{ "name": "bob" }, { "name": "sam" }, { "name": "jenny" }, { "name": "mark" }, { "name": "takeshi" }], "books": [{ "creator": { "name": "bob" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "sam" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/5125e598-cb16-424c-be79-e68e2a5e7ffd.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "takeshi" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/32a5076d-0fa5-4646-8b1b-f2b90bed2df3.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description4" }] }, { "creator": { "name": "sam" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "mark" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/84415ef4-e8b3-4b04-bfad-d43685c7f15b.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "jenny" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/7d5aecc6-1781-4b93-9e98-4b90c29e2851.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description4" }] }, { "creator": { "name": "jenny" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "bob" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/c0f4517d-6741-4373-af21-4312e412b9db.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "mark" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/b797f281-24ec-4fd6-bcdd-60968a46d848.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description4" }] }, { "creator": { "name": "mark" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "takeshi" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/60aa50b5-c186-4c4a-9b8f-f79af3e60799.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "sam" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/8a20ad14-f6e9-4339-b41d-6f076de8f724.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description4" }] }, { "creator": { "name": "takeshi" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "jenny" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/23c16ff3-9f64-4bc9-aa60-f528f6a91ea7.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "bob" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/0bfb1807-2e7e-41f6-9e93-8b874015200d.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description4" }] }], "presentationState": { "bookOwner": "bob", "pageNumber": 0 } }"""
            val gameState = Json.decodeFromString<GameState>(gameStateText)
            games[gameState] = ConflatedBroadcastChannel <GameState>()
            call.respond(gameState)
        }
        webSocket("/subscribe/{id}") {
            val id = call.parameters["id"]
            val gameState = games.keys.first{ it.id == id }
            val channel = games[gameState]!!
            println("Got a subscription!")  
            channel.consumeEach { state ->
                val json = Json { encodeDefaults = true ; prettyPrint = true }.encodeToString(state)
                send(json)
            }
        }
    }
}
