package backend
import java.util.*

data class Player(val name: String)

open class BookEntry(val author: Player)
class DescriptionBookEntry(author: Player, val description: String) : BookEntry(author)
class ImageBookEntry(author: Player, val imageUrl: String) : BookEntry(author)
data class Book(val creator: Player) {
    val entries = mutableListOf<BookEntry>()
}

data class GameSettings(val rounds: Int)
enum class GameStatus {
    NotStarted,
    InProgress,
    Complete
}

data class GameState(val id: String = UUID.randomUUID().toString()) {
    val gameSettings = GameSettings(5)
    var gameStatus = GameStatus.NotStarted
    val players = mutableListOf<Player>()
    val books = mutableListOf<Book>()

}