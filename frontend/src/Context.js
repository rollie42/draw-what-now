import React from 'react';
import { DrawingMode } from './atrament'

export const UserContext = React.createContext()
export const AtramentContext = React.createContext(null)
export const ActiveBookContext = React.createContext()
const defaultColor = {
    hex: "#ff0000"
}
export const ActiveColorContext = React.createContext(defaultColor)
export const ColorPalette = React.createContext([])
export const BrushWidthContext = React.createContext(1)
export const TasksContext = React.createContext([])
export const GameStateContext = React.createContext(null)
export const ActiveToolContext = React.createContext(DrawingMode.DRAW)
export const ActiveShapeContext = React.createContext(DrawingMode.DRAW_SQUARE)

export function AppContextProvider(props) {
    const [user, setUser] = React.useState(null)
    const [atrament, setAtrament] = React.useState(null)
    const [activeBook, setActiveBook] = React.useState(null)
    const [activeColor, setActiveColor] = React.useState(defaultColor)
    const setActiveColorWrapper = (newColor) => {
        if (!newColor.hex)
            newColor = { hex: newColor }
        setActiveColor(newColor)
    }
    const [colorPalette, setColorPalette] = React.useState([])
    const [brushWidth, setBrushWidth] = React.useState(1)
    const [tasks, setTasks] = React.useState([])
    const [gameState, setGameState] = React.useState(null)
    const [activeTool, setActiveTool] = React.useState(DrawingMode.DRAW)
    const [activeShape, setActiveShape] = React.useState(DrawingMode.DRAW_SQUARE)

    return (
        <UserContext.Provider value={[user, setUser]}>
            <AtramentContext.Provider value={[atrament, setAtrament]}>
                <ActiveBookContext.Provider value={[activeBook, setActiveBook]}>
                    <ActiveColorContext.Provider value={[activeColor, setActiveColorWrapper]}>
                        <ColorPalette.Provider value={[colorPalette, setColorPalette]}>
                            <BrushWidthContext.Provider value={[brushWidth, setBrushWidth]}>
                                <TasksContext.Provider value={[tasks, setTasks]}>
                                    <GameStateContext.Provider value={[gameState, setGameState]}>
                                        <ActiveToolContext.Provider value={[activeTool, setActiveTool]}>
                                            <ActiveShapeContext.Provider value={[activeShape, setActiveShape]}>
                                                {props.children}
                                            </ActiveShapeContext.Provider>
                                        </ActiveToolContext.Provider>
                                    </GameStateContext.Provider>
                                </TasksContext.Provider>
                            </BrushWidthContext.Provider>
                        </ColorPalette.Provider>
                    </ActiveColorContext.Provider>
                </ActiveBookContext.Provider>
            </AtramentContext.Provider>
        </UserContext.Provider>
    )
}

