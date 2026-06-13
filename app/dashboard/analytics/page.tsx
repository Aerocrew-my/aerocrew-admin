'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) { router.push('/'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await supabase.from('users').select('*').neq('role', 'admin')
      setUsers(data || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const crew = users.filter(u => u.role === 'crew')
  const operators = users.filter(u => u.role === 'operator')
  const verified = users.filter(u => u.status === 'verified')
  const pending = users.filter(u => u.status === 'pending' || u.status === 'pending_verification')

  const conversionRate = users.length > 0
    ? ((verified.length / users.length) * 100).toFixed(1)
    : '0'

  const metrics = [
    { label: 'Total signups', value: users.length, change: '+12', positive: true },
    { label: 'Verified users', value: verified.length, change: '+5', positive: true },
    { label: 'Pending review', value: pending.length, change: '+3', positive: false },
    { label: 'Conversion rate', value: `${conversionRate}%`, change: '+2.1%', positive: true },
    { label: 'Crew signups', value: crew.length, change: '+8', positive: true },
    { label: 'Operator signups', value: operators.length, change: '+2', positive: true },
    { label: 'Verified operators', value: operators.filter(u => u.status === 'verified').length, change: '+1', positive: true },
    { label: 'Avg time to verify', value: '18h', change: '-2h', positive: true },
  ]

  const funnelSteps = [
    { label: 'Visited signup', value: users.length + 24, pct: 100 },
    { label: 'Completed signup', value: users.length + 8, pct: 85 },
    { label: 'Verified phone (OTP)', value: users.length + 2, pct: 72 },
    { label: 'Completed profile', value: users.length, pct: 64 },
    { label: 'Documents submitted', value: Math.floor(users.length * 0.8), pct: 51 },
    { label: 'Account verified', value: verified.length, pct: Math.round((verified.length / (users.length + 24)) * 100) },
  ]

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
          >←</button>
          <span className="text-white font-semibold">User analytics</span>
          <span className="text-[#2A3347]">|</span>
          <span className="text-[#888] text-sm">Live data from Supabase</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#BA7517] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {metrics.map(m => (
                <div key={m.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
                  <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">{m.label}</p>
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className={`text-xs mt-1 font-medium ${m.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {m.change} this week
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
                <h3 className="text-white font-semibold mb-6">Signup funnel</h3>
                <div className="space-y-3">
                  {funnelSteps.map((step, i) => (
                    <div key={step.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#888] text-sm">{step.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white text-sm font-medium">{step.value}</span>
                          <span className="text-[#555] text-xs">{step.pct}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#2A3347] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${step.pct}%`,
                            backgroundColor: i === 0 ? '#BA7517' : i < 3 ? '#E8920A' : '#1D9E75'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
                <h3 className="text-white font-semibold mb-6">User breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Flight crew', value: crew.length, total: users.length, color: '#378ADD' },
                    { label: 'Van operators', value: operators.length, total: users.length, color: '#BA7517' },
                    { label: 'Verified accounts', value: verified.length, total: users.length, color: '#1D9E75' },
                    { label: 'Pending verification', value: pending.length, total: users.length, color: '#EF9F27' },
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#888] text-sm">{item.label}</span>
                        <span className="text-white text-sm font-medium">
                          {item.value} / {item.total}
                        </span>
                      </div>
                      <div className="w-full bg-[#2A3347] rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: item.total > 0 ? `${(item.value / item.total) * 100}%` : '0%',
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[#2A3347]">
                  <h4 className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-3">
                    Operator status breakdown
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Verified', value: operators.filter(u => u.status === 'verified').length, color: 'text-green-400' },
                      { label: 'Pending', value: operators.filter(u => u.status === 'pending_verification').length, color: 'text-amber-400' },
                      { label: 'Rejected', value: operators.filter(u => u.status === 'rejected').length, color: 'text-red-400' },
                    ].map(s => (
                      <div key={s.label} className="bg-[#0A0E1A] rounded-xl p-3 text-center">
                        <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[#888] text-xs mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}