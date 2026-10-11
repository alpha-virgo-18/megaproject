import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Outlet } from 'react-router-dom'
import authService from './appwrite/auth'
import { login, logout } from './Store/Authslice'
import { getErrorMessage } from './appwrite/errors'
import { Footer, Header, Container, Alert } from './components'

/**
 * App shell. Restores the Appwrite session once on mount; while that is pending the auth state is
 * `pending`, so guarded routes wait and the header shows no auth-specific actions. Public pages
 * render immediately.
 */
export default function App() {
    const dispatch = useDispatch()
    const [restoreError, setRestoreError] = useState('')
    // Guards against the double effect run in React StrictMode (dev only).
    const authChecked = useRef(false)

    useEffect(() => {
        if (authChecked.current) return
        authChecked.current = true

        authService
            .getCurrentUser()
            .then((user) => {
                if (user) dispatch(login(user))
                else dispatch(logout())
            })
            .catch((error) => {
                // Could not reach Appwrite: treat as a guest but tell the user why.
                dispatch(logout())
                setRestoreError(getErrorMessage(error, 'Your session could not be checked.'))
            })
    }, [dispatch])

    return (
        <>
            <a
                href="#main-content"
                className="sr-only-focusable fixed left-4 top-4 z-50 rounded-md bg-olive px-3 py-2 text-sm font-medium text-white"
            >
                Skip to content
            </a>
            <Header />
            <main id="main-content" className="flex-1">
                {restoreError && (
                    <Container className="pt-4">
                        <Alert tone="warning" title="Session check failed" onDismiss={() => setRestoreError('')}>
                            {restoreError} You are browsing as a guest; try logging in again.
                        </Alert>
                    </Container>
                )}
                <Outlet />
            </main>
            <Footer />
        </>
    )
}
