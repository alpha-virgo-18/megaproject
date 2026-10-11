import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectUser } from '../Store/Authslice'
import { usePost } from '../hooks/usePost'
import { isPostOwner } from '../utils/posts'
import { Container, Postform, LoadingState, ErrorState, NotFoundState, Alert } from '../components'

export default function EditPost() {
    const { slug } = useParams()
    const user = useSelector(selectUser)
    const { post, phase, error, reload } = usePost(slug)

    if (phase === 'loading') {
        return (
            <Container>
                <LoadingState label="Loading post…" />
            </Container>
        )
    }

    if (phase === 'notfound') {
        return (
            <Container width="narrow">
                <NotFoundState title="Post not found" message="This post does not exist, has been removed, or is not yours to edit." />
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

    // Appwrite enforces update permissions server-side; this just avoids presenting a form that will fail.
    if (!isPostOwner(post, user?.$id)) {
        return (
            <Container width="narrow" className="py-12">
                <Alert tone="warning" title="You can only edit your own posts">
                    <Link to={`/post/${post.$id}`} className="underline underline-offset-4">
                        Back to the post
                    </Link>
                </Alert>
            </Container>
        )
    }

    return (
        <div className="py-10 sm:py-14">
            <Container>
                <header className="mb-8">
                    <p className="font-sans text-xs font-semibold uppercase tracking-wider text-olive-dark">Editing</p>
                    <h1 className="mt-1 text-3xl sm:text-4xl">{post.title}</h1>
                </header>
                <Postform key={post.$id} post={post} />
            </Container>
        </div>
    )
}
