import React from 'react';
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import Modal from 'react-modal';
import { Button } from '../Controls'
import {DialogContainer, DialogContent, DialogHeader} from './GameDialogs'
import TutorialImg from '../images/tutorial.png'

/* Help text

These are your drawing controls!

They can be selected by click on them, or by using hotkeys QWERASD (in order)

*/

const TutorialContent = styled.div`
    display: flex;
    justify-content: center;
    margin: 60px;
`
export function TutorialDialog(props) {
    const { open, setOpen } = props
    const handleClose = () => { setOpen(false); };

    return (
        <DialogContainer onRequestClose={handleClose} aria-labelledby="customized-dialog-title" isOpen={open}>
            <DialogHeader onClose={handleClose}>
                How to Play
            </DialogHeader>
            <TutorialContent>
                <img src={TutorialImg} width={"80%"} />
                <br/>
                {/* <Button onClick={handleClose}>Next</Button> */}
            </TutorialContent>
        </DialogContainer>
    );
}