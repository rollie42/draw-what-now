import React from 'react'
import styled from 'styled-components'
import * as GameApi from '../GameApi'
import * as Context from '../Context'
import { Button } from '../Controls'
import ActionHistory from './ActionHistory'

const GameStatePanelContainer = styled.div`
    background: #222222dd;
    color: #dddddd;
    margin-top: 20px;
    padding: 10px 10px;
    
`

const GameSettingsContainer = styled.div`
    
`
const GameSettingsLine = styled.div`
    padding: 5px 0px;
    text-align: left;
`
function GameStatePanel() {
    const [gameState] = React.useContext(Context.GameStateContext)

    return (
        <GameStatePanelContainer>
            <GameSettingsContainer>
                <GameSettingsLine>Game name: {gameState.name}</GameSettingsLine>
                <GameSettingsLine>Current state: {gameState.gameStatus}</GameSettingsLine>
                <GameSettingsLine>Rounds: {gameState.gameSettings.rounds}</GameSettingsLine>
            </GameSettingsContainer>
            <GameSettingsLine>Players:</GameSettingsLine>
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
    const [gameState] = React.useContext(Context.GameStateContext)
    const [description] = React.useContext(Context.DescriptionContext)
    const [replayDrawings, setReplayDrawings] = React.useContext(Context.ReplayDrawingsContext)

    console.log(activeBook, activeBook?.entries)
    const handler = async () => {
        if (activeBook?.entries && activeBook.entries.length % 2 === 1) {
            // not my favorite way of doing this
            const data = document.getElementById('layerCanvas').toDataURL('image/png').split(';base64,')[1]
            for (const replay of replayDrawings) {
                replay.drawParams.layerCanvas = undefined
                replay.drawParams.workingCanvas = undefined
            }

            console.log(replayDrawings)

            await GameApi.UploadDrawing(data, gameState.id, activeBook.creator.name, JSON.stringify(replayDrawings), user)
            setReplayDrawings([])
        } else {
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
    const [gameState] = React.useContext(Context.GameStateContext)

    const handler = async () => {
        await GameApi.PresentNext(gameState.id, user)
    }

    return (
        <PresentNextButtonStyled onClick={handler}>Present Next</PresentNextButtonStyled>
    )
}

function PresentNextTestButton() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)

    const handler = async () => {
        const s = gameState.presentationState
        console.log(s)

        if (s.pageNumber === 1) {
            s.bookOwner = gameState.players.find(p => p.name !== s.bookOwner).name
            s.pageNumber = 0
        } else {
            s.pageNumber = 1
        }

        setGameState(gameState)
    }

    return (
        <PresentNextButtonStyled onClick={handler}>Present Next Test</PresentNextButtonStyled>
    )
}

function FinishPresentingButton() {
    const [user] = React.useContext(Context.UserContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    const handler = async () => {
        await GameApi.EndGame(gameState.id, user)
    }

    return (
        <PresentNextButtonStyled onClick={handler}>View Game Summary</PresentNextButtonStyled>
    )
}

function StartGameButton() {
    const [user] = React.useContext(Context.UserContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    // TODO: settings
    const handler = async () => {
        await GameApi.StartGame(gameState.id, { rounds: gameState.players.length }, user)
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

const ActionHistoryContainer = styled.div`
`

export default function GameStateDetails() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const readyToPresent = gameState && gameState.gameStatus === "InProgress" && !gameState.books.some(book => book.currentActor())
    const isGameOwner = gameState && user?.name === gameState?.creator

    return (
        <GameStateDetailsContainer>
            {gameState && <GameStatePanel />}
            <DeadSpace />
            {readyToPresent && isGameOwner && <StartPresentingButton />}
            {isGameOwner && <>
                {gameState?.isPresenting() && !gameState?.isDonePresenting() && <PresentNextButton />}
                {gameState?.isPresenting() && <PresentNextTestButton />}
                {gameState?.isDonePresenting() && <FinishPresentingButton />}
                {gameState.gameStatus === "NotStarted" && <StartGameButton />}
            </>}
            {activeBook && <DoneButton />}
            <ActionHistoryContainer><ActionHistory /></ActionHistoryContainer>
        </GameStateDetailsContainer>
    )
}