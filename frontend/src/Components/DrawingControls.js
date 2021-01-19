import React, { useEffect } from 'react'
import styled from 'styled-components'
import css from 'styled-components'
import { ChromePicker } from 'react-color'
import * as Context from '../Context'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {DrawingMode} from '../atrament'

import PaintBrushImg from '../images/paint-brush.png'
import ShapeToolImg from '../images/shape-tool.png'
import LineToolImg from '../images/line-tool.png'

const Container = styled.div`
    min-width: 28vh;
    display: flex;
    flex-direction: column;
    height: 100%;
`

const ControlPanel = styled.div`
    background-color: #080808aa;
    color: #e6e6e6;
    width: 25vh;
    padding: 20px 20px;
    margin: 30px 50px;
    min-height: 80%;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 30px;
    height: 30px;
    margin: 0px 2px;
    padding: 3px;
    ${props => props.selected && `background-color: #222222;`}
`

function ColorCircle(props) {
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    console.log(activeColor, props.color)
    return (
        <SVG onClick={() => setActiveColor(props.color)} selected={activeColor.hex == props.color}>
            <circle cx="15" cy="15" r="15" stroke={props.color} strokeWidth="1" fill={props.color} />
        </SVG>
    )
}

const ColorCircleContainer = styled.div`
    display: flex;
    justify-content: left;
    align-items: center;
    min-height: 30px;
    flex-wrap: wrap;
`
const ColorPaletteContainer = styled.div`
    margin-top: 8px;
`

const Label = styled.div`
`

function ColorPalette() {
    const [colorPalette] = React.useContext(Context.ColorPalette)

    return (
        <ColorPaletteContainer>
            <Label>Palette</Label>
            <ColorCircleContainer>
                {colorPalette.map((value) => {
                    return <ColorCircle key={value} color={value} />
                })}
            </ColorCircleContainer>
        </ColorPaletteContainer>
    )
}

const StrokeWidthContainer = styled.div`
`

const StrokeWidthValue = styled.input`
    width: 20px;
`

function StrokeWidth() {
    const [brushWidth, setBrushWidth] = React.useContext(Context.BrushWidthContext)

    const handler = (e) => {
        const val = e.target.value
        console.log(val)
        setBrushWidth(val)
    }
    return (
        <StrokeWidthContainer>
            <Label>Stroke width</Label>
            <StrokeWidthValue value={brushWidth} inputmode="numeric" min="1" max="72" onChange={handler}></StrokeWidthValue>
        </StrokeWidthContainer>
    )
}

const LabelContainer = styled.div`
    font-size: 30px;
    display: inline-block;
    width: 100%;
    margin: 0px 30px 32px 0px;
    text-align: right;
    transform: translate(-60px, 0px);

    &.hiding {
        transition: opacity 0.5s;
        opacity: 0;        
        transform: translate(0px, 0px);
    }

    &.showing {
        transition: transform 0.75s ease;
        transform: translate(0px, 0px);
    }
`

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function DescriptionLabel(props) {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [description, setDescription] = React.useState("")
    const [className, setClassName] = React.useState("")

    var name = ""
    if (gameState) {
        const presentationState = gameState.presentationState
        const book = gameState.books.find(b => b.creator.name === presentationState.bookOwner)
        var entry = book.entries[presentationState.pageNumber]
        if (entry.imageUrl)
            entry = book.entries[presentationState.pageNumber - 1]

        name = entry?.author?.name
    }

    useEffect(() => {
        const handler = async () => {
            if (name !== description) {
                // Fade old text out
                setClassName('hiding')
                await sleep(500)
                setClassName('')
                await sleep(200)

                // Update text, slide in
                setDescription(`${name} wrote:`)
                setClassName('showing')
            }
        }

        handler()
    }, [gameState])

    return (
        <LabelContainer className={className}>
            <span>{description}</span>
        </LabelContainer>
    )
}

const ImageLabelContainer = styled.div`
    font-size: 30px;
    display: inline-block;
    width: 100%;
    margin: 0px 30px 32px 0px;
    text-align: right;
