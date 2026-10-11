import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import parse from 'html-react-parser'
import appwriteService from '../appwrite/configure'
import { getErrorMessage } from '../appwrite/errors'
import { selectUser } from '../Store/Authslice'
import { usePost } from '../hooks/usePost'
import { useRouteNotice } from '../hooks/useRouteNotice'
import { sanitizeHtml } from '../utils/sanitize'
import { formatPostDate, isPostOwner } from '../utils/posts'
import { Container, Button, Alert, LoadingState, ErrorState, NotFoundState, PostImage, StatusBadge } from '../components'

export default function Post() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const { notice, warning, clearNotice, clearWarning } = useRouteNotice()
    const { post, phase, error, reload } = usePost(slug)

    const [confirmingDelete, setConfirmingDelete] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState('')
    const cancelButtonRef = useRef(null)

    useEffect(() => {
        if (confirmingDelete) cancelButtonRef.current?.focus()
    }, [confirmingDelete])

    const isOwner = isPostOwner(post, user?.$id)

    const handleDelete = async () => {
        setDeleteError('')
        setDeleting(true)
        try {
            await appwriteService.deletePost(post.$id)
        } catch (err) {
            setDeleteError(getErrorMessage(err, 'Unable to delete this post.'))
            setDeleting(false)
            return
        }
        // The document is gone; image cleanup is best effort and must not read as a failed delete.
        let cleanupWarning
        try {
            await appwriteService.deleteFile(post.featuredimage)
        } catch {
            cleanupWarning = 'The post was deleted, but its image could not be removed from storage.'
        }
        navigate('/all-posts', { replace: true, state: { notice: 'Post deleted.', warning: cleanupWarning } })
    }

    if (phase === 'loading') {
        return (
            <Container width="narrow">
                <LoadingState label="Loading post…" />
            </Container>
        )
    }

    if (phase === 'notfound') {
        return (
            <Container width="narrow">
                <NotFoundState title="Post not found" message="This post does not exist, has been removed, or is a draft you cannot view." />
            </Container>
        )
    }

    if (phase === 'error') {
        return (
            <Container width="narrow" className="py-12">
                <ErrorState title="The post could not be loaded" message={error} onRetry={reload} />
            </Container>
        )
    }

    const publishedDate = formatPostDate(post.$createdAt)
    const updatedDate = post.$updatedAt && post.$updatedAt !== post.$createdAt ? formatPostDate(post.$updatedAt) : ''

    return (
        <article className="py-10 sm:py-14">
            <Container width="narrow">
                {(notice || warning) && (
                    <div className="mb-6 space-y-3">
                        {notice && (
                            <Alert tone="success" onDismiss={clearNotice}>
                                {notice}
                            </Alert>
                        )}
                        {warning && (
                            <Alert tone="warning" onDismiss={clearWarning}>
                                {warning}
                            </Alert>
                        )}
                    </div>
                )}

                {isOwner && post.status !== 'active' && (
                    <Alert tone="info" className="mb-6">
                        This is a draft. Only you can see it until you change its status to published.
                    </Alert>
                )}

                <header>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-ink-faint">
                        {publishedDate && <time dateTime={post.$createdAt}>{publishedDate}</time>}
                        {updatedDate && <span>Updated {updatedDate}</span>}
                        {isOwner && <StatusBadge status={post.status} />}
                    </div>
                    <h1 className="mt-3 text-3xl leading-tight sm:text-5xl">{post.title}</h1>
                </header>

                {isOwner && (
                    <div className="mt-6 rounded-lg border border-line bg-white p-4">
                        {!confirmingDelete ? (
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="mr-auto text-sm text-ink-soft">You wrote this post.</span>
                                <Link
                                    to={`/edit-post/${post.$id}`}
                                    className="inline-flex items-center rounded-md border border-line-strong px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-paper-2"
                                >
                                    Edit
                                </Link>
                                <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                                    Delete
                                </Button>
                            </div>
                        ) : (
                            <div role="group" aria-labelledby="delete-confirm-title" className="space-y-3">
                                <p id="delete-confirm-title" className="font-medium text-ink">
                                    Delete “{post.title}”? This cannot be undone.
                                </p>
                                {deleteError && <Alert tone="error">{deleteError}</Alert>}
                                <div className="flex flex-wrap gap-3">
                                    <Button ref={cancelButtonRef} variant="secondary" onClick={() => setConfirmingDelete(false)} disabled={deleting}>
                                        Cancel
                                    </Button>
                                    <Button variant="danger" onClick={handleDelete} loading={deleting} loadingText="Deleting…">
                                        Yes, delete it
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <PostImage
                    fileId={post.featuredimage}
                    alt={`Featured image for ${post.title}`}
                    aspect="aspect-[16/9]"
                    className="mt-8 rounded-lg"
                    priority
                />

                <div className="post-content mt-10">{parse(sanitizeHtml(post.content))}</div>

                <footer className="mt-14 border-t border-line pt-6">
                    <Link to="/" className="text-sm font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                        ← Back to all posts
                    </Link>
                </footer>
            </Container>
        </article>
    )
}
