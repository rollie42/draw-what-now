import styled from 'styled-components'

const ImageButtonContainer = styled.button`
    padding: 0px;
    margin: 0px;
    border: 0px;
    background: none;
    outline: none;
    cursor: pointer;
`

export function ImageButton({image, height, onClick}) {
    return (
        <ImageButtonContainer onClick={onClick} image={image}>
            <img src={image} height={height} />
        </ImageButtonContainer>
    )
}
export const Button = styled.button`
    cursor: pointer;
    min-height: 36px;
    background-color: #f9f9f9;
    outline: none;
    color: #E07D4D;
    border: 1px solid #E07D4D;
    margin: 0px 4px;
    padding: 3px 8px;
    border-radius: 9px;
`