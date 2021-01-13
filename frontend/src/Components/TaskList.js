import React, { useContext } from 'react'
import styled from 'styled-components'
import Gesture from '@material-ui/icons/Gesture'
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

const DrawIcon = styled(Gesture)`
    width: 100%;
`

function Task() {
    return (
        <TaskContainer>
            <Gesture style={{ fontSize: 100 }} />
        </TaskContainer>
    )
}

export default function TaskList() {
    const [gameState] = useContext(Context.GameStateContext)
    const [user] = useContext(Context.UserContext)
    const [activeBook, setActiveBook] = React.useContext(Context.ActiveBookContext)
    const tasks = gameState?.books?.filter(book => book.currentActor?.name == user.name) ?? []

    React.useEffect(() => {
        if (!activeBook && gameState && gameState.books) {
            const book = gameState.books.filter(book => book.currentActor?.name == user.name)[0]
            if (book) {
                setActiveBook(book)
            }
        }
    }, [activeBook, gameState, user])

    console.log(tasks)

    return (
        <TaskListContainer>
            {tasks.map(task => <Task key={task.creator.name} />)}
        </TaskListContainer>
    )
}