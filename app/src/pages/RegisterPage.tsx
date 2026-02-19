import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterFormValues } from '../lib/schemas'
import { useAuthStore } from '../store/useAuthStore'
import FormField from '../components/FormField'

export default function RegisterPage() {
  const navigate = useNavigate()
  const register_ = useAuthStore(state => state.register)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  function inputCx(hasError?: boolean) {
    return `w-full rounded-sm border bg-transparent px-5 py-4 text-sm font-bold text-ink outline-none transition-colors focus:border-purple dark:text-white ${
      hasError
        ? 'border-delete'
        : 'border-border hover:border-purple dark:border-border-dark'
    }`
  }

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null)
    try {
      await register_(values.name, values.email, values.password)
      navigate('/')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 dark:bg-surface-dark">
      {/* Logo */}
      <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple">
        <img src="/assets/logo.svg" alt="Invoice App" width={28} height={26} />
      </div>

      {/* Card */}
      <div className="w-full max-w-[480px] rounded-lg bg-card p-10 shadow-sm dark:bg-card-dark">
        <h1 className="text-2xl font-bold text-ink dark:text-white">Create account</h1>
        <p className="mt-2 text-sm text-muted">Start managing your invoices today.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-6" noValidate>
          <FormField label="Full Name" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Alex Johnson"
              autoComplete="name"
              {...register('name')}
              className={inputCx(!!errors.name)}
            />
          </FormField>

          <FormField label="Email" error={errors.email?.message}>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
              className={inputCx(!!errors.email)}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('password')}
              className={inputCx(!!errors.password)}
            />
          </FormField>

          <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
            <input
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className={inputCx(!!errors.confirmPassword)}
            />
          </FormField>

          {serverError && (
            <p className="rounded-sm bg-delete/10 px-4 py-3 text-sm font-bold text-delete">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-full bg-purple py-4 text-sm font-bold text-white transition-colors hover:bg-purple-light disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-bold text-purple transition-colors hover:text-purple-light"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
