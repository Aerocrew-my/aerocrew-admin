'use client'

import { Card, EmptyState, LoadingState, Metric, PageHeader, StatusBadge } from '@/components/admin/ui'
import { supabase } from '@/lib/supabase'
import { AlertTriangle, ArrowRight, RefreshCw, Search } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'

type UserStatus = 'pending' | 'pending_verification' | 'verified' | 'suspended' | 'rejected' | string

interface UserRecord {
  id: string
  name: string | null
  email: string | null
  role: string
  status: UserStatus
  airline?: string | null
  vehicle_type?: string | null
  created_at: string
}

interface ActivePool {
  id: string
  airport: string | null
  zone: string | null
  flight_date: string | null
  departure_window_start: string | null
  departure_window_end: string | null
  current_count: number | null
  max_capacity: number | null
  operator_name: string | null
  status?: string | null
}

type View = 'all' | 'crew' | 'operators' | 'pending'

const isPending = (status: string) => status === 'pending' || status === 'pending_verification'

function statusTone(status: string): 'neutral' | 'success' | 'warning' | 'danger' {
  if (status === 'verified') return 'success'
  if (isPending(status)) return 'warning'
  if (status === 'suspended' || status === 'rejected') return 'danger'
  return 'neutral'
}

function statusLabel(status: string) {
  if (status === 'pending_verification') return 'Pending documents'
  return status.replaceAll('_', ' ').replace(/^./, (character) => character.toUpperCase())
}

