import React from 'react'
import styled from 'styled-components'
import { ChromePicker } from 'react-color'
import * as Context from '../Context'

const Container = styled.div`

`

const ControlPanel = styled.div`
    background-color: #151515aa;
    color: #e6e6e6;
    width: 25vh;
    padding: 20px 20px;
    margin: 30px 50px;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 30px;
    height: 30px;
    margin: 0px 5px;
`

function ColorCircle(props) {
    return (
        <SVG>
            <circle cx="15" cy="15" r="15" stroke={props.color} stroke-width="1" fill={props.color} />
        </SVG>
    )
}

const ColorCircleContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
`
const ColorPaletteContainer = styled.div`
    margin-top: 8px;
`

function ColorPalette() {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    console.log(color)

    return (
        <ColorPaletteContainer>
            <div>Palette</div>
            <ColorCircleContainer>
                <ColorCircle color={color.hex} />
                <ColorCircle color="green" />
            </ColorCircleContainer>
        </ColorPaletteContainer>
    )
}

export default function DrawingControls() {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    console.log('Color: ' + color)
    return (
        <Container>
            <ControlPanel>
                <ChromePicker disableAlpha={true} color={color} onChange={h => setColor(h)} />
                <ColorPalette />
            </ControlPanel>
        </Container>
    )
}