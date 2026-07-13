'use client'

import { ThemeToggle } from '@/components/admin/theme-toggle'
import { createClient } from '@/lib/supabase/browser'
import { AlertCircle, LockKeyhole, PlaneTakeoff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Unable to sign in. Check your email and password and try again.')
      setLoading(false)
      return
    }

    router.replace('/dashboard')
    router.refresh()
  }

  return (
    <main className="login-page">
      <div className="login-theme"><ThemeToggle /></div>
      <div className="login-wrap">
        <div className="login-brand"><span><PlaneTakeoff size={21} aria-hidden="true" /></span><div><strong>AeroCrew</strong><small>Operations Control</small></div></div>
        <section className="login-card">
          <div className="login-icon"><LockKeyhole size={19} aria-hidden="true" /></div>
          <p className="page-eyebrow">Restricted workspace</p>
          <h1>Admin sign in</h1>
          <p>Use your authorised AeroCrew account to access airport transportation operations.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@aerocrew.com" autoComplete="username" required disabled={loading} />
            <label className="login-password-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" required disabled={loading} />
            {error && <div className="login-error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error}</div>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </section>
        <p className="login-foot">AeroCrew internal operations workspace</p>
      </div>
    </main>
  )
}
