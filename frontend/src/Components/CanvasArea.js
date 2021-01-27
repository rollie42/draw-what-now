import React, { useEffect } from 'react'
import { DrawingMode } from './Canvas'
import * as Context from '../Context'
import CC from './Canvas.js'
import styled from 'styled-components'
import ReplayIcon from '@material-ui/icons/Replay'
import { mousePosition } from '../App'

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
    const [colorPalette] = React.useContext(Context.ColorPalette)
    const [pushedNumber, setPushedNumber] = React.useState(undefined)
    const [, setActiveColor] = React.useContext(Context.ActiveColorContext)
    const [, setActiveTool] = React.useContext(Context.ActiveToolContext)

    const { activeBufferIdx, setActiveBufferIdx, setRequestCopy, setRequestPaste, setRequestDelete } = props


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
                if (activeBufferIdx > 0)
                    setActiveBufferIdx(activeBufferIdx - 1)
            } else if (e.key === 'y' && e.ctrlKey) {
                setActiveBufferIdx(activeBufferIdx + 1)
            } else if (e.key === 'c' && e.ctrlKey) {
                setRequestCopy(true)
            } else if (e.key === 'v' && e.ctrlKey) {
                setRequestPaste(mousePosition)
            } else if (e.key === 'Delete') {
                setRequestDelete(true)
            } else if (parseInt(e.key) >= 0) {
                setPushedNumber(Number(e.key))
            } else if (e.key in toolKeybinds) {
                setActiveTool(toolKeybinds[e.key])
            }
        }

        console.log(activeBufferIdx)
        window.addEventListener('keydown', keydownHandler)
        return () => window.removeEventListener('keydown', keydownHandler)
    }, [activeBufferIdx])

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
    const [activeColor] = React.useContext(Context.ActiveColorContext)
    const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)
    const [activeTool] = React.useContext(Context.ActiveToolContext)
    const [activeShape] = React.useContext(Context.ActiveShapeContext)
    const [fillShape] = React.useContext(Context.FillShapeContext)
    const [, setColorPalette] = React.useContext(Context.ColorPalette)
    const [gameState] = React.useContext(Context.GameStateContext)
    const [displayedImage, setDisplayedImage] = React.useContext(Context.DisplayedImageContext)
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const [replayDrawings, setReplayDrawings] = React.useContext(Context.ReplayDrawingsContext)
    const [requestClear, setRequestClear] = React.useContext(Context.RequestClearContext)

    const [activeBufferIdx, setActiveBufferIdx] = React.useState(0)
    const [requestReplay, setRequestReplay] = React.useState(false)
    const [selected, setSelected] = React.useState(false)
    const [requestCopy, setRequestCopy] = React.useState(false)
    const [requestPaste, setRequestPaste] = React.useState(undefined)
    const [requestDelete, setRequestDelete] = React.useState(false)

    useEffect(() => {
        console.log("requestReplay", requestReplay)
        if (requestReplay) {
            setRequestReplay(false)
        }
    }, [requestReplay])

    useEffect(() => {
        if (!gameState)
            return

        setDisplayedImage("")
        if (gameState.gameStatus === "PresentingSummary" && gameState.presentationState.pageNumber === 0)
            setDisplayedImage("empty")

        if (activeBook && activeBook.entries.length % 2 === 0)
            setDisplayedImage("empty")
    }, [gameState, activeBook])

    const wheelHandler = (e) => {
        const d = brushWidth < 14 ? 1 : 2
        if (e.deltaY < 0) {
            setBrushWidth(brushWidth + d)
        } else if (e.deltaY > 0 && brushWidth > 1) {
            setBrushWidth(brushWidth - d)
        }
    }

    const onDraw = (drawing) => {
        setColorPalette(palette => {
            if (!palette.includes(drawing.color))
                return ([...palette, drawing.color])
            return palette
        })
        setReplayDrawings([...replayDrawings, drawing])
    }

    // const activelyDrawing = activeBook && activeBook.entries.length % 2 === 1
    // const isDrawing = !gameState || gameState.gameStatus === "NotStarted" || activelyDrawing

    const handleRequestReplay = React.useCallback(() => {
        const ps = gameState.presentationState
        const book = gameState.books?.find(b => b.creator.name === ps.bookOwner)
        var entry = book?.entries[ps.pageNumber]
        if (!entry.imageUrl)
            entry = book.entries[ps.pageNumber - 1]

        console.log(entry.replayDrawings)
        setReplayDrawings(JSON.parse(entry.replayDrawings))
        setRequestReplay(true)
    }, [gameState])

    console.log(gameState)

    return (
        <ConvasAreaContainer onWheel={wheelHandler}>
            <Keybinds
                activeBufferIdx={activeBufferIdx}
                setActiveBufferIdx={setActiveBufferIdx}
                setRequestCopy={setRequestCopy}
                setRequestPaste={setRequestPaste}
                setRequestDelete={setRequestDelete} />
            <CC
                mode={activeTool === 'draw-shape' ? activeShape : activeTool}
                fillShape={fillShape}
                color={activeColor}
                lineWidth={brushWidth}
                onDraw={onDraw}
                activeBufferIdx={activeBufferIdx}
                setActiveBufferIdx={setActiveBufferIdx}
                replayList={requestReplay ? replayDrawings : undefined}
                staticImage={displayedImage}
                requestClear={requestClear}
                setRequestClear={setRequestClear}
                selected={selected}
                setSelected={setSelected}
                requestCopy={requestCopy}
                setRequestCopy={setRequestCopy}
                requestPaste={requestPaste}
                setRequestPaste={setRequestPaste}
                requestDelete={requestDelete}
                setRequestDelete={setRequestDelete}

            />
            {gameState?.isPresenting() && <ReplayButton onClick={handleRequestReplay} />}
            {false && <StyledImage src={displayedImage}></StyledImage>}
            <Description />
        </ConvasAreaContainer>
    )
}