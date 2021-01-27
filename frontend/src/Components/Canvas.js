import React, { useEffect } from 'react'
import { sleep } from '../Utils'
import styled from 'styled-components'
import FloodFill from 'q-floodfill'

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
`

const clear = (canvas) => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

const _getPos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect()
    const position = (event?.changedTouches && event.changedTouches[0]) || event
    return { x: position.clientX - rect.left, y: position.clientY - rect.top }
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

const draw = async (drawParams) => {
    console.log(drawParams)
    const { startPoint, workingCanvas, layerCanvas, mode, fillShape, fakeDrawing } = drawParams
    const workingContext = workingCanvas.getContext('2d')
    const layerContext = layerCanvas.getContext('2d')

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
            const mouseEvt = await (fakeDrawing ? fakeMouseEvent(startTime) : mouseEvent(workingCanvas))
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
            floodFill.fill(layerContext.color, startPoint.x, startPoint.y, 0)
            layerContext.putImageData(floodFill.imageData, 0, 0)

            break
        }
        case DrawingMode.SELECT: {
            const c = workingContext.color
            workingContext.strokeStyle = '#000000'
            workingContext.setLineDash([5, 15])
            await drawShape(({ context, startPoint, dx, dy }) => {
                workingContext.strokeRect(startPoint.x, startPoint.y, dx, dy)
                drawing.dx = dx
                drawing.dy = dy
            })

            workingContext.setLineDash([])
            workingContext.strokeStyle = c



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

const getImageData = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)

export default function Canvas(props) {
    const [undoBufferInternal, setUndoBufferInternal] = React.useState([])
    const [activeBufferIdxInternal, setActiveBufferIdxInternal] = React.useState(0)
    const [currentBufferIdx, setCurrentBufferIdx] = React.useState(0)
    const [copiedImage, setCopiedImage] = React.useState(undefined)
    const workingCanvasRef = React.useRef()
    const activeLayerCanvasRef = React.useRef()

    const { color, lineWidth, mode, fillShape, onDraw, replayList, staticImage, requestClear, setRequestClear } = props
    const { selected, setSelected, requestCopy, setRequestCopy, requestPaste, setRequestPaste, requestDelete, setRequestDelete } = props

    // optional undo related properties
    const [undoBuffer, setUndoBuffer] = props.setUndoBuffer
        ? [props.undoBuffer, props.setUndoBuffer]
        : [undoBufferInternal, setUndoBufferInternal]

    const [activeBufferIdx, setActiveBufferIdx] = props.setActiveBufferIdx
        ? [props.activeBufferIdx, props.setActiveBufferIdx]
        : [activeBufferIdxInternal, setActiveBufferIdxInternal]

    const startDrawing = React.useCallback(async (event) => {
        console.log(staticImage)
        if (event.button !== 0 || staticImage)
            return

        if (event.cancelable)
            event.preventDefault()

        const drawing = await draw({
            startPoint: _getPos(workingCanvasRef.current, event),
            workingCanvas: workingCanvasRef.current,
            layerCanvas: activeLayerCanvasRef.current,
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

        // Save the current image to the undo buffer
        console.log(undoBuffer, activeBufferIdx)
        setUndoBuffer([...undoBuffer.slice(0, activeBufferIdx + 1), {
            imageData: getImageData(activeLayerCanvasRef.current)
        }])
        setCurrentBufferIdx(currentBufferIdx + 1)
        setActiveBufferIdx(currentBufferIdx + 1)

        drawing && onDraw(drawing)
    }, [staticImage, mode, fillShape, undoBuffer, activeBufferIdx, currentBufferIdx, onDraw])

    // Init canvases (one time only)
    useEffect(() => {
        const handler = async () => {
            const activeCanvas = activeLayerCanvasRef.current
            const workingCanvas = workingCanvasRef.current
            const setCanvas = (canvas) => {
                canvas.width = canvas.offsetWidth
                canvas.height = canvas.offsetHeight
                canvas.getContext('2d').translate(0.5, 0.5)
            }

            setCanvas(workingCanvas)
            setCanvas(activeCanvas)
            setUndoBuffer([{
                imageData: getImageData(activeCanvas)
            }])
        }

        handler()
    }, [])

    // Handle copy
    useEffect(() => {
        if (requestCopy) {
            if (selected) {
                const activeCanvas = activeLayerCanvasRef.current
                const imgData = activeCanvas.getContext('2d').getImageData(selected.x, selected.y, selected.dx, selected.dy)
                setCopiedImage(imgData)
                // Sadly, clipboard api seems difficult to work with
            }
            setRequestCopy(false)
        }
    }, [requestCopy, selected])

    // Handle paste
    useEffect(() => {
        if (requestPaste) {
            if (copiedImage) {
                const activeCanvas = activeLayerCanvasRef.current
                const pos = _getPos(activeCanvas, requestPaste)
                console.log(requestPaste)
                activeCanvas.getContext('2d').putImageData(copiedImage, pos.x - copiedImage.width / 2, pos.y - copiedImage.height / 2)
            }
            setRequestPaste(undefined)
        }
    }, [requestPaste, copiedImage])

    // Handle delete
    useEffect(() => {
        console.log(requestDelete, selected)
        if (requestDelete) {
            if (selected) {
                const activeContext = activeLayerCanvasRef.current.getContext('2d')
                activeContext.clearRect(selected.x, selected.y, selected.dx, selected.dy)
            }
            setRequestDelete(false)
        }
    }, [requestDelete, selected])

    // Load static image if provided
    useEffect(() => {
        const handler = async () => {
            if (staticImage) {
                console.log(staticImage)
                if (staticImage === "empty") {
                    clear(activeLayerCanvasRef.current)
                } else {
                    let img = new Image()
                    await new Promise(r => img.onload = r, img.src = staticImage)
                    activeLayerCanvasRef.current.getContext('2d').drawImage(img, 0, 0)
                }
            }
        }

        handler()
    }, [staticImage])

    // Handle clear request
    useEffect(() => {
        if (requestClear) {
            clear(activeLayerCanvasRef.current)
            setRequestClear(false)
        }
    }, [requestClear, activeLayerCanvasRef])

    // Handles buffer changes (i.e., undo/redo)
    useEffect(() => {
        if (activeBufferIdx >= undoBuffer.length) {
            // out of range; disregard this operation
            setActiveBufferIdx(currentBufferIdx)
        } else if (activeBufferIdx !== currentBufferIdx) {
            activeLayerCanvasRef.current.getContext('2d').putImageData(undoBuffer[activeBufferIdx].imageData, 0, 0)
            setCurrentBufferIdx(activeBufferIdx)
        }
    }, [activeBufferIdx, currentBufferIdx, undoBuffer])

    // Handle replay
    useEffect(() => {
        const handler = async () => {
            console.log("replaying!")

            const activeLayerContext = activeLayerCanvasRef.current.getContext('2d')
            const workingContext = workingCanvasRef.current.getContext('2d')
            clear(activeLayerCanvasRef.current)

            const setContextData = (context, drawing) => {
                context.lineWidth = drawing.lineWidth
                context.color = drawing.color
                context.fillStyle = drawing.color
                context.strokeStyle = drawing.color
            }

            for (const drawing of replayList) {
                const params = drawing.drawParams
                setContextData(activeLayerContext, drawing)
                setContextData(workingContext, drawing)
                await draw({
                    ...params,
                    workingCanvas: workingCanvasRef.current,
                    layerCanvas: activeLayerCanvasRef.current,
                    fakeDrawing: drawing
                })
            }
            console.log("done replay")

        }

        if (replayList)
            handler()
    }, [replayList])

    useEffect(() => {
        const setCanvas = (canvas) => {
            const context = canvas.getContext('2d')
            context.globalCompositeOperation = mode === DrawingMode.ERASE
                ? 'destination-out'
                : 'source-over'
            context.globalAlpha = 1
            context.lineWidth = lineWidth
            context.color = color
            context.fillStyle = color
            context.strokeStyle = color
        }

        setCanvas(workingCanvasRef.current)
        setCanvas(activeLayerCanvasRef.current)

    }, [color, lineWidth, workingCanvasRef, activeLayerCanvasRef, mode])

    return (
        <CanvasContainer>
            <StyledCanvas id="layerCanvas" ref={activeLayerCanvasRef} />
            <StyledCanvas id="workingCanvas" ref={workingCanvasRef} onPointerDown={startDrawing} />
        </CanvasContainer>
    )
}