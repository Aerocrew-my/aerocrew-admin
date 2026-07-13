'use client'

import { ThemeToggle } from '@/components/admin/theme-toggle'
import { AlertCircle, LockKeyhole, PlaneTakeoff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AdminAccess() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const configuredPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (!configuredPassword) {
      setError('Admin access is not configured for this environment.')
      setLoading(false)
      return
    }

    if (password === configuredPassword) {
      localStorage.setItem('aerocrew_admin_auth', 'true')
      router.push('/dashboard')
      return
    }

    setError('Incorrect password')
    setLoading(false)
  }

  return (
    <main className="login-page">
      <div className="login-theme"><ThemeToggle /></div>
      <div className="login-wrap">
        <div className="login-brand"><span><PlaneTakeoff size={21} aria-hidden="true" /></span><div><strong>AeroCrew</strong><small>Operations Control</small></div></div>
        <section className="login-card">
          <div className="login-icon"><LockKeyhole size={19} aria-hidden="true" /></div>
          <p className="page-eyebrow">Restricted workspace</p>
          <h1>Admin access</h1>
          <p>Sign in to manage AeroCrew airport transportation operations.</p>
          <form onSubmit={handleLogin}>
            <label htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter admin password" autoComplete="current-password" required />
            {error && <div className="login-error" role="alert"><AlertCircle size={15} aria-hidden="true" />{error}</div>}
            <button type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
        </section>
        <p className="login-foot">AeroCrew internal operations workspace</p>
      </div>
    </main>
  )
}
