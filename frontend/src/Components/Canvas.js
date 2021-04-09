import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import { sleep, usePrevState, useStateChange } from '../Utils'
import styled from 'styled-components'
import FloodFill from 'q-floodfill'
import PaintBrushImg from '../images/icons/paint-brush.png'
import { DrawAction } from '../History'

export const DrawingMode = {
    DRAW: 'draw',
    DRAW_SQUARE: 'draw-square',
    DRAW_CIRCLE: 'draw-circle',
    DRAW_TRIANGLE: 'draw-triangle',
    DRAW_LINE: 'draw-line',
    ERASE: 'erase',
    FILL: 'fill',
    DISABLED: 'disabled',
    SELECT: 'select',
    MOVE: 'move'
}

const MouseEventType = {
    UP: "up",
    DOWN: "down",
    MOVE: "move"
}

class MouseEvent {
    constructor(eventType, position, pen, pressure) {
        this.eventType = eventType
        this.position = position
        this.pen = pen
        this.pressure = pressure
    }

    up() { return this.eventType === MouseEventType.UP }
    down() { return this.eventType === MouseEventType.DOWN }
    move() { return this.eventType === MouseEventType.MOVE }
}

const StyledCanvas = styled.canvas`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: ${props => props.hidden ? 'none;' : 'block;'}    
`

const clear = (canvas) => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

const _getPos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const position = (event?.changedTouches && event.changedTouches[0]) || event
    return { x: Math.floor(position.clientX - rect.left), y: Math.floor(position.clientY - rect.top) }
}

const mouseEvent = (canvas) => {
    return new Promise((resolve, reject) => {
        const makeHandler = type => event => {
            if (event.type === 'pointerup' && event.button !== 0)
                return

            if (event.cancelable)
                event.preventDefault()

            canvas.removeEventListener('pointermove', moveHandler)
            document.removeEventListener('pointerup', upHandler)
            resolve(new MouseEvent(type, _getPos(canvas, event), event.pointerType === 'pen', event.pressure))
        }

        const moveHandler = makeHandler(MouseEventType.MOVE)
        const upHandler = makeHandler(MouseEventType.UP)

        canvas.addEventListener('pointermove', moveHandler)
        document.addEventListener('pointerup', upHandler)
    })
}

const clearSelection = ([layerCanvas, workingCanvas, uiCanvas]) => {
    console.log("Clear selection...?")
    layerCanvas.getContext('2d').drawImage(workingCanvas, 0, 0)
    clear(workingCanvas)
    clear(uiCanvas)
}

