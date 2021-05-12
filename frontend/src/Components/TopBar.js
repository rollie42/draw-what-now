import React from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import * as GameApi from '../GameApi'
import { JoinGameDialog, CreateGameDialog } from './GameDialogs'
import {TutorialDialog} from './Turorial'
import { ImageButton, Button } from '../Controls'
import CreateGameImage from '../images/create-game.png'
import JoinGameImage from '../images/join-game.png'
import ExitGameImage from '../images/exit.png'
import HelpImage from '../images/help.png'
import LogoImage from '../images/logo.png'
import PupImage from '../images/pup.png'
import PupSpeechBehindImage from '../images/pup-speech-behind.png'
import PupSpeechHurryImage from '../images/pup-speech-hurry.png'

const TopControlContainer = styled.div`
    display: flex;
    align-items: center;
    color: #dddddd;
    font-size: 22px;
    margin: 0px 10px;
`

const TopBarImageButton = (props) => (<ImageButton {...props} height="70px" />)

const groupBy = (list, keyGetter) =>
        list.reduce(function (r, a) {
            r[keyGetter(a)] = r[keyGetter(a)] || [];
            r[keyGetter(a)].push(a);
            return r;
        }, Object.create(null));
        
function JoinGame() {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <TopBarImageButton onClick={() => setOpen(true)} image={JoinGameImage} ></TopBarImageButton>
            <JoinGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function CreateGame() {
    const [open, setOpen] = React.useState(false)

    return (
        <TopControlContainer>
            <TopBarImageButton onClick={() => setOpen(true)} image={CreateGameImage} ></TopBarImageButton>
            <CreateGameDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

function ExitGame() {
    const [, setGameState] = React.useContext(Context.GameStateContext)
    const [, setUser] = React.useContext(Context.UserContext)
    const clickHandler = () => {
        setGameState(undefined)
        setUser(undefined)
    }

    return (
        <TopControlContainer>
            <TopBarImageButton onClick={clickHandler} image={ExitGameImage} ></TopBarImageButton>
        </TopControlContainer>
    )
}

function Help() {
    const [open, setOpen] = React.useState(false)
    const clickHandler = () => {
        setOpen(true)
    }

    return (
        <TopControlContainer>
            <TopBarImageButton onClick={clickHandler} image={HelpImage} ></TopBarImageButton>
            <TutorialDialog open={open} setOpen={setOpen} />
        </TopControlContainer>
    )
}

const TopBarContainer = styled.div`
    width: 100%;
    height: 75px;
    background-color: #FFBF76;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 12px;
    padding-left: 8px;
`

const DeadSpace = styled.div`
    flex: 1;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 70px;
    height: 70px;
    margin: 0px 2px;
    padding: 3px;
    ${props => props.selected && `background-color: #222222;`}
`

function Logo() {
    return (
        <TopBarImageButton image={LogoImage} ></TopBarImageButton>
    )
}

const PupSpeechContainer = styled.img`
    width: 130px;
    height: 80px;
    position: absolute;
    left:20px;
    top: 5px;
`

const PupContainer = styled.div`
    position: relative;
`
function Pup() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [user] = React.useContext(Context.UserContext)

    var img = ""
    console.log(gameState)
    const entries = gameState?.books?.map(book => book.entries).flat().filter(entry => entry.imageUrl)
    if (entries?.length) {
        const groups = groupBy(entries, entry => entry.author.name)
        const imagesDone = Object.values(groups).map(arr => arr.length).sort()
        const median = imagesDone[Math.floor(imagesDone.length / 2)]
        const userCompleted = groups[user.name]?.length || 0
        img = userCompleted >= median
            ? ""
            : userCompleted >= median - 1
                ? PupSpeechBehindImage
                : PupSpeechHurryImage
    }
    return (
        <PupContainer>
            <TopBarImageButton image={PupImage} ></TopBarImageButton>
            {img && <PupSpeechContainer src={img}/>}
        </PupContainer>
        )
}

export default function TopBar() {
    const [gameState] = React.useContext(Context.GameStateContext)
    return (
        <TopBarContainer>
            <Pup />
            <DeadSpace />
            <Logo />
            <DeadSpace />
            {!gameState &&
                <>
                    <JoinGame />
                    <CreateGame />
                </>
            }
            {gameState && <ExitGame />}
            <Help />
        </TopBarContainer>
    )
}