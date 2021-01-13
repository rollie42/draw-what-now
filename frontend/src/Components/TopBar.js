import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'

const LoginBtn = styled.button`
`

function Login() {
    const [userName, setUserName] = React.useState("")
    const [, setUser] = React.useContext(Context.UserContext)

    const sendRequest = useCallback(async () => {
        const user = await GameApi.Login(userName)
        console.log(user)
        setUser(user)
    })

    return (
        <div>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)}></input>
            <LoginBtn onClick={sendRequest}>Login</LoginBtn>
        </div>
    )
}

function CreateGame() {
    const [gameName, setGameName] = React.useState("")
    const [user] = React.useContext(Context.UserContext)

    const sendRequest = useCallback(async () => {
        await GameApi.CreateGame(gameName, user)
    })

    return (
        <div>
            <input type="text" value={gameName} onChange={e => setGameName(e.target.value)}></input>
            <button onClick={sendRequest}>Create Game</button>
        </div>
    )
}

function StartGame() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)

    const [subscribed, setSubscribed] = React.useState(false)

    useEffect(() => {
        if (!subscribed && gameState && gameState.id) {
            console.log("subscribing")
            setSubscribed(true)
            // TODO: should this be wss?
            const ws = new WebSocket(`ws://localhost:4000/subscribe/${gameState.id}`);
            ws.onmessage = (message) => {
                const newGameState = JSON.parse(message.data)
                console.log(newGameState)
                setGameState(newGameState)
            }
        }
    }, [gameState])

    const sendRequest = async () => {
        const newState = await GameApi.StartGame(gameState.id, { rounds: 2 }, user)
        setGameState(newState)
    }

    return (
        <div>
            <button onClick={sendRequest}>Start Game</button>
        </div>
    )
}

function TestGame() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [, setUser] = React.useContext(Context.UserContext)

    const testFunc = async () => {
        const users = []
        users.push(
            await GameApi.Login("bob"),
            await GameApi.Login("sam"),
            await GameApi.Login("jenny"),
            await GameApi.Login("mark"),
            await GameApi.Login("takeshi")
        )

        const creator = users[0]

        setUser(creator)

        const gameName = "Test Game" + Math.floor(Math.random() * Math.floor(10000))
        console.log("creating game")
        const gameCreatedState = await GameApi.CreateGame(gameName, creator)
        setGameState(gameCreatedState)

        console.log("having users join game")
        for (const user of users) {
            await GameApi.JoinGame(gameName, user)
        }

        console.log("starting game")
        const gameStartedState = await GameApi.StartGame(gameCreatedState.id, { rounds: 5 }, creator)
        setGameState(gameStartedState)

        console.log("submitting descriptions")
        console.log(gameStartedState)
        for (const user of users.filter(user => user.name != creator.name)) {
            const book = gameStartedState.books.filter(book => book.currentActor?.name == user.name)[0]
            console.log(user.name, book?.currentActor?.name, book)
            if (book)
                await GameApi.UploadDescription("Test Description", gameStartedState.id, book.creator.name, user)
        }
    }

    useEffect(() => {
        testFunc()
    }, [])

    return (
        <div>

        </div>
    )
}

function UserInfo() {
    const [user] = React.useContext(Context.UserContext)
    return (
        <div>
            <span>User: {user ? user.name : '??'}</span>
        </div>
    )
}

const Container = styled.div`
    width: 100%;
    height: 50px;
    background-color: #55555588;
    display: flex;
    justify-content: right;
`

export default function TopBar() {
    return (
        <Container>
            <Login />
            <CreateGame />
            <UserInfo />
            <StartGame />
            <TestGame />
        </Container>
    )
}