const draw = async (drawParams) => {
    console.log(drawParams)
    const { startPoint, workingCanvas, layerCanvas, uiCanvas, mode, fillShape, fakeDrawing } = drawParams
    const workingContext = workingCanvas.getContext('2d')
    const layerContext = layerCanvas.getContext('2d')
    const uiContext = uiCanvas.getContext('2d')

    var fakePointIdx = 0
    const fakeMouseEvent = async (startTime) => {
        switch (mode) {
            case DrawingMode.DRAW:
            case DrawingMode.ERASE: {
                const points = fakeDrawing.points

                await sleep(.001)
                fakePointIdx = Math.min(fakePointIdx + 2, points.length - 1)

                return new MouseEvent(
                    fakePointIdx === points.length - 1 ? MouseEventType.UP : MouseEventType.MOVE,
                    points[fakePointIdx],
                    false,
                    1)
            }
            case DrawingMode.DRAW_SQUARE:
            case DrawingMode.DRAW_CIRCLE:
            case DrawingMode.DRAW_TRIANGLE:
            case DrawingMode.DRAW_LINE: {
                await sleep(1)
                const t = Date.now() - startTime
                const durationMs = 800
                const pos = {
                    x: startPoint.x + fakeDrawing.dx * t / durationMs,
                    y: startPoint.y + fakeDrawing.dy * t / durationMs
                }

                return new MouseEvent(
                    t >= durationMs ? MouseEventType.UP : MouseEventType.MOVE,
                    pos,
                    false,
                    1)
            }
            case DrawingMode.FILL:
            default:
                break
        }
    }

    const drawShape = async (drawFn) => {
        const startTime = Date.now()
        while (true) {
            const mouseEvt = await (fakeDrawing ? fakeMouseEvent(startTime) : mouseEvent(uiCanvas))
            const { pen, pressure, position } = mouseEvt
            const dx = mouseEvt.position.x - startPoint.x
            const dy = mouseEvt.position.y - startPoint.y

            // clear temp canvas
            clear(workingCanvas)
            
            drawFn({
                context: mouseEvt.up() ? layerContext : workingContext,
                startPoint,
                endPoint: position,
                dx,
                dy,
                pen,
                pressure
            })

            if (mouseEvt.up()) {
                console.log("Done!")
                console.log(layerContext)
                return
            }
        }
    }

    var drawing = {
        drawParams,
        color: workingContext.color,
        lineWidth: workingContext.lineWidth,
    }

    switch (mode) {
        case DrawingMode.DRAW:
        case DrawingMode.ERASE:
            var path = undefined
            const paths = []
            const points = [{ ...startPoint }]

            const t = 1

            await drawShape(({ context, endPoint, pen, pressure }) => {
                if (mode === DrawingMode.ERASE)
                    context = layerContext

                var lineWidth = context.lineWidth
                if (pen) {
                    const x = Math.pow(Math.E, 2.03731 * pressure)
                    const width = 11.2892 * x - 12.0045
                    lineWidth = Math.min(Math.max(width, 1), 72)
                }

                points.push({ ...endPoint, lineWidth })

                const i = points.length - 2
                var p0 = (i > 0) ? points[i - 1] : points[0]
                var p1 = points[i]
                var p2 = points[i + 1] // This is the one we're going to
                var p3 = (i !== points.length - 2) ? points[i + 2] : p2

                if (!path || lineWidth !== path.lineWidth) {
                    // line width changed - set up a new path
                    path = new Path2D()
                    path.lineWidth = lineWidth
                    path.moveTo(p1.x, p1.y)
                    paths.push(path)
                }

                var filledShape = false
                if (points.length > 2 || (points.length === 2 && points[0].x !== points[1].x && points[0].y !== points[1].y)) {
                    var cp1x = p1.x + (p2.x - p0.x) / 6 * t
                    var cp1y = p1.y + (p2.y - p0.y) / 6 * t

                    var cp2x = p2.x - (p3.x - p1.x) / 6 * t
                    var cp2y = p2.y - (p3.y - p1.y) / 6 * t
                    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
                } else {
                    // draw  as a single point
                    console.log('single point')
                    filledShape = true
                    //path.ellipse(startPoint.x, startPoint.y, lineWidth / 4, lineWidth / 4, 0, 0, 2 * Math.PI)
                    context.beginPath()
                    context.lineWidth = 1
                    context.arc(startPoint.x, startPoint.y, lineWidth / 2, 0, 2 * Math.PI)

                }

                paths.forEach(p => {
                    if (filledShape) {
                        context.fill()
                        context.lineWidth = p.lineWidth
                    } else {
                        context.lineWidth = p.lineWidth
                        context.stroke(p)
                    }
                })
                drawing.points = points
            })
            break
        case DrawingMode.DRAW_SQUARE:
            await drawShape(({ context, startPoint, dx, dy }) => {
                fillShape
                    ? context.fillRect(startPoint.x, startPoint.y, dx, dy)
                    : context.strokeRect(startPoint.x, startPoint.y, dx, dy)
                drawing.dx = dx
                drawing.dy = dy
            })
            break
        case DrawingMode.DRAW_CIRCLE:
            await drawShape(({ context, startPoint, dx, dy }) => {
                const rx = dx / 2
                const ry = dy / 2
                context.beginPath()
                context.ellipse(startPoint.x + rx, startPoint.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
                if (fillShape)
                    context.fill()
                context.stroke()
                drawing.dx = dx
                drawing.dy = dy
            })
            break
        case DrawingMode.DRAW_TRIANGLE:
            await drawShape(({ context, startPoint, endPoint, dx, dy }) => {
                context.beginPath()
                context.moveTo(startPoint.x + dx / 2, startPoint.y)
                context.lineTo(startPoint.x, endPoint.y)
                context.lineTo(endPoint.x, endPoint.y)
                if (fillShape)
                    context.fill()
                context.stroke()
                drawing.dx = dx
                drawing.dy = dy
            })
            break
        case DrawingMode.DRAW_LINE:
            await drawShape(({ context, startPoint, endPoint, dx, dy }) => {
                context.beginPath()
                context.moveTo(startPoint.x, startPoint.y)
                context.lineTo(endPoint.x, endPoint.y)
                context.stroke()
                drawing.dx = dx
                drawing.dy = dy
            })
            break
        case DrawingMode.FILL: {
            const imgData = layerContext.getImageData(0, 0, layerCanvas.width, layerCanvas.height)
            const floodFill = new FloodFill(imgData)
            floodFill.fill(layerContext.color, Math.floor(startPoint.x), Math.floor(startPoint.y), 0)
            layerContext.putImageData(floodFill.imageData, 0, 0)

            break
        }
        case DrawingMode.SELECT: {
            // Undo the effect of any previous selection
            clearSelection([layerCanvas, workingCanvas, uiCanvas])

            uiContext.save()
            uiContext.strokeStyle = '#000000'
            uiContext.setLineDash([5, 15])
            await drawShape(({ context, startPoint, dx, dy }) => {
                clear(uiCanvas)
                uiContext.strokeRect(startPoint.x, startPoint.y, dx, dy)
                drawing.dx = dx
                drawing.dy = dy
            })

            // Move the selected area into the working canvas to support moving
            console.log(startPoint, drawing)
            const imgData = layerContext.getImageData(startPoint.x, startPoint.y, drawing.dx, drawing.dy)
            workingContext.putImageData(imgData, startPoint.x, startPoint.y)
            layerContext.clearRect(startPoint.x, startPoint.y, drawing.dx, drawing.dy)
            //layerContext.clearRect(0, 0, 9000, 9000)
            uiContext.restore()

            break
        }
        case DrawingMode.MOVE: {
            const workingImg = workingContext.getImageData(0, 0, workingCanvas.width, workingCanvas.height)
            const uiImg = uiContext.getImageData(0, 0, uiCanvas.width, uiCanvas.height)
            await drawShape(({ context, startPoint, dx, dy }) => {
                workingContext.putImageData(workingImg, dx, dy)
                uiContext.putImageData(uiImg, dx, dy)
            })
            break
        }
        default:
            break
    }

    return drawing
}

const CanvasContainer = styled.div`
        position: relative;
        width: 100%;
        height: 100%;
    `

const cursorIcons = {
    [DrawingMode.DRAW]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.DRAW_SQUARE]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.DRAW_CIRCLE]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.DRAW_TRIANGLE]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.DRAW_LINE]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.ERASE]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.FILL]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.DISABLED]: 'auto',
    [DrawingMode.SELECT]: `url(${PaintBrushImg}) 4 26, auto`,
    [DrawingMode.MOVE]: `url(${PaintBrushImg}) 4 26, auto`,
}

