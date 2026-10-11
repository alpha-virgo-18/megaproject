// Shared helpers for working with post documents returned by Appwrite.

export const POST_STATUSES = ['active', 'inactive']

export const STATUS_OPTIONS = [
    { value: 'active', label: 'Published (visible to everyone)' },
    { value: 'inactive', label: 'Draft (only you can see it)' },
]

/** Ownership is derived from the document's own permission strings, which Appwrite enforces. */
export function isPostOwner(post, userId) {
    if (!post || !userId || !Array.isArray(post.$permissions)) return false
    return (
        post.$permissions.includes(`update("user:${userId}")`) ||
        post.$permissions.includes(`write("user:${userId}")`)
    )
}

export function statusLabel(status) {
    return status === 'active' ? 'Published' : 'Draft'
}

export function formatPostDate(isoDate) {
    if (!isoDate) return ''
    const date = new Date(isoDate)
    if (Number.isNaN(date.getTime())) return ''
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

/** Rough plain-text excerpt from stored HTML for list cards. */
export function excerptFromHtml(html, maxLength = 150) {
    if (typeof html !== 'string' || !html) return ''
    const text = html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
    if (text.length <= maxLength) return text
    return `${text.slice(0, maxLength).replace(/\s+\S*$/, '')}…`
}
