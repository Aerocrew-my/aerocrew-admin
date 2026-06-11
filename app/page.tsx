'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === 'aerocrew2026') {
      localStorage.setItem('aerocrew_admin_auth', 'true')
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-10 h-10 bg-[#BA7517] rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <span className="text-white text-xl font-semibold">AeroCrew Admin</span>
        </div>

        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-8">
          <h1 className="text-white text-2xl font-bold mb-1">Admin access</h1>
          <p className="text-[#888] text-sm mb-8">Restricted to AeroCrew team only</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[#888] text-xs font-semibold tracking-widest uppercase block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#0A0E1A] border border-[#2A3347] rounded-xl px-4 py-3 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#BA7517] transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BA7517] hover:bg-[#E8920A] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[#444] text-xs mt-6">
          AeroCrew · Internal Admin Panel · v1.0
        </p>
      </div>
    </main>
  )
}