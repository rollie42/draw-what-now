import React, { useEffect } from 'react'
import styled from 'styled-components'
import * as Context from '../Context'
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import {sleep} from '../Utils'
import { DrawingMode } from './Canvas'
import { RgbaStringColorPicker } from "react-colorful";
import "react-colorful/dist/index.css"
import { v4 as uuidv4 } from 'uuid'
import DeleteLayerIcon from '@material-ui/icons/Close'
import VisibleIcon from '@material-ui/icons/Visibility'
import NotVisibleIcon from '@material-ui/icons/VisibilityOff'
import { LayerCreateAction, LayerToggleAction, LayerDeleteAction, LayerSelectAction } from '../History'
import Slider from '@material-ui/core/Slider';
import ClearCanvasImg from '../images/clear-canvas.png'
import { withStyles } from '@material-ui/core';
import AddIcon from '@material-ui/icons/AddCircle'

const Container = styled.div`
    display: flex;
    flex-direction: column;
    height: 80vh;
`

const ControlPanel = styled.div`
    background-color: #FFF1BD;
    border: solid #FDAA4F 3px;
    border-radius: 40px;
    box-shadow: 8px 5px 5px #706A54cc;
    padding: 20px 10px;
    margin: 30px 50px;
    min-height: 80%;
`

const SVG = styled.svg`
    display: inline-flex;
    width: 100%;
    height: 100%;
    margin: 0px 0px;
    padding: 0px;
    ${props => props.selected && `background-color: #22222255;`}
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

