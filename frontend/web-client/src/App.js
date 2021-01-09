import logo from './logo.svg';
import './App.css';
import React, { useCallback } from 'react';
import Atrament from '@drawing-app/atrament'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import DrawingControls from './Components/DrawingControls'
import GameStateDetails from './Components/GameStateDetails'
import MainContainer from './Components/MainContainer'
import TaskList from './Components/TaskList'
import TopBar from './Components/TopBar'

const LoginBtn = styled.button`
`

function Login() {
  const [userName, setUserName] = React.useState("")
  const [, setUser] = React.useContext(Context.UserContext)

  const sendRequest = useCallback(async () => {
    const user = await GameApi.Login(userName)
    console.log(user)
    setUser(user)
  })

  return (
    <div>
      <input type="text" value={userName} onChange={e => setUserName(e.target.value)}></input>
      <LoginBtn onClick={sendRequest}>Login</LoginBtn>
    </div>
  )
}

function CreateGame() {
  const [gameName, setGameName] = React.useState("")

  const sendRequest = useCallback(async () => {
    await GameApi.CreateGame(gameName)
  })

  return (
    <div>
      <input type="text" value={gameName} onChange={e => setGameName(e.target.value)}></input>
      <button onClick={sendRequest}>Create Game</button>
    </div>
  )
}

function UserInfo() {
  const [user] = React.useContext(Context.UserContext)
  console.log(user)
  return (
    <div>
      <span>User: {user ? user.name : '??'}</span>
    </div>
  )
}

function UploadImage() {
  const [user] = React.useContext(Context.UserContext)
  const [activePage] = React.useContext(Context.ActivePageContext)
  const imageData = null

  const handler = useCallback(async () => {
    await GameApi.UploadImage(imageData, user)
  })

  return (
    <div>
      <button onClick={handler}>Upload Image</button>
    </div>
  )
}

function Canvas() {
  const canvasRef = React.useRef();
  React.useEffect(() => {
    const canvas = canvasRef.current
    console.log('Canvas: ' + canvas)
    canvas.style.cursor = 'crosshair';
    // instantiate Atrament
    const atrament = new Atrament(canvas, {
      width: canvas.offsetWidth,
      height: canvas.offsetHeight,
    });
  }, []);

  return (<canvas ref={canvasRef}></canvas>)
}

const Container = styled.div`
    display: flex;
    flex-flow: column;
    height: 100vh;
`

function App() {
  return (
    <div className="App">
      <Context.AppContextProvider>
        <Container>
          <TopBar />
          <MainContainer>
            <DrawingControls />
            <Canvas />
            <GameStateDetails />
            <Login />
            <CreateGame />
            <UserInfo />
            <UploadImage />
          </MainContainer>
          <TaskList></TaskList>
        </Container>

      </Context.AppContextProvider>
    </div>
  );
}

export default App;
