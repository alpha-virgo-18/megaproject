import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import store from './Store/Store.js'
import { AuthLayout } from './components/index.js'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import AllPosts from './pages/AllPosts.jsx'
import AddPost from './pages/AddPost.jsx'
import EditPost from './pages/EditPost.jsx'
import Post from './pages/Post.jsx'
import NotFound from './pages/NotFound.jsx'

// Routes keep the Appwrite document id as the post slug (`/post/:slug`, `/edit-post/:slug`).
const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <Home /> },
            {
                path: 'login',
                element: (
                    <AuthLayout authentication={false}>
                        <Login />
                    </AuthLayout>
                ),
            },
            {
                path: 'signup',
                element: (
                    <AuthLayout authentication={false}>
                        <Signup />
                    </AuthLayout>
                ),
            },
            {
                path: 'all-posts',
                element: (
                    <AuthLayout>
                        <AllPosts />
                    </AuthLayout>
                ),
            },
            {
                path: 'add-post',
                element: (
                    <AuthLayout>
                        <AddPost />
                    </AuthLayout>
                ),
            },
            {
                path: 'edit-post/:slug',
                element: (
                    <AuthLayout>
                        <EditPost />
                    </AuthLayout>
                ),
            },
            { path: 'post/:slug', element: <Post /> },
            { path: '*', element: <NotFound /> },
        ],
    },
])

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>
)
