'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const DEMO_OPERATORS = [
  { id: 1, name: 'Ahmad Hassan', vehicle: 'Toyota Hiace', zone: 'PJ · Subang', trips: 87, rating: 4.9, earnings: 7830, onTime: 98, status: 'verified' },
  { id: 2, name: 'Rahman Drivers', vehicle: 'Toyota Alphard', zone: 'Damansara', trips: 72, rating: 4.8, earnings: 6480, onTime: 96, status: 'verified' },
  { id: 3, name: 'Khairul Transport', vehicle: 'Nissan Serena', zone: 'Shah Alam', trips: 61, rating: 4.7, earnings: 5490, onTime: 94, status: 'verified' },
  { id: 4, name: 'Farouk Van Services', vehicle: 'Toyota Hiace', zone: 'Cyberjaya', trips: 54, rating: 4.6, earnings: 4860, onTime: 93, status: 'verified' },
  { id: 5, name: 'Asyraf Transport', vehicle: 'Honda Odyssey', zone: 'Nilai', trips: 48, rating: 4.5, earnings: 4320, onTime: 91, status: 'verified' },
]

export default function LeaderboardPage() {
  const router = useRouter()
  const [metric, setMetric] = useState<'trips' | 'rating' | 'earnings' | 'onTime'>('trips')
  const [operators, setOperators] = useState(DEMO_OPERATORS)

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) { router.push('/'); return }
  }, [])

  const sorted = [...operators].sort((a, b) => b[metric] - a[metric])
  const maxValue = Math.max(...sorted.map(o => o[metric]))

  const metricLabel = { trips: 'Total trips', rating: 'Avg rating', earnings: 'Earnings (RM)', onTime: 'On-time %' }
  const metricFormat = (op: typeof operators[0]) => {
    switch (metric) {
      case 'rating': return op[metric].toFixed(1)
      case 'earnings': return `RM${op[metric].toLocaleString()}`
      case 'onTime': return `${op[metric]}%`
      default: return op[metric].toString()
    }
  }

  const medalColor = (i: number) => {
    if (i === 0) return 'text-yellow-400'
    if (i === 1) return 'text-gray-400'
    if (i === 2) return 'text-amber-600'
    return 'text-[#555]'
  }

  const medalEmoji = (i: number) => {
    if (i === 0) return '🥇'
    if (i === 1) return '🥈'
    if (i === 2) return '🥉'
    return `#${i + 1}`
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
          >←</button>
          <span className="text-white font-semibold">Operator leaderboard</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-8 flex-wrap">
          {(Object.keys(metricLabel) as Array<keyof typeof metricLabel>).map(m => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                metric === m
                  ? 'bg-[#BA7517] text-white border-[#BA7517]'
                  : 'bg-[#1C2333] text-[#888] border-[#2A3347] hover:text-white'
              }`}
            >
              {metricLabel[m]}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sorted.map((op, i) => {
            const ratio = op[metric] / maxValue
            return (
              <div key={op.id} className={`bg-[#1C2333] rounded-2xl border p-5 ${i === 0 ? 'border-yellow-500/30' : 'border-[#2A3347]'}`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className={`text-2xl font-black w-10 text-center ${medalColor(i)}`}>
                    {medalEmoji(i)}
                  </div>
                  <div className="w-10 h-10 bg-[#BA7517]/20 rounded-xl flex items-center justify-center text-[#BA7517] font-bold">
                    {op.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold">{op.name}</p>
                    <p className="text-[#888] text-xs">{op.vehicle} · {op.zone}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${i === 0 ? 'text-yellow-400' : 'text-[#BA7517]'}`}>
                      {metricFormat(op)}
                    </p>
                    <p className="text-[#888] text-xs">{metricLabel[metric]}</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'Trips', value: op.trips },
                    { label: 'Rating', value: op.rating.toFixed(1) },
                    { label: 'Earnings', value: `RM${(op.earnings / 1000).toFixed(1)}k` },
                    { label: 'On-time', value: `${op.onTime}%` },
                  ].map(s => (
                    <div key={s.label} className="bg-[#0A0E1A] rounded-xl p-2 text-center border border-[#2A3347]">
                      <p className="text-white text-sm font-semibold">{s.value}</p>
                      <p className="text-[#555] text-xs">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="h-2 bg-[#2A3347] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${i === 0 ? 'bg-yellow-400' : 'bg-[#BA7517]'}`}
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}