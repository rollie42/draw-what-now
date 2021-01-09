package backend

import backend.user.*
import java.util.concurrent.atomic.*
import java.util.*

import io.ktor.server.engine.embeddedServer
import io.ktor.routing.*
import io.ktor.server.netty.Netty
import io.ktor.application.*
import io.ktor.features.CallLogging
import io.ktor.features.DefaultHeaders
import io.ktor.http.*
import io.ktor.features.*
import io.ktor.request.*
import io.ktor.response.*
import io.ktor.serialization.*
import io.ktor.http.cio.websocket.*
import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.auth.*
import io.ktor.http.HttpStatusCode
import io.ktor.sessions.*

import io.ktor.routing.*

class Connection(val session: DefaultWebSocketSession) {
    companion object {
        var lastId = AtomicInteger(0)
    }
    val name = "user${lastId.getAndIncrement()}"
}

fun main(args: Array<String>): Unit = io.ktor.server.netty.EngineMain.main(args)

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
    routing {
        println("Hello world")
        val connections = Collections.synchronizedSet<Connection?>(LinkedHashSet())
        val games = mutableListOf<GameState>()
        post("/login") {
            println("Get login?")
            val login = call.receive<backend.request.Login>()
            call.respond(GameUser(login.name))
        }
        post("/createGame") {
            val user = call.receive<backend.request.CreateGame>()
            val gameState = GameState()
            games += gameState
        }
        // post("/uploadDrawing") {
        //     val drawing = call.receive<backend.request.UploadDrawing>()
        //     // TODO: Validate image size, etc
        //     drawing.imageId
        // }
        post("/uploadDescription") {
            val description = call.receive<backend.request.UploadDescription>()
            description.description
        }
        // post("/addDrawing/{id}") {
        //     // TODO: identity vs body content
        //     val gameState = 
        //     connections.forEach {
        //         it.session.send(gameState)
        //     }
        // }
        // webSocket("/subscribe") {
        //     val thisConnection = Connection(this)
        //     connections += thisConnection
        //     for(frame in incoming) {
        //         frame as? Frame.Text ?: continue
        //         val receivedText = frame.readText()
        //         send("You said: $receivedText")
        //     }
        // }
    }
}
