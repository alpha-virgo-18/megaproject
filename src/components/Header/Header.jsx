import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Container from '../container/Container'
import Logo from '../Logo'
import LogoutBtn from './LogoutBtn'
import { selectAuthStatus, selectUser } from '../../Store/Authslice'

const linkClass = ({ isActive }) =>
    `inline-flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive ? 'bg-olive-light text-olive-dark' : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
    }`

const primaryLinkClass = ({ isActive }) =>
    `inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium transition-colors duration-150 ${
        isActive
            ? 'border-olive-dark bg-olive-dark text-white'
            : 'border-olive bg-olive text-white hover:border-olive-dark hover:bg-olive-dark'
    }`

function NavLinks({ authStatus, onNavigate }) {
    const isAuthenticated = authStatus === 'authenticated'
    const isGuest = authStatus === 'guest'
    return (
        <>
            <NavLink to="/" end className={linkClass} onClick={onNavigate}>
                Home
            </NavLink>
            {isAuthenticated && (
                <>
                    <NavLink to="/all-posts" className={linkClass} onClick={onNavigate}>
                        All posts
                    </NavLink>
                    <NavLink to="/add-post" className={primaryLinkClass} onClick={onNavigate}>
                        Write a post
                    </NavLink>
                </>
            )}
            {isGuest && (
                <>
                    <NavLink to="/login" className={linkClass} onClick={onNavigate}>
                        Log in
                    </NavLink>
                    <NavLink to="/signup" className={primaryLinkClass} onClick={onNavigate}>
                        Sign up
                    </NavLink>
                </>
            )}
        </>
    )
}

export default function Header() {
    const authStatus = useSelector(selectAuthStatus)
    const user = useSelector(selectUser)
    const location = useLocation()
    const [open, setOpen] = useState(false)
    const [lastPathname, setLastPathname] = useState(location.pathname)

    // Close the mobile menu whenever the route changes (state adjusted during render, no effect).
    if (lastPathname !== location.pathname) {
        setLastPathname(location.pathname)
        setOpen(false)
    }

    // Close on Escape while open.
    useEffect(() => {
        if (!open) return undefined
        const onKey = (event) => {
            if (event.key === 'Escape') setOpen(false)
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    const isAuthenticated = authStatus === 'authenticated'
    const isPending = authStatus === 'pending'

    return (
        <header className="sticky top-0 z-30 border-b border-line bg-paper">
            <Container>
                <div className="flex h-16 items-center justify-between gap-4">
                    <Link to="/" className="shrink-0 rounded-sm" aria-label="MegaProject home">
                        <Logo />
                    </Link>

                    <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
                        <NavLinks authStatus={authStatus} />
                        {isAuthenticated && (
                            <div className="ml-3 flex items-center gap-3 border-l border-line pl-4">
                                {user?.name && (
                                    <span className="hidden text-sm text-ink-soft lg:inline" title={user.email || undefined}>
                                        {user.name}
                                    </span>
                                )}
                                <LogoutBtn />
                            </div>
                        )}
                        {isPending && <span aria-hidden="true" className="ml-2 h-8 w-28 animate-pulse rounded-md bg-paper-2" />}
                    </nav>

                    <button
                        type="button"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line-strong text-ink md:hidden"
                        aria-expanded={open}
                        aria-controls="primary-navigation"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
                        <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                            {open ? (
                                <>
                                    <path d="M4 4l12 12" />
                                    <path d="M16 4L4 16" />
                                </>
                            ) : (
                                <>
                                    <path d="M3 5h14" />
                                    <path d="M3 10h14" />
                                    <path d="M3 15h14" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>

                <nav
                    id="primary-navigation"
                    aria-label="Primary"
                    className={`${open ? 'flex' : 'hidden'} flex-col gap-1 border-t border-line py-3 md:hidden`}
                >
                    <NavLinks authStatus={authStatus} onNavigate={() => setOpen(false)} />
                    {isAuthenticated && (
                        <div className="mt-2 flex items-center justify-between gap-3 border-t border-line pt-3">
                            <span className="truncate text-sm text-ink-soft">{user?.name ? `Signed in as ${user.name}` : 'Signed in'}</span>
                            <LogoutBtn />
                        </div>
                    )}
                    {isPending && (
                        <span className="px-3 py-2 text-sm text-ink-faint" role="status">
                            Checking your session…
                        </span>
                    )}
                </nav>
            </Container>
        </header>
    )
}
