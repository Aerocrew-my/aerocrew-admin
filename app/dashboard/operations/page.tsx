'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_OPERATIONS = [
  {
    id: 'op1',
    poolId: 'POOL-001',
    airport: 'SZB',
    zone: 'Petaling Jaya',
    flightTime: '05:30',
    pickupTime: '03:00',
    crewCount: 3,
    operator: 'Ahmad Hassan',
    vehicle: 'Toyota Hiace · WXY 1234',
    status: 'in_progress',
    currentStop: 1,
    totalStops: 3,
    etaAirport: '04:05',
  },
  {
    id: 'op2',
    poolId: 'POOL-002',
    airport: 'KLIA',
    zone: 'Shah Alam',
    flightTime: '07:30',
    pickupTime: '05:00',
    crewCount: 2,
    operator: 'Rahman Drivers',
    vehicle: 'Toyota Alphard · ABC 5678',
    status: 'pickup',
    currentStop: 0,
    totalStops: 2,
    etaAirport: '06:10',
  },
  {
    id: 'op3',
    poolId: 'POOL-003',
    airport: 'KLIA',
    zone: 'Damansara',
    flightTime: '08:00',
    pickupTime: '05:30',
    crewCount: 4,
    operator: 'Pending assignment',
    vehicle: '—',
    status: 'unassigned',
    currentStop: 0,
    totalStops: 4,
    etaAirport: '—',
  },
  {
    id: 'op4',
    poolId: 'POOL-004',
    airport: 'klia2',
    zone: 'Cyberjaya',
    flightTime: '09:00',
    pickupTime: '06:30',
    crewCount: 2,
    operator: 'Ahmad Hassan',
    vehicle: 'Toyota Hiace · WXY 1234',
    status: 'scheduled',
    currentStop: 0,
    totalStops: 2,
    etaAirport: '07:45',
  },
  {
    id: 'op5',
    poolId: 'POOL-005',
    airport: 'SZB',
    zone: 'Subang Jaya',
    flightTime: '06:00',
    pickupTime: '03:30',
    crewCount: 3,
    operator: 'Rahman Drivers',
    vehicle: 'Toyota Alphard · ABC 5678',
    status: 'completed',
    currentStop: 3,
    totalStops: 3,
    etaAirport: '04:50',
  },
]

export default function OperationsPage() {
  const router = useRouter()
  const [ops, setOps] = useState(DEMO_OPERATIONS)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) { router.push('/'); return }
    const interval = setInterval(() => setTick(t => t + 1), 5000)
    return () => clearInterval(interval)
  }, [])

  const filtered = selectedStatus === 'all'
    ? ops
    : ops.filter(o => o.status === selectedStatus)

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-[#BA7517]/20 text-[#BA7517] border-[#BA7517]/20'
      case 'pickup': return 'bg-blue-900/30 text-blue-400 border-blue-500/20'
      case 'scheduled': return 'bg-[#2A3347] text-[#888] border-[#2A3347]'
      case 'unassigned': return 'bg-red-900/30 text-red-400 border-red-500/20'
      case 'completed': return 'bg-green-900/30 text-green-400 border-green-500/20'
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'in_progress': return '🚐 In progress'
      case 'pickup': return '📍 Pickup'
      case 'scheduled': return '🕐 Scheduled'
      case 'unassigned': return '⚠️ Unassigned'
      case 'completed': return '✅ Completed'
      default: return status
    }
  }

  const inProgress = ops.filter(o => o.status === 'in_progress').length
  const pickupCount = ops.filter(o => o.status === 'pickup').length
  const unassigned = ops.filter(o => o.status === 'unassigned').length
  const completed = ops.filter(o => o.status === 'completed').length
  const totalCrew = ops.reduce((s, o) => s + o.crewCount, 0)

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-8 h-8 bg-[#0A0E1A] rounded-lg border border-[#2A3347] flex items-center justify-center text-white hover:bg-[#2A3347] transition-colors text-sm"
            >←</button>
            <span className="text-white font-semibold">Live operations</span>
            <div className="flex items-center gap-1.5 bg-[#1D9E75]/10 border border-[#1D9E75]/20 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-[#1D9E75] rounded-full animate-pulse"/>
              <span className="text-[#1D9E75] text-xs font-semibold">Live</span>
            </div>
          </div>
          <span className="text-[#555] text-xs">Auto-refreshes every 5s</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'In progress', value: inProgress, color: 'text-[#BA7517]' },
            { label: 'Pickup phase', value: pickupCount, color: 'text-blue-400' },
            { label: 'Unassigned', value: unassigned, color: 'text-red-400' },
            { label: 'Completed today', value: completed, color: 'text-green-400' },
            { label: 'Total crew', value: totalCrew, color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-4">
              <p className="text-[#888] text-xs uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {unassigned > 0 && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <span className="text-red-400 text-lg">⚠️</span>
            <div>
              <p className="text-red-400 font-semibold text-sm">{unassigned} pool{unassigned > 1 ? 's' : ''} need operator assignment</p>
              <p className="text-red-400/70 text-xs">Assign operators immediately to avoid crew transport failure</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'in_progress', 'pickup', 'unassigned', 'scheduled', 'completed'].map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                selectedStatus === s
                  ? 'bg-[#BA7517] text-white border-[#BA7517]'
                  : 'bg-[#1C2333] text-[#888] border-[#2A3347] hover:text-white'
              }`}
            >
              {s === 'all' ? `All (${ops.length})` : getStatusLabel(s)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map(op => (
            <div key={op.id} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-semibold">{op.poolId}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg border font-medium ${getStatusStyle(op.status)}`}>
                      {getStatusLabel(op.status)}
                    </span>
                  </div>
                  <p className="text-[#888] text-sm">{op.zone} → {op.airport} · Flight {op.flightTime}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{op.crewCount} crew</p>
                  <p className="text-[#888] text-xs">Pickup {op.pickupTime}</p>
                </div>
              </div>

              {op.status !== 'unassigned' && (
                <div className="flex items-center gap-3 bg-[#0A0E1A] rounded-xl p-3 mb-4 border border-[#2A3347]">
                  <div className="w-8 h-8 bg-[#BA7517]/20 rounded-lg flex items-center justify-center text-[#BA7517] text-xs font-bold">
                    {op.operator.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{op.operator}</p>
                    <p className="text-[#888] text-xs">{op.vehicle}</p>
                  </div>
                  {op.etaAirport !== '—' && (
                    <div className="ml-auto text-right">
                      <p className="text-[#888] text-xs">ETA airport</p>
                      <p className="text-[#BA7517] font-semibold text-sm">{op.etaAirport}</p>
                    </div>
                  )}
                </div>
              )}

              {op.status === 'unassigned' && (
                <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <span className="text-red-400 text-sm">No operator assigned</span>
                  <button className="px-3 py-1 bg-[#BA7517] text-white text-xs font-semibold rounded-lg">
                    Assign now
                  </button>
                </div>
              )}

              {(op.status === 'in_progress' || op.status === 'pickup') && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#888] text-xs">Stop {op.currentStop} of {op.totalStops}</span>
                    <span className="text-[#BA7517] text-xs font-semibold">{Math.round((op.currentStop / op.totalStops) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-[#2A3347] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#BA7517] rounded-full transition-all"
                      style={{ width: `${(op.currentStop / op.totalStops) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}