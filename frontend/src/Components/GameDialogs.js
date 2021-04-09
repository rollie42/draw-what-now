import React from 'react';
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import Modal from 'react-modal';
import { Button } from '../Controls'

const FieldContainer = styled.div`
    justify-content: space-between;
`

const Label = styled.label`
    display: block;
`

const Input = styled.input`
    display: block;
`

function UserName(props) {
    const { userName, setUserName } = props

    return (
        <FieldContainer>
            <Label>Your name</Label>
            <Input autoFocus type="text" value={userName} onChange={e => setUserName(e.target.value)} />
        </FieldContainer>
    )
}

function GameName(props) {
    const { gameName, setGameName } = props

    return (
        <FieldContainer>
            <Label>Game name</Label>
            <Input type="text" value={gameName} onChange={e => setGameName(e.target.value)} />
        </FieldContainer>
    )
}


Modal.setAppElement('#root');

export const DialogContainer = styled(Modal)`
    background-color: #222222aa;

    margin-top: -50px;
    margin-left: -50px;
    padding: 15px;

`

export function JoinGameDialog(props) {
    const [userName, setUserName] = React.useState("")
    const [gameName, setGameName] = React.useState("")
    const [, setUser] = React.useContext(Context.UserContext)
    const [, setGameState] = React.useContext(Context.GameStateContext)

    const { open, setOpen } = props
    const handleClose = () => { setOpen(false); };
    const joinGame = async () => {
        const newUser = await GameApi.Login(userName)
        const newGameState = await GameApi.JoinGame(gameName, newUser)
        setUser(newUser)
        setGameState(newGameState)
        setOpen(false)
    }

    return (
        <DialogContainer onRequestClose={handleClose} aria-labelledby="customized-dialog-title" isOpen={open}>
            <div onClose={handleClose}>
                Join game
            </div>
            <div>
                <UserName userName={userName} setUserName={setUserName} />
                <GameName gameName={gameName} setGameName={setGameName} />
            </div>

            <div>
                <Button onClick={joinGame}>Join</Button>
            </div>
        </DialogContainer>
    );
}

export function CreateGameDialog(props) {
    const [userName, setUserName] = React.useState("")
    const [gameName, setGameName] = React.useState("")
    const [, setUser] = React.useContext(Context.UserContext)
    const [, setGameState] = React.useContext(Context.GameStateContext)

    const { open, setOpen } = props
    const handleClose = () => { setOpen(false); };
    const createGame = async () => {
        const newUser = await GameApi.Login(userName)
        await GameApi.CreateGame(gameName, newUser)
        const newGameState = await GameApi.JoinGame(gameName, newUser)
        console.log(newGameState)

        setUser(newUser)
        setGameState(newGameState)
        setOpen(false)
    }

    return (
        <DialogContainer onRequestClose={handleClose} aria-labelledby="customized-dialog-title" isOpen={open}>
            <div onClose={handleClose}>
                Create game
            </div>
            <div>
                <UserName userName={userName} setUserName={setUserName} />
                <GameName gameName={gameName} setGameName={setGameName} />
            </div>

            <div>
                <Button onClick={createGame}>Create</Button>
            </div>
        </DialogContainer>
    );
}