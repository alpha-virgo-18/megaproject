import { Link } from 'react-router-dom'
import Button from './Button'

/** Full-width loading indicator announced politely to assistive technology. */
export function LoadingState({ label = 'Loading…', className = '' }) {
    return (
        <div role="status" aria-live="polite" className={`flex items-center justify-center gap-3 py-16 text-ink-soft ${className}`}>
            <span
                aria-hidden="true"
                className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-olive border-r-transparent"
            />
            <span>{label}</span>
        </div>
    )
}

/** Skeleton card grid used while a list is loading. */
export function PostGridSkeleton({ count = 6 }) {
    return (
        <div role="status" aria-live="polite" aria-label="Loading posts" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-lg border border-line bg-white" aria-hidden="true">
                    <div className="aspect-[4/3] animate-pulse bg-paper-2" />
                    <div className="space-y-3 p-4">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-paper-3" />
                        <div className="h-5 w-4/5 animate-pulse rounded bg-paper-3" />
                        <div className="h-3 w-full animate-pulse rounded bg-paper-2" />
                    </div>
                </div>
            ))}
            <span className="sr-only">Loading posts</span>
        </div>
    )
}

/** Generic empty state with optional call to action (link or button). */
export function EmptyState({ title, children, action, className = '' }) {
    return (
        <div className={`rounded-lg border border-dashed border-line-strong bg-paper-2/60 px-6 py-14 text-center ${className}`}>
            <h2 className="text-xl">{title}</h2>
            {children && <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div>}
            {action && <div className="mt-6 flex justify-center">{action}</div>}
        </div>
    )
}

/** Error state with optional retry. */
export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
    return (
        <div
            role="alert"
            className={`rounded-lg border border-terracotta/40 bg-terracotta-light px-6 py-10 text-center ${className}`}
        >
            <h2 className="text-xl text-terracotta-dark">{title}</h2>
            {message && <p className="mx-auto mt-2 max-w-md text-ink-soft">{message}</p>}
            {onRetry && (
                <div className="mt-6 flex justify-center">
                    <Button variant="secondary" onClick={onRetry}>
                        Try again
                    </Button>
                </div>
            )}
        </div>
    )
}

/** Not-found state used for missing posts and unknown routes. */
export function NotFoundState({ title = 'Not found', message, className = '' }) {
    return (
        <div className={`px-6 py-16 text-center ${className}`}>
            <p className="font-serif text-6xl text-line-strong" aria-hidden="true">
                404
            </p>
            <h1 className="mt-2 text-2xl">{title}</h1>
            {message && <p className="mx-auto mt-2 max-w-md text-ink-soft">{message}</p>}
            <div className="mt-6">
                <Link to="/" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                    Back to the home page
                </Link>
            </div>
        </div>
    )
}
