import {DrawingMode, MouseEventType, Shapes, _getPos} from './Canvas'
import FloodFill from 'q-floodfill'

export const DrawingStage = {
    DEFINE: 'define',
    COMMIT: 'commit',
    REPLAY: 'replay'
}

const pushContext = (canvases, drawingContext) => {
    for (const canvas of Object.values(canvases)) {
        const canvasContext = canvas.getContext('2d')
        canvasContext.save()
        canvasContext.lineWidth = drawingContext.lineWidth
    }
}

const popContext = (canvases) => {
    for (const canvas of Object.values(canvases)) {
        canvas.getContext('2d').restore()
    }
}

export const drawFn = (mode, shape) => {
    const fn = drawFnInner(mode, shape)
    return (canvases, state) => {
        pushContext(canvases, state.drawingContext)
        fn(canvases, state)
        popContext(canvases)
    }
}

export const drawFnInner = (mode, shape) => {
    switch(mode) {
        case DrawingMode.DRAW_SHAPE:
            switch(shape) {
                case Shapes.SQUARE:
                    return drawSquare
                case Shapes.CIRCLE:
                    return drawCircle
                case Shapes.TRIANGLE:
                    return drawTriangle
                default:
                    throw new Error(`unknown shape '${shape}'`)
            }
        case DrawingMode.DRAW_LINE:
            return drawLine
        case DrawingMode.DRAW:
        case DrawingMode.ERASE:
            return drawPath
        case DrawingMode.FILL:
            return fill
        case DrawingMode.SELECT:
            return select
        case DrawingMode.MOVE:
            return move
        default:
            throw new Error(`unknown drawing mode '${mode}'`)
    }
}

const clear = (canvas) => {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
}

const drawCurve = (points, path) => {
    const t = 1
    const i = points.length - 2
    var p0 = (i > 0) ? points[i - 1] : points[0]
    var p1 = points[i]
    var p2 = points[i + 1] // This is the one we're going to
    var p3 = (i !== points.length - 2) ? points[i + 2] : p2
    var cp1x = p1.x + (p2.x - p0.x) / 6 * t
    var cp1y = p1.y + (p2.y - p0.y) / 6 * t

    var cp2x = p2.x - (p3.x - p1.x) / 6 * t
    var cp2y = p2.y - (p3.y - p1.y) / 6 * t
    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)
}

function pressureToLineWidth(pressure) {
    return Math.max(1, Math.min(72, pressure * 77 - 5));
}

function drawPath(canvases, state) {
    const canvas = state.stage === DrawingStage.DEFINE && state.mode !== DrawingMode.ERASE ? canvases.workingCanvas : canvases.layerCanvas
    state.paths = state.paths ?? []
    state.points = state.points ?? []
    const paths = state.paths
    const points = state.points

    var path = paths[paths.length-1]
    const lineWidth = state.curEvent.pen 
        ? pressureToLineWidth(state.curEvent.pressure)
        : state.drawingContext.lineWidth

    if (state.stage === DrawingStage.DEFINE) {
        const curPoint = state.curEvent.position                
        points.push(curPoint)
        if (path === undefined || lineWidth !== path.lineWidth) {
            if (path !== undefined) {
                // bridge between 2 paths - draw with the mean line width
                const linkingPath = new Path2D()
                const prevPt = points[points.length - 2]
                linkingPath.moveTo(prevPt.x, prevPt.y)
                drawCurve(points, linkingPath)
                linkingPath.lineWidth = (lineWidth + path.lineWidth) / 2
                linkingPath.linking = true
                paths.push(linkingPath)
            }
            path = new Path2D()
            path.moveTo(curPoint.x, curPoint.y)
            path.lineWidth = lineWidth
            paths.push(path)
        }
    }

    if (points.length === 1) {
        // const x = points[0].x - lineWidth/2
        // const y = points[0].y - lineWidth/2
        // drawCircleOnce(canvas, {location: {x: x, y: y}, dx: lineWidth, dy: lineWidth, fillShape: true})
        const context = canvas.getContext('2d')
        const prevLineWidth = context.lineWidth
        context.beginPath()
        context.lineWidth = 1
        context.arc(points[0].x, points[0].y, lineWidth / 2, 0, 2 * Math.PI)
        context.fill()
        context.lineWidth = prevLineWidth
    } else {
        
        if (state.stage === DrawingStage.DEFINE) {
            drawCurve(points, path)
        }

        if (state.stage === DrawingStage.COMMIT) {
            // console.log(points)
            // console.log(paths)
        }
        
        const context = canvas.getContext('2d')

        paths.forEach(p => {
            const lineWidth = context.lineWidth
            context.lineWidth = p.lineWidth
            context.stroke(p)
            context.lineWidth = lineWidth
        })
    }
}

const getStateInfo = (state) => {
    const startPoint = state.firstEvent.position
    const endPoint = state.curEvent.position
    const dx = endPoint.x - startPoint.x
    const dy = endPoint.y - startPoint.y
    return {
        ...state,
        startPoint,
        endPoint,
        dx,
        dy,
        rx: dx / 2,
        ry: dy / 2
    }
}

