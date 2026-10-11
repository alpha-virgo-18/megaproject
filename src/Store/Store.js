import { configureStore } from '@reduxjs/toolkit'
import authReducer from './Authslice'

// Posts are fetched per page with local state (see pages/), so the store only holds auth.
const store = configureStore({
    reducer: {
        auth: authReducer,
    },
})

export default store