const CircleContainer = styled.div`
    width: 40px;
    height: 40px;
`
function ColorCircle(props) {
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    const [colorPalette, setColorPalette] = React.useContext(Context.ColorPalette)
    const width = props.width ?? 15
    
    const clickHandler = React.useCallback((e) => {
        e.preventDefault()
        if (e.type === "click")
            setActiveColor(props.color)
        else if (e.type === 'contextmenu')
            setColorPalette(colorPalette.filter(color => color != props.color))
    }, [colorPalette, activeColor])
    return (
        <CircleContainer>
            <SVG onContextMenu={clickHandler} onClick={clickHandler} selected={colorsEqual(activeColor, props.color)}>
                <circle cx={20} cy={20} r={width} stroke={props.color} strokeWidth="1" fill={props.color} />
            </SVG>
        </CircleContainer>
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
    cursor: arrow;
    user-select: none;
    flex: 1;
`

const ClearButtonStyled = styled.img`
    width: 90%;
    cursor: pointer;
`

function ClearButton() {
    const [, setRequestClear] = React.useContext(Context.RequestClearContext)

    return (
        <ClearButtonStyled src={ClearCanvasImg} onClick={() => setRequestClear(true)} />
    )
}
function ColorPalette() {
    const [colorPalette, setColorPalette] = React.useContext(Context.ColorPalette)
    const [activeBook] = React.useContext(Context.ActiveBookContext)

    React.useEffect(() => {
        setColorPalette([])
    }, [activeBook])

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

const FontSlider = withStyles({
    root: {
        flex: 1
    }    
})(Slider)

const FontControlBox = styled.div`
    display: flex;
    align-items: center;
`

const SampleBrushDot = styled.div`
    width: 40px;
    height: 40px;
    margin-left: 10px;
    border: solid #FDAA4F 1px;
    background: #ffffff;
`

function StrokeWidth() {
    const [lineWidth, setLineWidth] = React.useContext(Context.LineWidthContext)

    const handler = (e, newWidth) => {
        const val = e.target.value
        setLineWidth(newWidth)
    }
    return (
        <StrokeWidthContainer>
            <Label>Stroke width</Label>
            <FontControlBox>
                <FontSlider value={lineWidth} onChange={handler} min={1} max={72} valueLabelDisplay="auto" />
                <SampleBrushDot>
                    <ColorCircle color={"black"} width={lineWidth/2} />
                </SampleBrushDot>
            </FontControlBox>         
        </StrokeWidthContainer>
    )
}

const ColorPicker = styled(RgbaStringColorPicker)`
    width: 100%;
`

const LayerOuterContainer = styled.div`
    width: 100%;
    border: solid #FDAA4F 3px;
    border-radius: 15px;
    overflow: hidden;
`
const LayerContainer = styled.div`
    width: 100%;
    display: flex;
    background-color: ${props => props.active ? '#f9f9f9' : '#ffffff'};
    height: 35px;
    display: flex;
    align-items: center;
    cursor: default;
`

const VisibleToggleContainer = styled.span`
    margin-left: 6px;
    cursor: pointer;

`

function VisibleToggle({layer}) {
    const [layers, setLayers] = React.useContext(Context.LayerContext)
    const [, , pushAction] = React.useContext(Context.ActionHistoryContext)

    const toggleVisible = React.useCallback((e) => {
        if (layer.visible && layers.filter(l => l.visible).length == 1) {
            console.log("You can't toggle off the last visible layer!")
            return
        }
        e.stopPropagation()
        const action = new LayerToggleAction(layer)
        action.exec({setLayers})
        pushAction(action)
    }, [layers])

    return (
        <VisibleToggleContainer onClick={toggleVisible}>
        {layer.visible && <VisibleIcon />}
        {!layer.visible && <NotVisibleIcon />}
        </VisibleToggleContainer>
    )
}

const LayerText = styled.span`
    flex: 1;
    user-select:none;
`

const DeleteLayerButton = styled(DeleteLayerIcon)`
    margin-right: 6px;
    cursor: pointer;
`

const RenameInput = styled.input`
    width: 100%;
    text-align: center;
`

function Layer({layer}) {
    const [layers, setLayers] = React.useContext(Context.LayerContext)
    const [, , pushAction] = React.useContext(Context.ActionHistoryContext)
    const [renaming, setRenaming] = React.useState(false)
    const [layerName, setLayerName] = React.useState(layer.name)
    
    const selectLayer = React.useCallback(() => {
        if (layer.active)
            return

        const currentLayer = layers.find(layer => layer.active)
        const action = new LayerSelectAction(layer, currentLayer)
        action.exec({setLayers})
        pushAction(action)
    }, [layers])

    const deleteLayer = React.useCallback((e) => {
        e.stopPropagation()
        if (layers.length === 1)
            return

        let idx = layers.findIndex(l => l.id === layer.id)
        const action = new LayerDeleteAction(layer, idx)
        action.exec({setLayers})
        pushAction(action)
    }, [layers])

    console.log(layer)

    React.useEffect(() => {
        if (renaming) {
            const keyHandler = (e) => {
                if (e.keyCode === 27) {
                    setLayerName(layer.name) // Revert change
                    setRenaming(false)
                } else if (e.keyCode === 13) {
                    setRenaming(false)
                }
            }
            const pointerHandler = () => {
                setRenaming(false)
            }

            window.addEventListener('pointerup', pointerHandler, false)
            window.addEventListener('keydown', keyHandler, false)
            return () => {
                window.removeEventListener('keydown', keyHandler, false)
                window.removeEventListener('pointerup', pointerHandler, false)
            }
        }
    }, [renaming])

    React.useEffect(() => {
        if (!renaming) {
            layer.name = layerName
        }
    }, [renaming, layerName])

    const updateLayerName = (newName) => {
        setLayerName(newName)
    }

    return (
        <LayerContainer onClick={selectLayer} active={layer.active} onDoubleClick={() => setRenaming(true)}>
            <VisibleToggle layer={layer} />
            {!renaming && <LayerText>{layerName}</LayerText>}
            {renaming && 
                <LayerText>
                    <RenameInput autoFocus type="text" 
                        value={layerName} 
                        onChange={e => updateLayerName(e.target.value)} 
                        onFocus={e => e.target.select()}
                        onBlur={e => setRenaming(false)}
                    />
                </LayerText>}
            <DeleteLayerButton onClick={deleteLayer}/>
        </LayerContainer>
    )
}

const NewLayerButton = styled.button`

`

const LayerListContainer = styled.div`
    
`

const LayerLabelContainer = styled.div`
    display: flex;
`

const AddIconStyled = styled(AddIcon)`
    cursor: pointer;
`

function LayerList() {
    const [layers, setLayers] = React.useContext(Context.LayerContext)
    const [, , pushAction] = React.useContext(Context.ActionHistoryContext)

    const addLayer = React.useCallback(() => {
        const prevActiveLayer = layers.find(layer => layer.active)
        const newLayer = {
            name: 'New Layer',
            id: uuidv4(),
            active: true,
            visible: true
        }
        const action = new LayerCreateAction(newLayer, prevActiveLayer)
        action.exec({setLayers})
        pushAction(action)  
    }, [layers])

    return (
        <LayerListContainer>
            <LayerLabelContainer>
                <Label>Layers</Label>
                <AddIconStyled onClick={addLayer}>+</AddIconStyled>
            </LayerLabelContainer>
            <LayerOuterContainer>
                {[...layers].reverse().map(layer => <Layer key={layer.id} layer={layer} />)}
            </LayerOuterContainer>
        </LayerListContainer>
    )
}

export default function LayerBox() {
    const [activeColor, setActiveColor] = React.useContext(Context.ActiveColorContext)
    const [gameState] = React.useContext(Context.GameStateContext)
    const presentingSummary = ["PresentingSummary"].includes(gameState?.gameStatus)

    return (
        <Container>
            {!["PresentingSummary", "Completed"].includes(gameState?.gameStatus) && <ControlPanel>
                <ClearButton />
                <ColorPicker color={activeColor} onChange={setActiveColor} />
                <StrokeWidth />
                <ColorPalette />
                <LayerList />                
            </ControlPanel>}
        </Container>
    )
}