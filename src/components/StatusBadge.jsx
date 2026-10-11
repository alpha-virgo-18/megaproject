import { statusLabel } from '../utils/posts'

/** Small pill that makes a post's active/inactive status obvious. */
export default function StatusBadge({ status, className = '' }) {
    const isActive = status === 'active'
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide ${
                isActive ? 'border-olive/30 bg-olive-light text-olive-dark' : 'border-bark/30 bg-bark-light text-bark'
            } ${className}`}
        >
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-olive' : 'bg-bark'}`} />
            {statusLabel(status)}
        </span>
    )
}
