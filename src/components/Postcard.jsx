import { Link } from 'react-router-dom'
import PostImage from './PostImage'
import StatusBadge from './StatusBadge'
import { excerptFromHtml, formatPostDate } from '../utils/posts'

/**
 * Card for post lists. Routes use the Appwrite document id (`$id`) as the slug.
 */
export default function PostCard({ post, showStatus = false }) {
    const { $id, title, featuredimage, content, status, $createdAt } = post
    const date = formatPostDate($createdAt)
    const excerpt = excerptFromHtml(content)

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors duration-150 hover:border-line-strong">
            <Link to={`/post/${$id}`} className="block" tabIndex={-1} aria-hidden="true">
                <PostImage fileId={featuredimage} alt="" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
            </Link>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                <div className="flex items-center gap-3 text-xs text-ink-faint">
                    {date && <time dateTime={$createdAt}>{date}</time>}
                    {showStatus && <StatusBadge status={status} />}
                </div>
                <h2 className="mt-2 text-xl leading-snug">
                    <Link
                        to={`/post/${$id}`}
                        className="decoration-olive/50 underline-offset-4 group-hover:underline focus-visible:underline"
                    >
                        {title}
                    </Link>
                </h2>
                {excerpt && <p className="mt-2 line-clamp-3 text-sm text-ink-soft">{excerpt}</p>}
            </div>
        </article>
    )
}
