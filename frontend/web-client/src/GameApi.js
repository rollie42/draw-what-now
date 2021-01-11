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

export async function CreateGame(name) {
    console.log(name)
    const response = await fetch(`http://localhost:4000/createGame`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({

        })
    })
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