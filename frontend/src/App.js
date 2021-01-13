import logo from './logo.svg';
import './App.css';
import React, { useCallback, useEffect } from 'react'
import Atrament from './atrament'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import DrawingControls from './Components/DrawingControls'
import GameStateDetails from './Components/GameStateDetails'
import MainContainer from './Components/MainContainer'
import TaskList from './Components/TaskList'
import TopBar from './Components/TopBar'
import CanvasArea from './Components/CanvasArea'


const DoneButtonContainer = styled.div`
  position: fixed;
  top: 80%;
  left: 80%;
`

function DoneButton() {
  const [user] = React.useContext(Context.UserContext)
  const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
  const [atrament] = React.useContext(Context.AtramentContext)
  const [gameState] = React.useContext(Context.GameStateContext)

  console.log(activeBook, activeBook?.entries)
  const handler = async () => {
    if (activeBook?.entries && activeBook.entries.length % 2 == 1)
      await GameApi.UploadDrawing(atrament.toImage(), user)
    else {
      // TODO: get real text
      await GameApi.UploadDescription("Done Button Description", gameState.id, activeBook.creator.name, user)
    }
    setActiveBook(null)

  }

  return (
    <DoneButtonContainer>
      <button onClick={handler}>Done</button>
    </DoneButtonContainer>
  )
}

const Container = styled.div`
    display: flex;
    flex-flow: column;
    height: 100vh;
    background: url('bg.jpg')
`

function App() {
  return (
    <div className="App">
      <Context.AppContextProvider>
        <Container>
          <TopBar />
          <MainContainer>
            <DrawingControls />
            <CanvasArea />
            <GameStateDetails />
          </MainContainer>
          <DoneButton />
          <TaskList />
        </Container>

      </Context.AppContextProvider>
    </div>
  );
}

export default App;
