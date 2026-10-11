import DOMPurify from 'dompurify'

// TinyMCE output is author-controlled HTML stored in Appwrite. html-react-parser renders HTML but
// does not sanitise it, so everything is passed through DOMPurify before it reaches the DOM.
const purifier = typeof window !== 'undefined' ? DOMPurify(window) : null

if (purifier) {
    purifier.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A' && node.hasAttribute('href')) {
            node.setAttribute('rel', 'noopener noreferrer')
            if (/^https?:/i.test(node.getAttribute('href') || '')) {
                node.setAttribute('target', '_blank')
            }
        }
        if (node.tagName === 'IMG') {
            node.setAttribute('loading', 'lazy')
        }
    })
}

export function sanitizeHtml(html) {
    if (typeof html !== 'string' || !html || !purifier) return ''
    return purifier.sanitize(html, {
        USE_PROFILES: { html: true },
        FORBID_TAGS: ['style', 'form', 'input', 'button', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['style'],
    })
}

/** Plain-text content of an HTML string, used to decide whether editor content is really empty. */
export function htmlToText(html) {
    if (typeof html !== 'string' || !html) return ''
    if (typeof document === 'undefined') return html.replace(/<[^>]*>/g, '')
    const container = document.createElement('div')
    container.innerHTML = sanitizeHtml(html)
    const nbsp = new RegExp(String.fromCharCode(160), 'g')
    return (container.textContent || '').replace(nbsp, ' ').trim()
}
