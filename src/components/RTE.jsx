import { useId } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { Controller } from 'react-hook-form'
import config from '../config/config'
import Alert from './Alert'

const EDITOR_PLUGINS = [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor', 'searchreplace',
    'visualblocks', 'code', 'fullscreen', 'insertdatetime', 'media', 'table', 'help', 'wordcount',
]

const EDITOR_TOOLBAR =
    'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist outdent indent | link image | blockquote removeformat | code | help'

const EDITOR_CONTENT_STYLE =
    'body { font-family: Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif; font-size: 17px; line-height: 1.7; color: #2b2a27; max-width: 48rem; margin: 0 auto; padding: 1rem; } img { max-width: 100%; height: auto; }'

/**
 * Rich text field bound to React Hook Form through a Controller. The TinyMCE editor is used as a
 * controlled component (`value` + `onEditorChange`) so edits always flow back into the form state
 * and existing content is shown in edit mode. When the TinyMCE Cloud API key is not configured the
 * field degrades to a plain textarea so the form keeps working.
 */
export default function RTE({ name = 'content', control, label = 'Content', rules, disabled = false, required = false }) {
    const id = useId()
    const labelId = `${id}-label`
    const errorId = `${id}-error`
    const apiKey = config.tinymceApiKey

    return (
        <Controller
            name={name}
            control={control}
            rules={rules}
            render={({ field, fieldState }) => {
                const error = fieldState.error?.message
                return (
                    <div className="w-full" role="group" aria-labelledby={labelId} aria-describedby={error ? errorId : undefined}>
                        <span id={labelId} className="mb-1 block text-sm font-medium text-ink">
                            {label}
                            {required && (
                                <span className="ml-0.5 text-terracotta" aria-hidden="true">
                                    *
                                </span>
                            )}
                        </span>

                        {apiKey ? (
                            <div className={`rte-editor ${error ? 'rte-editor--invalid' : ''}`}>
                                <Editor
                                    id={`${id}-editor`}
                                    apiKey={apiKey}
                                    value={field.value || ''}
                                    onEditorChange={(content) => field.onChange(content)}
                                    onBlur={field.onBlur}
                                    disabled={disabled}
                                    init={{
                                        height: 480,
                                        menubar: false,
                                        branding: false,
                                        promotion: false,
                                        plugins: EDITOR_PLUGINS,
                                        toolbar: EDITOR_TOOLBAR,
                                        toolbar_mode: 'sliding',
                                        block_formats: 'Paragraph=p; Heading 2=h2; Heading 3=h3; Heading 4=h4; Quote=blockquote; Code=pre',
                                        content_style: EDITOR_CONTENT_STYLE,
                                        convert_urls: false,
                                    }}
                                />
                            </div>
                        ) : (
                            <>
                                <Alert tone="warning" className="mb-2">
                                    The rich text editor is unavailable because the <code>VITE_TINYMCE_API_KEY</code> environment
                                    variable is not set. Add it to your <code>.env</code> file and restart the dev server. You can
                                    still write HTML below.
                                </Alert>
                                <textarea
                                    id={`${id}-editor`}
                                    aria-labelledby={labelId}
                                    aria-invalid={error ? 'true' : undefined}
                                    aria-describedby={error ? errorId : undefined}
                                    rows={16}
                                    disabled={disabled}
                                    value={field.value || ''}
                                    onChange={(event) => field.onChange(event.target.value)}
                                    onBlur={field.onBlur}
                                    className={`block w-full rounded-md border bg-white px-3 py-2 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-olive/40 ${
                                        error ? 'border-terracotta' : 'border-line-strong'
                                    }`}
                                />
                            </>
                        )}

                        {error && (
                            <p id={errorId} className="mt-1 text-sm text-terracotta" role="alert">
                                {error}
                            </p>
                        )}
                    </div>
                )
            }}
        />
    )
}
