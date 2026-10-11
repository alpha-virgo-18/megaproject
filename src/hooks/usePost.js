import { useEffect, useState } from 'react'
import appwriteService from '../appwrite/configure'
import { getErrorMessage, isAppwriteError } from '../appwrite/errors'

function isHiddenFromViewer(error) {
    // Appwrite answers 404 for documents the caller may not read (401/403 in some setups).
    return isAppwriteError(error) && [401, 403, 404].includes(error.code)
}

/**
 * Loads a single post by document id.
 * Returns `{ post, phase, error, reload }` where phase is 'loading' | 'ready' | 'notfound' | 'error'.
 * Loading is derived from a request key rather than set inside the effect, so a slug change or a
 * reload flips back to 'loading' synchronously with no intermediate stale render.
 */
export function usePost(slug) {
    const [reloadTick, setReloadTick] = useState(0)
    const key = `${slug ?? ''}|${reloadTick}`
    const [result, setResult] = useState({ key: null, post: null, phase: 'ready', error: '' })

    useEffect(() => {
        if (!slug) return undefined
        let cancelled = false
        appwriteService
            .getPost(slug)
            .then((document) => {
                if (!cancelled) setResult({ key, post: document, phase: 'ready', error: '' })
            })
            .catch((error) => {
                if (cancelled) return
                if (isHiddenFromViewer(error)) {
                    setResult({ key, post: null, phase: 'notfound', error: '' })
                } else {
                    setResult({ key, post: null, phase: 'error', error: getErrorMessage(error, 'Unable to load this post.') })
                }
            })
        return () => {
            cancelled = true
        }
    }, [key, slug])

    const isCurrent = result.key === key
    return {
        post: isCurrent ? result.post : null,
        phase: !slug ? 'notfound' : isCurrent ? result.phase : 'loading',
        error: isCurrent ? result.error : '',
        reload: () => setReloadTick((tick) => tick + 1),
    }
}
