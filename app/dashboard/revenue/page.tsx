'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function RevenuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [selectedMonth, setSelectedMonth] = useState('June 2026')

  const months = ['June 2026', 'May 2026', 'April 2026']

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) { router.push('/'); return }
    fetchData()
  }, [])

  const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')

    if (error) {
  console.log("REVENUE SUPABASE ERROR MESSAGE:", error.message)
  console.log("REVENUE SUPABASE ERROR DETAILS:", error.details)
  console.log("REVENUE SUPABASE ERROR HINT:", error.hint)
  console.log("REVENUE SUPABASE ERROR CODE:", error.code)
  return
}

    console.log("Users loaded:", data)

    setUsers(data || [])

  } catch (e) {
    console.error("Fetch failed:", e)
  } finally {
    setLoading(false)
  }
}

  const crew = users.filter(u => u.role === 'crew')
  const operators = users.filter(u => u.role === 'operator')
  const verifiedCrew = crew.filter(u => u.status === 'verified')

  // Simulated revenue based on verified crew
  const aeroPoolCrew = Math.floor(verifiedCrew.length * 0.7)
  const aeroFlexCrew = Math.floor(verifiedCrew.length * 0.2)
  const aeroSoloCrew = Math.floor(verifiedCrew.length * 0.1)

  const aeroPoolGTV = aeroPoolCrew * 750
  const aeroFlexGTV = aeroFlexCrew * 120
  const aeroSoloGTV = aeroSoloCrew * 1500

  const totalGTV = aeroPoolGTV + aeroFlexGTV + aeroSoloGTV
  const totalCommission = (aeroPoolGTV * 0.15) + (aeroFlexGTV * 0.20) + (aeroSoloGTV * 0.175)
  const operatorPayout = totalGTV - totalCommission

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
            >
              ←
            </button>
            <span className="text-white font-semibold">Revenue analytics</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#1C2333] border border-[#2A3347] rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#BA7517]"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Top stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Gross transaction value', value: `RM${totalGTV.toLocaleString()}`, color: 'text-white', sub: selectedMonth },
            { label: 'AeroCrew commission', value: `RM${Math.round(totalCommission).toLocaleString()}`, color: 'text-[#BA7517]', sub: `${((totalCommission/totalGTV)*100).toFixed(1)}% avg` },
            { label: 'Operator payouts', value: `RM${Math.round(operatorPayout).toLocaleString()}`, color: 'text-green-400', sub: `${operators.length} operators` },
            { label: 'Active subscribers', value: verifiedCrew.length.toString(), color: 'text-blue-400', sub: `${crew.length} total crew` },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
              <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[#555] text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Product breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              product: 'AeroPool',
              color: '#BA7517',
              bgColor: 'bg-[#BA7517]/10',
              borderColor: 'border-[#BA7517]/20',
              crew: aeroPoolCrew,
              pricePerCrew: 750,
              gtv: aeroPoolGTV,
              commission: aeroPoolGTV * 0.15,
              commissionRate: '15%',
            },
            {
              product: 'AeroFlex',
              color: '#378ADD',
              bgColor: 'bg-[#378ADD]/10',
              borderColor: 'border-[#378ADD]/20',
              crew: aeroFlexCrew,
              pricePerCrew: 120,
              gtv: aeroFlexGTV,
              commission: aeroFlexGTV * 0.20,
              commissionRate: '20%',
            },
            {
              product: 'AeroSolo',
              color: '#EF9F27',
              bgColor: 'bg-[#EF9F27]/10',
              borderColor: 'border-[#EF9F27]/20',
              crew: aeroSoloCrew,
              pricePerCrew: 1500,
              gtv: aeroSoloGTV,
              commission: aeroSoloGTV * 0.175,
              commissionRate: '17.5%',
            },
          ].map(p => (
            <div key={p.product} className={`${p.bgColor} rounded-2xl border ${p.borderColor} p-5`}>
              <h3 className="font-bold text-lg mb-4" style={{ color: p.color }}>{p.product}</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#888] text-sm">Active crew</span>
                  <span className="text-white font-semibold">{p.crew}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888] text-sm">Avg per crew</span>
                  <span className="text-white font-semibold">RM{p.pricePerCrew}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#888] text-sm">GTV</span>
                  <span className="text-white font-semibold">RM{p.gtv.toLocaleString()}</span>
                </div>
                <div className="h-px bg-[#2A3347]"/>
                <div className="flex justify-between">
                  <span className="text-[#888] text-sm">Commission ({p.commissionRate})</span>
                  <span className="font-bold" style={{ color: p.color }}>RM{Math.round(p.commission).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Year 1 projection */}
        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-6">
          <h3 className="text-white font-semibold mb-6">Year 1 projection (target: 300 crew)</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3347]">
                  {['Month', 'Active crew', 'GTV', 'Commission', 'Operators', 'Status'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3347]">
                {[
                  { month: 'Jun 2026', crew: verifiedCrew.length, status: 'current' },
                  { month: 'Jul 2026', crew: Math.min(verifiedCrew.length + 20, 300), status: 'projected' },
                  { month: 'Aug 2026', crew: Math.min(verifiedCrew.length + 50, 300), status: 'projected' },
                  { month: 'Sep 2026', crew: Math.min(verifiedCrew.length + 90, 300), status: 'projected' },
                  { month: 'Oct 2026', crew: Math.min(verifiedCrew.length + 140, 300), status: 'projected' },
                  { month: 'Nov 2026', crew: Math.min(verifiedCrew.length + 200, 300), status: 'projected' },
                  { month: 'Dec 2026', crew: 300, status: 'target' },
                ].map(row => {
                  const rowGTV = row.crew * 750
                  const rowComm = rowGTV * 0.15
                  const rowOps = Math.ceil(row.crew / 8)
                  return (
                    <tr key={row.month} className={`hover:bg-[#ffffff05] ${row.status === 'current' ? 'bg-[#BA7517]/5' : ''}`}>
                      <td className="px-4 py-3 text-white text-sm font-medium">{row.month}</td>
                      <td className="px-4 py-3 text-white text-sm">{row.crew}</td>
                      <td className="px-4 py-3 text-[#888] text-sm">RM{rowGTV.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#BA7517] text-sm font-medium">RM{Math.round(rowComm).toLocaleString()}</td>
                      <td className="px-4 py-3 text-[#888] text-sm">{rowOps}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                          row.status === 'current'
                            ? 'bg-[#BA7517]/20 text-[#BA7517] border-[#BA7517]/20'
                            : row.status === 'target'
                            ? 'bg-green-900/30 text-green-400 border-green-500/20'
                            : 'bg-[#2A3347] text-[#888] border-[#2A3347]'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}