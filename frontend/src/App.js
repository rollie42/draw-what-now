import './App.css';
import React, { useEffect } from 'react'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import { createGlobalStyle } from 'styled-components'
import MainContainer from './Components/MainContainer'
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
      if (u && gs) {
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
        console.log(message.data)
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
    background-color: #FFE895;
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

function useActiveBook() {

}

function ActiveBook() {
  const [gameState] = React.useContext(Context.GameStateContext)
  var [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
  const [user] = React.useContext(Context.UserContext)
  React.useEffect(() => {
    if (!gameState) return

    const availableBooks = gameState
      .books
      .filter(book => book.currentActor()?.name === user.name)
      .sort((a,b) => b.entries.length - a.entries.length)
    
    if (!availableBooks.some(b => b.creator.name === activeBook?.creator?.name)) {
      // TODO: The currently active book isn't active - presumably retracted 
      // (notify box)
      // setNotificationMessage("This page has been retracted")
      activeBook = undefined
    }

    setActiveBook(activeBook ?? availableBooks[0])
  }, [activeBook, gameState, user])

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
        <ActiveBook />
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
