import React, { useEffect } from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import {sleep} from '../Utils'
import { DrawingMode, Shapes } from './Canvas'
import "react-colorful/dist/index.css"

import PaintBrushImg from '../images/paint-brush.png'
import ShapeToolImg from '../images/shape-tool.png'
import LineToolImg from '../images/line-tool.png'
import PaintBucketImg from '../images/paint-bucket.png'
import EraserImg from '../images/eraser.png'
import SelectRegion from '../images/select-region.png'
import Hand from '../images/hand.png'
import UndoImg from '../images/undo.png'
import RedoImg from '../images/redo.png'
import SquareImg from '../images/square.png'
import SquareFilledImg from '../images/square-filled.png'
import CircleImg from '../images/circle.png'
import CircleFilledImg from '../images/circle-filled.png'
import TriangleImg from '../images/triangle.png'
import TriangleFilledImg from '../images/triangle-filled.png'
import { withStyles } from '@material-ui/core';

const Container = styled.div`    
    display: flex;
    flex-direction: column;
    height: 100%;
`

const ControlPanel = styled.div`
    text-align: left;
    margin-top:100px;
`

const LabelContainer = styled.div`
    font-size: 30px;
    display: inline-block;
    width: 100%;
    margin: 0px 30px 32px 0px;
    text-align: right;
    transform: translate(-60px, 0px);
    opacity: 0;
    padding: 30px 0px;    

    &.showing {
        transition: transform 0.75s ease;
        transform: translate(0px, 0px);
        opacity: 1;
    }

    &.hiding {
        transition: opacity 0.5s;
        opacity: 0;        
        transform: translate(0px, 0px);
    }
`

function DescriptionLabel() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [, setDescription] = React.useContext(Context.DescriptionContext)
    const [label, setLabel] = React.useState("")
    const [className, setClassName] = React.useState("")

    var name = ""
    if (gameState) {
        const presentationState = gameState.presentationState
        const book = gameState.books?.find(b => b.creator.name === presentationState.bookOwner)
        var entry = book?.entries[presentationState.pageNumber]
        if (entry?.imageUrl)
            entry = book.entries[presentationState.pageNumber - 1]

        name = entry?.author?.name
    }

    useEffect(() => {
        console.log(gameState)
        const handler = async () => {
            const newLabel = `${name} wrote:`
            if (newLabel !== label) {
                // Fade old text out
                setClassName('hiding')
                await sleep(500)          
                setClassName('')
                // Update text, slide in
                setLabel(newLabel)
                await sleep(200)
                setClassName('showing')

                await sleep(800)
                setDescription(entry.description)
            }
        }

        handler()
    }, [entry.description, gameState, label, name])

    return (
        <LabelContainer className={className}>
            <span>{label}</span>
        </LabelContainer>
    )
}

function ImageLabel() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [, setStaticImage] = React.useContext(Context.StaticImageContext)
    const [label, setLabel] = React.useState("")
    const [className, setClassName] = React.useState("")
    
    const presentationState = gameState.presentationState
    // const book = gameState.books.find(b => b.creator.name === presentationState.bookOwner)

    var name = ""
    if (gameState) {
        const presentationState = gameState.presentationState
        const book = gameState.books.find(b => b.creator.name === presentationState.bookOwner)
        var entry = book.entries[presentationState.pageNumber]
        console.log(presentationState, book.entries)
        if (entry.description && presentationState.pageNumber > 0)
            entry = book.entries[presentationState.pageNumber - 1]

        name = entry?.author?.name
    }

    useEffect(() => {
        const handler = async () => {
            const newLabel = `${name} drew:`
            
            if (presentationState.pageNumber === 0) {
                setStaticImage(entry.imageUrl)
                setLabel("")
            } else if (newLabel !== label) {
                // Fade old text out
                setClassName('hiding')
                await sleep(500)          
                setClassName('')
                // Update text, slide in
                setLabel(newLabel)
                await sleep(200)
                setClassName('showing')

                await sleep(800)
                setStaticImage(entry.imageUrl)
            }
        }

        handler()
    }, [entry.imageUrl, gameState, label, name, presentationState.pageNumber])

    return (
        <LabelContainer className={className}>
            {presentationState.pageNumber > 0 && <span>{label}</span>}
        </LabelContainer>
    )
}

const BookTitleContainer = styled.div`    
    font-family: 'Shadows Into Light', cursive;
    font-size: 100px;
    position: fixed;
    color: #7F0037;
    transform: translate(130px, -15px) rotate(-18deg);    
    z-index: 3;
`

