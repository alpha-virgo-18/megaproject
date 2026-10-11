import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Container from '../container/Container'
import Logo from '../Logo'
import { selectAuthStatus } from '../../Store/Authslice'

const footerLink = 'text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline'

export default function Footer() {
    const authStatus = useSelector(selectAuthStatus)
    const year = new Date().getFullYear()

    return (
        <footer className="mt-auto border-t border-line bg-paper-2/60">
            <Container>
                <div className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-sm">
                        <Logo />
                        <p className="mt-3 text-sm text-ink-soft">
                            A small, independent blog. Write, publish, and keep drafts to yourself until they are ready.
                        </p>
                    </div>

                    <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-6">
                        <div>
                            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-faint">Read</h2>
                            <ul className="space-y-2">
                                <li>
                                    <Link to="/" className={footerLink}>
                                        Latest posts
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-ink-faint">
                                {authStatus === 'authenticated' ? 'Write' : 'Account'}
                            </h2>
                            <ul className="space-y-2">
                                {authStatus === 'authenticated' && (
                                    <>
                                        <li>
                                            <Link to="/all-posts" className={footerLink}>
                                                All posts
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/add-post" className={footerLink}>
                                                Write a post
                                            </Link>
                                        </li>
                                    </>
                                )}
                                {authStatus !== 'authenticated' && (
                                    <>
                                        <li>
                                            <Link to="/login" className={footerLink}>
                                                Log in
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="/signup" className={footerLink}>
                                                Create an account
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="border-t border-line py-4 text-xs text-ink-faint">
                    © {year} MegaProject. Built with React and Appwrite.
                </div>
            </Container>
        </footer>
    )
}
