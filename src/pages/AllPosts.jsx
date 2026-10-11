import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Container, PostCard, PostGridSkeleton, EmptyState, ErrorState, Button, Alert } from '../components'
import { selectUser } from '../Store/Authslice'
import { usePaginatedPosts } from '../hooks/usePosts'
import { useRouteNotice } from '../hooks/useRouteNotice'
import { isPostOwner } from '../utils/posts'

const STATUS_FILTERS = [
    { value: '', label: 'All statuses' },
    { value: 'active', label: 'Published' },
    { value: 'inactive', label: 'Drafts' },
]

/**
 * Authenticated management view. Appwrite returns every document the signed-in user may read:
 * all published posts plus their own drafts. Status is filtered server-side; ownership is a
 * client-side filter derived from each document's permissions.
 */
export default function AllPosts() {
    const user = useSelector(selectUser)
    const [statusFilter, setStatusFilter] = useState('')
    const [mineOnly, setMineOnly] = useState(false)
    const filterId = useId()
    const { notice, warning, clearNotice, clearWarning } = useRouteNotice()

    const { posts, total, hasMore, isLoading, isError, error, loadingMore, moreError, loadMore, reload } =
        usePaginatedPosts({ status: statusFilter || null })

    const visiblePosts = useMemo(
        () => (mineOnly ? posts.filter((post) => isPostOwner(post, user?.$id)) : posts),
        [posts, mineOnly, user]
    )

    const emptyTitle = mineOnly
        ? statusFilter === 'inactive'
            ? 'You have no drafts'
            : statusFilter === 'active'
              ? 'You have no published posts'
              : 'You have not written anything yet'
        : statusFilter === 'inactive'
          ? 'No drafts'
          : statusFilter === 'active'
            ? 'No published posts'
            : 'No posts yet'

    return (
        <div className="py-10 sm:py-14">
            <Container>
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-3xl sm:text-4xl">All posts</h1>
                        <p className="mt-2 text-ink-soft">Published posts from everyone, plus your own drafts.</p>
                    </div>
                    <Link
                        to="/add-post"
                        className="inline-flex items-center justify-center rounded-md border border-olive bg-olive px-4 py-2 text-sm font-medium text-white transition-colors hover:border-olive-dark hover:bg-olive-dark"
                    >
                        Write a post
                    </Link>
                </header>

                {notice && (
                    <Alert tone="success" className="mb-4" onDismiss={clearNotice}>
                        {notice}
                    </Alert>
                )}
                {warning && (
                    <Alert tone="warning" className="mb-4" onDismiss={clearWarning}>
                        {warning}
                    </Alert>
                )}

                <div className="mb-8 flex flex-col gap-4 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                        <div className="flex items-center gap-2">
                            <label htmlFor={`${filterId}-status`} className="text-sm font-medium text-ink">
                                Status
                            </label>
                            <select
                                id={`${filterId}-status`}
                                value={statusFilter}
                                onChange={(event) => setStatusFilter(event.target.value)}
                                className="rounded-md border border-line-strong bg-white px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-olive/40"
                            >
                                {STATUS_FILTERS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <label className="inline-flex items-center gap-2 text-sm text-ink">
                            <input
                                type="checkbox"
                                checked={mineOnly}
                                onChange={(event) => setMineOnly(event.target.checked)}
                                className="h-4 w-4 rounded border-line-strong accent-olive"
                            />
                            Only my posts
                        </label>
                    </div>
                    {!isLoading && !isError && (
                        <p className="text-sm text-ink-faint" role="status">
                            {mineOnly
                                ? `${visiblePosts.length} of ${posts.length} loaded ${posts.length === 1 ? 'post is' : 'posts are'} yours`
                                : `Showing ${posts.length} of ${total} ${total === 1 ? 'post' : 'posts'}`}
                        </p>
                    )}
                </div>

                {isLoading && <PostGridSkeleton />}

                {isError && <ErrorState title="Posts could not be loaded" message={error} onRetry={reload} />}

                {!isLoading && !isError && visiblePosts.length === 0 && (
                    <EmptyState
                        title={emptyTitle}
                        action={
                            <Link to="/add-post" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                                Write a new post
                            </Link>
                        }
                    >
                        {mineOnly && hasMore
                            ? 'None of the loaded posts are yours. Load more to keep looking, or write a new post.'
                            : 'Posts you create will show up here with their status.'}
                    </EmptyState>
                )}

                {visiblePosts.length > 0 && (
                    <ul className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3" aria-label="Posts">
                        {visiblePosts.map((post) => (
                            <li key={post.$id} className="h-full">
                                <PostCard post={post} showStatus />
                            </li>
                        ))}
                    </ul>
                )}

                {!isLoading && !isError && posts.length > 0 && (
                    <div className="mt-10 flex flex-col items-center gap-3">
                        {moreError && <Alert tone="error">{moreError}</Alert>}
                        {hasMore && (
                            <Button variant="secondary" onClick={loadMore} loading={loadingMore} loadingText="Loading…">
                                Load more posts
                            </Button>
                        )}
                    </div>
                )}
            </Container>
        </div>
    )
}