`

function ImageLabel() {
    const [gameState] = React.useContext(Context.GameStateContext)
    const [description, setDescription] = React.useState("")
    const [className, setClassName] = React.useState("")
    
    const presentationState = gameState.presentationState
    const book = gameState.books.find(b => b.creator.name === presentationState.bookOwner)

    var name = ""
    if (gameState) {
        const presentationState = gameState.presentationState
        const book = gameState.books.find(b => b.creator.name === presentationState.bookOwner)
        var entry = book.entries[presentationState.pageNumber]
        if (entry.description && presentationState.pageNumber > 0)
            entry = book.entries[presentationState.pageNumber - 1]

        name = entry?.author?.name
    }

        useEffect(() => {
            const handler = async () => {
                if (name !== description) {
                    // Fade old text out
                    setClassName('hiding')
                    await sleep(500)
                    setClassName('')
                    await sleep(200)
    
                    // Update text, slide in
                    setDescription(`${name} drew:`)
                    setClassName('showing')
                }
            }
    
            handler()
        }, [gameState])

    return (
        <LabelContainer>
            {presentationState.pageNumber > 0 && <span>{description}</span>}
        </LabelContainer>
    )
}

const BookTitleContainer = styled.div`    
    font-family: 'Shadows Into Light', cursive;
    font-size:68px;
    position: fixed;
    color: #7F0037;
    transform: translate(130px, -15px) rotate(-18deg);    
`

function BookTitle() {
    return (
        <BookTitleContainer>Bob's Book</BookTitleContainer>
    )
}

const DeadSpace = styled.div`
    flex: 1;
`

const ToolSelectorContainer = styled(ToggleButtonGroup)`
`

const ToggleButtonStyled = styled(ToggleButton)`
`

const ToggleButtonImage = styled.img`
    width: 24px;
    height: 24px;
`    

function ToolSelector() {
    const [activeTool, setActiveTool] = React.useContext(Context.ActiveToolContext);
    return (
        <ToggleButtonGroup value={activeTool} exclusive onChange={(event, newTool) => newTool && setActiveTool(newTool)}>
            <ToggleButtonStyled value={DrawingMode.DRAW}>
                <ToggleButtonImage src={PaintBrushImg} />
            </ToggleButtonStyled>
            <ToggleButtonStyled value={'draw-shape'} >
                <ToggleButtonImage src={ShapeToolImg} />
            </ToggleButtonStyled>
            <ToggleButtonStyled value={DrawingMode.DRAW_LINE} >
                <ToggleButtonImage src={LineToolImg} />
            </ToggleButtonStyled>
        </ToggleButtonGroup>
    )
}

const Select = styled.select`
    display: block;
`

const ShapeOptionsContainer = styled.div`    
    overflow: hidden;
    ${({ state }) => (state === "exited") ? `
        max-height: 0px;
        transition: max-height .4s ease-in-out;` : `
    
        max-height: 200px;
        transition: max-height .7s ease-in-out;`
    };
`

function ShapeSelector() {
    const [activeTool] = React.useContext(Context.ActiveToolContext)
    const [activeShape, setActiveShape] = React.useContext(Context.ActiveShapeContext)
    console.log(activeShape)
    const options = [
        { label: 'Square', value: DrawingMode.DRAW_SQUARE},
        { label: 'Circle', value: DrawingMode.DRAW_CIRCLE},
        { label: 'Triangle', value: DrawingMode.DRAW_TRIANGLE}
    ]
    const setter = (evt) => {setActiveShape(evt.target.value) }
    return (        
        <ShapeOptionsContainer state={activeTool === 'draw-shape' ? 'show' : 'exited'}>
            <label>Shape</label>            
            <Select value={activeShape} onChange={setter} >
                {options.map(o => <option value={o.value}>{o.label}</option>)}
            </Select>
        </ShapeOptionsContainer>
    )
}

export default function DrawingControls() {
    const [color, setColor] = React.useContext(Context.ActiveColorContext)
    const [gameState] = React.useContext(Context.GameStateContext)

    return (
        <Container>
            {!["PresentingSummary", "Completed"].includes(gameState?.gameStatus) && <ControlPanel>
                <ToolSelector />
                <ShapeSelector />
                <StrokeWidth />
                <ChromePicker disableAlpha={true} color={color} onChange={h => setColor(h)} />
                <ColorPalette />
                
            </ControlPanel>}
            {["PresentingSummary"].includes(gameState?.gameStatus) && <BookTitle />}
            {["PresentingSummary"].includes(gameState?.gameStatus) && <ImageLabel />}
            {["PresentingSummary"].includes(gameState?.gameStatus) && <DeadSpace />}
            <DescriptionLabel show={["PresentingSummary"].includes(gameState?.gameStatus)} />
        </Container>
    )
}