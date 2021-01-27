import React, { useContext } from 'react'
import styled from 'styled-components'
import Gesture from '@material-ui/icons/Gesture'
import TextFields from '@material-ui/icons/TextFields'
import * as Context from '../Context'

const TaskListContainer = styled.div`
    height: 15vh;
    background-color: #55555588;
    display: flex;
    align-items: center;
`

const TaskContainer = styled.div`
    background-color: #f8f8f8;
    margin: 0px 15px;
`

function Task(props) {
    const style = {
        fontSize: 100,
        color: props.active ? 'red' : 'black'
    }
    return (
        <TaskContainer>
            {props.drawing && <Gesture style={style} />}
            {!props.drawing && <TextFields style={style} />}
        </TaskContainer>
    )
}

export default function TaskList() {
    const [gameState] = useContext(Context.GameStateContext)
    const [user] = useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const tasks = gameState?.books?.filter(book => book.actors && book.actors[0]?.name === user.name) ?? []

    React.useEffect(() => {
        if (!activeBook && gameState && gameState.books) {
            const book = gameState.books.find(book => book.actors && book.actors[0]?.name === user.name)
            if (book) {
                setActiveBook(book)
            }
        }
    }, [activeBook, gameState, user])

    return (
        <TaskListContainer>
            {tasks.map(task => <Task key={task.creator.name} drawing={task?.entries?.length % 2 === 1} active={task?.creator?.name === activeBook?.creator?.name} />)}
        </TaskListContainer>
    )
}