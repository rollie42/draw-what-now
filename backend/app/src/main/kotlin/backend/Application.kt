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
import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.auth.*
import io.ktor.http.HttpStatusCode
import io.ktor.sessions.*


import io.ktor.routing.*

fun main(args: Array<String>): Unit = io.ktor.server.cio.EngineMain.main(args)

fun Application.module() {
    install(CORS) {
        anyHost()
        header(HttpHeaders.AccessControlAllowHeaders)
        header(HttpHeaders.ContentType)
        header(HttpHeaders.AccessControlAllowOrigin)
    }
    install(ContentNegotiation) {
        json()
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
        val games = mutableMapOf<GameState, Channel<GameState>>()
        val storageApi = StorageApi()
        post("/login") {
            println("Get login?")
            val login = call.receive<backend.request.Login>()
            call.respond(GameUser(login.name))
        }
        post("/createGame") {
            val user = call.receive<backend.request.CreateGame>()
            val gameState = GameState()
            games[gameState] = Channel<GameState>()
        }
        post("/uploadDrawing") {
            val drawing = call.receive<backend.request.UploadDrawing>()
            val bytes = Base64.getDecoder().decode(drawing.imageData)
                       
            // TODO: Validate image size, etc
            
            val gameState = games.keys.first{ it.id == drawing.gameId }!!
            val book = gameState.books.first { it.creator.name == drawing.bookCreator }!!
            val url = storageApi.Upload(bytes)
            gameState.addBookEntry(book, ImageBookEntry(Player(drawing.user.name), url))
        }
        post("/uploadDescription") {
            val description = call.receive<backend.request.UploadDescription>()
            val gameState = games.keys.first{ it.id == description.gameId }!!
            val book = gameState.books.first { it.creator.name == description.bookCreator }!!
            gameState.addBookEntry(book, DescriptionBookEntry(Player(description.user.name), description.description))
        }
        webSocket("/subscribe/{id}") {
            val id = call.parameters["id"]
            val gameState = games.keys.first{ it.id == id }!!
            println(id)
            val channel = games[gameState]!!
            for (state in channel)
                send(Json.encodeToString(state))
        }
    }
}
