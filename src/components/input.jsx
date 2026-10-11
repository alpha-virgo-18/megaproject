import React, { useId } from 'react'

export const inputClassName =
    'block w-full rounded-md border bg-white px-3 py-2 text-ink placeholder:text-ink-faint transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-olive/40 disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-soft'

/**
 * Labelled text input with optional hint and error. Error text is linked via aria-describedby and
 * the control is flagged with aria-invalid so screen readers announce problems.
 */
const Input = React.forwardRef(function Input(
    { label, type = 'text', hint, error, className = '', wrapperClassName = '', id: idProp, required, ...props },
    ref
) {
    const generatedId = useId()
    const id = idProp || generatedId
    const hintId = hint ? `${id}-hint` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    return (
        <div className={`w-full ${wrapperClassName}`}>
            {label && (
                <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
                    {label}
                    {required && (
                        <span className="ml-0.5 text-terracotta" aria-hidden="true">
                            *
                        </span>
                    )}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                type={type}
                required={required}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                className={`${inputClassName} ${error ? 'border-terracotta' : 'border-line-strong'} ${className}`}
                {...props}
            />
            {hint && (
                <p id={hintId} className="mt-1 text-sm text-ink-faint">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="mt-1 text-sm text-terracotta" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
})

export default Input
