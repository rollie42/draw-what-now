import React from 'react'
import styled from 'styled-components'
import LayerBox from './LayerBox'
import { ImageButton, Button } from '../Controls'
import { getDrawing } from './Canvas'
import { sleep } from '../Utils'
import StartButtonImg from '../images/start-button.png'
import * as GameApi from '../GameApi'
import * as Context from '../Context'

const RightSideContainer = styled.div`
`

const GameButtons = styled.div`
`


const ActionButton = styled(Button)`
    font-size: 28px;  
`

function DoneButton() {
    const [user] = React.useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const [gameState] = React.useContext(Context.GameStateContext)
    const [description] = React.useContext(Context.DescriptionContext)
    const [replayDrawings, setReplayDrawings] = React.useContext(Context.ReplayDrawingsContext)
    const [layers] = React.useContext(Context.LayerContext)
    const [, setRecentSubmission] = React.useContext(Context.RecentSubmissionContext)

    const handler = async () => {
        if (activeBook?.entries && activeBook.entries.length % 2 === 1) {            
            const data = getDrawing(layers).split(';base64,')[1]
            for (const replay of replayDrawings) {
                replay.drawParams.layerCanvas = undefined
                replay.drawParams.workingCanvas = undefined
            }

            const resp = await GameApi.UploadDrawing(data, gameState.id, activeBook.creator.name, JSON.stringify(replayDrawings), user)
            if (resp) { // TODO
                setRecentSubmission(activeBook.creator.name)    
            }
            setReplayDrawings([])
        } else {
            await GameApi.UploadDescription(description, gameState.id, activeBook.creator.name, user)
        }
        setActiveBook(null)
    }

    return (
        <ActionButton onClick={handler}>Done</ActionButton>
    )
}

const UndoSubmitButtonStyled = styled(ActionButton)`
    display: none;

    &.showing {
        display: block;
        opacity: 1;
    }

    &.hiding {
        display: block;
        transition: opacity 2.0s ease-out;
        opacity: 0;
    }
`

function UndoSubmitButton() {
    const [gameState, setGameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)
    const [recentSubmission, setRecentSubmission] = React.useContext(Context.RecentSubmissionContext)
    const [, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const [, setDescription] = React.useContext(Context.DescriptionContext)
    const [, setStaticImage] = React.useContext(Context.StaticImageContext)
    const [className, setClassName] = React.useState("")

    React.useEffect(() => {
        const handler = async () => {
            if (recentSubmission) {
                // Show
                await sleep(300)
                setClassName('showing')
                await sleep(4000)
                setClassName('hiding')

                await sleep(2000)
                setClassName('')
                
                await sleep(4000)                

                //setRecentSubmission((recentSubmission ?? 'x') + '1') // Testing
                setRecentSubmission(undefined)
            }
        }

        handler()
    }, [recentSubmission])

    const undoSubmission = React.useCallback(() => {
        const handler = async () => {
            const result = await GameApi.UndoSubmission(gameState.id, recentSubmission, user)
            if (result.success) {
                const data = result.data
                const gameState = result.gameState
                // Normally we let the websocket propagate this, but we need to keep the newly active book in
                // sync with the game state, so we need to set them together.
                setGameState(result.gameState)
                const book = gameState.books.find(book => book.creator.name === recentSubmission)
                setActiveBook(book)
                
                if (data.imageUrl) {
                    // Image entry
                    setStaticImage(data.imageUrl)
                } else {
                    // Description entry
                    setStaticImage('empty')
                }
            }
        }

        handler()
    }, [gameState, recentSubmission, user])

    return (
        <>
            <UndoSubmitButtonStyled onClick={undoSubmission} className={className}>Undo</UndoSubmitButtonStyled>
        </>
    )
}

export default function RightSide() {
    const [user] = React.useContext(Context.UserContext)
    const [gameState] = React.useContext(Context.GameStateContext)
    const [activeBook] = React.useContext(Context.ActiveBookContext)

    const startGame = async () => {
        await GameApi.StartGame(gameState.id, { rounds: gameState.players.length }, user)
    }

    const startPresentation = async () => {
        await GameApi.StartPresentation(gameState.id, user)
    }

    const presentNext = async () => {
        await GameApi.PresentNext(gameState.id, user)
    }

    const viewGameSummary = async () => {
        await GameApi.EndGame(gameState.id, user)
    }

    const readyToPresent = gameState && gameState.gameStatus === "InProgress" && !gameState.books.some(book => book.currentActor())
    const isGameOwner = gameState?.isOwner(user)

    return (
        <RightSideContainer>
            <LayerBox />
            <GameButtons>
                {isGameOwner && 
                <>
                    {readyToPresent && 
                        <ActionButton onClick={startPresentation}>Start Presenting</ActionButton>}
                    {gameState.isNotStarted() && 
                        <ImageButton onClick={startGame} height="120px" image={StartButtonImg} />                
                    }
                    {gameState.isPresenting() && !gameState.isDonePresenting() && 
                        <ActionButton onClick={presentNext}>Present Next</ActionButton>}
                    {gameState.isDonePresenting() && 
                        <ActionButton onClick={viewGameSummary}>View Game Summary</ActionButton>}
                </>}
            
                {activeBook && <DoneButton />}
                <UndoSubmitButton />
            </GameButtons>
        </RightSideContainer>
    )
}