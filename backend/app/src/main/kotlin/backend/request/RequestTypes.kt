package backend.request
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
data class UploadDrawing(val gameId: String, val bookId: String, val imageData: String, val user: GameUser)

@Serializable
data class UploadDescription(val gameId: String, val bookId: String, val description: String, val user: GameUser)
