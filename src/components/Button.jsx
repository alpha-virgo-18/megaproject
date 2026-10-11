import React from 'react'

const VARIANTS = {
    primary:
        'bg-olive text-white border border-olive hover:bg-olive-dark hover:border-olive-dark',
    secondary:
        'bg-transparent text-ink border border-line-strong hover:bg-paper-2 hover:border-ink-faint',
    danger:
        'bg-terracotta text-white border border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark',
    ghost: 'bg-transparent text-ink-soft border border-transparent hover:text-ink hover:bg-paper-2',
}

const SIZES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm sm:text-base',
    lg: 'px-5 py-2.5 text-base',
}

export function Spinner({ className = '' }) {
    return (
        <span
            aria-hidden="true"
            className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent ${className}`}
        />
    )
}

/**
 * Shared button. `loading` disables the control, keeps its width stable, and announces busy state.
 * Defaults to type="button" so it never submits a form by accident.
 */
const Button = React.forwardRef(function Button(
    {
        children,
        type = 'button',
        variant = 'primary',
        size = 'md',
        loading = false,
        loadingText,
        disabled = false,
        className = '',
        ...props
    },
    ref
) {
    const isDisabled = disabled || loading
    return (
        <button
            ref={ref}
            type={type}
            disabled={isDisabled}
            aria-busy={loading || undefined}
            className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
            {...props}
        >
            {loading && <Spinner />}
            <span>{loading && loadingText ? loadingText : children}</span>
        </button>
    )
})

export default Button
