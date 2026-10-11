import { useCallback, useEffect, useMemo, useState } from 'react'
import appwriteService from '../appwrite/configure'
import { getErrorMessage } from '../appwrite/errors'

/**
 * Paginated post list with explicit loading / error / empty semantics.
 * The "loading" state is derived by comparing the current request key with the key of the last
 * result, so changing the filter (or reloading) flips to loading synchronously; all state updates
 * happen in async callbacks.
 *
 * @param {object} options
 * @param {'active'|'inactive'|null} [options.status] server-side status filter (null = all readable)
 */
export function usePaginatedPosts({ status = null } = {}) {
    const [reloadTick, setReloadTick] = useState(0)
    const key = `${status ?? ''}|${reloadTick}`
    const [result, setResult] = useState({ key: null, posts: [], total: 0, error: '' })
    const [loadingMore, setLoadingMore] = useState(false)
    const [moreError, setMoreError] = useState('')

    useEffect(() => {
        let cancelled = false
        appwriteService
            .listPosts({ status })
            .then((response) => {
                if (!cancelled) setResult({ key, posts: response.documents, total: response.total, error: '' })
            })
            .catch((error) => {
                if (!cancelled) setResult({ key, posts: [], total: 0, error: getErrorMessage(error, 'Unable to load posts.') })
            })
        return () => {
            cancelled = true
        }
    }, [key, status])

    const isCurrent = result.key === key
    const posts = useMemo(() => (isCurrent ? result.posts : []), [isCurrent, result.posts])
    const total = isCurrent ? result.total : 0

    const reload = useCallback(() => setReloadTick((tick) => tick + 1), [])

    const loadMore = useCallback(async () => {
        if (loadingMore || !isCurrent || posts.length === 0) return
        setLoadingMore(true)
        setMoreError('')
        try {
            const response = await appwriteService.listPosts({ status, cursorAfter: posts[posts.length - 1].$id })
            setResult((current) => {
                if (current.key !== key) return current
                const seen = new Set(current.posts.map((post) => post.$id))
                return {
                    ...current,
                    posts: [...current.posts, ...response.documents.filter((post) => !seen.has(post.$id))],
                    total: response.total,
                }
            })
        } catch (error) {
            setMoreError(getErrorMessage(error, 'Unable to load more posts.'))
        } finally {
            setLoadingMore(false)
        }
    }, [loadingMore, isCurrent, posts, status, key])

    return {
        posts,
        total,
        hasMore: posts.length < total,
        isLoading: !isCurrent,
        isError: isCurrent && Boolean(result.error),
        isReady: isCurrent && !result.error,
        error: isCurrent ? result.error : '',
        loadingMore,
        moreError,
        loadMore,
        reload,
    }
}
