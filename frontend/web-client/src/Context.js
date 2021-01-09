import React from 'react';
export const UserContext = React.createContext();
export const ActivePageContext = React.createContext();

export function AppContextProvider(props) {
    const [user, setUser] = React.useState(null)
    const [activePage, setActivePage] = React.useState(null)
    return (
        <UserContext.Provider value={[user, setUser]}>
            <ActivePageContext.Provider value={[activePage, setActivePage]}>
                {props.children}
            </ActivePageContext.Provider>
        </UserContext.Provider>
    )
}

