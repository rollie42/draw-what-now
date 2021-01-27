export default class GameState {
    constructor(data) {
        Object.assign(this, data)
    }

    isPresenting = () => this.gameStatus === "PresentingSummary"
    isDonePresenting = () =>
        this.gameStatus === "PresentingSummary"
        && this.presentationState.pageNumber === this.gameSettings.rounds - 1
        && this.presentationState.bookOwner === this.books[this.books.length - 1].creator.name
    isGameOver = () => this.gameStatus === "Complete"

}
