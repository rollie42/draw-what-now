package backend.request

import backend.*
import backend.user.*
import java.util.*
import kotlinx.serialization.Serializable

@Serializable
data class Login(val name: String)

@Serializable
data class CreateGame(val gameName: String, val user: GameUser) {
    val id: String = UUID.randomUUID().toString()
}

@Serializable
data class JoinGame(val gameName: String, val user: GameUser) 

@Serializable
data class StartGame(val gameId: String, val settings: GameSettings, val user: GameUser)

@Serializable
data class UploadDrawing(val gameId: String, val bookCreator: String, val imageData: String, val replayDrawings: String, val user: GameUser)

@Serializable
data class UploadDescription(val gameId: String, val bookCreator: String, val description: String, val user: GameUser)

@Serializable
data class UndoSubmission(val gameId: String, val bookCreator: String, val user: GameUser)

@Serializable
data class StartPresentation(val gameId: String, val user: GameUser)

@Serializable
data class PresentNext(val gameId: String, val user: GameUser)

@Serializable
data class EndGame(val gameId: String, val user: GameUser)
