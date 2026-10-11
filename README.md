# MegaProject

A small blog built with React and Appwrite. Writers sign up, log in, and write posts with a rich text editor and a featured image. Each post is either **published** (readable by anyone, including guests) or a **draft** (readable only by its author). Access rules are enforced by Appwrite's per-document and per-file permissions, not just by the UI.

## Features

All of the following are implemented in `src/` and verified against the code.

- **Email and password accounts.** Sign up (name, email, password of at least 8 characters), log in, and log out through Appwrite Account. A signed-in user is sent home or back to the page they were trying to reach.
- **Session restore with a real pending state.** On load the app asks Appwrite for the current user. Guarded routes show a loading state until that answer arrives, so guests are never briefly treated as signed in (or the reverse).
- **Public feed.** The home page lists published posts newest first, 12 per page, with a "Load more" button that uses Appwrite cursor pagination.
- **All posts (signed in).** A management view showing every post the user may read: everyone's published posts plus the user's own drafts. Status is filtered server side; an "Only my posts" checkbox filters the loaded pages client side using each document's permissions.
- **Create a post.** Title (max 255 characters), slug, content, featured image, and status. The slug is generated from the title until edited by hand and becomes the Appwrite document id, so it must be 1 to 36 characters of letters, digits, `.`, `-` or `_`, starting with a letter or digit.
- **Rich text editing.** TinyMCE (cloud) when a key is configured. Without a key the content field degrades to a plain HTML textarea with a visible warning, so the form still works.
- **Featured image upload.** One PNG, JPEG, GIF or WebP file of at most 5 MB, required on create and optional on edit. On replace, the new file is uploaded first, the document is updated, and only then is the old file deleted. If the document write fails the new upload is removed again.
- **Edit and delete.** Only the author sees Edit and Delete controls, and Appwrite enforces update and delete permissions server side regardless. Delete asks for confirmation; the image is removed afterwards on a best-effort basis. The slug cannot be changed after creation.
- **Drafts stay private.** A post switched to draft gets owner-only read permission, and its image's permissions are re-aligned to match. A draft image that a plain `<img>` cannot load is re-fetched through the authenticated Appwrite client and shown from an object URL.
- **Safe HTML rendering.** Stored post HTML is sanitised with DOMPurify before `html-react-parser` renders it. `style`, `form`, `input`, `button`, `iframe`, `object` and `embed` tags and the `style` attribute are removed. External links get `rel="noopener noreferrer"` and open in a new tab. Images are lazy loaded.
- **Friendly errors.** Appwrite errors are mapped to short user-facing messages (wrong password, duplicate email, duplicate slug, rate limiting, server problems, network failures). Success and warning notices are passed through router state and cleared from history so they do not replay on refresh.
- **Responsive, accessible shell.** Sticky header with a mobile menu that closes on route change and Escape, skip-to-content link, labelled form fields with inline validation, and a 404 page.

### Routes

| Path | Access | Page |
| --- | --- | --- |
| `/` | Public | Published posts feed |
| `/post/:slug` | Public (drafts: author only) | Single post, with Edit and Delete for the author |
| `/login`, `/signup` | Guests only | Authentication forms |
| `/all-posts` | Signed in | Management list with status and ownership filters |
| `/add-post` | Signed in | Create a post |
| `/edit-post/:slug` | Signed in, author only | Edit a post |
| `*` | Public | Not found |

## Tech stack

