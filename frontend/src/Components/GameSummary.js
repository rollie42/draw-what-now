import React from 'react';
import styled from 'styled-components'
import * as Context from '../Context'
import Modal from 'react-modal';
import { Button } from '../Controls'
import { DialogContainer } from './GameDialogs'

const SummaryContainer = styled.div`
`

function DescriptionEntrySummary({ descEntry }) {
    return (
        <SummaryContainer>
            <span>{descEntry.description}</span>
        </SummaryContainer>
    )
}

function ImageEntrySummary({ imageEntry }) {
    return (
        <SummaryContainer>
            <img src={imageEntry.imageUrl} />
        </SummaryContainer>
    )
}

function EntrySummary({ entry }) {
    return (<>
        { entry.imageUrl ? <ImageEntrySummary imageEntry={entry} /> : <DescriptionEntrySummary descEntry={entry} />}
    </>
    )
}

function BookSummary({ book }) {
    return (
        <div>
            {book.entries.map((entry) => <EntrySummary key={entry} entry={entry} />)}
        </div>
    )
}
export function GameSummary(props) {
    const { open, setOpen } = props
    const [gameState] = React.useContext(Context.GameStateContext)

    return (
        <DialogContainer isOpen={open}>
            <div>
                {gameState.books.map((book) => <BookSummary key={book} book={book} />)}
            </div>

            <div>
                <Button onClick={() => { }}>Exit game</Button>
            </div>
        </DialogContainer>
    )
}