import config from '../config/config.js'
import { Client, Account, ID } from 'appwrite'
import { isUnauthorizedError } from './errors.js'

/**
 * Thin wrapper around the Appwrite Account service.
 * Every method either resolves with a value or throws an AppwriteException; nothing is swallowed.
 */
export class AuthService {
    client = new Client()
    account

    constructor() {
        this.client.setEndpoint(config.appwriteurl).setProject(config.appwriteprojectid)
        this.account = new Account(this.client)
    }

    /** Creates the account, then signs in. Resolves with the signed-in user. */
    async createAccount({ email, password, name }) {
        await this.account.create({ userId: ID.unique(), email, password, name })
        return this.login({ email, password })
    }

    /** Creates an email/password session and resolves with the current user. */
    async login({ email, password }) {
        await this.account.createEmailPasswordSession({ email, password })
        return this.account.get()
    }

    /**
     * Returns the logged-in user, or `null` when there is no session.
     * A 401 from Appwrite is the normal "guest" state, not an error; anything else is rethrown so
     * callers can tell "guest" apart from "could not reach Appwrite".
     */
    async getCurrentUser() {
        try {
            return await this.account.get()
        } catch (error) {
            if (isUnauthorizedError(error)) return null
            throw error
        }
    }

    async logout() {
        await this.account.deleteSession({ sessionId: 'current' })
    }
}

const authService = new AuthService()

export default authService
