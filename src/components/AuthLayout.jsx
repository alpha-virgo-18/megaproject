import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'
import { selectAuthStatus } from '../Store/Authslice'
import { LoadingState } from './States'

/**
 * Declarative route guard.
 * - `authentication` (default true): the route needs a signed-in user; guests are sent to /login and
 *   the attempted location is remembered so Login can return them afterwards.
 * - `authentication={false}`: guest-only route (login/signup); signed-in users are sent home or back
 *   to where they came from.
 * While the initial session check is still pending nothing is redirected, which prevents guests from
 * being treated as authenticated (or vice versa) before Appwrite has answered.
 */
export default function AuthLayout({ children, authentication = true }) {
    const authStatus = useSelector(selectAuthStatus)
    const location = useLocation()

    if (authStatus === 'pending') {
        return <LoadingState label="Checking your session…" />
    }

    const isAuthenticated = authStatus === 'authenticated'

    if (authentication && !isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    if (!authentication && isAuthenticated) {
        const target = location.state?.from?.pathname
        return <Navigate to={target && target !== location.pathname ? target : '/'} replace />
    }

    return children
}
