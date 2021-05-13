import React, { useEffect } from 'react'
import Canvas, { DrawingMode, getDrawing } from './Canvas'
import * as Context from '../Context'
import styled from 'styled-components'
import ReplayIcon from '@material-ui/icons/Replay'
import { mousePosition } from '../App'
import {useCanvasProps} from './CanvasProps'
import { contextsToProps } from '../Utils'

import NotebookImage from '../images/note.png'
import NotebookRingsImg from '../images/note-rings.png'
import SaveIcon from '@material-ui/icons/Save'

const DescriptionContainer = styled.div`
    
    background-color: #a4e6ff66;
    position: absolute;
    bottom: 1vh;
    right: 10vh;
    left: 10vh;
    z-index: ${props => props.inputting ? '20' : '1'};
`

function lastEntry(book) {
    if (!book?.entries)
        return undefined

    return book.entries[book.entries.length - 1]
}

const DescriptionInput = styled.input`
    background: none;
    width: 100%;
    min-height: 80px;
    font-size:40px;
    text-align:center;
    border: none;
    outline: none;

    &:focus {
        &::placeholder {
            color: transparent;
        }
    }
`

function Description() {
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const [description, setDescription] = React.useContext(Context.DescriptionContext)

    useEffect(() => {
        if (!activeBook?.entries || activeBook.entries.length % 2 === 0) {
            setDescription("")
        } else {
            setDescription(lastEntry(activeBook).description)
        }
    }, [activeBook])


    var helpText = "What is this image?"
    var readOnly = false
    if (!activeBook) {
        helpText = ""
    } else if (activeBook.entries.length === 0) {
        // Active book is empty, so it's our book - pick a phrase
        helpText = "Pick a phrase"
    } else if (activeBook.entries.length % 2 === 1) {
        readOnly = true
    }

    const descriptionChange = (event) => {
        if (event.cancelable)
            event.preventDefault()

        event.stopPropagation()
        setDescription(event.target.value)
    }
    return (
        <DescriptionContainer inputting={activeBook && activeBook.entries.length % 2 === 0}>
            <DescriptionInput readOnly={readOnly} placeholder={helpText} value={description} onChange={descriptionChange} />
        </DescriptionContainer>
    )
}

function Keybinds(props) {
    const [pushedNumber, setPushedNumber] = React.useState(undefined)
    const [, setActiveTool] = React.useContext(Context.ActiveToolContext)

    const { setActiveColor, colorPalette } = props
    const { setRequestUndo, setRequestRedo, setRequestCopy, setRequestPaste, setRequestDelete } = props


    // Color commands
    React.useEffect(() => {
        if (pushedNumber !== undefined) {
            // convert to an index
            var idx = pushedNumber === 0 ? 9 : pushedNumber - 1
            if (colorPalette.length > idx) {
                setActiveColor(colorPalette[idx])
            }

            // clear this event
            setPushedNumber(undefined)
        }
    }, [colorPalette, pushedNumber])

    useEffect(() => {
        // Tool commands
        const toolKeybinds = {
            q: DrawingMode.DRAW,
            w: 'draw-shape',
            e: DrawingMode.DRAW_LINE,
            r: DrawingMode.FILL,
            a: DrawingMode.ERASE,
            s: DrawingMode.SELECT,
            d: DrawingMode.MOVE
        }

        const keydownHandler = (e) => {
            if (e.target instanceof HTMLInputElement)
                return

            if (e.key === 'z' && e.ctrlKey) {
                setRequestUndo(true)
            } else if (e.key === 'y' && e.ctrlKey) {
                setRequestRedo(true)
            } else if (e.key === 'c' && e.ctrlKey) {
                setRequestCopy(true)
            } else if (e.key === 'v' && e.ctrlKey) {
                setRequestPaste(mousePosition)
            } else if (e.key === 'Delete') {
                setRequestDelete(true)
            } else if (parseInt(e.key) >= 0) {
                setPushedNumber(Number(e.key))
            } else if (e.key === '[') {
                props.setLineWidth(w => w > 30 ? w - 2 : w - 1)
            } else if (e.key === ']') {
                props.setLineWidth(w => w > 30 ? w + 2 : w + 1)
            } else if (e.key in toolKeybinds) {
                setActiveTool(toolKeybinds[e.key])
            }
        }

        window.addEventListener('keydown', keydownHandler)
        return () => window.removeEventListener('keydown', keydownHandler)
    }, [])

    return (<></>)
}

