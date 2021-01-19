import React from 'react'
import styled from 'styled-components'
import DrawingControls from './DrawingControls'
import GameStateDetails from './GameStateDetails'
import CanvasArea from './CanvasArea'
import * as Context from '../Context'

const Container = styled.div`
    flex: 1;
    display: flex;
`

export default function MainContainer(props) {
    const [gameState] = React.useContext(Context.GameStateContext)
    return (
        <Container>
            <DrawingControls />
            <CanvasArea />
            <GameStateDetails />
        </Container>
    )
}