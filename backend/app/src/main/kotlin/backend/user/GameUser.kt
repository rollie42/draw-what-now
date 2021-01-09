package backend.user
import java.util.*
import kotlinx.serialization.Serializable

@Serializable
data class GameUser(val name: String) {
    val id: String = UUID.randomUUID().toString()
}