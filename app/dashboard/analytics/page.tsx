'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AnalyticsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<{ role?: string; status?: string; home_zone?: string; airline?: string; product?: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('users').select('*').neq('role', 'admin')
      setUsers(data || [])
      setLoading(false)
    }
    void fetchData()
  }, [])

  const crew = users.filter(u => u.role === 'crew')
  const operators = users.filter(u => u.role === 'operator')
  const verified = users.filter(u => u.status === 'verified')
  const pending = users.filter(u => u.status === 'pending' || u.status === 'pending_verification')

  const zoneData = crew.reduce<Record<string, number>>((acc, u) => {
    const zone = u.home_zone || 'Unknown'
    acc[zone] = (acc[zone] || 0) + 1
    return acc
  }, {})

  const airlineData = crew.reduce<Record<string, number>>((acc, u) => {
    const airline = u.airline || 'Unknown'
    acc[airline] = (acc[airline] || 0) + 1
    return acc
  }, {})

  const productData = crew.reduce<Record<string, number>>((acc, u) => {
    const product = u.product || 'aeropool'
    acc[product] = (acc[product] || 0) + 1
    return acc
  }, {})

  const maxZoneCount = Math.max(...Object.values(zoneData as Record<string, number>).map(Number), 1)

  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[var(--canvas)] rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors text-sm"
          >←</button>
          <span className="text-[var(--text-primary)] font-semibold">User analytics</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total users', value: users.length, color: 'text-[var(--text-primary)]' },
                { label: 'Flight crew', value: crew.length, color: 'text-blue-400' },
                { label: 'Van operators', value: operators.length, color: 'text-[var(--primary)]' },
                { label: 'Verified', value: verified.length, color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
                  <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Zone distribution */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4">Crew by zone</h3>
                <div className="space-y-3">
                  {Object.entries(zoneData as Record<string, number>)
                    .sort(([,a],[,b]) => b - a)
                    .slice(0, 6)
                    .map(([zone, count]) => (
                    <div key={zone}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[var(--text-secondary)] text-xs">{zone}</span>
                        <span className="text-[var(--text-primary)] text-xs font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all"
                          style={{ width: `${(count / maxZoneCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {Object.keys(zoneData).length === 0 && (
                    <p className="text-[var(--text-secondary)] text-sm">No zone data yet</p>
                  )}
                </div>
              </div>

              {/* Airline distribution */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4">Crew by airline</h3>
                <div className="space-y-3">
                  {Object.entries(airlineData as Record<string, number>)
                    .sort(([,a],[,b]) => b - a)
                    .map(([airline, count]) => (
                    <div key={airline} className="flex items-center justify-between bg-[var(--canvas)] rounded-xl p-3 border border-[var(--border)]">
                      <span className="text-[var(--text-primary)] text-sm">{airline}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / Math.max(crew.length, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-[var(--text-secondary)] text-xs w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(airlineData).length === 0 && (
                    <p className="text-[var(--text-secondary)] text-sm">No airline data yet</p>
                  )}
                </div>
              </div>

              {/* Product distribution */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
                <h3 className="text-[var(--text-primary)] font-semibold mb-4">Subscription products</h3>
                <div className="space-y-3">
                  {[
                    { id: 'aeropool', label: 'AeroPool', color: 'var(--primary)' },
                    { id: 'aeroflex', label: 'AeroFlex', color: 'var(--information)' },
                    { id: 'aerosolo', label: 'AeroSolo', color: '#EF9F27' },
                  ].map(p => {
                    const count = productData[p.id] || 0
                    const pct = crew.length > 0 ? Math.round((count / crew.length) * 100) : 0
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: p.color }}>{p.label}</span>
                          <span className="text-[var(--text-secondary)] text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {crew.length === 0 && (
                    <p className="text-[var(--text-secondary)] text-sm">No crew data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-[var(--text-primary)] font-semibold mb-4">Verification status breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Verified', count: verified.length, color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20' },
                  { label: 'Pending', count: pending.length, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-500/20' },
                  { label: 'Rejected', count: users.filter(u => u.status === 'rejected').length, color: 'text-red-400', bg: 'bg-red-900/20 border-red-500/20' },
                  { label: 'Suspended', count: users.filter(u => u.status === 'suspended').length, color: 'text-gray-400', bg: 'bg-gray-900/20 border-gray-500/20' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
