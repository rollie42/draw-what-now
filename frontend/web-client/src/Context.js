import React from 'react';
export const UserContext = React.createContext()
export const ActivePageContext = React.createContext()
export const ActiveColorContext = React.createContext("red")

export function AppContextProvider(props) {
    const [user, setUser] = React.useState(null)
    const [activePage, setActivePage] = React.useState(null)
    const [activeColor, setActiveColor] = React.useState("red")

    return (
        <UserContext.Provider value={[user, setUser]}>
            <ActivePageContext.Provider value={[activePage, setActivePage]}>
                <ActiveColorContext.Provider value={[activeColor, setActiveColor]}>
                    {props.children}
                </ActiveColorContext.Provider>
            </ActivePageContext.Provider>
        </UserContext.Provider>
    )
}

