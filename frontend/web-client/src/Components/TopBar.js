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
                console.log(message.data)
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

        console.log("creating game")
        const gameCreatedState = await GameApi.CreateGame("Test Game", creator)
        setGameState(gameCreatedState)
        console.log("starting game")
        const gameStartedState = await GameApi.StartGame(gameCreatedState.id, { rounds: 5 }, creator)
        setGameState(gameStartedState)
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