export class Book {
    constructor(data) {
        Object.assign(this, data)
    }

    currentActor = () => this.actors[this.entries.length]
}

export class GameState {
    constructor(data) {
        Object.assign(this, data)
        this.books = this.books.map(book => new Book(book))
    }

    isNotStarted = () => this.gameStatus === "NotStarted"
    isPresenting = () => this.gameStatus === "PresentingSummary"
    isDonePresenting = () =>
        this.gameStatus === "PresentingSummary"
        && this.presentationState.pageNumber === this.gameSettings.rounds - 1
        && this.presentationState.bookOwner === this.books[this.books.length - 1].creator.name
    isGameOver = () => this.gameStatus === "Complete"
    isOwner = (user) => user.name === this.creator
}
