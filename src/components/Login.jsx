import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { login as authLogin } from '../Store/Authslice'
import authService from '../appwrite/auth'
import { getErrorMessage } from '../appwrite/errors'
import Button from './Button'
import Input from './input'
import Logo from './Logo'
import Alert from './Alert'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [serverError, setServerError] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { email: '', password: '' } })

    const redirectTo = location.state?.from?.pathname || '/'

    const onSubmit = async (data) => {
        setServerError('')
        try {
            const user = await authService.login({ email: data.email.trim(), password: data.password })
            dispatch(authLogin(user))
            navigate(redirectTo, { replace: true })
        } catch (error) {
            setServerError(
                getErrorMessage(error, 'Unable to sign in right now.', {
                    401: 'Incorrect email or password.',
                })
            )
        }
    }

    return (
        <div className="mx-auto w-full max-w-md">
            <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
                <div className="flex justify-center">
                    <Logo />
                </div>
                <h1 className="mt-5 text-center text-2xl">Welcome back</h1>
                <p className="mt-1 text-center text-sm text-ink-soft">
                    New here?{' '}
                    <Link to="/signup" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                        Create an account
                    </Link>
                </p>

                {serverError && (
                    <Alert tone="error" className="mt-6" onDismiss={() => setServerError('')}>
                        {serverError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        placeholder="you@example.com"
                        required
                        error={errors.email?.message}
                        {...register('email', {
                            required: 'Enter your email address.',
                            pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
                        })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        required
                        error={errors.password?.message}
                        {...register('password', { required: 'Enter your password.' })}
                    />
                    <Button type="submit" className="w-full" loading={isSubmitting} loadingText="Signing in…">
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    )
}
