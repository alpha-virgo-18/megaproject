// Environment-backed configuration for Appwrite and TinyMCE.
// Values come from Vite's `import.meta.env` (see .env.example for the variable names).
// Required values are validated here so a missing variable fails with a clear developer-facing
// error instead of the literal string "undefined" being handed to the Appwrite SDK.

const REQUIRED_ENV = {
    appwriteurl: 'VITE_APPWRITE_URL',
    appwriteprojectid: 'VITE_APPWRITE_PROJECT_ID',
    appwritedatabaseid: 'VITE_APPWRITE_DATABASE_ID',
    appwritecollectionid: 'VITE_APPWRITE_COLLECTION_ID',
    appwritebucketid: 'VITE_APPWRITE_BUCKET_ID',
}

function readEnv(name) {
    const raw = import.meta.env[name]
    if (raw === undefined || raw === null) return ''
    const value = String(raw).trim()
    // Guard against the literal strings a careless template or shell export can produce.
    if (value === 'undefined' || value === 'null') return ''
    return value
}

const config = {}
const missing = []

for (const [key, envName] of Object.entries(REQUIRED_ENV)) {
    const value = readEnv(envName)
    if (!value) missing.push(envName)
    config[key] = value
}

if (missing.length > 0) {
    // Only variable NAMES are included here, never values.
    throw new Error(
        `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. ` +
            'Copy .env.example to .env, fill in your Appwrite project values, and restart the dev server.'
    )
}

// Optional: the rich text editor degrades to a plain textarea when this is absent.
config.tinymceApiKey = readEnv('VITE_TINYMCE_API_KEY')

export default Object.freeze(config)
