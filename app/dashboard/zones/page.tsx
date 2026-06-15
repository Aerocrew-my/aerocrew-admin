'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEFAULT_ZONES = [
  { id: 1, name: 'Nilai', price: 300, airports: ['KLIA', 'klia2'], active: true },
  { id: 2, name: 'Cyberjaya', price: 350, airports: ['KLIA', 'klia2'], active: true },
  { id: 3, name: 'Putra Heights', price: 450, airports: ['KLIA', 'klia2', 'SZB'], active: true },
  { id: 4, name: 'Shah Alam', price: 650, airports: ['KLIA', 'klia2', 'SZB'], active: true },
  { id: 5, name: 'Subang Jaya', price: 600, airports: ['SZB', 'KLIA'], active: true },
  { id: 6, name: 'Petaling Jaya', price: 700, airports: ['SZB', 'KLIA', 'klia2'], active: true },
  { id: 7, name: 'Ara Damansara', price: 750, airports: ['SZB', 'KLIA', 'klia2'], active: true },
  { id: 8, name: 'Damansara', price: 850, airports: ['KLIA', 'klia2'], active: true },
  { id: 9, name: 'Kepong', price: 700, airports: ['KLIA', 'klia2'], active: false },
  { id: 10, name: 'Ampang', price: 780, airports: ['KLIA', 'klia2'], active: false },
  { id: 11, name: 'Cheras', price: 720, airports: ['KLIA', 'klia2'], active: false },
  { id: 12, name: 'Setapak', price: 760, airports: ['KLIA', 'klia2'], active: false },
]

export default function ZonesPage() {
  const router = useRouter()
  const [zones, setZones] = useState(DEFAULT_ZONES)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newZone, setNewZone] = useState({ name: '', price: '', airports: [] as string[] })

  const toggleZone = (id: number) => {
    setZones(zones.map(z => z.id === id ? { ...z, active: !z.active } : z))
  }

  const savePrice = (id: number) => {
    setZones(zones.map(z => z.id === id ? { ...z, price: parseInt(editPrice) || z.price } : z))
    setEditingId(null)
  }

  const addZone = () => {
    if (!newZone.name || !newZone.price) return
    setZones([...zones, {
      id: zones.length + 1,
      name: newZone.name,
      price: parseInt(newZone.price),
      airports: newZone.airports.length ? newZone.airports : ['KLIA'],
      active: false,
    }])
    setNewZone({ name: '', price: '', airports: [] })
    setShowAddForm(false)
  }

  const activeZones = zones.filter(z => z.active)
  const inactiveZones = zones.filter(z => !z.active)
  const avgPrice = Math.round(activeZones.reduce((s, z) => s + z.price, 0) / (activeZones.length || 1))

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
            >←</button>
            <span className="text-white font-semibold">Zone management</span>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-[#BA7517] hover:bg-[#E8920A] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            + Add zone
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Active zones</p>
            <p className="text-3xl font-bold text-green-400">{activeZones.length}</p>
          </div>
          <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Avg price</p>
            <p className="text-3xl font-bold text-[#BA7517]">RM{avgPrice}</p>
          </div>
          <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
            <p className="text-[#888] text-xs uppercase tracking-wider mb-2">Total zones</p>
            <p className="text-3xl font-bold text-white">{zones.length}</p>
          </div>
        </div>

        {/* Add form */}
        {showAddForm && (
          <div className="bg-[#1C2333] rounded-2xl border border-[#BA7517]/30 p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Add new zone</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Zone name</label>
                <input
                  value={newZone.name}
                  onChange={e => setNewZone({...newZone, name: e.target.value})}
                  placeholder="e.g. Kepong"
                  className="w-full bg-[#0A0E1A] border border-[#2A3347] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#BA7517]"
                />
              </div>
              <div>
                <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Monthly price (RM)</label>
                <input
                  value={newZone.price}
                  onChange={e => setNewZone({...newZone, price: e.target.value})}
                  placeholder="e.g. 700"
                  type="number"
                  className="w-full bg-[#0A0E1A] border border-[#2A3347] rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#BA7517]"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[#888] text-xs uppercase tracking-wider block mb-2">Airports served</label>
              <div className="flex gap-2">
                {['KLIA', 'klia2', 'SZB', 'PEN'].map(a => (
                  <button
                    key={a}
                    onClick={() => {
                      const airports = newZone.airports.includes(a)
                        ? newZone.airports.filter(x => x !== a)
                        : [...newZone.airports, a]
                      setNewZone({...newZone, airports})
                    }}
                    className={`px-3 py-1 rounded-lg text-sm border transition-colors ${
                      newZone.airports.includes(a)
                        ? 'bg-[#BA7517]/20 text-[#BA7517] border-[#BA7517]/30'
                        : 'bg-[#0A0E1A] text-[#888] border-[#2A3347]'
                    }`}
                  >{a}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addZone} className="px-4 py-2 bg-[#BA7517] text-white text-sm font-semibold rounded-xl">Save zone</button>
              <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-[#2A3347] text-[#888] text-sm rounded-xl">Cancel</button>
            </div>
          </div>
        )}

        {/* Active zones */}
        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#2A3347]">
            <h2 className="text-white font-semibold">Active zones ({activeZones.length})</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A3347]">
                {['Zone', 'Monthly price', 'Airports', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3347]">
              {activeZones.map(zone => (
                <tr key={zone.id} className="hover:bg-[#ffffff05]">
                  <td className="px-6 py-4 text-white font-medium">{zone.name}</td>
                  <td className="px-6 py-4">
                    {editingId === zone.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editPrice}
                          onChange={e => setEditPrice(e.target.value)}
                          className="w-20 bg-[#0A0E1A] border border-[#BA7517] rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                        />
                        <button onClick={() => savePrice(zone.id)} className="text-green-400 text-xs font-semibold">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-[#888] text-xs">Cancel</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[#BA7517] font-semibold">RM{zone.price}</span>
                        <button
                          onClick={() => { setEditingId(zone.id); setEditPrice(zone.price.toString()) }}
                          className="text-[#555] hover:text-[#888] text-xs"
                        >edit</button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {zone.airports.map(a => (
                        <span key={a} className="text-xs px-2 py-0.5 bg-[#2A3347] text-[#888] rounded">{a}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs px-2 py-1 rounded-lg bg-green-900/30 text-green-400 border border-green-500/20">Active</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleZone(zone.id)}
                      className="text-xs px-3 py-1 bg-[#0A0E1A] hover:bg-[#2A3347] text-[#888] rounded-lg border border-[#2A3347] transition-colors"
                    >Deactivate</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inactive zones */}
        {inactiveZones.length > 0 && (
          <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#2A3347]">
              <h2 className="text-white font-semibold">Inactive zones ({inactiveZones.length})</h2>
            </div>
            <table className="w-full">
              <tbody className="divide-y divide-[#2A3347]">
                {inactiveZones.map(zone => (
                  <tr key={zone.id} className="hover:bg-[#ffffff05] opacity-60">
                    <td className="px-6 py-4 text-white">{zone.name}</td>
                    <td className="px-6 py-4 text-[#BA7517] font-semibold">RM{zone.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        {zone.airports.map(a => (
                          <span key={a} className="text-xs px-2 py-0.5 bg-[#2A3347] text-[#888] rounded">{a}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg bg-[#2A3347] text-[#888] border border-[#2A3347]">Inactive</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleZone(zone.id)}
                        className="text-xs px-3 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded-lg border border-green-500/20 transition-colors"
                      >Activate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}