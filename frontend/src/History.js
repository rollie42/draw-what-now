import { v4 as uuidv4 } from 'uuid'

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

export class DrawAction extends Action {
    constructor(image, drawing) {
        super()
        this.image = image
        this.drawing = drawing
    }

    describeInternal = () => `Draw`

    undo = (ctx) => {
        const canvasCtx = ctx.activeLayerCanvasRef.current.getContext('2d')
        console.log(canvasCtx, this.image, this.drawing)
        canvasCtx.putImageData(this.image, 0, 0)
    }

    exec = (ctx) => {

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