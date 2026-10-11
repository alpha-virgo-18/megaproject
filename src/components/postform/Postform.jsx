import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import appwriteService, { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../../appwrite/configure'
import { getErrorMessage } from '../../appwrite/errors'
import { selectUser } from '../../Store/Authslice'
import { slugify, validateSlug, SLUG_MAX_LENGTH } from '../../utils/slug'
import { htmlToText } from '../../utils/sanitize'
import { STATUS_OPTIONS } from '../../utils/posts'
import Button from '../Button'
import Input from '../input'
import Select from '../Select'
import RTE from '../RTE'
import Alert from '../Alert'
import PostImage from '../PostImage'

const MAX_IMAGE_MB = Math.round(MAX_IMAGE_BYTES / (1024 * 1024))

/**
 * Create / edit form for a post.
 *
 * Write flow (create):   upload image → create document → on failure delete the uploaded image.
 * Write flow (edit):     upload new image (if any) → update document → only then delete the old
 *                        image; if the update fails the new upload is removed instead. When no new
 *                        image is chosen the existing one is kept and its permissions are re-aligned
 *                        with the (possibly changed) status.
 */
export default function Postform({ post }) {
    const isEdit = Boolean(post)
    const navigate = useNavigate()
    const user = useSelector(selectUser)
    const [serverError, setServerError] = useState('')
    const [preview, setPreview] = useState({ file: null, url: '' })
    // Once the author edits the slug by hand we stop regenerating it from the title.
    const slugTouchedRef = useRef(isEdit)

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            title: post?.title || '',
            slug: post?.$id || '',
            content: post?.content || '',
            status: post?.status || 'active',
            image: undefined,
        },
    })

    const imageFiles = useWatch({ control, name: 'image' })

    // Local preview for a newly selected image (read asynchronously; derived below so a cleared or
    // changed selection never shows a stale preview).
    const selectedFile = imageFiles?.[0]
    const previewFile = selectedFile && ALLOWED_IMAGE_TYPES.includes(selectedFile.type) ? selectedFile : null
    useEffect(() => {
        if (!previewFile) return undefined
        let cancelled = false
        const reader = new FileReader()
        reader.onload = () => {
            if (!cancelled) setPreview({ file: previewFile, url: String(reader.result) })
        }
        reader.readAsDataURL(previewFile)
        return () => {
            cancelled = true
            reader.abort()
        }
    }, [previewFile])
    const previewUrl = previewFile && preview.file === previewFile ? preview.url : ''

    const titleField = register('title', {
        required: 'Give the post a title.',
        validate: (value) => value.trim().length > 0 || 'Give the post a title.',
        maxLength: { value: 255, message: 'Titles can be at most 255 characters.' },
    })

    const slugField = register('slug', {
        validate: (value) => (isEdit ? true : validateSlug(value) || true),
    })

    // Keep the slug in step with the title until the author edits the slug by hand.
    const handleTitleChange = (event) => {
        titleField.onChange(event)
        if (isEdit || slugTouchedRef.current) return
        const nextTitle = event.target.value
        setValue('slug', slugify(nextTitle), { shouldValidate: Boolean(nextTitle) })
    }

    async function safeDeleteFile(fileId) {
        try {
            await appwriteService.deleteFile(fileId)
            return true
        } catch {
            return false
        }
    }

    const submit = async (data) => {
        setServerError('')
        if (!user) {
            setServerError('Your session has expired. Please log in again and retry.')
            return
        }

        const payload = {
            title: data.title.trim(),
            content: data.content,
            status: data.status,
            userId: user.$id,
        }
        const file = data.image?.[0]
        let uploaded = null

        try {
            if (file) {
                uploaded = await appwriteService.uploadFile(file, { userId: user.$id, status: data.status })
            }

            if (isEdit) {
                const updated = await appwriteService.updatePost(post.$id, {
                    ...payload,
                    featuredimage: uploaded ? uploaded.$id : post.featuredimage,
                })

                // Post-success housekeeping. Failures here must not read as a failed save.
                const warnings = []
                if (uploaded && post.featuredimage) {
                    if (!(await safeDeleteFile(post.featuredimage))) {
                        warnings.push('The previous image could not be removed from storage.')
                    }
                } else if (!uploaded && post.featuredimage && (data.status !== post.status || data.status === 'inactive')) {
                    try {
                        await appwriteService.updateFilePermissions(post.featuredimage, {
                            userId: user.$id,
                            status: data.status,
                        })
                    } catch {
                        warnings.push(
                            'The featured image’s visibility could not be updated to match the new status. Replace the image to fix this.'
                        )
                    }
                }

                navigate(`/post/${updated.$id}`, {
                    state: { notice: 'Post updated.', warning: warnings.join(' ') || undefined },
                })
                return
            }

            const created = await appwriteService.createPost({
                ...payload,
                slug: data.slug,
                featuredimage: uploaded.$id,
            })
            navigate(`/post/${created.$id}`, { state: { notice: 'Post created.' } })
        } catch (error) {
            // Never leave an orphaned upload behind when the document write failed.
            if (uploaded) await safeDeleteFile(uploaded.$id)
            setServerError(
                getErrorMessage(error, isEdit ? 'Unable to update the post.' : 'Unable to create the post.', {
                    409: 'That slug is already in use. Choose a different slug.',
                    401: 'Your session has expired. Please log in again and retry.',
                })
            )
        }
    }

    return (
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-8" aria-busy={isSubmitting || undefined}>
            {serverError && (
                <Alert tone="error" onDismiss={() => setServerError('')}>
                    {serverError}
                </Alert>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="space-y-6">
                    <Input
                        label="Title"
                        placeholder="A clear, descriptive title"
                        required
                        disabled={isSubmitting}
                        error={errors.title?.message}
                        {...titleField}
                        onChange={handleTitleChange}
                    />

                    <Input
                        label="Slug"
                        placeholder="generated-from-the-title"
                        required={!isEdit}
                        readOnly={isEdit}
                        disabled={isSubmitting}
                        maxLength={SLUG_MAX_LENGTH}
                        hint={
                            isEdit
                                ? 'The slug is the post’s permanent address and cannot be changed.'
                                : `Used in the post’s address. Generated from the title until you edit it; clear it to resume automatic generation. Letters, numbers, hyphens, underscores or periods, up to ${SLUG_MAX_LENGTH} characters.`
                        }
                        error={errors.slug?.message}
                        {...slugField}
                        onChange={(event) => {
                            slugTouchedRef.current = event.target.value.trim() !== ''
                            slugField.onChange(event)
                        }}
                        onBlur={(event) => {
                            if (!isEdit) {
                                setValue('slug', slugify(event.target.value), { shouldValidate: true })
                            }
                            slugField.onBlur(event)
                        }}
                    />

                    <RTE
                        name="content"
                        control={control}
                        label="Content"
                        required
                        disabled={isSubmitting}
                        rules={{
                            validate: (value) => htmlToText(value).length > 0 || 'Write some content before saving.',
                        }}
                    />
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-lg border border-line bg-white p-5">
                        <Input
                            label={isEdit ? 'Replace featured image' : 'Featured image'}
                            type="file"
                            accept={ALLOWED_IMAGE_TYPES.join(',')}
                            required={!isEdit}
                            disabled={isSubmitting}
                            className="file:mr-3 file:rounded-md file:border-0 file:bg-olive-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-olive-dark"
                            hint={`PNG, JPEG, GIF or WebP, up to ${MAX_IMAGE_MB} MB.${isEdit ? ' Leave empty to keep the current image.' : ''}`}
                            error={errors.image?.message}
                            {...register('image', {
                                validate: {
                                    required: (files) => isEdit || (files && files.length > 0) || 'Choose a featured image.',
                                    type: (files) => {
                                        const selected = files?.[0]
                                        return !selected || ALLOWED_IMAGE_TYPES.includes(selected.type) || 'Use a PNG, JPEG, GIF or WebP image.'
                                    },
                                    size: (files) => {
                                        const selected = files?.[0]
                                        return !selected || selected.size <= MAX_IMAGE_BYTES || `Images must be ${MAX_IMAGE_MB} MB or smaller.`
                                    },
                                },
                            })}
                        />

                        <div className="mt-4">
                            {previewUrl ? (
                                <figure>
                                    <div className="aspect-[4/3] overflow-hidden rounded-md bg-paper-2">
                                        <img src={previewUrl} alt="Preview of the selected image" className="h-full w-full object-cover" />
                                    </div>
                                    <figcaption className="mt-1 text-xs text-ink-faint">New image preview</figcaption>
                                </figure>
                            ) : isEdit && post.featuredimage ? (
                                <figure>
                                    <PostImage fileId={post.featuredimage} alt={`Current featured image for ${post.title}`} className="rounded-md" />
                                    <figcaption className="mt-1 text-xs text-ink-faint">Current image</figcaption>
                                </figure>
                            ) : null}
                        </div>
                    </div>

                    <div className="rounded-lg border border-line bg-white p-5">
                        <Select
                            label="Status"
                            required
                            disabled={isSubmitting}
                            options={STATUS_OPTIONS}
                            hint="Drafts are hidden from the public feed and from anyone but you."
                            error={errors.status?.message}
                            {...register('status', { required: 'Choose a status.' })}
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                        <Button
                            type="submit"
                            className="w-full"
                            loading={isSubmitting}
                            loadingText={isEdit ? 'Saving…' : 'Publishing…'}
                        >
                            {isEdit ? 'Save changes' : 'Save post'}
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            disabled={isSubmitting}
                            onClick={() => navigate(isEdit ? `/post/${post.$id}` : '/all-posts')}
                        >
                            Cancel
                        </Button>
                    </div>
                </aside>
            </div>
        </form>
    )
}
