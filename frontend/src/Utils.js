import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'

export function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function contextsToProps(contexts) {
    const props = {}
    for (const [key, value] of Object.entries(contexts)) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [getter, setter] = React.useContext(value)
        props[key] = getter
        props['set' + capitalize(key)] = setter
    }

    return props
}

export function usePrevState(state) {
    const [curState, setCurState] = React.useState(state)
    // const [prevState, setPrevState] = React.useState(state)

    useEffect(() => {
        if (state !== curState) {
            console.log('state change internal')
            setCurState(state)         
        }
    }, [state])

    
    
    return curState
}

export function useStateChange(state, handler) {
    const prevState = usePrevState(state)
    React.useEffect(() => {
        if (state !== prevState) {
            handler(prevState, state)
        }
    }, [state, prevState])
}