import React, { useEffect } from 'react'
import { sleep } from '../Utils'
import styled from 'styled-components'
import PaintBrushImg from '../images/icons/paint-brush.png'
import { DrawAction, PasteAction } from '../History'
import { clearSelection, drawFn, DrawingStage } from './Drawing'
import DrawingContext from '../DrawingContext'

export const DrawingMode = {
    DRAW: 'draw',
    DRAW_SHAPE: 'draw-shape',
    DRAW_LINE: 'draw-line',
    ERASE: 'erase',
    FILL: 'fill',
    DISABLED: 'disabled',
    SELECT: 'select',
    MOVE: 'move'
}

export const Shapes = {
    CIRCLE: 'circle',
    SQUARE: 'square',
    TRIANGLE: 'triangle'
}

export const MouseEventType = {
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

const UICanvas = styled(StyledCanvas)`
    z-index: 10;
`

const clear = (canvas) => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

export const _getPos = (canvas, event) => {
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

const draw = async (drawParams) => {
    const { startPoint, workingCanvas, layerCanvas, uiCanvas, mode, shape, fakeDrawing, layer, uiCanvasBackupBuffer } = drawParams
    const workingContext = workingCanvas.getContext('2d')
    const layerContext = layerCanvas.getContext('2d')
    const uiContext = uiCanvas.getContext('2d')
    layer.backupBuffer = undefined
    uiCanvasBackupBuffer.current = undefined

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
        width: ${props => props.dimensions ? props.dimensions.width + 'px' : '100%'};
        height: ${props => props.dimensions ? props.dimensions.height + 'px' : '100%'};
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
const putImageData = (canvas, image) => canvas.getContext('2d').putImageData(image, 0, 0)

export const getDrawing = (layers) => {
    var tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = layers[0].canvasRef.current.width;
    tmpCanvas.height = layers[0].canvasRef.current.height;
    var tempContext = tmpCanvas.getContext("2d");
    for (const layer of layers) {
        tempContext.drawImage(layer.canvasRef.current, 0, 0)
        tempContext.drawImage(layer.workingCanvasRef.current, 0, 0)
    }

    // const imgData = getImageData(tmpCanvas)
    const imgData = tmpCanvas.toDataURL('image/png').split(';base64,')[1]
    // document.removeElement(tmpCanvas)
    return imgData
}

export default function Canvas(props) {
    //const [currentBufferIdx, setCurrentBufferIdx] = React.useState(0)
    const [canvasDimensions, setCanvasDimensions] = React.useState(undefined)
    const activeLayerRef = React.useRef()
    const canvasContainerRef = React.useRef()
    const uiCanvasBackupBuffer = React.useRef(undefined)    

    const { activeLayerCanvasRef, workingCanvasRef, uiCanvasRef } = props    
    const useEffectAsync = (fn, deps) => {
        useEffect(() => {
            const handler = async () => {
                fn(activeLayerCanvasRef.current, workingCanvasRef.current, uiCanvasRef.current)
            }

            handler()
        }, [...deps, layers])
    }

    const { activeColor, lineWidth, mode, shape, fillShape, onDraw, replayList, staticImage, requestClear, setRequestClear } = props
    const { requestCopy, setRequestCopy, requestPaste, setRequestPaste, requestDelete, setRequestDelete } = props
    const { actionHistory, setActionHistory, layers, requestUndo, setRequestUndo, requestRedo, setRequestRedo } = props

    const drawingContextRef = React.useRef(new DrawingContext({lineWidth, fillShape}))

    const getCanvases = () => { return {
        layerCanvas: activeLayerCanvasRef.current,
        workingCanvas: workingCanvasRef.current,
        uiCanvas: uiCanvasRef.current
    }}

    for (const layer of layers) {
        if (layer.canvasRef === undefined) {
            layer.canvasRef = React.createRef()
            layer.workingCanvasRef = React.createRef()            
        }
    }

    useEffect(() => {
        for (const layer of layers) {    
            if (layer.active) {
                activeLayerRef.current = layer
                activeLayerCanvasRef.current = layer.canvasRef.current
                workingCanvasRef.current = layer.workingCanvasRef.current
            }
        }
    })

    const pushAction = (action) => {
        setActionHistory(actions => {
            return [...actions.filter(a => a.active), action]
        })
    }

    const lastActiveUndoIdx = (buffer) => {
        for (var i=0; i<buffer.length; i++) {
            if (!buffer[i].active)
                return i-1
        }
            
        return buffer.length-1
    }

    const enrichProps = props => {
        return {
            ...props,
            layerCanvas: activeLayerCanvasRef.current,
            workingCanvas: workingCanvasRef.current,
            uiCanvas: uiCanvasRef.current
        }
    }

    const startDrawing = React.useCallback(async (event) => {
        if (event.button !== 0 || staticImage)
            return

        if (event.cancelable)
            event.preventDefault()

        const startingImg = getImageData(activeLayerCanvasRef.current)

        const firstEvent = new MouseEvent(
            MouseEventType.DOWN,
            _getPos(workingCanvasRef.current, event), 
            event.pointerType === 'pen', 
            event.pressure)

        const drawShape = drawFn(mode, shape)
        const state = {
            stage: DrawingStage.DEFINE,
            mode,
            firstEvent,
            curEvent: firstEvent
        }
        
        while (true) {
            const ev = state.curEvent
            if (ev.up())
                break
            
            state.drawingContext = drawingContextRef.current
            clear(workingCanvasRef.current)
            drawShape(getCanvases(), state)            
            
            state.curEvent = await mouseEvent(uiCanvasRef.current)   
        }

        state.stage = DrawingStage.COMMIT
   
        console.log('state: ', state)
        clear(workingCanvasRef.current)
        const action = new DrawAction(startingImg, mode, shape, state)
        pushAction(action)
        const res = action.exec(getCanvases())
        onDraw(res) // TODO: what does this need to provide?
    }, [activeColor, staticImage, mode, fillShape, actionHistory, onDraw, shape, layers, lineWidth])    

    useEffect(() => {
        const handleResize = () => {
            // clearTimeout(window.resizeFinished)
            // window.resizeFinished = setTimeout(() => {
                if (uiCanvasBackupBuffer.current === undefined) {
                    uiCanvasBackupBuffer.current = getImageData(uiCanvasRef.current)
                }

                const h = canvasContainerRef.current.offsetHeight
                const w = canvasContainerRef.current.offsetWidth
                const resizeCanvas = (canvas, img) => {
                    canvas.width = w
                    canvas.height = h
                    setCanvas(canvas)
                    putImageData(canvas, img)
                }

                for (const layer of layers) {
                    if (layer.backupBuffer === undefined) {
                        layer.backupBuffer = {
                            canvas: getImageData(layer.canvasRef.current),
                            workingCanvas: getImageData(layer.workingCanvasRef.current)
                        }
                    }
                    resizeCanvas(layer.canvasRef.current, layer.backupBuffer.canvas)
                    resizeCanvas(layer.workingCanvasRef.current, layer.backupBuffer.workingCanvas)
                }
                resizeCanvas(uiCanvasRef.current, uiCanvasBackupBuffer.current)
            // }, 500)
        }
        window.addEventListener("resize", handleResize)
    }, [])
    // Init canvases
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        const setCanvas = (canvas) => {
            if (!canvas.init) {
                canvas.init = true
                const ctx = canvas.getContext('2d')
                canvas.width = dimensions.width
                canvas.height = dimensions.height
                ctx.translate(0.5, 0.5) // TODO...why?
                ctx.globalAlpha = 1;
                ctx.imageSmoothingEnabled = false;
            }
        }
        
        var dimensions = canvasDimensions
        if (canvasDimensions === undefined) {
            // This is the first time we know dimensions - update the container to a fixed size
            // to prevent resizing the canvas later
            // canvasContainerRef.current.width = canvasContainerRef.current.offsetWidth/2
            // canvasContainerRef.current.height = canvasContainerRef.current.offsetHeight/2
            dimensions = { width: layerCanvas.offsetWidth, height: layerCanvas.offsetHeight }
            setCanvasDimensions(dimensions)
        }

        setCanvas(layerCanvas)
        setCanvas(workingCanvas)
        setCanvas(uiCanvas)
    }, [canvasDimensions])

    // Handle mode change (requires cleanup of working buffer)
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (![DrawingMode.SELECT, DrawingMode.MOVE].includes(mode)) {
            // This operation can't work on selection; write
            // whatever is in working buffer to layer
            // TODO: this probably doesn't work with layer change
            clearSelection(getCanvases(), drawingContextRef.current)
        }        
    }, [mode])        

    // Handle copy
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestCopy) {
            const selection = drawingContextRef.current.selection
            if (selection) {
                const imgData = layerCanvas.getContext('2d').getImageData(selection.startPoint.x, selection.startPoint.y, selection.delta.x, selection.delta.y)
                drawingContextRef.current.copiedImage = imgData
                // Sadly, clipboard api seems difficult to work with
            }
            setRequestCopy(false)
        }
    }, [requestCopy])

    // Handle paste
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestPaste) {
            const copiedImg = drawingContextRef.current.copiedImage
            if (copiedImg) {
                clearSelection(getCanvases(), drawingContextRef.current)
                const startingImg = getImageData(activeLayerCanvasRef.current)
                const pos = _getPos(layerCanvas, requestPaste)
                const action = new PasteAction(startingImg, copiedImg, pos)
                pushAction(action)
                action.exec(getCanvases())
                //layerCanvas.getContext('2d').putImageData(copiedImg, pos.x - copiedImg.width / 2, pos.y - copiedImg.height / 2)
                // TODO: actionHistory
                // TODO: save to replay buffers
            }
            setRequestPaste(undefined)
        }
    }, [requestPaste])

    // Handle delete
    useEffectAsync((layerCanvas, workingCanvas, uiCanvas) => {
        if (requestDelete) {
            const selection = drawingContextRef.current.selection
            if (selection) {
                layerCanvas.getContext('2d').clearRect(selection.startPoint.x, selection.startPoint.y, selection.delta.x, selection.delta.y)
                clearSelection(getCanvases(), drawingContextRef.current)
                // TODO: actionHistory
            }
            setRequestDelete(false)
        }
    }, [requestDelete])

    // Load static image if provided
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        if (staticImage) {
            clear(layerCanvas)
            if (staticImage !== "empty") {
                let img = new Image()
                img.crossOrigin = "Anonymous";
                await new Promise(r => img.onload = r, img.src = staticImage)
                // TODO: center
                layerCanvas.getContext('2d').drawImage(img, 0, 0, layerCanvas.width, layerCanvas.height)
            }
        }
    }, [staticImage])

    // Handle clear request
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        if (requestClear) {
            clearSelection(getCanvases(), drawingContextRef.current)
            for (const layer of layers) {
                clear(layer.canvasRef.current)
            }
            setRequestClear(false)
            // TODO: actionHistory
        }
    }, [requestClear])

    // Handles undo/redo
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {
        const idx = lastActiveUndoIdx(actionHistory)
        if (requestUndo && idx >= 0) {
            actionHistory[idx].active = false
            actionHistory[idx].undo(getCanvases())
            setActionHistory([...actionHistory])
        } else if (requestRedo && idx < actionHistory.length - 1) {
            actionHistory[idx+1].active = true
            actionHistory[idx+1].exec(getCanvases())
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

    const setCanvas = React.useCallback((canvas) => {
        const context = canvas.getContext('2d')
        context.globalCompositeOperation = mode === DrawingMode.ERASE
            ? 'destination-out'
            : 'source-over'//'hard-light'
        context.lineWidth = lineWidth
        context.color = activeColor
        context.fillStyle = activeColor
        context.strokeStyle = activeColor
        canvas.style.cursor = cursorIcons[mode]
    }, [activeColor, lineWidth, layers, mode])

    // Handle property change
    useEffectAsync(async (layerCanvas, workingCanvas, uiCanvas) => {        

        setCanvas(layerCanvas)
        setCanvas(workingCanvas)
        setCanvas(uiCanvas)
    }, [activeColor, lineWidth, layers, mode])

    useEffect(() => {
        drawingContextRef.current.lineWidth = lineWidth
        drawingContextRef.current.fillShape = fillShape
    }, [fillShape, lineWidth])

    // const activeLayerIndex = layers.findIndex(l => l.active)
    return (
        <CanvasContainer ref={canvasContainerRef} >
            {layers.map(v => <React.Fragment key={v.id}>
                <StyledCanvas hidden={!v.visible} id={v.id} ref={v.canvasRef}/>
                <StyledCanvas hidden={!v.visible} id={'working_'+v.id} ref={v.workingCanvasRef}/>                
                </React.Fragment>)}
            <UICanvas id="uiCanvas" ref={uiCanvasRef} onPointerDown={startDrawing} />
        </CanvasContainer>
    )
}