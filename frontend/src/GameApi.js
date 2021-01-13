export async function Login(name) {
    const response = await fetch(`http://localhost:4000/login`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name
        })
    })

    return await response.json()
}

export async function CreateGame(gameName, user) {
    const response = await fetch(`http://localhost:4000/createGame`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameName,
            user
        })
    })

    return await response.json()
}

export async function JoinGame(gameName, user) {
    const response = await fetch(`http://localhost:4000/joinGame`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameName,
            user
        })
    })

    return await response.json()
}

export async function StartGame(gameId, settings, user) {
    const response = await fetch(`http://localhost:4000/startGame`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId,
            settings,
            user
        })
    })

    return await response.json()
}

export async function UploadDrawing(imageData, user) {
    const response = await fetch(`http://localhost:4000/uploadDrawing`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId: "123",
            bookCreator: "222",
            imageData: imageData,
            user: user
        })
    })
}

export async function UploadDescription(description, gameId, bookCreator, user) {
    const response = await fetch(`http://localhost:4000/uploadDescription`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            gameId,
            bookCreator,
            description,
            user
        })
    })
}