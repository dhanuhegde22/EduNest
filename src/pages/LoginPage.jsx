import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 flex items-center justify-center p-4">
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
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
            {forgotMode ? 'Reset Password' : 'Welcome back'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {forgotMode ? "We'll send you a password reset link" : "Sign in to your EduNest account"}
          </p>
        </div>

        <div className="glass-card p-8">
          {resetSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-accent-500" />
              </div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg mb-2">Check your email</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <button onClick={() => { setForgotMode(false); setResetSent(false) }} className="btn-primary w-full justify-center">
                Back to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={forgotMode ? handleReset : handleLogin} className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl border border-red-200 dark:border-red-800">
                  <AlertCircle size={16} className="shrink-0" />
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  {<Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 " />}
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-field "
                  />
                </div>
              </div>

              {/* Password (only in login mode) */}
              {!forgotMode && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter Your password"
                      className="input-field pl-11 pr-11"
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
              )}

              {!forgotMode && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => { setForgotMode(true); setError('') }}
                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                {loading ? <LoadingSpinner size="sm" /> : (forgotMode ? 'Send Reset Link' : 'Sign In')}
              </button>

              {forgotMode && (
                <button
                  type="button"
                  onClick={() => { setForgotMode(false); setError('') }}
                  className="btn-secondary w-full justify-center"
                >
                  Back to Sign In
                </button>
              )}
            </form>
          )}
        </div>

        {!forgotMode && !resetSent && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
