import React, { useEffect } from 'react';
import { DrawingMode, Shapes } from './Components/Canvas'
import { GameState } from './GameState'
import Cookies from 'js-cookie'
import { v4 as uuidv4 } from 'uuid'

export const UserContext = React.createContext()
export const ActiveBookContext = React.createContext()
const defaultColor = "rgba(255, 0, 0, 1)"
export const ActiveColorContext = React.createContext(defaultColor)
export const ColorPalette = React.createContext([])
export const LineWidthContext = React.createContext(1)
export const TasksContext = React.createContext([])
export const GameStateContext = React.createContext(null)
export const ActiveToolContext = React.createContext(DrawingMode.DRAW)
export const ActiveShapeContext = React.createContext(Shapes.SQUARE)
export const FillShapeContext = React.createContext(true)
export const DescriptionContext = React.createContext("")
export const StaticImageContext = React.createContext("")
export const ReplayDrawingsContext = React.createContext([])
export const RequestClearContext = React.createContext(false)
const defaultLayer = {
    name: 'Background',
    id: uuidv4(),
    active: true,
    visible: true
}
export const LayerContext = React.createContext([defaultLayer])
export const ActionHistoryContext = React.createContext([])
export const RecentSubmissionContext = React.createContext(undefined)

export function AppContextProvider(props) {
    const [user, setUser] = React.useState(null)
    const setUserWrapper = (u) => {

        if (u)
            Cookies.set("user", u)
        else
            Cookies.remove("user")
        setUser(u)
    }
    const [activeBook, setActiveBook] = React.useState(null)
    const [activeColor, setActiveColor] = React.useState(defaultColor)
    const [colorPalette, setColorPalette] = React.useState([])
    const [lineWidth, setLineWidth] = React.useState(1)
    const [tasks, setTasks] = React.useState([])
    const [gameState, setGameState] = React.useState(null)
    const setGameStateWrapper = (gs) => {
        console.log(gs)
        if (gs && gs.type !== "error") {
            console.log(gs)
            Cookies.set("gameState", gs)            
            setGameState(new GameState(gs))
        } else {
            Cookies.remove("gameState")
            setGameState(undefined)
        }
    }
    const [activeTool, setActiveTool] = React.useState(DrawingMode.DRAW)
    const [activeShape, setActiveShape] = React.useState(Shapes.SQUARE)
    const [fillShape, setFillShape] = React.useState(true)
    const [description, setDescription] = React.useState("")
    const [staticImage, setStaticImage] = React.useState("")
    const [replayDrawings, setReplayDrawings] = React.useState([])
    const [requestClear, setRequestClear] = React.useState(false)
    const [layers, setLayers] = React.useState([defaultLayer])
    const [actionHistory, setActionHistory] = React.useState([])
    const pushAction = (action) => {
        setActionHistory(actions => {
            return [...actions.filter(a => a.active), action]
        })
    }
    const [recentSubmission, setRecentSubmission] = React.useState(undefined)
    return (
        <UserContext.Provider value={[user, setUserWrapper]}>
            <ActiveBookContext.Provider value={[activeBook, setActiveBook]}>
                <ActiveColorContext.Provider value={[activeColor, setActiveColor]}>
                    <ColorPalette.Provider value={[colorPalette, setColorPalette]}>
                        <LineWidthContext.Provider value={[lineWidth, setLineWidth]}>
                            <TasksContext.Provider value={[tasks, setTasks]}>
                                <GameStateContext.Provider value={[gameState, setGameStateWrapper]}>
                                    <ActiveToolContext.Provider value={[activeTool, setActiveTool]}>
                                        <ActiveShapeContext.Provider value={[activeShape, setActiveShape]}>
                                            <FillShapeContext.Provider value={[fillShape, setFillShape]}>
                                                <DescriptionContext.Provider value={[description, setDescription]}>
                                                    <StaticImageContext.Provider value={[staticImage, setStaticImage]}>
                                                        <ReplayDrawingsContext.Provider value={[replayDrawings, setReplayDrawings]}>
                                                            <RequestClearContext.Provider value={[requestClear, setRequestClear]}>
                                                                <LayerContext.Provider value={[layers, setLayers]}>
                                                                    <ActionHistoryContext.Provider value={[actionHistory, setActionHistory, pushAction]}>
                                                                        <RecentSubmissionContext.Provider value={[recentSubmission, setRecentSubmission]}>
                                                                            {props.children}
                                                                        </RecentSubmissionContext.Provider>
                                                                    </ActionHistoryContext.Provider>
                                                                </LayerContext.Provider>
                                                            </RequestClearContext.Provider>
                                                        </ReplayDrawingsContext.Provider>
                                                    </StaticImageContext.Provider>
                                                </DescriptionContext.Provider>
                                            </FillShapeContext.Provider>
                                        </ActiveShapeContext.Provider>
                                    </ActiveToolContext.Provider>
                                </GameStateContext.Provider>
                            </TasksContext.Provider>
                        </LineWidthContext.Provider>
                    </ColorPalette.Provider>
                </ActiveColorContext.Provider>
            </ActiveBookContext.Provider>
        </UserContext.Provider>
    )
}