function DashboardOverviewContent() {
  const searchParams = useSearchParams()
  const requestedView = searchParams.get('view')
  const initialView: View = requestedView === 'crew' || requestedView === 'operators' || requestedView === 'pending' ? requestedView : 'all'
  const [selectedView, setSelectedView] = useState<View | null>(null)
  const view = selectedView ?? initialView
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState<UserRecord[]>([])
  const [pools, setPools] = useState<ActivePool[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [usersResult, poolsResult] = await Promise.all([
      supabase.from('users').select('*').neq('role', 'admin').order('created_at', { ascending: false }),
      supabase.from('active_pools').select('*').limit(20),
    ])

    if (usersResult.error) setError(`User records could not be loaded: ${usersResult.error.message}`)
    else setUsers((usersResult.data ?? []) as UserRecord[])

    if (poolsResult.error) {
      setError((current) => current ?? `Transport requirements could not be loaded: ${poolsResult.error.message}`)
    } else {
      setPools((poolsResult.data ?? []) as ActivePool[])
    }

    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => {
    // Initial client fetch synchronises the connected Supabase records with this view.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData()
  }, [loadData])

  const refreshData = () => {
    setRefreshing(true)
    setError(null)
    void loadData()
  }

  const stats = useMemo(() => ({
    crew: users.filter((user) => user.role === 'crew').length,
    operators: users.filter((user) => user.role === 'operator').length,
    pending: users.filter((user) => isPending(user.status)).length,
    accepting: users.filter((user) => user.role === 'operator' && user.status === 'verified').length,
    unmatched: pools.filter((pool) => !pool.operator_name).length,
    active: pools.filter((pool) => pool.status !== 'completed' && pool.status !== 'cancelled').length,
  }), [pools, users])

  const filteredUsers = useMemo(() => users.filter((user) => {
    if (view === 'crew' && user.role !== 'crew') return false
    if (view === 'operators' && user.role !== 'operator') return false
    if (view === 'pending' && !isPending(user.status)) return false
    if (!search.trim()) return true
    const value = `${user.name ?? ''} ${user.email ?? ''}`.toLowerCase()
    return value.includes(search.trim().toLowerCase())
  }), [search, users, view])

  const updateStatus = async (userId: string, status: UserStatus) => {
    setUpdatingId(userId)
    setError(null)
    const { error: updateError } = await supabase
      .from('users')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (updateError) setError(`Status was not updated: ${updateError.message}`)
    else setUsers((current) => current.map((user) => user.id === userId ? { ...user, status } : user))
    setUpdatingId(null)
  }

  return (
    <div className="overview-page">
      <PageHeader
        eyebrow="Monday · Operational day"
        title="Operations overview"
        description="Prioritise transport requirements and operator readiness. Counts below come from the connected AeroCrew data tables."
        actions={
          <button className="button secondary" type="button" onClick={refreshData} disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? 'spin' : ''} aria-hidden="true" />
            {refreshing ? 'Refreshing' : 'Refresh data'}
          </button>
        }
      />

      {error && <div className="notice danger" role="alert"><AlertTriangle size={17} aria-hidden="true" /><span>{error}</span></div>}

      <Card className="priority-metrics" aria-label="Operational priorities">
        <Metric label="Requires attention" value={stats.unmatched + stats.pending} detail="Unmatched demand + pending reviews" tone={stats.unmatched + stats.pending > 0 ? 'danger' : 'success'} href="#attention" />
        <Metric label="Unmatched requirements" value={stats.unmatched} detail="No operator on active pool" tone={stats.unmatched > 0 ? 'warning' : 'success'} href="#requirements" />
        <Metric label="Active transport pools" value={stats.active} detail="Current Supabase records" tone="info" href="#requirements" />
        <Metric label="Late pickup risks" value="—" detail="Requires live trip telemetry" />
        <Metric label="Open incidents" value="—" detail="Incident service not connected" />
      </Card>

      <div className="overview-grid" id="attention">
        <Card className="attention-card">
          <div className="card-heading"><div><span>Priority queue</span><h2>Trips requiring attention</h2></div><StatusBadge tone={stats.unmatched ? 'danger' : 'success'}>{stats.unmatched ? `${stats.unmatched} open` : 'Clear'}</StatusBadge></div>
          {loading ? <LoadingState label="Loading requirements" /> : stats.unmatched === 0 ? (
            <EmptyState title="No unmatched requirements" description="All currently loaded transport pools have an operator recorded." />
          ) : (
            <div className="attention-list">
              {pools.filter((pool) => !pool.operator_name).slice(0, 4).map((pool) => (
                <div className="attention-row" key={pool.id}>
                  <span className="risk-marker" aria-hidden="true" />
                  <div><strong>{pool.zone ?? 'Zone not set'} → {pool.airport ?? 'Airport not set'}</strong><small>{pool.flight_date ?? 'Date unavailable'} · {pool.current_count ?? 0} crew</small></div>
                  <StatusBadge tone="danger">Unmatched</StatusBadge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="readiness-card">
          <div className="card-heading"><div><span>Network readiness</span><h2>Operator and verification status</h2></div></div>
          <div className="readiness-list">
            <Link href="/dashboard?view=operators#records"><span>Verified operators</span><strong>{stats.accepting}</strong><small>Eligibility only; live availability is not connected</small></Link>
            <Link href="/dashboard?view=pending#records"><span>Pending operator verification</span><strong className={stats.pending ? 'warning-text' : ''}>{stats.pending}</strong><small>All pending crew and operator records</small></Link>
            <div><span>Payment exceptions</span><strong>—</strong><small>Reconciliation exception feed not connected</small></div>
            <div><span>Upcoming peak periods</span><strong>—</strong><small>Roster demand forecast not connected</small></div>
          </div>
        </Card>
      </div>

      <Card className="requirements-card" id="requirements">
        <div className="card-heading"><div><span>Current data</span><h2>Active transport requirements</h2></div><Link href="/dashboard/operations" className="text-link">Open Live Operations <ArrowRight size={14} /></Link></div>
        {loading ? <LoadingState label="Loading transport pools" /> : pools.length === 0 ? (
          <EmptyState title="No active transport requirements" description="The connected active_pools table returned no records." />
        ) : (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Route</th><th>Date and window</th><th>Crew</th><th>Operator</th><th>Status</th></tr></thead><tbody>
            {pools.slice(0, 8).map((pool) => <tr key={pool.id}><td><strong>{pool.zone ?? '—'} → {pool.airport ?? '—'}</strong></td><td>{pool.flight_date ?? '—'}<small>{pool.departure_window_start ?? '—'} – {pool.departure_window_end ?? '—'}</small></td><td>{pool.current_count ?? 0}/{pool.max_capacity ?? '—'}</td><td>{pool.operator_name ?? 'Not assigned'}</td><td><StatusBadge tone={pool.operator_name ? 'info' : 'danger'}>{pool.operator_name ? statusLabel(pool.status ?? 'active') : 'Unmatched'}</StatusBadge></td></tr>)}
          </tbody></table></div>
        )}
      </Card>

      <Card className="records-card" id="records">
        <div className="records-toolbar">
          <div><span>Connected records</span><h2>Crew and operators</h2></div>
          <label className="search-input"><Search size={16} aria-hidden="true" /><span className="sr-only">Search records</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" /></label>
        </div>
        <div className="tabs" role="tablist" aria-label="Record filters">
          {([{ id: 'all', label: `All (${users.length})` }, { id: 'pending', label: `Pending (${stats.pending})` }, { id: 'crew', label: `Crew (${stats.crew})` }, { id: 'operators', label: `Operators (${stats.operators})` }] as { id: View; label: string }[]).map((tab) => (
            <button key={tab.id} role="tab" type="button" aria-selected={view === tab.id} className={view === tab.id ? 'active' : ''} onClick={() => setSelectedView(tab.id)}>{tab.label}</button>
          ))}
        </div>
        {loading ? <LoadingState label="Loading crew and operator records" /> : filteredUsers.length === 0 ? (
          <EmptyState title="No matching records" description="Try another search or record filter." />
        ) : (
          <div className="table-scroll"><table className="data-table"><thead><tr><th>Name</th><th>Role</th><th>Operational detail</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
            {filteredUsers.map((user) => <tr key={user.id}><td><Link href={`/dashboard/user/${user.id}`} className="record-name"><span>{user.name?.charAt(0) || '?'}</span><div><strong>{user.name || 'Unnamed record'}</strong><small>{user.email || 'No email'}</small></div></Link></td><td>{user.role === 'crew' ? 'Flight crew' : user.role === 'operator' ? 'Operator' : user.role}</td><td>{user.role === 'crew' ? user.airline || 'Not provided' : user.vehicle_type || 'Not provided'}</td><td><StatusBadge tone={statusTone(user.status)}>{statusLabel(user.status)}</StatusBadge></td><td className="row-actions">{isPending(user.status) ? <><button type="button" className="small-action approve" disabled={updatingId === user.id} onClick={() => void updateStatus(user.id, 'verified')}>Approve</button><button type="button" className="small-action reject" disabled={updatingId === user.id} onClick={() => void updateStatus(user.id, 'rejected')}>Reject</button></> : <Link href={`/dashboard/user/${user.id}`} className="small-action">View</Link>}</td></tr>)}
          </tbody></table></div>
        )}
      </Card>
    </div>
  )
}

export default function DashboardOverview() {
  return (
    <Suspense fallback={<Card><LoadingState label="Preparing operations overview" /></Card>}>
      <DashboardOverviewContent />
    </Suspense>
  )
}
