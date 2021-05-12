package backend.backend.response

import backend.BookEntry
import backend.GameState
import kotlinx.serialization.Serializable


@Serializable
data class UndoSubmissionResponse (val success: Int, val gameState: GameState, val data: BookEntry? = null)