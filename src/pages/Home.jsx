import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Container, PostCard, PostGridSkeleton, EmptyState, ErrorState, Button, Alert } from '../components'
import { selectAuthStatus } from '../Store/Authslice'
import { usePaginatedPosts } from '../hooks/usePosts'

/** Public feed: lists active posts for everyone, guest or signed in. */
export default function Home() {
    const authStatus = useSelector(selectAuthStatus)
    const { posts, total, hasMore, isLoading, isError, error, loadingMore, moreError, loadMore, reload } =
        usePaginatedPosts({ status: 'active' })

    const isAuthenticated = authStatus === 'authenticated'

    return (
        <div className="py-10 sm:py-14">
            <Container>
                <header className="mb-10 max-w-2xl">
                    <p className="font-sans text-xs font-semibold uppercase tracking-wider text-olive-dark">The journal</p>
                    <h1 className="mt-2 text-4xl sm:text-5xl">Latest posts</h1>
                    <p className="mt-3 text-lg text-ink-soft">
                        Essays, notes and updates from writers on MegaProject.
                        {!isAuthenticated && authStatus === 'guest' && (
                            <>
                                {' '}
                                <Link to="/signup" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                                    Create an account
                                </Link>{' '}
                                to publish your own.
                            </>
                        )}
                    </p>
                </header>

                {isLoading && <PostGridSkeleton />}

                {isError && <ErrorState title="Posts could not be loaded" message={error} onRetry={reload} />}

                {!isLoading && !isError && posts.length === 0 && (
                    <EmptyState
                        title="Nothing published yet"
                        action={
                            isAuthenticated ? (
                                <Link
                                    to="/add-post"
                                    className="inline-flex items-center justify-center rounded-md border border-olive bg-olive px-4 py-2 text-sm font-medium text-white transition-colors hover:border-olive-dark hover:bg-olive-dark"
                                >
                                    Write the first post
                                </Link>
                            ) : authStatus === 'guest' ? (
                                <Link to="/login" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                                    Log in to write one
                                </Link>
                            ) : null
                        }
                    >
                        When a post is published it will appear here.
                    </EmptyState>
                )}

                {posts.length > 0 && (
                    <>
                        <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-label="Published posts">
                            {posts.map((post) => (
                                <li key={post.$id} className="h-full">
                                    <PostCard post={post} />
                                </li>
                            ))}
                        </ul>

                        <div className="mt-10 flex flex-col items-center gap-3">
                            <p className="text-sm text-ink-faint" role="status">
                                Showing {posts.length} of {total} {total === 1 ? 'post' : 'posts'}
                            </p>
                            {moreError && <Alert tone="error">{moreError}</Alert>}
                            {hasMore && (
                                <Button variant="secondary" onClick={loadMore} loading={loadingMore} loadingText="Loading…">
                                    Load more posts
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </Container>
        </div>
    )
}
