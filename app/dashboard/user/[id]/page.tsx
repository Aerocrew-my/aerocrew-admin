'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  status: string
  airline?: string
  base_airport?: string
  home_zone?: string
  staff_id?: string
  company_name?: string
  vehicle_type?: string
  plate_number?: string
  coverage_zones?: string
  capacity?: number
  product?: string
  created_at: string
}

export default function UserDetail() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', params.id)
          .single()
        if (error) throw error
        setUser(data)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    }
    void fetchUser()
  }, [params.id])

  const updateStatus = async (status: string) => {
    if (!user) return
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (error) throw error
      setUser({ ...user, status })
    } catch (e) {
      console.error(e)
    }
    setUpdating(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-900/30 text-green-400 border-green-500/20'
      case 'pending_verification':
      case 'pending': return 'bg-amber-900/30 text-amber-400 border-amber-500/20'
      case 'suspended': return 'bg-red-900/30 text-red-400 border-red-500/20'
      case 'rejected': return 'bg-red-900/30 text-red-400 border-red-500/20'
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"/>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--canvas)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-primary)] text-lg font-semibold mb-2">User not found</p>
          <button onClick={() => router.back()} className="text-[var(--primary)] text-sm">← Go back</button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--canvas)]">
      <header className="bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 bg-[var(--canvas)] rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
            >
              ←
            </button>
            <span className="text-[var(--text-primary)] font-semibold">User detail</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-lg font-medium border ${getStatusColor(user.status)}`}>
              {user.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 text-center mb-6">
            <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-2xl flex items-center justify-center text-[var(--primary)] text-2xl font-bold mx-auto mb-4">
              {user.name?.charAt(0) || '?'}
            </div>
            <h2 className="text-[var(--text-primary)] font-bold text-lg">{user.name}</h2>
            <p className="text-[var(--text-secondary)] text-sm mt-1">{user.email}</p>
            {user.phone && <p className="text-[var(--text-secondary)] text-sm">{user.phone}</p>}
            <div className="mt-3">
              <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${
                user.role === 'crew'
                  ? 'bg-blue-900/30 text-blue-400 border-blue-500/20'
                  : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
              }`}>
                {user.role === 'crew' ? 'Flight crew' : 'Van operator'}
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-xs mt-4">
              Joined {new Date(user.created_at).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Actions */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4 space-y-2">
            <p className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider mb-3">Actions</p>
            {(user.status === 'pending' || user.status === 'pending_verification') && (
              <>
                <button
                  onClick={() => updateStatus('verified')}
                  disabled={updating}
                  className="w-full py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-sm font-semibold rounded-xl border border-green-500/20 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => updateStatus('rejected')}
                  disabled={updating}
                  className="w-full py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-sm font-semibold rounded-xl border border-red-500/20 transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
            {user.status === 'verified' && (
              <button
                onClick={() => updateStatus('suspended')}
                disabled={updating}
                className="w-full py-2 bg-[var(--canvas)] hover:bg-[var(--border)] text-[var(--text-secondary)] text-sm font-semibold rounded-xl border border-[var(--border)] transition-colors disabled:opacity-50"
              >
                Suspend account
              </button>
            )}
            {user.status === 'suspended' && (
              <button
                onClick={() => updateStatus('verified')}
                disabled={updating}
                className="w-full py-2 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-sm font-semibold rounded-xl border border-green-500/20 transition-colors disabled:opacity-50"
              >
                Reinstate
              </button>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {user.role === 'crew' && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-[var(--text-primary)] font-semibold mb-4">Crew details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Airline', value: user.airline },
                  { label: 'Base airport', value: user.base_airport },
                  { label: 'Home zone', value: user.home_zone },
                  { label: 'Staff ID', value: user.staff_id },
                  { label: 'Product', value: user.product?.toUpperCase() },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[var(--text-primary)] text-sm font-medium">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {user.role === 'operator' && (
            <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
              <h3 className="text-[var(--text-primary)] font-semibold mb-4">Operator details</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Company name', value: user.company_name },
                  { label: 'Vehicle type', value: user.vehicle_type },
                  { label: 'Plate number', value: user.plate_number },
                  { label: 'Capacity', value: user.capacity ? `${user.capacity} passengers` : undefined },
                  { label: 'Coverage zones', value: user.coverage_zones },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-[var(--text-secondary)] text-xs uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[var(--text-primary)] text-sm font-medium">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents placeholder */}
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6">
            <h3 className="text-[var(--text-primary)] font-semibold mb-4">
              {user.role === 'crew' ? 'Staff ID verification' : 'Submitted documents'}
            </h3>
            <div className="space-y-3">
              {user.role === 'operator' ? (
                ['SSM Certificate', 'PSV Licence', 'Operator Permit', 'Vehicle Insurance'].map(doc => (
                  <div key={doc} className="flex items-center justify-between bg-[var(--canvas)] rounded-xl p-3 border border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E6F1FB]/10 rounded-lg flex items-center justify-center text-[var(--information)] text-xs">📄</div>
                      <span className="text-[var(--text-primary)] text-sm">{doc}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-lg border ${
                      user.status === 'verified'
                        ? 'bg-green-900/30 text-green-400 border-green-500/20'
                        : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
                    }`}>
                      {user.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between bg-[var(--canvas)] rounded-xl p-3 border border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#E6F1FB]/10 rounded-lg flex items-center justify-center text-[var(--information)] text-xs">🪪</div>
                    <span className="text-[var(--text-primary)] text-sm">Staff ID photo</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg border ${
                    user.status === 'verified'
                      ? 'bg-green-900/30 text-green-400 border-green-500/20'
                      : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
                  }`}>
                    {user.status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
