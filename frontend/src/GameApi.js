const hostname = window && window.location && window.location.hostname;

var backendHost = 'http://localhost:4000';
// TODO: should this be wss?
var wsHost = 'ws://localhost:4000'

if (hostname === 'https://drawing-game-webapp-72bwvupbta-uw.a.run.app') {
    backendHost = 'https://drawing-game-api-72bwvupbta-uw.a.run.app';
    wsHost = 'wss://drawing-game-api-72bwvupbta-uw.a.run.app';
}

async function Post(endpoint, body) {
    const response = await fetch(`${backendHost}/${endpoint}`, {
        method: "POST",
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })

    return await response.json()
}

async function Get(endpoint) {
    const response = await fetch(`${backendHost}/${endpoint}`, {
        method: "GET",
        headers: {
            Accept: 'application/json'
        }
    })

    return await response.json()
}

export const Subscribe = async (gameId, handler) => {
    const ws = new WebSocket(`${wsHost}/subscribe/${gameId}`);
    ws.onmessage = handler
}

export const GetFakeGame = async (name) => await Get("fakeGameState")
export const Login = async (name) => await Post("login", { name })
export const CreateGame = async (gameName, user) => await Post("createGame", { gameName, user })
export const JoinGame = async (gameName, user) => await Post("joinGame", { gameName, user })
export const StartGame = async (gameId, settings, user) => await Post("startGame", { gameId, settings, user })
export const UploadDrawing = async (imageData, gameId, bookCreator, user) => await Post("uploadDrawing", { imageData, gameId, bookCreator, user })
export const UploadDescription = async (description, gameId, bookCreator, user) => await Post("uploadDescription", { description, gameId, bookCreator, user })
export const StartPresentation = async (gameId, user) => await Post("startPresentation", { gameId, user })
export const PresentNext = async (gameId, user) => await Post("presentNext", { gameId, user })
export const EndGame = async (gameId, user) => await Post("endGame", { gameId, user })