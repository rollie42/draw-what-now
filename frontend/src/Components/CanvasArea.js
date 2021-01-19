import React, { useCallback, useEffect } from 'react'
import { Atrament, DrawingMode } from '../atrament'
import * as GameApi from '../GameApi'
import * as Context from '../Context'
import styled from 'styled-components'

const ConvasContainer = styled.div`
    position: relative;
    flex: 1;
    margin: 95px 48px 5px 70px;
`

const DescriptionContainer = styled.div`
margin-bottom: 45px;
`

const StyledCanvas = styled.canvas`
    width: 100%;
    height: 100%;
`

const StyledImage = styled.img`
`

function lastEntry(book) {
    if (!book?.entries)
        return undefined

    return book.entries[book.entries.length - 1]
}

function Canvas() {
    const [atrament, setAtrament] = React.useContext(Context.AtramentContext)
    const [lastStroke, setLastStroke] = React.useState(null)
    const [activeBook] = React.useContext(Context.ActiveBookContext)
    const [colorPalette, setColorPalette] = React.useContext(Context.ColorPalette)
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    const [, setActiveTool] = React.useContext(Context.ActiveToolContext)
    const [pushedNumber, setPushedNumber] = React.useState(undefined)
    const canvasRef = React.useRef();

    const toolKeybinds = {
        q: DrawingMode.DRAW,
        w: 'draw-shape',
        e: DrawingMode.DRAW_LINE
    }

    // Init atrament api
    React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.style.cursor = 'crosshair'
        const atrament = new Atrament(canvas, {
            width: canvas.offsetWidth,
            height: canvas.offsetHeight,
        });
        atrament.recordStrokes = true

        atrament.addEventListener('strokerecorded', ({ stroke }) => {
            setLastStroke(stroke)
        });

        const keydownHandler = (e) => {
            if (e.key === 'z' && e.ctrlKey) {
                console.log('undo?')
            } else if (parseInt(e.key) >= 0) {
                setPushedNumber(Number(e.key))
            } else if (e.key in toolKeybinds) {
                setActiveTool(toolKeybinds[e.key])
            }
        }

        window.addEventListener('keydown', keydownHandler)
        setAtrament(atrament)
    }, [])

    // Handle numeric keys
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
    }, [pushedNumber])

    // Update color palette as needed
    useEffect(() => {
        if (lastStroke !== null && !colorPalette.includes(lastStroke.color)) {
            const arr = [...colorPalette, lastStroke.color]
            setColorPalette(arr)
        }
    }, [colorPalette, lastStroke])

    const isDrawing = !activeBook?.entries || activeBook.entries.length % 2 === 1

    return (
        <ConvasContainer>
            {isDrawing && <StyledCanvas ref={canvasRef}></StyledCanvas>}
            {!isDrawing && <StyledImage src={lastEntry(activeBook)}></StyledImage>}
        </ConvasContainer>
    )
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
    const [description, setDescription] = React.useState("")

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
    if (!activeBook?.entries) {
        // Book is empty, so it's our book - pick a phrase
        helpText = "Pick a phrase"
    } else if (activeBook.entries.length % 2 === 1) {
        readOnly = true
    }

    // console.log(activeBook == null, readOnly, helpText, description)
    return (
        <DescriptionContainer>
            <DescriptionInput readOnly={readOnly} placeholder={helpText} value={description} onChange={e => setDescription(e.target.value)} />
        </DescriptionContainer>
    )
}

const ConvasAreaContainer = styled.div`
  flex: 1;
  display: flex;
  flex-flow: column;
  margin: 0px 10px;
  background-image: url('notebook.png');
  background-size: 100% 100%;
  background-position: center;
`

export default function CanvasArea() {
    const [color] = React.useContext(Context.ActiveColorContext)
    const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)
    const [atrament, setAtrament] = React.useContext(Context.AtramentContext)
    const [activeTool, setActiveTool] = React.useContext(Context.ActiveToolContext);
    const [activeShape] = React.useContext(Context.ActiveShapeContext)

    // Keep color, weight, etc in sync with state
    React.useEffect(() => {
        if (atrament !== null) {
            atrament.color = color.hex || color
            console.log(brushWidth)
            atrament.weight = brushWidth
            atrament.mode = activeTool === 'draw-shape' ? activeShape : activeTool
        }
    }, [atrament, color, brushWidth, activeTool, activeShape]);

    const wheelHandler = (e) => {
        const d = brushWidth < 14 ? 1 : 2
        if (e.deltaY < 0) {
            setBrushWidth(brushWidth + d)
        } else if (e.deltaY > 0 && brushWidth > 1) {
            setBrushWidth(brushWidth - d)
        }
    }

    return (
        <ConvasAreaContainer onWheel={wheelHandler}>
            <Canvas />
            <Description />
        </ConvasAreaContainer>
    )
}