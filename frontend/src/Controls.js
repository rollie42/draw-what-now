import styled from 'styled-components'

export const Button = styled.button`
    &:hover, &:focus {
        transform: translateY(-0.05em);        
    }

    min-height: 36px;
    background: #7B4F18;
    outline: none;
    color: #dddddd;
    border: 4px solid #DAB66A;
    margin: 0px 4px;
    padding: 3px 8px;
    border-radius: 9px;
`