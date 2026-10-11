const TONES = {
    error: 'border-terracotta/40 bg-terracotta-light text-terracotta-dark',
    success: 'border-olive/40 bg-olive-light text-olive-dark',
    info: 'border-line-strong bg-paper-2 text-ink-soft',
    warning: 'border-bark/40 bg-bark-light text-bark',
}

/**
 * Inline status message. Errors use role="alert" (assertive); other tones use a polite live region
 * so async results are announced without interrupting.
 */
export default function Alert({ tone = 'info', title, children, onDismiss, className = '', ...props }) {
    if (!children && !title) return null
    const live = tone === 'error' ? { role: 'alert' } : { role: 'status', 'aria-live': 'polite' }
    return (
        <div
            {...live}
            className={`flex items-start gap-3 rounded-md border px-4 py-3 text-sm ${TONES[tone] || TONES.info} ${className}`}
            {...props}
        >
            <div className="min-w-0 flex-1">
                {title && <p className="font-semibold">{title}</p>}
                {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
            </div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="-m-1 rounded p-1 text-current opacity-70 hover:opacity-100"
                    aria-label="Dismiss message"
                >
                    <span aria-hidden="true">×</span>
                </button>
            )}
        </div>
    )
}
