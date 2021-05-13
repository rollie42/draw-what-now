import React from 'react';
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import Modal from 'react-modal';
import { Button } from '../Controls'

const FieldContainer = styled.div`
    justify-content: space-between;
    padding-bottom: 8px;
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

const c = "#11050310"
export const DialogHeader = styled.div`
    width: 100%;
    background-color: #FFBF76;
    text-align: center;
    outline: none;
    padding: 5px 0px;
    color: #A4E6FF;
    font-size: 24px;
    text-shadow:
    -2px   -2px ${c},
    -2px -1.5px ${c},
    -2px   -1px ${c},
    -2px -0.5px ${c},
    -2px    0px ${c},
    -2px  0.5px ${c},
    -2px    1px ${c},
    -2px  1.5px ${c},
    -2px    2px ${c},
    -1.5px  2px ${c},
    -1px    2px ${c},
    -0.5px  2px ${c},
    0px     2px ${c},
    0.5px   2px ${c},
    1px     2px ${c},
    1.5px   2px ${c},
    2px     2px ${c},
    2px   1.5px ${c},
    2px     1px ${c},
    2px   0.5px ${c},
    2px     0px ${c},
    2px  -0.5px ${c},
    2px    -1px ${c},
    2px  -1.5px ${c},
    2px    -2px ${c},
    1.5px  -2px ${c},
    1px    -2px ${c},
    0.5px  -2px ${c},
    0px    -2px ${c},
    -0.5px -2px ${c},
    -1px   -2px ${c},
    -1.5px -2px ${c};
`

export const DialogContent = styled.div`
    padding: 12px;
`

const DialogControl = styled.div`
    padding: 4px;
`

export const DialogContainer = (props) => {
    return (<Modal className="modal" overlayClassName="modalBackground" {...props} />)
}

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
            <DialogHeader onClose={handleClose}>
                Join game
            </DialogHeader>
            <DialogContent>
                <UserName userName={userName} setUserName={setUserName} />
                <GameName gameName={gameName} setGameName={setGameName} />

                <Button onClick={joinGame}>Join</Button>
            </DialogContent>
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
        
        setUser(newUser)
        setGameState(newGameState)
        setOpen(false)
    }

    return (
        <DialogContainer onRequestClose={handleClose} aria-labelledby="customized-dialog-title" isOpen={open}>
            <DialogHeader onClose={handleClose}>
                Create game
            </DialogHeader>
            <DialogContent>
                <UserName userName={userName} setUserName={setUserName} />
                <GameName gameName={gameName} setGameName={setGameName} />

                <Button onClick={createGame}>Create</Button>
            </DialogContent>
        </DialogContainer>
    );
}