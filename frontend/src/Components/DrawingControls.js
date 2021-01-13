import React from 'react'
import styled from 'styled-components'
import css from 'styled-components'
import { ChromePicker } from 'react-color'
import * as Context from '../Context'

const Container = styled.div`

`

const ControlPanel = styled.div`
    background-color: #080808aa;
    color: #e6e6e6;
    width: 25vh;
    padding: 20px 20px;
    margin: 30px 50px;
    min-height: 80%;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 30px;
    height: 30px;
    margin: 0px 2px;
    padding: 3px;
    ${props => props.selected && `background-color: #222222;`}
`

function ColorCircle(props) {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    return (
        <SVG onClick={() => setColor({ hex: props.color })} selected={color.hex == props.color}>
            <circle cx="15" cy="15" r="15" stroke={props.color} strokeWidth="1" fill={props.color} />
        </SVG>
    )
}

const ColorCircleContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
    min-height: 30px;
    flex-wrap: wrap;
`
const ColorPaletteContainer = styled.div`
    margin-top: 8px;
`

const Label = styled.div`
`

function ColorPalette() {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    const [colorPalette] = React.useContext(Context.ColorPalette)

    return (
        <ColorPaletteContainer>
            <Label>Palette</Label>
            <ColorCircleContainer>
                {colorPalette.map((value) => {
                    return <ColorCircle key={value} color={value} />
                })}
            </ColorCircleContainer>
        </ColorPaletteContainer>
    )
}

const StrokeWidthContainer = styled.div`
`

const StrokeWidthValue = styled.input`
    width: 20px;
`

function StrokeWidth() {
    const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)

    return (
        <StrokeWidthContainer>
            <Label>Stroke width</Label>
            <StrokeWidthValue value={brushWidth} onChange={(e) => setBrushWidth(e.target.value)}></StrokeWidthValue>
        </StrokeWidthContainer>
    )
}
export default function DrawingControls() {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    return (
        <Container>
            <ControlPanel>
                <ChromePicker disableAlpha={true} color={color} onChange={h => setColor(h)} />
                <ColorPalette />
                <StrokeWidth />
            </ControlPanel>
        </Container>
    )
}