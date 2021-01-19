import './App.css';
import React, { useCallback, useEffect } from 'react'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import { createGlobalStyle } from 'styled-components'
import MainContainer from './Components/MainContainer'
import TaskList from './Components/TaskList'
import TopBar from './Components/TopBar'



function GameSubscriber() {
  const [gameState, setGameState] = React.useContext(Context.GameStateContext)
  const [user] = React.useContext(Context.UserContext)

  const [subscribed, setSubscribed] = React.useState(false)

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
  }, [gameState])

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


function App() {
  return (
    <div className="App">
      <AppStyle />
      <Context.AppContextProvider>
        <Container>
          <TopBar />
          <MainContainer />

          <TaskList />
          <GameSubscriber />
        </Container>
      </Context.AppContextProvider>
    </div>
  );
}

export default App;
