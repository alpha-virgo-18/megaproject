import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Reads a one-off `{ notice, warning }` passed through router state (e.g. after creating or deleting
 * a post), then clears it from history so a refresh or back-navigation does not replay it.
 */
export function useRouteNotice() {
    const location = useLocation()
    const navigate = useNavigate()
    const [consumed, setConsumed] = useState(null)
    const [notice, setNotice] = useState('')
    const [warning, setWarning] = useState('')

    const incoming = location.state && (location.state.notice || location.state.warning) ? location.state : null

    // Adopt a new router-state message during render (React's "adjust state on prop change" pattern).
    if (incoming && incoming !== consumed) {
        setConsumed(incoming)
        setNotice(incoming.notice || '')
        setWarning(incoming.warning || '')
    }

    useEffect(() => {
        if (incoming) {
            navigate(location.pathname + location.search, { replace: true, state: null })
        }
    }, [incoming, location.pathname, location.search, navigate])

    return {
        notice,
        warning,
        clearNotice: () => setNotice(''),
        clearWarning: () => setWarning(''),
    }
}
