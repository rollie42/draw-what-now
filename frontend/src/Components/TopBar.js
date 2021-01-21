import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import { JoinGameDialog, CreateGameDialog } from './GameDialogs'
import { Button } from '../Controls'
import HourglassEmpty from '@material-ui/icons/HourglassEmpty'


const PresentationTestState = { "name": "Test Game9971", "id": "05988475-5604-4821-841d-58d8a6f6c633", "gameStatus": "PresentingSummary", "players": [{ "name": "bob" }, { "name": "sam" }, { "name": "jenny" }, { "name": "mark" }, { "name": "takeshi" }], "books": [{ "creator": { "name": "bob" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "sam" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/5125e598-cb16-424c-be79-e68e2a5e7ffd.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "takeshi" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/32a5076d-0fa5-4646-8b1b-f2b90bed2df3.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description4" }] }, { "creator": { "name": "sam" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "mark" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/84415ef4-e8b3-4b04-bfad-d43685c7f15b.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "jenny" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/7d5aecc6-1781-4b93-9e98-4b90c29e2851.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description4" }] }, { "creator": { "name": "jenny" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "bob" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/c0f4517d-6741-4373-af21-4312e412b9db.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "mark" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/b797f281-24ec-4fd6-bcdd-60968a46d848.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description4" }] }, { "creator": { "name": "mark" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "takeshi" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/60aa50b5-c186-4c4a-9b8f-f79af3e60799.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "jenny" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "sam" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/8a20ad14-f6e9-4339-b41d-6f076de8f724.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "bob" }, "description": "Test Description4" }] }, { "creator": { "name": "takeshi" }, "entries": [{ "type": "backend.DescriptionBookEntry", "author": { "name": "takeshi" }, "description": "Test Description0" }, { "type": "backend.ImageBookEntry", "author": { "name": "jenny" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/23c16ff3-9f64-4bc9-aa60-f528f6a91ea7.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "sam" }, "description": "Test Description2" }, { "type": "backend.ImageBookEntry", "author": { "name": "bob" }, "imageUrl": "https://image_uploads_301412.storage.googleapis.com/0bfb1807-2e7e-41f6-9e93-8b874015200d.png" }, { "type": "backend.DescriptionBookEntry", "author": { "name": "mark" }, "description": "Test Description4" }] }], "presentationState": { "bookOwner": "bob", "pageNumber": 0 } }
const TopControlContainer = styled.div`
    display: flex;
    align-items: center;
    color: #dddddd;
    font-size: 22px;
`

function UserName(props) {
    const { userName, setUserName } = props
    const [, setUser] = React.useContext(Context.UserContext)

    return (
        <TopControlContainer>
            <label>Your name</label>
            <input type="text" value={userName} onChange={e => setUserName(e.target.value)}></input>
        </TopControlContainer>
    )
}

function GameName(props) {
    const { gameName, setGameName } = props

    return (
        <TopControlContainer>
            <label>Game name</label>
            <input type="text" value={gameName} onChange={e => setGameName(e.target.value)}></input>
        </TopControlContainer>
    )
}

function JoinGame() {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <Button onClick={() => setOpen(true)}>Join Game</Button>
            <JoinGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function CreateGame(props) {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <Button onClick={() => setOpen(true)}>Create Game</Button>
            <CreateGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function StartGame() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)

    const sendRequest = async () => {
        await GameApi.StartGame(gameState.id, { rounds: 2 }, user)
    }

    return (
        <TopControlContainer>
            <Button onClick={sendRequest}>Start Game</Button>
        </TopControlContainer>
    )
}

function TestGame() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [, setUser] = React.useContext(Context.UserContext)
    const [atrament] = React.useContext(Context.AtramentContext)

    const testFunc = async () => {
        setUser(await GameApi.Login("bob"))
        const gs = await GameApi.GetFakeGame()
        setGameState(gs)
        return

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
        var testGameState = await GameApi.CreateGame(gameName, creator)
        setGameState(testGameState)

        console.log("having users join game")
        for (const user of users) {
            await GameApi.JoinGame(gameName, user)
        }

        console.log("starting game")
        testGameState = await GameApi.StartGame(testGameState.id, { rounds: 5 }, creator)
        setGameState(testGameState)
        const imageData = atrament.toImage()

        while (true) {
            const book = testGameState.books.filter(b => b.actors[0])[0]
            if (!book)
                break

            const user = book.actors[0]
            if (book.entries.length % 2 === 0) { // describe
                testGameState = await GameApi.UploadDescription("Test Description" + book.entries.length, testGameState.id, book.creator.name, user)
            } else { // draw
                testGameState = await GameApi.UploadDrawing(imageData, testGameState.id, book.creator.name, user)
            }
        }

        // console.log("submitting descriptions")
        // console.log(testGameState)
        // for (const user of users) {//.filter(user => user.name != creator.name)) {
        //     const book = testGameState.books.filter(book => book.actors[0]?.name == user.name)[0]
        //     console.log(user.name, book?.actors[0]?.name, book)
        //     if (book)
        //         await GameApi.UploadDescription("Test Description", testGameState.id, book.creator.name, user)
        // }
    }

    return (
        <TopControlContainer>
            <Button onClick={testFunc}>Test Game</Button>
        </TopControlContainer>
    )
}

function UserInfo() {
    const [user] = React.useContext(Context.UserContext)
    return (
        <TopControlContainer>
            <span>User: {user ? user.name : '??'}</span>
        </TopControlContainer>
    )
}

const Container = styled.div`
    width: 100%;
    height: 50px;
    background-color: #111111aa;
    display: flex;
    justify-content: flex-end;
`

const DeadSpace = styled.div`
    flex: 1;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 70px;
    height: 70px;
    margin: 0px 2px;
    padding: 3px;
    ${props => props.selected && `background-color: #222222;`}
`

const HourGlassContainer = styled.div`
    position: absolute;
    left: 6px;
    top: 2px;
    font-size: 44px;
`


function HourGlass() {
    const r = 35
    const fontStyle = {
        position: 'absolute',
        left: 15,
        top: 13,
        color: "#222222",
        fontSize: "48px"
    }
    return (
        <HourGlassContainer>
            <SVG>
                <circle cx={r} cy={r} r={r} stroke="green" strokeWidth="1" fill="green" />
            </SVG>
            <HourglassEmpty style={fontStyle} />
        </HourGlassContainer>
    )
}

export default function TopBar() {
    const [userName, setUserName] = React.useState("")
    const [gameName, setGameName] = React.useState("")
    return (
        <Container>
            <HourGlass />
            <DeadSpace />
            <JoinGame />
            <CreateGame />
            <TestGame />
        </Container>
    )
}