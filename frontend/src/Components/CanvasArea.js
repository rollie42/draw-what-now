import React, { useCallback, useEffect } from 'react'
import Atrament from '../atrament'
import * as GameApi from '../GameApi'
import * as Context from '../Context'
import styled from 'styled-components'

const ConvasContainer = styled.div`
    flex: 1;
`

const DescriptionContainer = styled.div`
    font-size: 30px;
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
    const canvasRef = React.useRef();

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
            if (e.ctrlKey && e.key === 'z') {
                console.log('undo?')
                atrament.undo()
            }
        }

        window.addEventListener('keydown', keydownHandler)
        setAtrament(atrament)
    }, [activeBook])

    // Update color palette as needed
    useEffect(() => {
        if (lastStroke !== null && !colorPalette.includes(lastStroke.color)) {
            const arr = [...colorPalette, lastStroke.color]
            setColorPalette(arr)
        }
    }, [colorPalette, lastStroke])

    const isDrawing = activeBook?.entries && activeBook.entries.length % 2 === 1

    return (
        <ConvasContainer>
            {isDrawing && <StyledCanvas ref={canvasRef}></StyledCanvas>}
            {!isDrawing && <StyledImage src={lastEntry(activeBook)}></StyledImage>}
        </ConvasContainer>
    )
}

const DescriptionInput = styled.input`

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
  margin: 20px 10px;
`

export default function CanvasArea() {
    const [color] = React.useContext(Context.ActiveColorContext)
    const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)
    const [atrament, setAtrament] = React.useContext(Context.AtramentContext)

    // Keep color, weight, etc in sync with state
    React.useEffect(() => {
        if (atrament !== null) {
            atrament.color = color.hex || color
            atrament.weight = brushWidth
        }
    }, [atrament, color, brushWidth]);

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