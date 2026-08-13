import type { Session, User } from '@supabase/supabase-js'
import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'
import { queryClient } from '@/lib/queryClient'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        // Draft technologies are visible to admins. Remove every cached copy when
        // Supabase ends the session, including expiry/revocation outside our button.
        if (event === 'SIGNED_OUT') queryClient.clear()
        if (active) {
          setSession(nextSession)
          setLoading(false)
        }
      },
    )

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return

      if (error) {
        setSession(null)
      } else {
        setSession(data.session)
      }
      setLoading(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }, [])

  const verifyOtp = useCallback(async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (error) throw error
    return data
  }, [])

  const resendCode = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) throw error
    return data
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/nueva-password`,
    })
    if (error) throw error
    return data
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const { data, error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    return data
  }, [])

  const signOutOtherSessions = useCallback(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    queryClient.clear()
  }, [])

  const user: User | null = session?.user ?? null

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    verifyOtp,
    resendCode,
    requestPasswordReset,
    updatePassword,
    signOutOtherSessions,
  }
}
