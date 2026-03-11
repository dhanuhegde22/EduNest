import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we actually have a session to perform the reset.
    // Supabase sets a session from the email link URL automatically.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Your password reset link has expired or is invalid. Please request a new one.')
      }
    })
  }, [])

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <BookOpen size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Edu<span className="text-primary-600 dark:text-primary-400">Nest</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-1">
            Update Password
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Please enter your new password below.
          </p>
        </div>

        <div className="glass-card p-8">
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-accent-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-2">Password Updated!</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                Your password has been successfully changed.
              </p>
              <button onClick={() => navigate('/login')} className="btn-primary w-full justify-center">
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="input-field pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="input-field pr-11"
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
