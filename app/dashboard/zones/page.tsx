'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const zones = [
  { name: 'Petaling Jaya', code: 'PJ', price: 700, crew: 0, operators: 0, status: 'active', airport: 'SZB' },
  { name: 'Ara Damansara', code: 'ARA', price: 750, crew: 0, operators: 0, status: 'active', airport: 'SZB/KLIA' },
  { name: 'Shah Alam', code: 'SA', price: 650, crew: 0, operators: 0, status: 'active', airport: 'SZB/KLIA' },
  { name: 'Subang Jaya', code: 'SJ', price: 600, crew: 0, operators: 0, status: 'active', airport: 'SZB' },
  { name: 'Cyberjaya', code: 'CYB', price: 350, crew: 0, operators: 0, status: 'active', airport: 'KLIA/klia2' },
  { name: 'Nilai', code: 'NLI', price: 300, crew: 0, operators: 0, status: 'active', airport: 'KLIA/klia2' },
  { name: 'Putra Heights', code: 'PH', price: 450, crew: 0, operators: 0, status: 'active', airport: 'SZB/KLIA' },
  { name: 'Damansara', code: 'DAM', price: 850, crew: 0, operators: 0, status: 'active', airport: 'KLIA' },
  { name: 'Penang', code: 'PEN', price: 400, crew: 0, operators: 0, status: 'coming_soon', airport: 'PEN' },
  { name: 'Johor Bahru', code: 'JB', price: 500, crew: 0, operators: 0, status: 'coming_soon', airport: 'JHB' },
  { name: 'Singapore', code: 'SIN', price: 0, crew: 0, operators: 0, status: 'planned', airport: 'SIN' },
  { name: 'Bangkok', code: 'BKK', price: 0, crew: 0, operators: 0, status: 'planned', airport: 'BKK' },
]

export default function ZonesPage() {
  const router = useRouter()
  const [editingZone, setEditingZone] = useState<string | null>(null)
  const [prices, setPrices] = useState<Record<string, number>>(
    Object.fromEntries(zones.map(z => [z.code, z.price]))
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400 border-green-500/20'
      case 'coming_soon': return 'bg-amber-900/30 text-amber-400 border-amber-500/20'
      case 'planned': return 'bg-[#2A3347] text-[#888] border-[#2A3347]'
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active'
      case 'coming_soon': return 'Coming soon'
      case 'planned': return 'Planned'
      default: return status
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
          >←</button>
          <span className="text-white font-semibold">Zone management</span>
          <span className="text-[#2A3347]">|</span>
          <span className="text-[#888] text-sm">{zones.filter(z => z.status === 'active').length} active zones</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active zones', value: zones.filter(z => z.status === 'active').length, color: 'text-green-400' },
            { label: 'Coming soon', value: zones.filter(z => z.status === 'coming_soon').length, color: 'text-amber-400' },
            { label: 'Planned expansion', value: zones.filter(z => z.status === 'planned').length, color: 'text-[#888]' },
            { label: 'Avg zone price', value: `RM${Math.round(zones.filter(z => z.price > 0).reduce((a, z) => a + z.price, 0) / zones.filter(z => z.price > 0).length)}`, color: 'text-[#BA7517]' },
          ].map(s => (
            <div key={s.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
              <p className="text-[#888] text-xs font-semibold uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A3347]">
            <h2 className="text-white font-semibold">All zones</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2A3347]">
                  {['Zone', 'Airport', 'Monthly price', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3347]">
                {zones.map(zone => (
                  <tr key={zone.code} className="hover:bg-[#ffffff05]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#BA7517]/20 rounded-lg flex items-center justify-center text-[#BA7517] text-xs font-bold">
                          {zone.code}
                        </div>
                        <span className="text-white font-medium text-sm">{zone.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#888] text-sm">{zone.airport}</td>
                    <td className="px-6 py-4">
                      {editingZone === zone.code ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[#888] text-sm">RM</span>
                          <input
                            type="number"
                            value={prices[zone.code]}
                            onChange={e => setPrices(p => ({ ...p, [zone.code]: Number(e.target.value) }))}
                            className="w-20 bg-[#0A0E1A] border border-[#BA7517] rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                          />
                          <button
                            onClick={() => setEditingZone(null)}
                            className="text-green-400 text-xs font-semibold"
                          >Save</button>
                        </div>
                      ) : (
                        <span className="text-white text-sm font-medium">
                          {zone.price > 0 ? `RM${prices[zone.code]}` : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${getStatusBadge(zone.status)}`}>
                        {getStatusLabel(zone.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditingZone(zone.code)}
                        className="text-[#BA7517] text-xs hover:text-[#E8920A] transition-colors font-medium"
                      >
                        Edit price
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}