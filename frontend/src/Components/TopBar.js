import React from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import { JoinGameDialog, CreateGameDialog } from './GameDialogs'
import { Button } from '../Controls'
import HourglassEmpty from '@material-ui/icons/HourglassEmpty'


const TopControlContainer = styled.div`
    display: flex;
    align-items: center;
    color: #dddddd;
    font-size: 22px;
`

function JoinGame() {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <Button onClick={() => setOpen(true)}>Join Game</Button>
            <JoinGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function CreateGame() {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <Button onClick={() => setOpen(true)}>Create Game</Button>
            <CreateGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function ExitGame() {
    const [, setGameState] = React.useContext(Context.GameStateContext)
    const [, setUser] = React.useContext(Context.UserContext)
    const clickHandler = () => {
        setGameState(undefined)
        setUser(undefined)
    }

    return (
        <TopControlContainer>
            <Button onClick={clickHandler}>Exit Game</Button>
        </TopControlContainer>
    )
}


function TestGame() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [, setUser] = React.useContext(Context.UserContext)

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
        const imageData = undefined

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
    const [gameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)

    const groupBy = (list, keyGetter) =>
        list.reduce(function (r, a) {
            r[keyGetter(a)] = r[keyGetter(a)] || [];
            r[keyGetter(a)].push(a);
            return r;
        }, Object.create(null));

    var color = "green"
    console.log(gameState)
    const entries = gameState.books.map(book => book.entries).flat().filter(entry => entry.imageUrl)
    if (entries.length) {

        const groups = groupBy(entries, entry => entry.author.name)
        const imagesDone = Object.values(groups).map(arr => arr.length).sort()
        const median = imagesDone[Math.floor(imagesDone.length / 2)]
        const userCompleted = groups[user.name]?.length || 0
        color = userCompleted >= median
            ? "green"
            : userCompleted >= median - 1
                ? "yellow"
                : "red"
    }
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
                <circle cx={r} cy={r} r={r} stroke={color} strokeWidth="1" fill={color} />
            </SVG>
            <HourglassEmpty style={fontStyle} />
        </HourGlassContainer>
    )
}

export default function TopBar() {
    const [gameState] = React.useContext(Context.GameStateContext)
    return (
        <Container>
            {gameState?.gameStatus === "InProgress" && <HourGlass />}
            <DeadSpace />
            {!gameState &&
                <>
                    <JoinGame />
                    <CreateGame />
                    <ExitGame />
                </>
            }

        </Container>
    )
}