| Library | Role in this project |
| --- | --- |
| [Vite](https://vite.dev) 8 | Dev server, production build (`vite build`), `import.meta.env` handling |
| React 19 and React DOM | UI, using function components and hooks only |
| React Router 7 (`react-router-dom`) | Client-side routing via `createBrowserRouter`, route guards, router-state notices |
| Redux Toolkit and React Redux | A single `auth` slice (`pending`, `authenticated`, `guest`) with the current user. Posts are not stored in Redux. |
| React Hook Form | Login, signup and post forms, including a `Controller` for the editor field |
| Appwrite Web SDK 28 | Account (auth), Databases (posts collection) and Storage (featured images) |
| TinyMCE React (`@tinymce/tinymce-react`) | Rich text editor loaded from TinyMCE Cloud with an API key |
| DOMPurify | Sanitises stored HTML before rendering |
| html-react-parser | Turns the sanitised HTML string into React elements |
| Tailwind CSS 4 (`@tailwindcss/vite`) | Styling. The theme is defined in `src/index.css` with `@theme`. No Tailwind config file is needed. |
| ESLint 10 | Linting with `@eslint/js` recommended, `eslint-plugin-react-hooks` and `eslint-plugin-react-refresh` |

There is no TypeScript, no test runner and no backend code in this repository. Everything server side is Appwrite.

## Prerequisites

- **Node.js 20.19 or newer, 22.13 or newer, or 24 and above.** Vite 8 and `@vitejs/plugin-react` require `^20.19.0 || >=22.12.0`; ESLint 10 additionally requires `^20.19.0 || ^22.13.0 || >=24`, so Node 22.12 can build but not lint. Node 22 LTS or Node 24 is recommended. The project was last verified with Node 24.15 and npm 11.12.
- **npm 7 or newer** (the lockfile is `lockfileVersion` 3). npm 10 or newer is recommended.
- **An Appwrite project.** Appwrite Cloud, or a self-hosted server recent enough for Web SDK 28 (the SDK targets Appwrite server 2.3.x as shipped on Cloud). See [Appwrite setup](#appwrite-setup).
- **Optional: a TinyMCE Cloud API key** for the rich text editor.

## Getting started

### 1. Install dependencies

Use `npm ci` to install exactly what `package-lock.json` specifies.

```bash
npm ci
```

### 2. Create your `.env`

Copy the template, then open `.env` and fill in your own values. `.env` is git-ignored and must never be committed.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS or Linux:

```bash
cp .env.example .env
```

### 3. Run the dev server

```bash
npm run dev
```

Vite prints the local URL (by default `http://localhost:5173`). The app refuses to start, with an error naming the missing variable, if any required Appwrite value is absent. Restart the dev server after changing `.env`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally (default `http://localhost:4173`) |
| `npm run lint` | Run ESLint over the project |

## Environment variables

All variables are read in `src/config/config.js` from Vite's `import.meta.env`. Only variables prefixed with `VITE_` are exposed to the browser. The names and placeholder values live in `.env.example`; real values go in `.env` only.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_APPWRITE_URL` | Yes | Appwrite API endpoint, for example `https://<region>.cloud.appwrite.io/v1` or your self-hosted URL ending in `/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Yes | Appwrite project id |
| `VITE_APPWRITE_DATABASE_ID` | Yes | Id of the database that holds the posts collection |
| `VITE_APPWRITE_COLLECTION_ID` | Yes | Id of the posts collection |
| `VITE_APPWRITE_BUCKET_ID` | Yes | Id of the storage bucket for featured images |
| `VITE_TINYMCE_API_KEY` | No | TinyMCE Cloud API key. Without it the editor falls back to a plain HTML textarea. |

Notes:

- Missing required values throw at startup with a message that lists the variable **names** only.
- Values equal to the literal strings `undefined` or `null` are treated as missing.
- Vite inlines these values into the JavaScript bundle at build time. They are visible to anyone who loads the site, which is normal for Appwrite client ids and TinyMCE Cloud keys. Protect them with Appwrite platform origins and TinyMCE approved domains rather than by trying to hide them.

## Appwrite setup

Everything in this section must be configured manually in the Appwrite console (or CLI). The app does not create any of it. The requirements below are derived from `src/appwrite/auth.js` and `src/appwrite/configure.js`.

### Project and platform

1. Create a project and note its id and API endpoint.
2. Under **Auth**, enable the **Email/Password** method. No other auth method is used.
3. Under **Platforms**, add a **Web** platform for every origin the app will run on. Appwrite rejects browser requests from unregistered origins. Typical entries: `localhost` (covers the dev and preview servers) and your production hostname.

### Database and posts collection

1. Create a database and note its id.
2. Create a collection for posts and note its id. Add these attributes exactly as named (the app reads and writes them by these keys):

   | Attribute | Type | Notes |
   | --- | --- | --- |
   | `title` | String | Required. Size at least 255 (the form enforces a 255-character maximum). |
   | `content` | String | Required. Large size, for example 65535 or more. Holds the editor's HTML. |
   | `featuredimage` | String | Required. Holds the storage file id (36 characters is sufficient, more is fine). |
   | `status` | String (or Enum with `active`, `inactive`) | Required. `active` means published, `inactive` means draft. |

3. Add a **key index on `status`**. The feed and the All posts filters query `status` with `Query.equal`, and Appwrite needs an index for that on most versions. Sorting uses the built-in `$createdAt`, which needs no extra index.
4. Enable **Document security** in the collection settings. The app sets permissions on every document it creates or updates:
   - published (`active`): `read("any")`, `update("user:<author>")`, `delete("user:<author>")`
   - draft (`inactive`): `read("user:<author>")`, `update("user:<author>")`, `delete("user:<author>")`
5. Set the **collection-level permissions** to grant **Create** to the **Users** role only. Do **not** grant collection-level Read to **Any** or to **Users**: because collection-level and document-level grants are combined, that would make drafts readable by everyone. Guests can still read published posts through the per-document `read("any")` grant.

The document id is used as the post's URL slug (`/post/<id>`), so it must obey Appwrite's document id rules; the form validates this before submitting.

### Storage bucket

1. Create a bucket for featured images and note its id.
2. Enable **File security** so per-file permissions apply. The app gives each image the same permissions as its post, so draft images are not publicly readable.
3. Set bucket-level permissions to grant **Create** to **Users** only, for the same reason as the collection.
4. Recommended: restrict allowed file extensions to `png`, `jpg`, `jpeg`, `gif`, `webp` and set the maximum file size to at least 5 MB. The app checks type and size client side (5 MB limit); the bucket enforces it server side.

### TinyMCE (optional)

Create a free API key at tiny.cloud and add the domains you serve the app from (for example `localhost` and your production hostname) to the key's approved domains. Put the key in `VITE_TINYMCE_API_KEY`. The editor inserts images by URL; there is no upload handler configured, so featured images are the only files written to Appwrite Storage.

## Source tree

```
.
├── index.html                 Vite entry HTML
├── vite.config.js             Vite with React and Tailwind plugins
├── eslint.config.js           Flat ESLint config (ignores dist/)
├── .env.example               Variable names with placeholder values
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx               Router definition and app bootstrap
    ├── App.jsx                Layout shell; restores the Appwrite session on mount
    ├── index.css              Tailwind import, @theme tokens, base and post-content styles
    ├── appwrite/
    │   ├── auth.js            Account service wrapper (signup, login, current user, logout)
    │   ├── configure.js       Databases + Storage service, permission builders, page size, image limits
    │   └── errors.js          AppwriteException helpers and user-facing error messages
    ├── config/config.js       Reads and validates VITE_* variables
    ├── Store/                 Redux store and auth slice
    ├── hooks/                 usePost, usePaginatedPosts, useRouteNotice
    ├── utils/                 sanitize (DOMPurify), slug rules, post helpers
    ├── components/            Header, Footer, forms, RTE, PostCard, PostImage, states, inputs
    └── pages/                 Home, AllPosts, Post, AddPost, EditPost, Login, Signup, NotFound
```

## Deployment notes

- **Single-page app routing.** Deep links such as `/post/<slug>` must be served `index.html` by the host. Configure a rewrite or fallback to `/index.html` on Netlify, Vercel, Cloudflare Pages, nginx, or whatever you deploy to.
- **Build-time environment.** `VITE_*` values are baked in by `npm run build`. Set them in your hosting provider's build environment, then build there. Rebuild after changing any of them.
- **Register the production origin** as a Web platform in Appwrite and as an approved domain for the TinyMCE key, or requests will be rejected.
- **Cookies across sites.** When the app and Appwrite are on different sites, the session cookie is third party and some browsers block it. The Appwrite SDK falls back to storing the session in `localStorage` and sending it as a header, and the app's image component re-fetches private images through the SDK for the same reason. Serving Appwrite from a custom domain on the same site as the app avoids this entirely.
- **Bundle size.** The production build emits a single JavaScript chunk above 500 kB (minified; about 190 kB gzipped) and Vite prints a warning about it. This is expected with the current dependency set and does not fail the build.

## Known limitations

- No automated tests.
- The "Only my posts" filter applies to pages already loaded; it does not query Appwrite by author.
- Slugs are permanent once a post is created.
- One featured image per post. Images inside the post body are references by URL only.
- No comments, categories, tags, search, or author profile pages.
- Post excerpts on cards are produced by stripping tags with a regular expression, which is adequate for editor output but not a full HTML parser.
- No `LICENSE` file is included. Add one before accepting contributions.
