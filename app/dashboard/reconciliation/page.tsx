'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_PAYOUTS = [
  { id: 'PAY-001', operator: 'Ahmad Hassan', period: 'Jun W1 2026', trips: 18, gross: 1620, commission: 243, net: 1377, status: 'paid', date: '16 Jun 2026', bank: 'Maybank · 1234-XXXX' },
  { id: 'PAY-002', operator: 'Rahman Drivers', period: 'Jun W1 2026', trips: 14, gross: 1960, commission: 294, net: 1666, status: 'paid', date: '16 Jun 2026', bank: 'CIMB · 5678-XXXX' },
  { id: 'PAY-003', operator: 'Khairul Transport', period: 'Jun W1 2026', trips: 11, gross: 990, commission: 148.5, net: 841.5, status: 'pending', date: '23 Jun 2026', bank: 'Public Bank · 9012-XXXX' },
  { id: 'PAY-004', operator: 'Farouk Van Services', period: 'Jun W1 2026', trips: 9, gross: 810, commission: 121.5, net: 688.5, status: 'pending', date: '23 Jun 2026', bank: 'RHB · 3456-XXXX' },
  { id: 'PAY-005', operator: 'Asyraf Transport', period: 'May W4 2026', trips: 16, gross: 1440, commission: 216, net: 1224, status: 'paid', date: '9 Jun 2026', bank: 'Maybank · 7890-XXXX' },
]

export default function ReconciliationPage() {
  const router = useRouter()
  const [payouts, setPayouts] = useState(DEMO_PAYOUTS)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter)
  const totalGross = payouts.reduce((s, p) => s + p.gross, 0)
  const totalCommission = payouts.reduce((s, p) => s + p.commission, 0)
  const totalNet = payouts.reduce((s, p) => s + p.net, 0)
  const pendingAmount = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.net, 0)

  const markPaid = (id: string) => {
    setPayouts(payouts.map(p => p.id === id ? { ...p, status: 'paid', date: new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) } : p))
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-8 h-8 bg-[var(--canvas)] rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors text-sm"
          >←</button>
          <span className="text-[var(--text-primary)] font-semibold">Financial reconciliation</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total gross', value: `RM${totalGross.toLocaleString()}`, color: 'text-[var(--text-primary)]' },
            { label: 'Total commission', value: `RM${totalCommission.toLocaleString()}`, color: 'text-[var(--primary)]' },
            { label: 'Operator payouts', value: `RM${Math.round(totalNet).toLocaleString()}`, color: 'text-green-400' },
            { label: 'Pending payout', value: `RM${Math.round(pendingAmount).toLocaleString()}`, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
              <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-2">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {['all', 'pending', 'paid'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                filter === f
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
              }`}
            >
              {f === 'all' ? `All (${payouts.length})` : `${f} (${payouts.filter(p => p.status === f).length})`}
            </button>
          ))}
        </div>

        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                {['Payout ID', 'Operator', 'Period', 'Trips', 'Gross', 'Commission (15%)', 'Net payout', 'Bank', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#ffffff05]">
                  <td className="px-4 py-4 text-[var(--text-secondary)] text-xs font-mono">{p.id}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)] text-sm font-medium">{p.operator}</td>
                  <td className="px-4 py-4 text-[var(--text-secondary)] text-xs">{p.period}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)] text-sm">{p.trips}</td>
                  <td className="px-4 py-4 text-[var(--text-primary)] text-sm">RM{p.gross.toLocaleString()}</td>
                  <td className="px-4 py-4 text-[var(--primary)] text-sm">−RM{p.commission.toLocaleString()}</td>
                  <td className="px-4 py-4 text-green-400 text-sm font-semibold">RM{Math.round(p.net).toLocaleString()}</td>
                  <td className="px-4 py-4 text-[var(--text-secondary)] text-xs">{p.bank}</td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-lg border font-medium ${
                      p.status === 'paid'
                        ? 'bg-green-900/30 text-green-400 border-green-500/20'
                        : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
                    }`}>
                      {p.status === 'paid' ? `Paid ${p.date}` : `Due ${p.date}`}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {p.status === 'pending' && (
                      <button
                        onClick={() => markPaid(p.id)}
                        className="px-3 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 transition-colors"
                      >
                        Mark paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
