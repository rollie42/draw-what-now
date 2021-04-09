import React from 'react';
import styled from 'styled-components'
import * as Context from '../Context'
import Modal from 'react-modal';
import { Button } from '../Controls'
import { DialogContainer } from './GameDialogs'

const SummaryContainer = styled.span`
    width: 180px;
    height: 120px;
`

function DescriptionEntrySummary({ descEntry }) {
    return (
        <SummaryContainer>
            <span>{descEntry.description}</span>
        </SummaryContainer>
    )
}

const StyledImg = styled.img`
    height: 100%;
    width: 100%;
    background: #ffffff;
`
function ImageEntrySummary({ imageEntry }) {
    return (
        <SummaryContainer>
            <StyledImg src={imageEntry.imageUrl} />
        </SummaryContainer>
    )
}

function EntrySummary({ entry }) {
    return (<>
        { entry.imageUrl ? <ImageEntrySummary imageEntry={entry} /> : <DescriptionEntrySummary descEntry={entry} />}
    </>
    )
}

const BookSummaryContainer = styled.div`
    display: flex;
`
function BookSummary({ book }) {
    return (
        <BookSummaryContainer>
            {book.entries.map((entry) => <EntrySummary key={entry} entry={entry} />)}
        </BookSummaryContainer>
    )
}
export function GameSummary(props) {
    const [open, setOpen] = React.useState(true)
    const [gameState] = React.useContext(Context.GameStateContext)


    console.log(open)
    return (
        <DialogContainer style={{ overlay: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }} onRequestClose={() => setOpen(false)} isOpen={open}>
            <div>
                {gameState.books.map((book) => <BookSummary key={book} book={book} />)}
            </div>

            <div>
                <Button onClick={() => { }}>Exit game</Button>
            </div>
        </DialogContainer>
    )
}