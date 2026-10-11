import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import authService from '../../appwrite/auth'
import { logout } from '../../Store/Authslice'
import { getErrorMessage } from '../../appwrite/errors'
import Button from '../Button'

export default function LogoutBtn({ className = '', variant = 'secondary', size = 'sm' }) {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogout = async () => {
        setError('')
        setLoading(true)
        try {
            await authService.logout()
            navigate('/')
            dispatch(logout())
        } catch (err) {
            setError(getErrorMessage(err, 'Unable to sign out. Please try again.'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <span className={`inline-flex flex-col items-start gap-1 ${className}`}>
            <Button variant={variant} size={size} onClick={handleLogout} loading={loading} loadingText="Signing out…">
                Log out
            </Button>
            {error && (
                <span role="alert" className="text-xs text-terracotta">
                    {error}
                </span>
            )}
        </span>
    )
}
