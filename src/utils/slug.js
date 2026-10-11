// Slug helpers. A post's slug is used directly as the Appwrite document ID, so it must satisfy the
// SDK's documentId constraints (see createDocument in appwrite/types/services/databases.d.ts):
// valid chars are a-z, A-Z, 0-9, period, hyphen and underscore; it cannot start with a special
// character; max length is 36 characters.

export const SLUG_MAX_LENGTH = 36
const VALID_SLUG = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/

/**
 * Normalise free text (usually the title) into a slug candidate.
 * Lower-cases, converts runs of unsupported characters to single hyphens, strips leading
 * special characters, and trims to the maximum document-ID length.
 */
export function slugify(value) {
    if (typeof value !== 'string') return ''
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-{2,}/g, '-')
        .replace(/^[^a-z0-9]+/, '')
        .slice(0, SLUG_MAX_LENGTH)
        .replace(/[-._]+$/, '')
}

/**
 * Returns an error message for an invalid slug, or `null` when the slug is acceptable.
 */
export function validateSlug(value) {
    const slug = typeof value === 'string' ? value.trim() : ''
    if (!slug) return 'A slug is required.'
    if (slug.length > SLUG_MAX_LENGTH) return `Slugs can be at most ${SLUG_MAX_LENGTH} characters.`
    if (!VALID_SLUG.test(slug)) {
        return 'Use only letters, numbers, hyphens, underscores or periods, and start with a letter or number.'
    }
    return null
}
