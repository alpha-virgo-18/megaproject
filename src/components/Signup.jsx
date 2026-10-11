import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { login } from '../Store/Authslice'
import authService from '../appwrite/auth'
import { getErrorMessage } from '../appwrite/errors'
import Button from './Button'
import Input from './input'
import Logo from './Logo'
import Alert from './Alert'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function Signup() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [serverError, setServerError] = useState('')
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: { name: '', email: '', password: '' } })

    const onSubmit = async (data) => {
        setServerError('')
        try {
            const user = await authService.createAccount({
                name: data.name.trim(),
                email: data.email.trim(),
                password: data.password,
            })
            dispatch(login(user))
            navigate('/', { replace: true })
        } catch (error) {
            setServerError(
                getErrorMessage(error, 'Unable to create your account right now.', {
                    409: 'An account with this email already exists. Try logging in instead.',
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
                <h1 className="mt-5 text-center text-2xl">Create your account</h1>
                <p className="mt-1 text-center text-sm text-ink-soft">
                    Already have one?{' '}
                    <Link to="/login" className="font-medium text-olive-dark underline underline-offset-4 hover:text-bark">
                        Log in
                    </Link>
                </p>

                {serverError && (
                    <Alert tone="error" className="mt-6" onDismiss={() => setServerError('')}>
                        {serverError}
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
                    <Input
                        label="Full name"
                        autoComplete="name"
                        placeholder="Your name"
                        required
                        error={errors.name?.message}
                        {...register('name', {
                            required: 'Enter your name.',
                            maxLength: { value: 128, message: 'Names can be at most 128 characters.' },
                            validate: (value) => value.trim().length > 0 || 'Enter your name.',
                        })}
                    />
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
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        hint="Use at least 8 characters."
                        required
                        error={errors.password?.message}
                        {...register('password', {
                            required: 'Choose a password.',
                            minLength: { value: 8, message: 'Passwords must be at least 8 characters.' },
                            maxLength: { value: 256, message: 'Passwords can be at most 256 characters.' },
                        })}
                    />
                    <Button type="submit" className="w-full" loading={isSubmitting} loadingText="Creating account…">
                        Create account
                    </Button>
                </form>
            </div>
        </div>
    )
}
