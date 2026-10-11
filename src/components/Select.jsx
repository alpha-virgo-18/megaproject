import React, { useId } from 'react'
import { inputClassName } from './input'

/**
 * Labelled select. `options` may be plain strings or `{ value, label }` objects.
 */
const Select = React.forwardRef(function Select(
    { options = [], label, hint, error, className = '', wrapperClassName = '', id: idProp, required, ...props },
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
            <select
                ref={ref}
                id={id}
                required={required}
                aria-invalid={error ? 'true' : undefined}
                aria-describedby={describedBy}
                className={`${inputClassName} ${error ? 'border-terracotta' : 'border-line-strong'} ${className}`}
                {...props}
            >
                {options.map((option) => {
                    const value = typeof option === 'string' ? option : option.value
                    const text = typeof option === 'string' ? option : option.label
                    return (
                        <option key={value} value={value}>
                            {text}
                        </option>
                    )
                })}
            </select>
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

export default Select
