import React from 'react'
import styled from 'styled-components'
import { ChromePicker } from 'react-color'

const Container = styled.div`

`

const ControlPanel = styled.div`
    background-color: #151515aa;
    width: 25vh;
    padding: 20px 20px;
    margin: 30px 50px;
`

export default function DrawingControls() {
    const [color, setColor] = React.useState("orange")
    return (
        <Container>
            <ControlPanel>
                <ChromePicker disableAlpha={true} color={color} onChange={h => setColor(h)} />

            </ControlPanel>
        </Container>
    )
}