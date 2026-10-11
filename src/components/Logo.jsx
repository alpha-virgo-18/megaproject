/**
 * Simple wordmark for the app. Uses the project name with a small olive mark; no remote assets.
 */
export default function Logo({ className = '', compact = false }) {
    return (
        <span className={`inline-flex items-center gap-2 ${className}`}>
            <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-olive font-serif text-base font-semibold leading-none text-white"
            >
                M
            </span>
            {!compact && (
                <span className="font-serif text-xl font-semibold tracking-tight text-ink">
                    Mega<span className="text-olive-dark">Project</span>
                </span>
            )}
        </span>
    )
}
