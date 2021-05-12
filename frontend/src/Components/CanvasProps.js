import React from 'react'
import { capitalize } from '../Utils'
import { DrawingMode, Shapes } from './Canvas'

export function useCanvasProps(propsIn) {
    const props = {...propsIn}
    const attrs = [
        ['requestCopy', false],
        ['requestPaste', undefined],
        ['requestDelete', false],
        ['requestUndo', false],
        ['requestRedo', false],
        ['mode', DrawingMode.DRAW],
        ['shape', Shapes.SQUARE],
    ]

    const refs = ['activeLayerCanvasRef', 'workingCanvasRef', 'uiCanvasRef']

    for (const [k, v] of attrs) {
        if (!(k in props)) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const [getter, setter] = React.useState(v)
            props[k] = getter
            props['set' + capitalize(k)] = setter
        }
    }

    for (const ref of refs) {
        if (!(ref in props)) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            props[ref] = React.useRef()
        }
    }

    return props
}