package backend
import java.util.*
import kotlinx.serialization.*
import kotlinx.serialization.json.*
import java.time.Duration;
import java.time.Instant;

@Serializable
data class Player(val name: String) {
    override fun equals(other: Any?): Boolean{
        if (this === other) return true
        if (other?.javaClass != javaClass) return false
        other as Player
        return name == other.name
    }

    // TODO: hash code
}

@Serializable
sealed class BookEntry{abstract val author: Player}

@Serializable
class DescriptionBookEntry(override val author: Player, val description: String) : BookEntry()

@Serializable
class ImageBookEntry(override val author: Player, val imageUrl: String, val replayDrawings: String) : BookEntry()

@Serializable
data class Book(val creator: Player) {
    val entries = mutableListOf<BookEntry>()
    var actors = mutableListOf<Player>()
}

@Serializable
data class GameSettings(val rounds: Int)

@Serializable
enum class GameStatus {
    NotStarted,
    InProgress,
    PresentingSummary,
    Complete
}

@Serializable
data class PresentationState(var bookOwner: String, var pageNumber: Int)

@Serializable
class GameState(val name: String, val creator: String, val id: String = UUID.randomUUID().toString()
    ,var gameSettings:GameSettings = GameSettings(5),
    var gameStatus:GameStatus = GameStatus.NotStarted,
    @Transient
    val creationTime: Instant = Instant.now()) {
    val players = mutableListOf<Player>()
    val books = mutableListOf<Book>()
    var presentationState: PresentationState? = null

    fun serialize(): String {
        return Json { encodeDefaults = true ; prettyPrint = true }.encodeToString(this)
    }

    fun startGame(settings: GameSettings?) {
        gameSettings = settings ?: gameSettings
        gameStatus = GameStatus.InProgress
        prepareActors()
    }

    fun addPlayer(name: String): Boolean {
        // TODO: assert unique
        val player = Player(name)
        players += player       
        
        return true
    }

    fun prepareActors() {
        players.forEach {
            books += Book(it)
        }
        val sudo = Sudoku(players.size)
        sudo.generate()

        val shuffledPlayers = players.shuffled()
        shuffledPlayers.forEachIndexed { idx, player ->
            val book = books.first { it.creator == player }
            book.actors = sudo.arr[idx].map { shuffledPlayers[it!!] }.toMutableList()
        }
    }

    // Called once an actor has completed a task
    fun addBookEntry(book: Book, entry: BookEntry) {
        book.entries += entry
    }

    fun startPresentation() {
        gameStatus = GameStatus.PresentingSummary
        presentationState = PresentationState(books.first().creator.name, 0)
    }

    fun presentNext() {
        val state = presentationState
        if (state != null) {
            if (state.pageNumber == gameSettings.rounds - 1) {
                // Go to next book
                val currentBookIdx = books.indexOfFirst { book -> book.creator.name == state.bookOwner }
                state.bookOwner = books[currentBookIdx + 1].creator.name
                state.pageNumber = 0 
            } else {
                state.pageNumber++
            }
        }
    }

    fun endGame() {
        gameStatus = GameStatus.Complete
    }

    fun undoSubmission(book: Book): BookEntry {
        val entry = book.entries.last()
        book.entries.removeLast()
        return entry
    }
}
