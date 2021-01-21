import React from 'react'
import styled from 'styled-components'
import * as GameApi from '../GameApi'
import * as Context from '../Context'
import { Button } from '../Controls'

const GameStatePanelContainer = styled.div`
    background: #222222dd;
    color: #dddddd;
    margin-top: 20px;
`

function GameStatePanel() {
    const [gameState] = React.useContext(Context.GameStateContext)

    return (
        <GameStatePanelContainer>
            <div>Players</div>
            {gameState.players.map((player) => <div key={player.name}>{player.name}</div>)}
        </GameStatePanelContainer>
    )
}

const DeadSpace = styled.div`
    flex: 1;
`

const DoneButtonStyled = styled(Button)`
    font-size: 40px;
    padding: 10px 0px;
    margin: 0px 40px;
  
`

function DoneButton() {
    const [user] = React.useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const [atrament] = React.useContext(Context.AtramentContext)
    const [gameState] = React.useContext(Context.GameStateContext)
    const [description] = React.useContext(Context.DescriptionContext)

    console.log(activeBook, activeBook?.entries)
    const handler = async () => {
        // await GameApi.StartPresentation(gameState.id, user)
        if (activeBook?.entries && activeBook.entries.length % 2 == 1)
            await GameApi.UploadDrawing(atrament.toImage(), gameState.id, activeBook.creator.name, user)
        else {
            await GameApi.UploadDescription(description, gameState.id, activeBook.creator.name, user)
        }
        setActiveBook(null)

    }

    return (
        <DoneButtonStyled onClick={handler}>Done</DoneButtonStyled>
    )
}

const StartPresentingButtonStyled = styled(Button)`
    font-size: 40px;
    padding: 10px 0px;
    margin: 0px 40px;  
`

function StartPresentingButton() {
    const [user] = React.useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    const handler = async () => {
        await GameApi.StartPresentation(gameState.id, user)
    }

    return (
        <StartPresentingButtonStyled onClick={handler}>Start Presenting</StartPresentingButtonStyled>
    )
}

const PresentNextButtonStyled = styled(Button)`
    font-size: 40px;
    padding: 10px 0px;
    margin: 0px 40px;  
`

function PresentNextButton() {
    const [user] = React.useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    const handler = async () => {
        await GameApi.PresentNext(gameState.id, user)
    }

    return (
        <PresentNextButtonStyled onClick={handler}>Present Next</PresentNextButtonStyled>
    )
}

function StartGameButton() {
    const [user] = React.useContext(Context.UserContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    // TODO: settings
    const handler = async () => {
        await GameApi.StartGame(gameState.id, { rounds: 2 }, user)
    }

    return (
        <PresentNextButtonStyled onClick={handler}>Start Game</PresentNextButtonStyled>
    )
}

const GameStateDetailsContainer = styled.div`
    min-width: 300px;
    display: flex;
    flex-direction: column;
`
export default function GameStateDetails() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)
    const readyToPresent = gameState && gameState.gameStatus === "InProgress" && !gameState.books.some(book => book.actors?.length)
    console.log(gameState)
    console.log(user)
    const isGameOwner = gameState && user?.name === gameState?.creator

    return (
        <GameStateDetailsContainer>
            {gameState && <GameStatePanel />}
            <DeadSpace />
            {readyToPresent && isGameOwner && <StartPresentingButton />}
            {isGameOwner && gameState?.gameStatus === "PresentingSummary" && <PresentNextButton />}
            {isGameOwner && gameState.gameStatus === "NotStarted" && <StartGameButton />}
            {gameState?.gameStatus === "InProgress" && <DoneButton />}
        </GameStateDetailsContainer>
    )
}