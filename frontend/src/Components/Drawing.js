async function* mouseEvents(ctx) {
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
    while (true) {
        
    }

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

function drawPath(ctx) {
    path = []
    while (e of ctx.mouseEvents()) {
        path += e.pt
        clear(canvas)
        drawPath(path, canvas)
    }
}

function drawPathOnce(path, canvas) {
    // just draw the path
}

function drawSquare(ctx) {
    path = []
    while (e of ctx.mouseEvents()) {
        path += e.pt
        clear(canvas)
        drawPath(path, canvas)
    }
}

function drawSquareOnce(ctx, canvas) {
    ctx.fillShape
        ? context.fillRect(startPoint.x, startPoint.y, dx, dy)
        : context.strokeRect(startPoint.x, startPoint.y, dx, dy)
    drawing.dx = dx
    drawing.dy = dy
}