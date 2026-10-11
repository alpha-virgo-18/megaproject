import { useEffect, useState } from 'react'
import appwriteService from '../appwrite/configure'

/**
 * Featured image with a stable aspect ratio.
 *
 * Public images load straight from the storage view URL. If that fails (typically a draft image
 * whose file permissions are owner-only, in a browser that blocks the cross-site session cookie),
 * the component re-fetches the file through the Appwrite client, which carries the session and
 * the SDK's localStorage cookie fallback, and shows it from an object URL.
 */
export default function PostImage({
    fileId,
    alt,
    className = '',
    imgClassName = '',
    aspect = 'aspect-[4/3]',
    sizes,
    loading = 'lazy',
    priority = false,
}) {
    const directUrl = fileId ? appwriteService.getFileView(fileId) : ''
    const [trackedFileId, setTrackedFileId] = useState(fileId)
    const [src, setSrc] = useState(directUrl)
    const [failed, setFailed] = useState(!fileId)
    const [triedAuth, setTriedAuth] = useState(false)

    // Reset when the file changes (React's "adjust state on prop change" pattern, no effect needed).
    if (trackedFileId !== fileId) {
        setTrackedFileId(fileId)
        setSrc(directUrl)
        setFailed(!fileId)
        setTriedAuth(false)
    }

    useEffect(() => {
        if (!triedAuth || !fileId) return undefined
        let objectUrl = ''
        let cancelled = false
        appwriteService
            .fetchFileObjectUrl(fileId)
            .then((url) => {
                if (cancelled) {
                    URL.revokeObjectURL(url)
                    return
                }
                objectUrl = url
                setSrc(url)
            })
            .catch(() => {
                if (!cancelled) setFailed(true)
            })
        return () => {
            cancelled = true
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [triedAuth, fileId])

    const handleError = () => {
        if (!triedAuth) setTriedAuth(true)
        else setFailed(true)
    }

    return (
        <div className={`relative overflow-hidden bg-paper-2 ${aspect} ${className}`}>
            {failed ? (
                <div
                    role="img"
                    aria-label={alt ? `${alt} (image unavailable)` : 'Image unavailable'}
                    className="flex h-full w-full items-center justify-center text-sm text-ink-faint"
                >
                    Image unavailable
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt || ''}
                    loading={priority ? 'eager' : loading}
                    decoding="async"
                    sizes={sizes}
                    onError={handleError}
                    className={`h-full w-full object-cover ${imgClassName}`}
                />
            )}
        </div>
    )
}
