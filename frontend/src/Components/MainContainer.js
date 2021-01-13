import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
    flex: 1;
    display: flex;
`

export default function MainContainer(props) {
    return (
        <Container>
            {props.children}
        </Container>
    )
}