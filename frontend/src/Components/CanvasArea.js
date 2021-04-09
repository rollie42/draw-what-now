import React, { useEffect } from 'react'
import { DrawingMode } from './Canvas'
import * as Context from '../Context'
import CC from './Canvas.js'
import styled from 'styled-components'
import ReplayIcon from '@material-ui/icons/Replay'
import { mousePosition } from '../App'
import {useCanvasProps} from './CanvasProps'
import { contextsToProps } from '../Utils'

const _getPos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const position = (event?.changedTouches && event.changedTouches[0]) || event
    return { x: position.clientX - rect.left, y: position.clientY - rect.top }
}

const DescriptionContainer = styled.div`
    margin-bottom: 45px;
`

const StyledImage = styled.img`
    width: 100%;
    height: 100%;
`

function lastEntry(book) {
    if (!book?.entries)
        return undefined

    return book.entries[book.entries.length - 1]
}

const DescriptionInput = styled.input`
    background: none;
    width: 100%;
    min-height: 60px;
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
        console.log(activeBook)
        if (!activeBook?.entries || activeBook.entries.length % 2 === 0) {
            console.log(1, lastEntry(activeBook))
            setDescription("")
        } else {
            console.log(2, lastEntry(activeBook))
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
        <DescriptionContainer>
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

const ConvasAreaContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-flow: column;
  margin: 0px 10px;
  background-image: url('notebook.png');
  background-size: 100% 100%;
  background-position: center;
  padding: 10vh 8vh 0px 8vh;
`

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

function ReplayButton(props) {
    return (
        <ReplayButtonStyled onClick={props.onClick}><ReplayIcon /></ReplayButtonStyled>
    )
}

export default function CanvasArea() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const [activeTool] = React.useContext(Context.ActiveToolContext)
    const [activeShape] = React.useContext(Context.ActiveShapeContext)
    const [requestReplay, setRequestReplay] = React.useState(false)

    // const [activeColor] = React.useContext(Context.ActiveColorContext)
    // const [lineWidth, setLineWidth] = React.useContext(Context.LineWidthContext)
    
    // const [fillShape] = React.useContext(Context.FillShapeContext)
    // const [, setColorPalette] = React.useContext(Context.ColorPalette)    
    // const [staticImage, setStaticImage] = React.useContext(Context.StaticImageContext)
    // const [replayDrawings, setReplayDrawings] = React.useContext(Context.ReplayDrawingsContext)
    // const [requestClear, setRequestClear] = React.useContext(Context.RequestClearContext)
    // const [layers] = React.useContext(Context.LayerContext)

    // const [selected, setSelected] = React.useState(false)
    // const [requestCopy, setRequestCopy] = React.useState(false)
    // const [requestPaste, setRequestPaste] = React.useState(undefined)
    // const [requestDelete, setRequestDelete] = React.useState(false)

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
    })
    const canvasProps = useCanvasProps(contextProps)

    useEffect(() => {
        console.log("requestReplay", requestReplay)
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
        const d = canvasProps.lineWidth < 14 ? 1 : 2
        if (e.deltaY < 0) {
            canvasProps.setLineWidth(canvasProps.lineWidth + d)
        } else if (e.deltaY > 0 && canvasProps.lineWidth > 1) {
            canvasProps.setLineWidth(canvasProps.lineWidth - d)
        }
    }

    const onDraw = (drawing) => {
        canvasProps.setColorPalette(palette => {
            if (!palette.includes(drawing.color))
                return ([...palette, drawing.color])
            return palette
        })
    }

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

    console.log(gameState)
    console.log(canvasProps)

    return (
        <ConvasAreaContainer onWheel={wheelHandler}>
            <Keybinds {...canvasProps} />
            <CC
                mode={activeTool === 'draw-shape' ? activeShape : activeTool}
                onDraw={onDraw}
                // replayList={requestReplay ? replayDrawings : undefined} TODO
                {...canvasProps}

            />
            {gameState?.isPresenting() && <ReplayButton onClick={handleRequestReplay} />}
            <Description />
        </ConvasAreaContainer>
    )
}