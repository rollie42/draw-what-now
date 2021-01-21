import { DrawingMode, Atrament } from './atrament.js'
import draw from 'smooth-curve'
require('../../../node_modules/floodfill/floodfill.js');
const Constants = require('./constants.js');
const { Mouse, Point } = require('./mouse.js');

const MouseEventType = {
    UP: "up",
    DOWN: "down",
    MOVE: "move"
};

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

export class ShapeCanvas {
    constructor(atrament, shapeCanvas) {
        this.startPoint = undefined;
        this._shapeCanvas = shapeCanvas;
        this.context = shapeCanvas.getContext('2d');
        //this.context.lineCap = 'round';
        //this.context.lineJoin = 'bevel';
        this.context.translate(0.5, 0.5);
        this.atrament = atrament;

        const mouseDown = async (event) => {
            if (event.button !== 0)
                return;

            if (event.cancelable)
                event.preventDefault();

            await this.draw2(this._getPos(event))
        };

        this._shapeCanvas.addEventListener('mousedown', mouseDown);
    }

    mouseEvent() {
        return new Promise((resolve, reject) => {
            const makeHandler = type => event => {
                if (event.button !== 0)
                    return

                if (event.cancelable)
                    event.preventDefault();

                this._shapeCanvas.removeEventListener('mousemove', moveHandler)
                document.removeEventListener('mouseup', upHandler)
                resolve(new MouseEvent(type, this._getPos(event), event.pointerType === 'pen', event.pressure))
            }

            const moveHandler = makeHandler(MouseEventType.MOVE)
            const upHandler = makeHandler(MouseEventType.UP)

            this._shapeCanvas.addEventListener('mousemove', moveHandler)
            document.addEventListener('mouseup', upHandler)
        })
    }

    async draw2(startPoint) {
        const tempCtx = this.context
        const realCtx = this.atrament.context
        const drawShape = async (drawFn) => {
            while (true) {
                const mouseEvt = await this.mouseEvent()
                const { pen, pressure, position } = mouseEvt
                const dx = mouseEvt.position.x - startPoint.x;
                const dy = mouseEvt.position.y - startPoint.y;

                // clear temp canvas
                this.context.clearRect(0, 0, this._shapeCanvas.width, this._shapeCanvas.height);
                drawFn({
                    context: mouseEvt.up() ? realCtx : tempCtx,
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

        switch (this.atrament.mode) {
            case DrawingMode.DRAW:
            case DrawingMode.ERASE:
                var path = new Path2D()
                const x = this.atrament.weight
                path.lineWidth = x
                path.moveTo(startPoint.x, startPoint.y)
                const paths = [path]
                const points = [{ ...startPoint, lineWidth: this.atrament.weight }]

                const t = 1
                console.log(path.lineWidth)

                await drawShape(({ context, endPoint, pen, pressure }) => {
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
                    var p3 = (i != points.length - 2) ? points[i + 2] : p2

                    if (lineWidth != path.lineWidth) {
                        // line width changed - set up a new path
                        path = new Path2D()
                        path.lineWidth = lineWidth
                        path.moveTo(p1.x, p1.y)
                        paths.push(path)
                    }

                    var cp1x = p1.x + (p2.x - p0.x) / 6 * t
                    var cp1y = p1.y + (p2.y - p0.y) / 6 * t

                    var cp2x = p2.x - (p3.x - p1.x) / 6 * t
                    var cp2y = p2.y - (p3.y - p1.y) / 6 * t

                    path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y)

                    paths.forEach(p => {
                        context.lineWidth = p.lineWidth
                        if (this.atrament.mode == DrawingMode.ERASE)
                            realCtx.stroke(p)
                        else
                            context.stroke(p)
                    });

                })
                break;
            case DrawingMode.DRAW_SQUARE:
                await drawShape(({ context, startPoint, dx, dy }) => {
                    this.fillShape
                        ? context.fillRect(startPoint.x, startPoint.y, dx, dy)
                        : context.strokeRect(startPoint.x, startPoint.y, dx, dy)
                })
                break;
            case DrawingMode.DRAW_CIRCLE:
                await drawShape(({ context, startPoint, dx, dy }) => {
                    const rx = dx / 2;
                    const ry = dy / 2;
                    context.beginPath();
                    context.ellipse(startPoint.x + rx, startPoint.y + ry, Math.abs(rx), Math.abs(ry), 0, 0, 2 * Math.PI);
                    if (this.fillShape)
                        context.fill();
                    context.stroke();
                    context.closePath();
                })
                break;
            case DrawingMode.DRAW_TRIANGLE:
                await drawShape(({ context, startPoint, endPoint, dx }) => {
                    context.beginPath();
                    context.moveTo(startPoint.x + dx / 2, startPoint.y);
                    context.lineTo(startPoint.x, endPoint.y);
                    context.lineTo(endPoint.x, endPoint.y);
                    if (this.fillShape)
                        context.fill();
                    context.stroke();
                    context.closePath();
                })
                break;
            case DrawingMode.DRAW_LINE:
                await drawShape(({ context, startPoint, endPoint }) => {
                    context.beginPath();
                    context.moveTo(startPoint.x, startPoint.y);
                    context.lineTo(endPoint.x, endPoint.y);
                    context.stroke();
                    context.closePath();
                })
                break;
            case DrawingMode.FILL:
                realCtx.fillFlood(startPoint.x, startPoint.y, 5)
                break
            case DrawingMode.ERASE:

                break
        }

        this.atrament.dispatchEvent('drawend', { type: this.atrament.mode, color: this.atrament.color });
    }

    get fillShape() {
        return this.atrament.fillShape;
    }

    _getPos(event) {
        const rect = this._shapeCanvas.getBoundingClientRect();
        const position = event.changedTouches && event.changedTouches[0] || event;
        let x = position.offsetX;
        let y = position.offsetY;

        if (typeof x === 'undefined') {
            x = position.clientX - rect.left;
        }
        if (typeof y === 'undefined') {
            y = position.clientY - rect.top;
        }

        return new Point(x, y);
    }
}