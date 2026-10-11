import config from '../config/config'
import { Client, Databases, Storage, Query, ID, Permission, Role } from 'appwrite'

export const POSTS_PAGE_SIZE = 12

/** Image types the post form accepts; the server-side bucket may restrict this further. */
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

/**
 * Document permissions derived from the post status.
 * - active   → anyone may read; only the owner may update/delete.
 * - inactive → only the owner may read/update/delete (no anonymous access to drafts).
 * Appwrite only honours these when "Document security" is enabled on the collection.
 */
export function buildPostPermissions(userId, status) {
    if (!userId) throw new Error('A user id is required to build post permissions.')
    const permissions = [Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
    permissions.push(status === 'active' ? Permission.read(Role.any()) : Permission.read(Role.user(userId)))
    return permissions
}

/**
 * File permissions mirror the document permissions so a draft's featured image is not publicly
 * readable. Appwrite only honours these when "File security" is enabled on the bucket.
 */
export function buildFilePermissions(userId, status) {
    return buildPostPermissions(userId, status)
}

/**
 * Appwrite Databases + Storage access for posts.
 *
 * Contract: every method resolves with a real value or throws (usually an AppwriteException).
 * Nothing returns `undefined`/`false` to signal failure, so the UI can never mistake a failed
 * request for success. Callers decide how to present errors (see ./errors.js).
 */
export class Service {
    client = new Client()
    databases
    storage

    constructor() {
        this.client.setEndpoint(config.appwriteurl).setProject(config.appwriteprojectid)
        this.databases = new Databases(this.client)
        this.storage = new Storage(this.client)
    }

    // ---------------------------------------------------------------- documents

    async createPost({ title, slug, content, featuredimage, status, userId }) {
        return this.databases.createDocument({
            databaseId: config.appwritedatabaseid,
            collectionId: config.appwritecollectionid,
            documentId: slug,
            data: { title, content, featuredimage, status },
            permissions: buildPostPermissions(userId, status),
        })
    }

    /**
     * Updates a post. When `userId` is supplied the document permissions are re-derived from the
     * new status so a post switched to "inactive" stops being publicly readable (and vice versa).
     */
    async updatePost(documentId, { title, content, featuredimage, status, userId }) {
        return this.databases.updateDocument({
            databaseId: config.appwritedatabaseid,
            collectionId: config.appwritecollectionid,
            documentId,
            data: { title, content, featuredimage, status },
            permissions: userId ? buildPostPermissions(userId, status) : undefined,
        })
    }

    async deletePost(documentId) {
        await this.databases.deleteDocument({
            databaseId: config.appwritedatabaseid,
            collectionId: config.appwritecollectionid,
            documentId,
        })
    }

    async getPost(documentId) {
        return this.databases.getDocument({
            databaseId: config.appwritedatabaseid,
            collectionId: config.appwritecollectionid,
            documentId,
        })
    }

    /**
     * Lists posts newest-first with cursor pagination.
     * @param {object} options
     * @param {'active'|'inactive'|null} [options.status] filter by status; omit for every readable post
     * @param {string|null} [options.cursorAfter] `$id` of the last document already loaded
     * @param {number} [options.limit]
     * @returns {Promise<{documents: object[], total: number}>}
     */
    async listPosts({ status = null, cursorAfter = null, limit = POSTS_PAGE_SIZE } = {}) {
        const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)]
        if (status) queries.push(Query.equal('status', status))
        if (cursorAfter) queries.push(Query.cursorAfter(cursorAfter))

        const result = await this.databases.listDocuments({
            databaseId: config.appwritedatabaseid,
            collectionId: config.appwritecollectionid,
            queries,
        })
        return { documents: result.documents, total: result.total }
    }

    /** Public feed: only active posts, readable by guests. */
    listPublicPosts(options = {}) {
        return this.listPosts({ ...options, status: 'active' })
    }

    // ---------------------------------------------------------------- files

    /** Uploads a featured image with permissions that match the post status. */
    async uploadFile(file, { userId, status }) {
        if (!file) throw new Error('A featured image is required.')
        return this.storage.createFile({
            bucketId: config.appwritebucketid,
            fileId: ID.unique(),
            file,
            permissions: buildFilePermissions(userId, status),
        })
    }

    /** Re-aligns an existing image's permissions after a status change. */
    async updateFilePermissions(fileId, { userId, status }) {
        if (!fileId) return null
        return this.storage.updateFile({
            bucketId: config.appwritebucketid,
            fileId,
            permissions: buildFilePermissions(userId, status),
        })
    }

    async deleteFile(fileId) {
        if (!fileId) return
        await this.storage.deleteFile({ bucketId: config.appwritebucketid, fileId })
    }

    /** Plain URL for an image. Works directly for public files. */
    getFileView(fileId) {
        if (!fileId) return ''
        return this.storage.getFileView({ bucketId: config.appwritebucketid, fileId })
    }

    /**
     * Fetches an image through the SDK client so the request carries the session (including the
     * localStorage cookie fallback the SDK uses when third-party cookies are blocked). Needed for
     * private draft images, which a bare <img src> cannot authenticate. Resolves with an object URL
     * the caller must revoke.
     */
    async fetchFileObjectUrl(fileId) {
        if (!fileId) throw new Error('A file id is required.')
        const url = new URL(this.getFileView(fileId))
        const buffer = await this.client.call('GET', url, {}, {}, 'arrayBuffer')
        return URL.createObjectURL(new Blob([buffer]))
    }
}

const service = new Service()

export default service