const getImageData = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)

const combineCanvases = (canvases) => {
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = canvases[0].width;
    tmpCanvas.height = canvases[0].height;
    var tempContext = tmpCanvas.getContext("2d");
    for (const canvas of canvases) {
        tempContext.drawImage(canvas, 0, 0)
    }

    const imgData = getImageData(tmpCanvas)
    // document.removeElement(tmpCanvas)
    return imgData
}

export default function Canvas(props) {
    //const [currentBufferIdx, setCurrentBufferIdx] = React.useState(0)
    const [copiedImage, setCopiedImage] = React.useState(undefined)

    // const activeLayerCanvasRef = React.useRef()
    // const workingCanvasRef = React.useRef()
    // const uiCanvasRef = React.useRef()

    console.log(props)

    const { activeLayerCanvasRef, workingCanvasRef, uiCanvasRef } = props
    const useEffectAsync = (fn, deps) => {
        useEffect(() => {
            const handler = async () => {
                fn(activeLayerCanvasRef.current, workingCanvasRef.current, uiCanvasRef.current)
            }

            handler()
        }, [...deps, layers])
    }

    
    const { activeColor, lineWidth, mode, fillShape, onDraw, replayList, staticImage, requestClear, setRequestClear } = props
    const { selected, setSelected, requestCopy, setRequestCopy, requestPaste, setRequestPaste, requestDelete, setRequestDelete } = props
    const { actionHistory, setActionHistory, layers, requestUndo, setRequestUndo, requestRedo, setRequestRedo } = props

    const pushAction = (action) => {
        setActionHistory(actions => {
            const firstInactiveIdx = actions.findIndex(action => !action.active)
            return [...actions.slice(0, Math.min(0, firstInactiveIdx)), action]
        })
    }

    const lastActiveUndoIdx = (buffer) => {
        for (var i=0; i<buffer.length; i++) {
            if (!buffer[i].active)
                return i-1
            
            return buffer.length-1
        }
    }

    const startDrawing = React.useCallback(async (event) => {
        if (event.button !== 0 || staticImage)
            return

        if (event.cancelable)
            event.preventDefault()

        const startingImg = getImageData(activeLayerCanvasRef.current) // TODO: can we ignore working?

        const drawing = await draw({
            startPoint: _getPos(workingCanvasRef.current, event),
            workingCanvas: workingCanvasRef.current,
            layerCanvas: activeLayerCanvasRef.current,
            uiCanvas: uiCanvasRef.current,
            mode,
            fillShape
        })

        if (mode === DrawingMode.SELECT) {
            console.log(drawing)
            setSelected({
                x: drawing.drawParams.startPoint.x,
                y: drawing.drawParams.startPoint.y,
                dx: drawing.dx,
                dy: drawing.dy
            })
        }

        if (drawing) {
            // const img = combineCanvases([activeLayerCanvasRef.current, workingCanvasRef.current])        
            const action = new DrawAction(startingImg, drawing)
            pushAction(action)
            action.exec(drawing)
            onDraw(drawing)
        }
    }, [staticImage, mode, fillShape, actionHistory, onDraw, layers])

    // Init canvases
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        const setCanvas = (canvas) => {
            if (!canvas.init) {
                console.log('init...')
                canvas.init = true
                const ctx = canvas.getContext('2d')
                canvas.width = canvas.offsetWidth
                canvas.height = canvas.offsetHeight
                ctx.translate(0.5, 0.5)
                ctx.globalAlpha = 1;
                ctx.imageSmoothingEnabled = false;
            }
        }

        setCanvas(layerCanvas)
        setCanvas(workingCanvas)
        setCanvas(uiCanvas)
    }, [])

    // Handle mode change (requires cleanup of working buffer)
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (![DrawingMode.SELECT, DrawingMode.MOVE].includes(mode)) {
            // This operation can't work on selection; write
            // whatever is in working buffer to layer
            // TODO: this probably doesn't work with layer change
            clearSelection([layerCanvas, workingCanvas, uiCanvas])
        }        
    }, [mode])        

    // Handle copy
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestCopy) {
            if (selected) {
                const imgData = workingCanvas.getContext('2d').getImageData(selected.x, selected.y, selected.dx, selected.dy)
                setCopiedImage(imgData)
                // Sadly, clipboard api seems difficult to work with
            }
            setRequestCopy(false)
        }
    }, [requestCopy, selected])

    // Handle paste
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestPaste) {
            if (copiedImage) {
                clearSelection([layerCanvas, workingCanvas, uiCanvas])
                const pos = _getPos(layerCanvas, requestPaste)
                console.log('PASTE??')
                layerCanvas.getContext('2d').putImageData(copiedImage, pos.x - copiedImage.width / 2, pos.y - copiedImage.height / 2)
                // TODO: actionHistory
                // TODO: save to replay buffers
            }
            setRequestPaste(undefined)
        }
    }, [requestPaste, copiedImage])

    // Handle delete
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestDelete) {
            if (selected) {
                clear(workingCanvas)
                // TODO: actionHistory
            }
            setRequestDelete(false)
        }
    }, [requestDelete, selected])

    // Load static image if provided
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        if (staticImage) {
            console.log(staticImage)
            clear(layerCanvas)
            if (staticImage !== "empty") {
                let img = new Image()
                await new Promise(r => img.onload = r, img.src = staticImage)
                layerCanvas.getContext('2d').drawImage(img, 0, 0)
            }
        }
    }, [staticImage])

    // Handle clear request
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        if (requestClear) {
            clear(layerCanvas)
            setRequestClear(false)
            // TODO: actionHistory
        }
    }, [requestClear])

    // Handles undo/redo
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        const idx = lastActiveUndoIdx(actionHistory)
        console.log(requestUndo, idx, actionHistory)
        if (requestUndo && idx >= 0) {
            actionHistory[idx].active = false
            actionHistory[idx].undo(props) // TODO: will this update...?
            setActionHistory([...actionHistory])
        } else if (requestRedo && idx < actionHistory.length - 1) {
            actionHistory[idx+1].active = true
            actionHistory[idx+1].exec(props)
            setActionHistory([...actionHistory])            
            // layerCanvas.getContext('2d').putImageData(undoBuffer[activeBufferIdx].imageData, 0, 0)
        }
        setRequestUndo(false)
        setRequestRedo(false)
    }, [requestUndo, requestRedo, actionHistory])

    // Handle replay
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        if (!replayList)
            return

        console.log("replaying!")

        clear(layerCanvas)

        const setContextData = (context, drawing) => {
            context.lineWidth = drawing.lineWidth
            context.color = drawing.color
            context.fillStyle = drawing.color
            context.strokeStyle = drawing.color
        }

        for (const drawing of replayList) {
            const params = drawing.drawParams
            setContextData(layerCanvas.getContext('2d'), drawing)
            setContextData(workingCanvas.getContext('2d'), drawing)
            await draw({
                ...params,
                workingCanvas,
                layerCanvas,
                uiCanvas,
                fakeDrawing: drawing
            })
        }
        console.log("done replay")

    }, [replayList])

    // Handle property change
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        const setCanvas = (canvas) => {
            const context = canvas.getContext('2d')
            context.globalCompositeOperation = mode === DrawingMode.ERASE
                ? 'destination-out'
                : 'source-over'//'hard-light'
            context.lineWidth = lineWidth
            context.color = activeColor
            context.fillStyle = activeColor
            context.strokeStyle = activeColor
            canvas.style.cursor = cursorIcons[mode]
        }

        setCanvas(layerCanvas)
        setCanvas(workingCanvas)
        setCanvas(uiCanvas)
    }, [activeColor, lineWidth, workingCanvasRef, layers, mode])

    const activeLayerIndex = layers.findIndex(l => l.active)
    return (
        <CanvasContainer>
            {layers.map(v => <>
                <StyledCanvas hidden={!v.visible} id={v.id} key={v.id} ref={v.active ? activeLayerCanvasRef : undefined}/>
                <StyledCanvas hidden={!v.visible} id={'working_'+v.id} key={'working_'+v.id} ref={v.active ? workingCanvasRef : undefined}/>                
                </>)}
            <StyledCanvas id="uiCanvas" ref={uiCanvasRef} onPointerDown={startDrawing} />
        </CanvasContainer>
    )
}