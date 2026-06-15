'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  airline?: string
  vehicle_type?: string
  coverage_zones?: string
  created_at: string
}

export default function Dashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pools, setPools] = useState<any[]>([])
  const [showPools, setShowPools] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'crew' | 'operators' | 'pending'>('overview')
  const [stats, setStats] = useState({
    totalCrew: 0,
    totalOperators: 0,
    pendingVerification: 0,
    verifiedOperators: 0,
  })

  useEffect(() => {
    const auth = localStorage.getItem('aerocrew_admin_auth')
    if (!auth) {
      router.push('/')
      return
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
  setLoading(true)

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })

    if (error) {
  console.log("SUPABASE ERROR MESSAGE:", error.message)
  console.log("SUPABASE ERROR DETAILS:", error.details)
  console.log("SUPABASE ERROR HINT:", error.hint)
  console.log("SUPABASE ERROR CODE:", error.code)
  return
}

    const allUsers = data || []

console.log("RAW DATA:", data)
console.log("USER COUNT:", data?.length)

setUsers(allUsers)

    setStats({
      totalCrew: allUsers.filter(u => u.role === 'crew').length,
      totalOperators: allUsers.filter(u => u.role === 'operator').length,
      pendingVerification: allUsers.filter(u =>
        u.status === 'pending' || u.status === 'pending_verification'
      ).length,
      verifiedOperators: allUsers.filter(u =>
        u.role === 'operator' && u.status === 'verified'
      ).length,
    })

  } catch (e) {
    console.error("FETCH FAILED:", e)
  } finally {
    setLoading(false)
  }
}

  const fetchPools = async () => {
  try {
    const { data, error } = await supabase
      .from('active_pools')
      .select('*')
      .limit(20)

    if (error) {
      console.log("POOL ERROR MESSAGE:", error.message)
      console.log("POOL ERROR DETAILS:", error.details)
      console.log("POOL ERROR HINT:", error.hint)
      console.log("POOL ERROR CODE:", error.code)
      return
    }

    console.log("POOLS FOUND:", data)

    setPools(data || [])
    setShowPools(true)

  } catch (e) {
    console.error("FETCH POOLS FAILED:", e)
  }
}

  const updateStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId)
      if (error) throw error
      fetchUsers()
    } catch (e) {
      console.error('Error updating status:', e)
    }
  }

  const filteredUsers = () => {
    let list = users
    switch (activeTab) {
      case 'crew': list = users.filter(u => u.role === 'crew'); break
      case 'operators': list = users.filter(u => u.role === 'operator'); break
      case 'pending': list = users.filter(u =>
        u.status === 'pending' || u.status === 'pending_verification'
      ); break
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      )
    }
    return list
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-900/30 text-green-400 border-green-500/20'
      case 'pending_verification':
      case 'pending': return 'bg-amber-900/30 text-amber-400 border-amber-500/20'
      case 'suspended': return 'bg-red-900/30 text-red-400 border-red-500/20'
      default: return 'bg-gray-900/30 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_verification': return 'Pending docs'
      case 'pending': return 'Pending'
      case 'verified': return 'Verified'
      case 'suspended': return 'Suspended'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#BA7517] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <span className="text-white font-semibold">AeroCrew Admin</span>
            <span className="text-[#2A3347] mx-2">|</span>
            <span className="text-[#888] text-sm">Internal dashboard</span>
          </div>
          <div className="flex items-center gap-4">
             <button
              onClick={() => router.push('/dashboard/revenue')}
              className="text-[#BA7517] hover:text-[#E8920A] text-sm transition-colors font-medium"
            >
              Revenue
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="text-[#378ADD] hover:text-blue-300 text-sm transition-colors font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => router.push('/dashboard/zones')}
              className="text-[#1D9E75] hover:text-green-300 text-sm transition-colors font-medium"
            >
              Zones
            </button>
            <button
              onClick={() => router.push('/dashboard/operations')}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors font-medium"
            >
              Operations
            </button>
            <button
              onClick={() => router.push('/dashboard/leaderboard')}
              className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors font-medium"
            >
              Leaderboard
            </button>
            <button
              onClick={() => router.push('/dashboard/reconciliation')}
              className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors font-medium"
            >
              Payouts
            </button>
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="text-pink-400 hover:text-pink-300 text-sm transition-colors font-medium"
            >
              Notify
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="text-[#378ADD] hover:text-blue-300 text-sm transition-colors font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => router.push('/dashboard/zones')}
              className="text-[#1D9E75] hover:text-green-300 text-sm transition-colors font-medium"
            >
              Zones
            </button>
            <button
              onClick={() => router.push('/dashboard/analytics')}
              className="text-[#378ADD] hover:text-blue-300 text-sm transition-colors font-medium"
            >
              Analytics
            </button>
            <button
              onClick={() => router.push('/dashboard/zones')}
              className="text-[#1D9E75] hover:text-green-300 text-sm transition-colors font-medium"
            >
              Zones
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('aerocrew_admin_auth')
                router.push('/')
              }}
              className="text-[#888] hover:text-white text-sm transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Active crew', value: stats.totalCrew, color: 'text-white' },
            { label: 'Operators', value: stats.totalOperators, color: 'text-white' },
            { label: 'Pending review', value: stats.pendingVerification, color: 'text-amber-400' },
            { label: 'Verified operators', value: stats.verifiedOperators, color: 'text-green-400' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-5">
              <p className="text-[#888] text-xs font-semibold tracking-widest uppercase mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by name or email..."
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1C2333] border border-[#2A3347] rounded-xl px-4 py-2 text-white text-sm placeholder-[#555] focus:outline-none focus:border-[#BA7517] transition-colors w-72"
          />
        </div>
        <div className="flex gap-2 mb-6 bg-[#1C2333] p-1 rounded-xl border border-[#2A3347] w-fit">
          {[
            { id: 'overview', label: 'All users' },
            { id: 'pending', label: `Pending (${stats.pendingVerification})` },
            { id: 'crew', label: `Crew (${stats.totalCrew})` },
            { id: 'operators', label: `Operators (${stats.totalOperators})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'crew' | 'operators' | 'pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-[#BA7517] text-white' : 'text-[#888] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2A3347] flex items-center justify-between">
            <h2 className="text-white font-semibold">
              {activeTab === 'pending' ? 'Pending verifications' :
               activeTab === 'crew' ? 'Flight crew' :
               activeTab === 'operators' ? 'Van operators' : 'All users'}
            </h2>
            <div className="flex items-center gap-4">
              <button onClick={fetchUsers} className="text-[#BA7517] text-sm hover:text-[#E8920A] transition-colors">
                Refresh
              </button>
              <button onClick={fetchPools} className="text-[#378ADD] text-sm hover:text-blue-300 transition-colors">
                View pools
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-[#BA7517] border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : filteredUsers().length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#888]">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2A3347]">
                    {['Name', 'Email', 'Role', 'Details', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A3347]">
                  {filteredUsers().map((user) => (
                    <tr key={user.id} className="hover:bg-[#ffffff05] transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/user/${user.id}`)}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#BA7517]/20 flex items-center justify-center text-[#BA7517] text-xs font-bold flex-shrink-0">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-white text-sm font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#888] text-sm">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${
                          user.role === 'crew'
                            ? 'bg-blue-900/30 text-blue-400 border-blue-500/20'
                            : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
                        }`}>
                          {user.role === 'crew' ? 'Flight crew' : 'Van operator'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#888] text-sm">
                        {user.role === 'crew' ? user.airline || '—' : user.vehicle_type || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${getStatusColor(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {(user.status === 'pending' || user.status === 'pending_verification') && (
                            <>
                              <button
                                onClick={() => updateStatus(user.id, 'verified')}
                                className="px-3 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(user.id, 'rejected')}
                                className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 text-red-400 text-xs font-semibold rounded-lg border border-red-500/20 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {user.status === 'verified' && (
                            <button
                              onClick={() => updateStatus(user.id, 'suspended')}
                              className="px-3 py-1 bg-[#1C2333] hover:bg-[#2A3347] text-[#888] text-xs font-semibold rounded-lg border border-[#2A3347] transition-colors"
                            >
                              Suspend
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => updateStatus(user.id, 'verified')}
                              className="px-3 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 text-xs font-semibold rounded-lg border border-green-500/20 transition-colors"
                            >
                              Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showPools && (
          <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-[#2A3347] flex items-center justify-between">
              <h2 className="text-white font-semibold">Active matching pools</h2>
              <button
                onClick={() => setShowPools(false)}
                className="text-[#888] hover:text-white text-sm transition-colors"
              >
                Hide
              </button>
            </div>
            {pools.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#888]">No active pools yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2A3347]">
                      {['Airport', 'Zone', 'Date', 'Window', 'Crew', 'Operator', 'Status'].map(h => (
                        <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#888] uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A3347]">
                    {pools.map((pool) => (
                      <tr key={pool.id} className="hover:bg-[#ffffff05]">
                        <td className="px-6 py-4 text-white text-sm font-medium">{pool.airport}</td>
                        <td className="px-6 py-4 text-[#888] text-sm">{pool.zone}</td>
                        <td className="px-6 py-4 text-[#888] text-sm">{pool.flight_date}</td>
                        <td className="px-6 py-4 text-[#888] text-sm">{pool.departure_window_start} – {pool.departure_window_end}</td>
                        <td className="px-6 py-4">
                          <span className="text-white font-semibold">{pool.current_count}</span>
                          <span className="text-[#888] text-sm">/{pool.max_capacity}</span>
                        </td>
                        <td className="px-6 py-4 text-[#888] text-sm">{pool.operator_name || '—'}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-lg font-medium border ${
                            pool.status === 'assigned'
                              ? 'bg-green-900/30 text-green-400 border-green-500/20'
                              : 'bg-amber-900/30 text-amber-400 border-amber-500/20'
                          }`}>
                            {pool.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}