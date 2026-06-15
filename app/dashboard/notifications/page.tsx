'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NotificationsPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [type, setType] = useState('info')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [userCount, setUserCount] = useState(0)

  const history = [
    { title: 'Welcome to AeroCrew!', body: 'Your account has been verified. Upload your roster to get started.', audience: 'crew', sent: '10 Jun 2026', recipients: 5 },
    { title: 'New operator in your zone', body: 'A new verified operator now covers Petaling Jaya routes.', audience: 'crew', sent: '8 Jun 2026', recipients: 12 },
    { title: 'Payout processed', body: 'Your June W1 earnings have been transferred to your account.', audience: 'operators', sent: '16 Jun 2026', recipients: 3 },
  ]

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) { router.push('/'); return }
    fetchUserCount()
  }, [audience])

  const fetchUserCount = async () => {
    try {
      let query = supabase.from('users').select('id', { count: 'exact' })
      if (audience === 'crew') query = query.eq('role', 'crew')
      if (audience === 'operators') query = query.eq('role', 'operator')
      if (audience === 'verified') query = query.eq('status', 'verified')
      const { count } = await query
      setUserCount(count || 0)
    } catch (e) {
      setUserCount(0)
    }
  }

  const sendNotification = async () => {
    if (!title || !body) return
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    setSending(false)
    setSent(true)
    setTitle('')
    setBody('')
    setTimeout(() => setSent(false), 3000)
  }

  const typeColors: Record<string, string> = {
    info: 'border-blue-500/30 bg-blue-900/10',
    success: 'border-green-500/30 bg-green-900/10',
    warning: 'border-amber-500/30 bg-amber-900/10',
    alert: 'border-red-500/30 bg-red-900/10',
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
          >←</button>
          <span className="text-white font-semibold">Push notifications</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Composer */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold text-lg">Compose notification</h2>

            <div>
              <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Audience</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'all', label: 'All users' },
                  { id: 'crew', label: 'Flight crew only' },
                  { id: 'operators', label: 'Operators only' },
                  { id: 'verified', label: 'Verified only' },
                ].map(a => (
                  <button
                    key={a.id}
                    onClick={() => setAudience(a.id)}
                    className={`px-3 py-2 rounded-xl text-sm border transition-colors ${
                      audience === a.id
                        ? 'bg-[#BA7517]/20 text-[#BA7517] border-[#BA7517]/30'
                        : 'bg-[#1C2333] text-[#888] border-[#2A3347] hover:text-white'
                    }`}
                  >
                    {a.label}
                    {audience === a.id && userCount > 0 && (
                      <span className="ml-1 text-xs opacity-70">({userCount})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Type</label>
              <div className="flex gap-2">
                {['info', 'success', 'warning', 'alert'].map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors capitalize ${
                      type === t ? typeColors[t] + ' text-white' : 'bg-[#1C2333] text-[#888] border-[#2A3347]'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Notification title..."
                className="w-full bg-[#1C2333] border border-[#2A3347] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#BA7517] placeholder-[#555]"
              />
            </div>

            <div>
              <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Message</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Notification message..."
                rows={4}
                className="w-full bg-[#1C2333] border border-[#2A3347] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#BA7517] placeholder-[#555] resize-none"
              />
            </div>

            <button
              onClick={sendNotification}
              disabled={!title || !body || sending}
              className="w-full py-3 bg-[#BA7517] hover:bg-[#E8920A] disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              {sending ? 'Sending...' : sent ? '✓ Sent!' : `Send to ${userCount > 0 ? userCount : 'all'} users`}
            </button>
          </div>

          {/* Preview + history */}
          <div className="space-y-4">
            <h2 className="text-white font-semibold text-lg">Preview</h2>
            <div className={`rounded-2xl border p-5 ${typeColors[type]}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#BA7517] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title || 'Notification title'}</p>
                  <p className="text-[#888] text-xs mt-1">{body || 'Your notification message will appear here...'}</p>
                  <p className="text-[#555] text-xs mt-2">AeroCrew · just now</p>
                </div>
              </div>
            </div>

            <h2 className="text-white font-semibold text-lg pt-2">Sent history</h2>
            <div className="space-y-3">
              {history.map((n, i) => (
                <div key={i} className="bg-[#1C2333] rounded-xl border border-[#2A3347] p-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <span className="text-[#555] text-xs ml-2 shrink-0">{n.sent}</span>
                  </div>
                  <p className="text-[#888] text-xs mb-2">{n.body}</p>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-0.5 bg-[#2A3347] text-[#888] rounded capitalize">{n.audience}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#2A3347] text-[#888] rounded">{n.recipients} recipients</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}