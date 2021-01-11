package backend
import java.util.*

data class Player(val name: String) {
    override fun equals(other: Any?): Boolean{
        if (this === other) return true
        if (other?.javaClass != javaClass) return false
        other as Player
        return name == other.name
    }

    // TODO: hash code
}

open class BookEntry(val author: Player)
class DescriptionBookEntry(author: Player, val description: String) : BookEntry(author)
class ImageBookEntry(author: Player, val imageUrl: String) : BookEntry(author)

data class Book(val creator: Player) {
    val entries = mutableListOf<BookEntry>()
    var currentActor: Player? = null

    val availableDescribers = mutableListOf<Player>()
    val availableDrawers = mutableListOf<Player>()
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

    fun startGame() {
        prepareActors()
    }

    fun addPlayer(name: String) {
        // TODO: assert unique
        val player = Player(name)
        players += player
        books += Book(player)
    }

    fun prepareActors() {
        /* 
        Strategy for selecting book actor
            Rules:
            1) nobody ever gets the same book twice
            2) everyone draws and describes an equal number of times (option)

            For each book, randomly construct a pool of drawers and describers. If (2),
            that pool should be equal to the number of rounds. Whenever a book needs an actor,
            one from its predefined pool will be selected, selecting people with the fewest 
            completed actions first.            
        */

        data class ActorBuilder(val player: Player) {
            var describeCnt = 0
            var drawCnt = 0
        }

        var actorBuilders = players.map { ActorBuilder(it) }

        repeat(gameSettings.rounds - 1) { idx ->
            books.forEach { book ->
                val isDraw = idx % 2 == 0
                val target = if (isDraw) book.availableDrawers else book.availableDescribers
                val sel = { a: ActorBuilder -> if (isDraw) a.drawCnt else a.describeCnt }
                var options = actorBuilders.filter { it.player != book.creator && !target.contains(it.player) }
                val min = options.minOf{ sel(it) }
                val choice = options.filter{sel(it) == min}.random()
                target += choice.player
                if (isDraw) {
                    choice.drawCnt += 1
                } else {
                    choice.describeCnt += 1
                }
            }
        }
    }

    // Called once an actor has completed a task
    fun addBookEntry(book: Book, entry: BookEntry) {
        val isDraw = entry is DescriptionBookEntry
        book.entries += entry

        if (book.entries.size == gameSettings.rounds) {
            book.currentActor = null
            return
        }
        
        val target = if (isDraw) book.availableDrawers else book.availableDescribers

        val choice = target.random()
        target -= choice
        book.currentActor = choice
    }
}