export function drawSquare(canvases, state) {
    const canvas = state.stage === DrawingStage.DEFINE ? canvases.workingCanvas : canvases.layerCanvas
    const context = canvas.getContext('2d')
    const {startPoint, dx, dy} = getStateInfo(state)
    state.drawingContext.fillShape
        ? context.fillRect(startPoint.x, startPoint.y, dx, dy)
        : context.strokeRect(startPoint.x, startPoint.y, dx, dy)
}

export function drawCircle(canvases, state) {
    const canvas = state.stage === DrawingStage.DEFINE ? canvases.workingCanvas : canvases.layerCanvas
    const fillShape = state.drawingContext.fillShape
    const {startPoint, rx, ry} = getStateInfo(state)

    const context = canvas.getContext('2d')
    context.save()
    if (fillShape)
        context.lineWidth=1
    context.beginPath()
    context.ellipse(startPoint.x + rx, startPoint.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI)
    if (fillShape)
        context.fill()
    context.stroke()
    context.restore()
}

export function drawTriangle(canvases, state) {
    const canvas = state.stage === DrawingStage.DEFINE ? canvases.workingCanvas : canvases.layerCanvas
    const context = canvas.getContext('2d')
    const fillShape = state.drawingContext.fillShape
    const {startPoint, endPoint, dx} = getStateInfo(state)
    
    context.save()
    context.beginPath()
    if (fillShape)
        context.lineWidth=1
    context.moveTo(startPoint.x + dx / 2, startPoint.y)
    context.lineTo(startPoint.x, endPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.lineTo(startPoint.x + dx / 2, startPoint.y)
    if (fillShape)
        context.fill()
    context.stroke()
    context.restore()
}

export function drawLine(canvases, state) {
    const canvas = state.stage === DrawingStage.DEFINE ? canvases.workingCanvas : canvases.layerCanvas
    const {startPoint, endPoint} = getStateInfo(state)
    const context = canvas.getContext('2d')
    context.beginPath()
    context.moveTo(startPoint.x, startPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.stroke()
}

export function fill(canvases, state) {
    const {layerCanvas} = canvases
    if (state.stage === DrawingStage.DEFINE){
        // We don't work with the define stage for fill
        return true
    }

    const context = layerCanvas.getContext('2d')
    const {startPoint} = getStateInfo(state)

    const imgData = context.getImageData(0, 0, layerCanvas.width, layerCanvas.height)
    
    const floodFill = new FloodFill(imgData)
    floodFill.fill(context.color, Math.floor(startPoint.x), Math.floor(startPoint.y), 0)
    context.putImageData(floodFill.imageData, 0, 0)
}

export const clearSelection = ({layerCanvas, workingCanvas, uiCanvas}, drawingContext) => {
    drawingContext.selection = undefined    
    clear(uiCanvas)
}

function select(canvases, state) {
    const {layerCanvas, workingCanvas, uiCanvas} = canvases
    const {startPoint, dx, dy, drawingContext} = getStateInfo(state)

    if (state.stage === DrawingStage.COMMIT) {        
        if (dx > 0 && dy > 0) {
            drawingContext.selection = {startPoint, delta: {x: dx, y: dy}}
        } else {
            drawingContext.selection = undefined
        }

        return
    }
    clear(uiCanvas)
    const uiContext = uiCanvas.getContext('2d')
    uiContext.save()
    uiContext.strokeStyle = '#000000'
    uiContext.lineWidth = 1
    uiContext.setLineDash([5, 15])
    uiContext.strokeRect(startPoint.x, startPoint.y, dx, dy)
    uiContext.restore()
}


function move(canvases, state) {
    const {layerCanvas, workingCanvas, uiCanvas} = canvases
    const {dx, dy, drawingContext} = getStateInfo(state)
    const layerContext = layerCanvas.getContext('2d')
    const workingContext = workingCanvas.getContext('2d')
    const uiContext = uiCanvas.getContext('2d')
    const selection = drawingContext.selection

    if (!selection) {
        // Nothing selected, nothing to move
        return true
    }


    if (!state.workingImg) {
        // Beginning of operation
        // Note the +1/-1 offsets; if we select from 10,10 til 20,20, we have dx=10, but our selectedimage is 11 pixels;
        // these offsets account for that. The math doesn't quite add up for the clear though; why do we need the -1s?
        // Maybe difference in how clear rect works...
        state.workingImg = layerContext.getImageData(selection.startPoint.x, selection.startPoint.y, selection.delta.x+1, selection.delta.y+1)
        layerContext.clearRect(selection.startPoint.x-1, selection.startPoint.y-1, selection.delta.x+1, selection.delta.y+1)
        state.uiImg = uiContext.getImageData(0, 0, uiCanvas.width, uiCanvas.height)
    }        

    uiContext.putImageData(state.uiImg, dx, dy)

    if (state.stage === DrawingStage.DEFINE) {
        workingContext.putImageData(state.workingImg, selection.startPoint.x+dx, selection.startPoint.y+dy)
    } else {
        layerContext.save()
        layerContext.globalCompositeOperation = 'source-atop'
        layerContext.putImageData(state.workingImg, selection.startPoint.x+dx, selection.startPoint.y+dy)
        layerContext.restore()
        selection.startPoint.x += dx
        selection.startPoint.y += dy
    }
    
    
}
