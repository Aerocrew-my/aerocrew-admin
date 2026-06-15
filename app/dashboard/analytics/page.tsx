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
    const { data } = await supabase.from('users').select('*').neq('role', 'admin')
    setUsers(data || [])
    setLoading(false)
  }

  const crew = users.filter(u => u.role === 'crew')
  const operators = users.filter(u => u.role === 'operator')
  const verified = users.filter(u => u.status === 'verified')
  const pending = users.filter(u => u.status === 'pending' || u.status === 'pending_verification')

  const zoneData = crew.reduce((acc: any, u) => {
    const zone = u.home_zone || 'Unknown'
    acc[zone] = (acc[zone] || 0) + 1
    return acc
  }, {})

  const airlineData = crew.reduce((acc: any, u) => {
    const airline = u.airline || 'Unknown'
    acc[airline] = (acc[airline] || 0) + 1
    return acc
  }, {})

  const productData = crew.reduce((acc: any, u) => {
    const product = u.product || 'aeropool'
    acc[product] = (acc[product] || 0) + 1
    return acc
  }, {})

  const maxZoneCount = Math.max(...Object.values(zoneData as Record<string, number>).map(Number), 1)

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
          >←</button>
          <span className="text-white font-semibold">User analytics</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#BA7517] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : (
          <>
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total users', value: users.length, color: 'text-white' },
                { label: 'Flight crew', value: crew.length, color: 'text-blue-400' },
                { label: 'Van operators', value: operators.length, color: 'text-[#BA7517]' },
                { label: 'Verified', value: verified.length, color: 'text-green-400' },
              ].map(s => (
                <div key={s.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
                  <p className="text-[#888] text-xs uppercase tracking-wider mb-2">{s.label}</p>
                  <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Zone distribution */}
              <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
                <h3 className="text-white font-semibold mb-4">Crew by zone</h3>
                <div className="space-y-3">
                  {Object.entries(zoneData as Record<string, number>)
                    .sort(([,a],[,b]) => b - a)
                    .slice(0, 6)
                    .map(([zone, count]) => (
                    <div key={zone}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[#888] text-xs">{zone}</span>
                        <span className="text-white text-xs font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-[#2A3347] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#BA7517] rounded-full transition-all"
                          style={{ width: `${(count / maxZoneCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {Object.keys(zoneData).length === 0 && (
                    <p className="text-[#888] text-sm">No zone data yet</p>
                  )}
                </div>
              </div>

              {/* Airline distribution */}
              <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
                <h3 className="text-white font-semibold mb-4">Crew by airline</h3>
                <div className="space-y-3">
                  {Object.entries(airlineData as Record<string, number>)
                    .sort(([,a],[,b]) => b - a)
                    .map(([airline, count]) => (
                    <div key={airline} className="flex items-center justify-between bg-[#0A0E1A] rounded-xl p-3 border border-[#2A3347]">
                      <span className="text-white text-sm">{airline}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#2A3347] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / Math.max(crew.length, 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-[#888] text-xs w-4 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                  {Object.keys(airlineData).length === 0 && (
                    <p className="text-[#888] text-sm">No airline data yet</p>
                  )}
                </div>
              </div>

              {/* Product distribution */}
              <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
                <h3 className="text-white font-semibold mb-4">Subscription products</h3>
                <div className="space-y-3">
                  {[
                    { id: 'aeropool', label: 'AeroPool', color: '#BA7517' },
                    { id: 'aeroflex', label: 'AeroFlex', color: '#378ADD' },
                    { id: 'aerosolo', label: 'AeroSolo', color: '#EF9F27' },
                  ].map(p => {
                    const count = productData[p.id] || 0
                    const pct = crew.length > 0 ? Math.round((count / crew.length) * 100) : 0
                    return (
                      <div key={p.id}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: p.color }}>{p.label}</span>
                          <span className="text-[#888] text-xs">{count} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-[#2A3347] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {crew.length === 0 && (
                    <p className="text-[#888] text-sm">No crew data yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status breakdown */}
            <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
              <h3 className="text-white font-semibold mb-4">Verification status breakdown</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Verified', count: verified.length, color: 'text-green-400', bg: 'bg-green-900/20 border-green-500/20' },
                  { label: 'Pending', count: pending.length, color: 'text-amber-400', bg: 'bg-amber-900/20 border-amber-500/20' },
                  { label: 'Rejected', count: users.filter(u => u.status === 'rejected').length, color: 'text-red-400', bg: 'bg-red-900/20 border-red-500/20' },
                  { label: 'Suspended', count: users.filter(u => u.status === 'suspended').length, color: 'text-gray-400', bg: 'bg-gray-900/20 border-gray-500/20' },
                ].map(s => (
                  <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[#888] text-xs mt-1">{s.label}</p>
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