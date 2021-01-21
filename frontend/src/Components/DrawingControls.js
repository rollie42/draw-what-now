import React, { useEffect } from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {DrawingMode} from '../atrament'
import { HexColorPicker, RgbaStringColorPicker } from "react-colorful";
import "react-colorful/dist/index.css"

import PaintBrushImg from '../images/paint-brush.png'
import ShapeToolImg from '../images/shape-tool.png'
import LineToolImg from '../images/line-tool.png'
import PaintBucketImg from '../images/paint-bucket.png'
import EraserImg from '../images/eraser.png'

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

const getRGB = (hexColor) => {
    var match = hexColor.match(/rgba?\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3})\)?(?:, ?(\d(?:\.\d+)?)\))?/);
    return match ? {
        red: match[1],
        green: match[2],
        blue: match[3],
        alpha: match[4]
    } : {};
}

function colorsEqual(c1, c2) {
    const o1 = getRGB(c1)
    const o2 = getRGB(c2)
    return o1.red === o2.red && o1.green === o2.green && o1.blue === o2.blue && Math.abs(o1.alpha - o2.alpha) < .1
}

function ColorCircle(props) {
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    return (
        <SVG onClick={() => setActiveColor(props.color)} selected={colorsEqual(activeColor, props.color)}>
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
    padding: 30px 0px;

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
        const handler = async () => {
            const newLabel = `${name} wrote:`
            if (newLabel !== label) {
                // Fade old text out
                setClassName('hiding')
                await sleep(500)
                setClassName('')
                await sleep(200)

                // Update text, slide in
                setLabel(newLabel)
                setClassName('showing')

                await sleep(800)
                setDescription(entry.description)
            }
        }

        handler()
    }, [gameState])

    return (
        <LabelContainer className={className}>
            <span>{label}</span>
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
    const [, setDisplayedImage] = React.useContext(Context.DisplayedImageContext)
    const [label, setLabel] = React.useState("")
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
                const newLabel = `${name} drew:`
                if (newLabel !== label) {
                    // Fade old text out
                    setClassName('hiding')
                    await sleep(500)
                    setClassName('')
                    await sleep(200)
    
                    // Update text, slide in
                    setLabel(newLabel)
                    setClassName('showing')

                    await sleep(800)
                    setDisplayedImage(entry.imageUrl)
                }
            }
    
            handler()
        }, [gameState])

    return (
        <LabelContainer className={className}>
            {presentationState.pageNumber > 0 && <span>{label}</span>}
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
            <ToggleButtonStyled value={DrawingMode.FILL} >
                <ToggleButtonImage src={PaintBucketImg} />
            </ToggleButtonStyled>
            <ToggleButtonStyled value={DrawingMode.ERASE} >
                <ToggleButtonImage src={EraserImg} />
            </ToggleButtonStyled>
        </ToggleButtonGroup>
    )
}

const Select = styled.select`
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
const Checkbox = styled.input.attrs({ type: 'checkbox'})`
`

function ShapeSelector() {
    const [activeTool] = React.useContext(Context.ActiveToolContext)
    const [activeShape, setActiveShape] = React.useContext(Context.ActiveShapeContext)
    const [fillShape, setFillShape] = React.useContext(Context.FillShapeContext)
    const options = [
        { label: 'Square', value: DrawingMode.DRAW_SQUARE},
        { label: 'Circle', value: DrawingMode.DRAW_CIRCLE},
        { label: 'Triangle', value: DrawingMode.DRAW_TRIANGLE}
    ]
    const setter = (evt) => {setActiveShape(evt.target.value) }
    return (        
        <ShapeOptionsContainer state={activeTool === 'draw-shape' ? 'show' : 'exited'}>
            <label>Shape</label>
            <div>
                <Select value={activeShape} onChange={setter} >
                    {options.map(o => <option value={o.value}>{o.label}</option>)}
                </Select>
                <Checkbox checked={fillShape} onChange={event => setFillShape(event.target.checked)} />
                <label>Fill?</label>
            </div>         


        </ShapeOptionsContainer>
    )
}

const ColorPicker = styled(RgbaStringColorPicker)`
    width: 100%;
`

export default function DrawingControls() {
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    const [gameState] = React.useContext(Context.GameStateContext)
    const presentingSummary = ["PresentingSummary"].includes(gameState?.gameStatus)

    return (
        <Container>
            {!["PresentingSummary", "Completed"].includes(gameState?.gameStatus) && <ControlPanel>
                <ToolSelector />
                <ShapeSelector />
                <StrokeWidth />
                <ColorPicker color={activeColor} onChange={setActiveColor} />
                <ColorPalette />                
            </ControlPanel>}
            {presentingSummary && <BookTitle />}
            {presentingSummary && <DeadSpaceTop />}
            {presentingSummary && <ImageLabel />}
            {presentingSummary && <DeadSpace />}
            {presentingSummary && <DescriptionLabel />}
        </Container>
    )
}