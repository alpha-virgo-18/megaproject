import { AppwriteException } from 'appwrite'

export function isAppwriteError(error) {
    return error instanceof AppwriteException
}

export function isNotFoundError(error) {
    return isAppwriteError(error) && error.code === 404
}

export function isUnauthorizedError(error) {
    return isAppwriteError(error) && error.code === 401
}

export function isConflictError(error) {
    return isAppwriteError(error) && error.code === 409
}

function isNetworkError(error) {
    return error instanceof TypeError && /fetch|network/i.test(error.message || '')
}

/**
 * Convert any thrown value into a short message that is safe to show to end users.
 * Appwrite's own messages are already user-oriented; stack traces and internal details are never
 * surfaced. Callers can pass `overrides` keyed by HTTP status to give context-specific wording.
 */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.', overrides = {}) {
    if (!error) return fallback
    if (isNetworkError(error)) {
        return 'Could not reach the server. Check your connection and try again.'
    }
    if (isAppwriteError(error)) {
        if (overrides[error.code]) return overrides[error.code]
        switch (error.code) {
            case 401:
                return 'You need to be signed in to do that.'
            case 403:
                return 'You do not have permission to do that.'
            case 404:
                return 'That item could not be found.'
            case 409:
                return 'That already exists.'
            case 429:
                return 'Too many attempts. Please wait a moment and try again.'
            default:
                if (error.code >= 500) return 'The server had a problem. Please try again shortly.'
                return error.message || fallback
        }
    }
    if (error instanceof Error && error.message) return error.message
    return fallback
}
