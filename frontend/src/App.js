import './App.css';
import React, { useEffect } from 'react'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import { createGlobalStyle } from 'styled-components'
import MainContainer from './Components/MainContainer'
import TaskList from './Components/TaskList'
import TopBar from './Components/TopBar'
import Cookies from 'js-cookie'
import { GameSummary } from './Components/GameSummary'
import {usePrevState} from './Utils'
import BookReadyAudio from './sounds/task_received.mp3'

function GameSubscriber() {
  const [gameState, setGameState] = React.useContext(Context.GameStateContext)
  const [, setUser] = React.useContext(Context.UserContext)
  const [subscribed, setSubscribed] = React.useState(false)

  // On first load, if we have a cookie, we can try to rejoin
  useEffect(() => {
    const handler = async () => {
      const gs = Cookies.getJSON('gameState')
      const u = Cookies.getJSON('user')
      if (false && u && gs) { // TODO
        console.log(undefined)
        setUser(u)
        setGameState(gs)
      }
    }
    handler()
  }, [])

  // Handle subscribing if we are able to
  useEffect(() => {
    if (!subscribed && gameState?.id) {
      console.log("subscribing")
      setSubscribed(true)
      GameApi.Subscribe(gameState.id, (message) => {
        const newGameState = JSON.parse(message.data)
        console.log(newGameState)
        setGameState(newGameState)
      })
    }
  }, [gameState, subscribed])

  return (<div></div>)
}
const Container = styled.div`
    display: flex;
    flex-flow: column;
    height: 100vh;
    background: url('bg.jpg')
`

const AppStyle = createGlobalStyle`
  *{
    @import url('https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap');    
    font-family: 'Indie Flower', cursive;
  
  }
`

function GameAudio() {
  const [gameState] = React.useContext(Context.GameStateContext)
  const [activeBook] = React.useContext(Context.ActiveBookContext)
  const prevGameState = usePrevState(gameState)
  const prevActiveBook = usePrevState(activeBook)

  // If the user was waiting, let them know they have a task
  if (activeBook && !prevActiveBook) {
    const a = new Audio(BookReadyAudio)
    a.volume = .2
    a.play()
  }

  return (
    <></>
  )  
}

export var mousePosition = undefined

function PageContent() {
  const [gameState] = React.useContext(Context.GameStateContext)

  document.addEventListener('pointermove', (e) => {
    mousePosition = e
  })

  return (
    <>
      <Container>
        <TopBar />
        <MainContainer />

        <GameSubscriber />
        <GameAudio />
        {gameState?.isGameOver() && <GameSummary />}
      </Container>
    </>
  )
}

export default function App() {
  return (
    <div className="App">
      <AppStyle />
      <Context.AppContextProvider>
        <PageContent />
      </Context.AppContextProvider>
    </div>
  )
}
