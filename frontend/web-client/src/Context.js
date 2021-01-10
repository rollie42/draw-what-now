import React from 'react';
export const UserContext = React.createContext()
export const ActivePageContext = React.createContext()
const defaultColor = {
    hex: "#ff0000"
}
export const ActiveColorContext = React.createContext(defaultColor)
export const ColorPalette = React.createContext([])
export const BrushWidthContext = React.createContext(1)

export function AppContextProvider(props) {
    const [user, setUser] = React.useState(null)
    const [activePage, setActivePage] = React.useState(null)
    const [activeColor, setActiveColor] = React.useState(defaultColor)
    const [colorPalette, setColorPalette] = React.useState([])
    const [brushWidth, setBrushWidth] = React.useState(1)

    return (
        <UserContext.Provider value={[user, setUser]}>
            <ActivePageContext.Provider value={[activePage, setActivePage]}>
                <ActiveColorContext.Provider value={[activeColor, setActiveColor]}>
                    <ColorPalette.Provider value={[colorPalette, setColorPalette]}>
                        <BrushWidthContext.Provider value={[brushWidth, setBrushWidth]}>
                            {props.children}
                        </BrushWidthContext.Provider>
                    </ColorPalette.Provider>
                </ActiveColorContext.Provider>
            </ActivePageContext.Provider>
        </UserContext.Provider>
    )
}

