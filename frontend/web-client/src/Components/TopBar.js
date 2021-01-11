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

    const sendRequest = useCallback(async () => {
        await GameApi.CreateGame(gameName)
    })

    return (
        <div>
            <input type="text" value={gameName} onChange={e => setGameName(e.target.value)}></input>
            <button onClick={sendRequest}>Create Game</button>
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
        </Container>
    )
}