function BookTitle() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const presentationState = gameState.presentationState
    return (
        <BookTitleContainer>{presentationState.bookOwner}'s Book</BookTitleContainer>
    )
}

const DeadSpace = styled.div`
    flex: 1;
`

const DeadSpaceTop = styled.div`
    flex: 1;
`


const ToggleButtonImage = styled.img`
    width: 38px;
    height: 38px;
`    
const ToolButtonContainer = styled.div`
    position: relative;
`
const ToggleButton = styled.button`
    
    background: ${props => props.selected ? 'rgba(0,0,0,0.12)' : 'none'};
    border: 1px solid rgba(0,0,0,0.12);
    padding: 11px;
    cursor: pointer;

    :hover {
        background-color: ${props => props.selected ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)'};
    }
    
`

function ToolButton({img, mode, children}) {
    const [activeTool, setActiveTool] = React.useContext(Context.ActiveToolContext);
    const clickHandler = () => {
        setActiveTool(mode)
    }

    return (
        <ToolButtonContainer>
            <ToggleButton onClick={clickHandler} selected={activeTool === mode}>
                <ToggleButtonImage src={img}/>
            </ToggleButton>
            {children}
        </ToolButtonContainer>
    )
}

const ToolSelectorContainer = styled.div`
`

function ToolSelector() {
    return (
        <ToolSelectorContainer>
            <ToolButton mode={DrawingMode.DRAW} img={PaintBrushImg} />
            <ToolButton mode={'draw-shape'} img={ShapeToolImg}>
                <ShapeSelector />
            </ToolButton>
            <ToolButton mode={DrawingMode.DRAW_LINE} img={LineToolImg} />
            <ToolButton mode={DrawingMode.FILL} img={PaintBucketImg} />
            <ToolButton mode={DrawingMode.ERASE} img={EraserImg} />
            <ToolButton mode={DrawingMode.SELECT} img={SelectRegion} />
            <ToolButton mode={DrawingMode.MOVE} img={Hand} />
        </ToolSelectorContainer>
    )
}

const ShapeOptionsContainer = styled.div`
    z-index: 2;
    position: absolute;
    background-color: #FFE895;
    top: 0px;
    left:60px;
    overflow: hidden;
    max-width: 0px;
    transition: max-width .1s ease-in-out;

    ${ToolButtonContainer}:hover & {
        max-width: 200px;
        transition: max-width .2s ease-in-out;
    }
`

function ShapeButton({img, shape, filled}) {    
    const [activeShape, setActiveShape] = React.useContext(Context.ActiveShapeContext)
    const [fillShape, setFillShape] = React.useContext(Context.FillShapeContext)
    const [, setActiveTool] = React.useContext(Context.ActiveToolContext);
    
    const clickHandler = () => {
        setActiveShape(shape)
        setFillShape(filled)
        setActiveTool(DrawingMode.DRAW_SHAPE)
    }
    return (
        <ToggleButton onClick={clickHandler} selected={activeShape === shape && fillShape === filled}>
            <ToggleButtonImage src={img}/>
        </ToggleButton>
    )
}

const ShapeRow = styled.div`
    white-space: nowrap;
`

function ShapeSelector() {
    const [activeTool] = React.useContext(Context.ActiveToolContext)
    return (        
        <ShapeOptionsContainer show={activeTool === DrawingMode.DRAW_SHAPE}>
            <ShapeRow>
                <ShapeButton img={SquareFilledImg} shape={Shapes.SQUARE} filled={true} />
                <ShapeButton img={CircleFilledImg} shape={Shapes.CIRCLE} filled={true} />
                <ShapeButton img={TriangleFilledImg} shape={Shapes.TRIANGLE} filled={true} />
            </ShapeRow>
            <ShapeRow>
                <ShapeButton img={SquareImg} shape={Shapes.SQUARE} filled={false} />
                <ShapeButton img={CircleImg} shape={Shapes.CIRCLE} filled={false} />
                <ShapeButton img={TriangleImg} shape={Shapes.TRIANGLE} filled={false} />
            </ShapeRow>
        </ShapeOptionsContainer>
    )
}


export default function DrawingControls() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const presentingSummary = ["PresentingSummary"].includes(gameState?.gameStatus)

    return (
        <Container>
            {!["PresentingSummary", "Completed"].includes(gameState?.gameStatus) && <ControlPanel>
                <ToolSelector />
            </ControlPanel>}
            {presentingSummary && <BookTitle />}
            {presentingSummary && <DeadSpaceTop />}
            {presentingSummary && <ImageLabel />}
            {presentingSummary && <DeadSpace />}
            {presentingSummary && <DescriptionLabel />}
        </Container>
    )
}