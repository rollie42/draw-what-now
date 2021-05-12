import { v4 as uuidv4 } from 'uuid'
import { drawFn } from './Components/Drawing'

export const ActionType = {
    DRAW: 'draw',
    CHANGE_TOOL: 'change-tool',
    CHANGE_LAYER: 'change-layer'
}

export class Action {
    constructor() {
        this.active = true
        this.id = uuidv4()
    }

    describe = () => `${activeIcon(this)} ${this.describeInternal()}`
}

const activeIcon = (action) => action.active ? '*' : ' '
const clear = canvas => canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

export class DrawAction extends Action {
    constructor(image, mode, shape, state) {
        super()
        this.image = image
        this.mode = mode
        this.shape = shape
        this.state = state
    }

    describeInternal = () => `Draw`

    undo = (canvases) => {
        // TODO: undo/redo of select doesn't update the drawing context, but needs to
        const canvasCtx = canvases.layerCanvas.getContext('2d')
        console.log(canvasCtx, this.image, this.state)
        canvasCtx.putImageData(this.image, 0, 0)
    }

    exec = (canvases) => {
        const drawShape = drawFn(this.mode, this.shape)
        return drawShape(canvases, this.state)
    }
}

export class PasteAction extends Action {
    constructor(prevImg, pastedImg, location) {
        super()
        this.prevImg = prevImg
        this.pastedImg = pastedImg
        this.location = location
    }

    describeInternal = () => `Paste`

    undo = (canvases) => {
        const canvasCtx = canvases.layerCanvas.getContext('2d')
        canvasCtx.putImageData(this.prevImg, 0, 0)
    }

    exec = ({layerCanvas}) => {
        layerCanvas
            .getContext('2d')
            .putImageData(
                this.pastedImg, 
                this.location.x - this.pastedImg.width / 2, 
                this.location.y - this.pastedImg.height / 2
            )
    }

}
export class LayerToggleAction extends Action {
    constructor(layer) {
        super()
        this.layer = layer
        this.active = layer.active
    }

    describeInternal = () => `Layer toggle - ${this.layer.id}`

    undo = ({setLayers}) => {
        this.layer.visible = !this.layer.visible
        setLayers(layers => {
            if (this.active) {
                this.layer.active = true
                layers.forEach(l => l.active = false)
            }            
            return [...layers]
        })
    }

    exec = ({setLayers}) => {
        this.layer.visible = !this.layer.visible
        setLayers(layers => {
            if (this.active) {
                const idx = layers.findIndex(l => l.id === this.layer.id)
                this.layer.active = false
                layers[idx === layers.length - 1 ? idx-1 : idx+1].active = true
            }
            return [...layers]
        })
    }
}

export class LayerSelectAction extends Action {
    constructor(layer, prevLayer) {
        super()
        this.layer = layer
        this.prevLayer = prevLayer
        this.visible = layer.visible
    }

    describeInternal = () => `Layer select - ${this.layer.id} (prev: ${this.prevLayer.id})`

    undo = ({setLayers}) => {
        this.layer.active = false
        this.prevLayer.active = true
        this.layer.visible = this.visible
        setLayers(layers => [...layers])
    }

    exec = ({setLayers}) => {
        this.layer.active = true
        this.prevLayer.active = false
        this.layer.visible = true
        setLayers(layers => [...layers])
    }
}

export class LayerDeleteAction extends Action {
    constructor(layer, idx) {
        super()
        this.layer = layer
        this.idx = idx
    }

    describeInternal = () => `Layer delete - ${this.layer.id}`

    undo = ({setLayers}) => {
        setLayers(layers => {
            if (this.layer.active)
                layers.forEach(layer => layer.active = false)
            return [...layers.slice(0, this.idx), this.layer, ...layers.slice(this.idx, layers.length)]
        })
    }

    exec = ({setLayers}) => {
        setLayers(layers => {
            if (this.layer.active) {
                // Pick a new active layer
                let idx = layers.findIndex(l => l.id === this.layer.id)
                // TODO: make visible, and undo as well
                layers[idx === layers.length - 1 ? idx-1 : idx+1].active = true
            }
            return layers.filter(layer => layer.id !== this.layer.id)
        })
    }
}

export class LayerCreateAction extends Action {
    constructor(layer, prevActiveLayer) {
        super()
        this.layer = layer
        this.prevActiveLayer = prevActiveLayer
    }

    describeInternal = () => `Layer create`

    undo = (ctx) => {
        this.prevActiveLayer.active = true
        ctx.setLayers(layers => layers.filter(layer => layer.id !== this.layer.id))
    }

    exec = (ctx) => {
        this.prevActiveLayer.active = false
        ctx.setLayers(layers => [...layers, this.layer])
    }
}