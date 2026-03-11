import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (mounted) {
          setSession(data?.session ?? null)
          setUser(data?.session?.user ?? null)
        }
      } catch (err) {
        console.warn('Supabase session error (check your .env credentials):', err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getSession()

    let subscription = null
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      })
      subscription = data.subscription
    } catch (err) {
      console.warn('Supabase auth listener error:', err.message)
      if (mounted) setLoading(false)
    }

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = async ({ email, password, fullName }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      if (!error && data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email,
        })
      }
      return { data, error }
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }

  const signIn = async ({ email, password }) => {
    try {
      return await supabase.auth.signInWithPassword({ email, password })
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }

  const signOut = async () => {
    try {
      return await supabase.auth.signOut()
    } catch (err) {
      return { error: { message: err.message } }
    }
  }

  const resetPassword = async (email) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    } catch (err) {
      return { data: null, error: { message: err.message } }
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