const ConvasBackgroundContainer = styled.div`
`
const ConvasAreaContainer = styled.div`
  position: relative;
  flex: 0;
  min-width: 75vw;
  display: flex;
  flex-flow: column;
  margin: 0px 0px;
  background-image: url(${NotebookImage});
  background-size: 100% 100%;
  background-position: center;
  padding: 5.2vh 2.8vw 7vh 1.1vw;
`

const NotebookRingsContainer = styled.div`
    width: 100%;
    height: 100%;
    background-image: url(${NotebookRingsImg});
    background-size: 100% 100%;
    background-position: center;
    position: absolute;
    top: 0px;
    left: 0px;
`

// padding: 10vh 2.4vw 0px 0.9vw;
const RequestReplayButton = styled.button`
    position: absolute;
    top: 0px;
    left: 80px;
`

const ReplayButtonStyled = styled.button`
    width:50px;
    height:50px;
    position: absolute;
    right: 90px;
    bottom: 70px;
`

const CanvasActiveArea = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`

function ReplayButton(props) {
    return (
        <ReplayButtonStyled onClick={props.onClick}><ReplayIcon /></ReplayButtonStyled>
    )
}

const SaveButtonStyled = styled.a`
    position: absolute;
    top: 8px;
    right: 10px;
    width: 40px;
    z-index: 20;
    cursor: pointer;
    color: grey;}
`

function SaveButton() {
    const [layers] = React.useContext(Context.LayerContext)
    const btnRef = React.useRef()

    const clickHandler = () => {
        console.log('...')
        const data = getDrawing(layers)
        btnRef.current.href = data
    }

    return (
        <SaveButtonStyled
            ref={btnRef}
            onClick={clickHandler}
            download='DWNImage.png'>
            <SaveIcon 
                 style={{
                    width: '100%',
                    height: '100%'
                }}
            />
         </SaveButtonStyled>
    )
}

export default function CanvasArea() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const [requestReplay, setRequestReplay] = React.useState(false)

    const [activeColor] = React.useContext(Context.ActiveColorContext)

    const contextProps = contextsToProps({
        'activeColor': Context.ActiveColorContext,
        'lineWidth': Context.LineWidthContext,
        'fillShape': Context.FillShapeContext,
        'colorPalette': Context.ColorPalette,
        'staticImage': Context.StaticImageContext,
        'replayDrawings': Context.ReplayDrawingsContext,
        'requestClear': Context.RequestClearContext,
        'layers': Context.LayerContext,
        'actionHistory': Context.ActionHistoryContext,
        'mode': Context.ActiveToolContext,
        'shape': Context.ActiveShapeContext,
    })
    const canvasProps = useCanvasProps(contextProps)

    useEffect(() => {
        if (requestReplay) {
            setRequestReplay(false)
        }
    }, [requestReplay])

    useEffect(() => {
        if (!gameState)
            return

        canvasProps.setStaticImage("")
        if (gameState.gameStatus === "PresentingSummary" && gameState.presentationState.pageNumber === 0)
            canvasProps.setStaticImage("empty")

        if (activeBook && activeBook.entries.length % 2 === 0)
            canvasProps.setStaticImage("empty")
    }, [gameState, activeBook])

    const wheelHandler = (e) => {
        const d = Math.trunc(canvasProps.lineWidth / 14) + 1
        const w = canvasProps.lineWidth + (e.deltaY < 0 ? d : -d)
        canvasProps.setLineWidth(Math.max(1, Math.min(w, 72)))
    }

    const onDraw = React.useCallback(() => {
        canvasProps.setColorPalette(palette => {
            if (!palette.includes(activeColor))
                return ([...palette, activeColor])
            return palette
        })
    }, [activeColor])

    // const activelyDrawing = activeBook && activeBook.entries.length % 2 === 1
    // const isDrawing = !gameState || gameState.gameStatus === "NotStarted" || activelyDrawing

    const handleRequestReplay = React.useCallback(() => {
        const ps = gameState.presentationState
        const book = gameState.books?.find(b => b.creator.name === ps.bookOwner)
        var entry = book?.entries[ps.pageNumber]
        if (!entry.imageUrl)
            entry = book.entries[ps.pageNumber - 1]

        canvasProps.setReplayDrawings(JSON.parse(entry.replayDrawings))
        setRequestReplay(true)
    }, [gameState])


    return (
        <ConvasAreaContainer onWheel={wheelHandler}>
            <Keybinds {...canvasProps} />
            <CanvasActiveArea>
                <Canvas
                    onDraw={onDraw}
                    {...canvasProps}

                />                
                {false && gameState?.isPresenting() && <ReplayButton onClick={handleRequestReplay} />}
                <Description />                
                <SaveButton />
            </CanvasActiveArea>
            <NotebookRingsContainer />            
        </ConvasAreaContainer>
    )
}