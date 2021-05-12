import React from 'react'
import * as Context from '../Context'

function ActionRow({action}) {
    return (
        <div>
            <span>{action.describe()}</span>
        </div>
    )
}
export default function ActionHistory() {
    const [actionHistory] = React.useContext(Context.ActionHistoryContext)
    console.log(actionHistory)
    return (
        <div>
            <div>Actions</div>
            {actionHistory.map(action => <ActionRow key={action.id} action={action}/>)}
        </div>
    )
}