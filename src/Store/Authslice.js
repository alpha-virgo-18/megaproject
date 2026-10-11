import { createSlice } from '@reduxjs/toolkit'

/**
 * Auth state.
 * `status` is a real three-way value so the UI can tell "we have not checked Appwrite yet" apart
 * from "checked and this is a guest". Routes and the header wait for `pending` to resolve before
 * redirecting or rendering auth-specific controls.
 */
const initialState = {
    status: 'pending', // 'pending' | 'authenticated' | 'guest'
    userData: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = 'authenticated'
            state.userData = action.payload
        },
        logout: (state) => {
            state.status = 'guest'
            state.userData = null
        },
    },
})

export const { login, logout } = authSlice.actions

export const selectAuthStatus = (state) => state.auth.status
export const selectIsAuthPending = (state) => state.auth.status === 'pending'
export const selectIsAuthenticated = (state) => state.auth.status === 'authenticated'
export const selectUser = (state) => state.auth.userData

export default authSlice.reducer
