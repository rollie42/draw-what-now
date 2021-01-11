import logo from './logo.svg';
import './App.css';
import React, { useCallback, useEffect } from 'react'
import Atrament from '@drawing-app/atrament'
import * as GameApi from './GameApi'
import * as Context from './Context'
import styled from 'styled-components'
import DrawingControls from './Components/DrawingControls'
import GameStateDetails from './Components/GameStateDetails'
import MainContainer from './Components/MainContainer'
import TaskList from './Components/TaskList'
import TopBar from './Components/TopBar'


const DoneButtonContainer = styled.div`
  position: fixed;
  top: 80%;
  left: 80%;
`


function DoneButton() {
  const [user] = React.useContext(Context.UserContext)
  const [activePage] = React.useContext(Context.ActivePageContext)

  const handler = async () => {
    await GameApi.UploadDrawing(atrament.toImage(), user)
  }

  return (
    <DoneButtonContainer>
      <button onClick={handler}>Upload Image</button>
    </DoneButtonContainer>
  )
}

var atrament = null

const ConvasContainer = styled.canvas`
  background: url('bg.jpg');
  flex: 1;
  margin: 20px 10px;
`

function Canvas() {
  const [color] = React.useContext(Context.ActiveColorContext)
  const [colorPalette, setColorPalette] = React.useContext(Context.ColorPalette)
  const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)

  const [lastStroke, setLastStroke] = React.useState(null)


  const canvasRef = React.useRef();
  React.useEffect(() => {
    if (atrament === null) {
      // instantiate Atrament
      const canvas = canvasRef.current
      canvas.style.cursor = 'crosshair'
      atrament = new Atrament(canvas, {
        width: canvas.offsetWidth,
        height: canvas.offsetHeight,
      });
      atrament.recordStrokes = true

      atrament.addEventListener('strokerecorded', ({ stroke }) => {
        setLastStroke(stroke)
      });

      const keydownHandler = (e) => {
        if (e.ctrlKey && e.key === 'z') {
          console.log('undo?')
          atrament.undo()
        }
      }

      window.addEventListener('keydown', keydownHandler)
    }

    atrament.color = color.hex || color
    atrament.weight = brushWidth
  }, [color, colorPalette, brushWidth]);

  useEffect(() => {
    if (lastStroke !== null && !colorPalette.includes(lastStroke.color)) {
      const arr = [...colorPalette, lastStroke.color]
      setColorPalette(arr)
    }
  }, [colorPalette, lastStroke])

  const wheelHandler = (e) => {
    const d = brushWidth < 14 ? 1 : 2
    if (e.deltaY < 0) {
      setBrushWidth(brushWidth + d)
    } else if (e.deltaY > 0 && brushWidth > 1) {
      setBrushWidth(brushWidth - d)
    }
  }



  return (
    <ConvasContainer onWheel={wheelHandler} ref={canvasRef}>
    </ConvasContainer>
  )
}

const Container = styled.div`
    display: flex;
    flex-flow: column;
    height: 100vh;
    background: url('bg.jpg')
`

const doneHandler = async () => {
  const image = atrament.toImage()
  console.log(image)
}

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
          </MainContainer>
          <DoneButton onClick={doneHandler} />
          <TaskList />
        </Container>

      </Context.AppContextProvider>
    </div>
  );
}

export default App;
