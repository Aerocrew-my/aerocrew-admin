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
  const [activeTab, setActiveTab] =
    useState<'overview' | 'crew' | 'operators' | 'pending'>('overview')

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

      if (error) throw error

      const allUsers = data || []
      setUsers(allUsers)

      setStats({
        totalCrew: allUsers.filter(u => u.role === 'crew').length,
        totalOperators: allUsers.filter(u => u.role === 'operator').length,
        pendingVerification: allUsers.filter(
          u => u.status === 'pending' || u.status === 'pending_verification'
        ).length,
        verifiedOperators: allUsers.filter(
          u => u.role === 'operator' && u.status === 'verified'
        ).length,
      })
    } catch (e) {
      console.error('Error fetching users:', e)
    }
    setLoading(false)
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
    switch (activeTab) {
      case 'crew':
        return users.filter(u => u.role === 'crew')
      case 'operators':
        return users.filter(u => u.role === 'operator')
      case 'pending':
        return users.filter(
          u => u.status === 'pending' || u.status === 'pending_verification'
        )
      default:
        return users
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-900/30 text-green-400 border-green-500/20'
      case 'pending_verification':
      case 'pending':
        return 'bg-amber-900/30 text-amber-400 border-amber-500/20'
      case 'suspended':
        return 'bg-red-900/30 text-red-400 border-red-500/20'
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500/20'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'Pending docs'
      case 'pending':
        return 'Pending'
      case 'verified':
        return 'Verified'
      default:
        return status
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0E1A]">
      {/* HEADER */}
      <header className="bg-[#1C2333] border-b border-[#2A3347] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#BA7517] rounded-lg flex items-center justify-center" />
            <span className="text-white font-semibold">AeroCrew Admin</span>
            <span className="text-[#2A3347]">|</span>
            <span className="text-[#888] text-sm">Internal dashboard</span>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('aerocrew_admin_auth')
              router.push('/')
            }}
            className="text-[#888] hover:text-white text-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Active crew', value: stats.totalCrew },
            { label: 'Operators', value: stats.totalOperators },
            { label: 'Pending review', value: stats.pendingVerification },
            { label: 'Verified operators', value: stats.verifiedOperators },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-[#1C2333] rounded-2xl border border-[#2A3347] p-4"
            >
              <p className="text-[#888] text-xs uppercase mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* TABS (FIXED — no w-fit) */}
        <div className="flex gap-2 mb-6 bg-[#1C2333] p-1 rounded-xl border border-[#2A3347]">
          {[
            { id: 'overview', label: 'All users' },
            {
              id: 'pending',
              label: `Pending (${stats.pendingVerification})`,
            },
            { id: 'crew', label: `Crew (${stats.totalCrew})` },
            { id: 'operators', label: `Operators (${stats.totalOperators})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm transition ${
                activeTab === tab.id
                  ? 'bg-[#BA7517] text-white'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-[#1C2333] rounded-2xl border border-[#2A3347] overflow-hidden">
          <div className="px-6 py-5 border-b border-[#2A3347] flex justify-between">
            <h2 className="text-white font-semibold">
              {activeTab === 'pending'
                ? 'Pending verifications'
                : activeTab === 'crew'
                ? 'Flight crew'
                : activeTab === 'operators'
                ? 'Van operators'
                : 'All users'}
            </h2>

            <button
              onClick={fetchUsers}
              className="text-[#BA7517] text-sm"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-[#BA7517] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-[#2A3347]">
                    {['Name', 'Email', 'Role', 'Details', 'Status', 'Actions'].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs text-[#888] uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2A3347]">
                  {filteredUsers().map(user => (
                    <tr
                      key={user.id}
                      className="hover:bg-white/5 transition h-14"
                    >
                      <td className="px-6 py-5 text-white">
                        {user.name}
                      </td>

                      <td className="px-6 py-5 text-[#888]">
                        {user.email}
                      </td>

                      <td className="px-6 py-5 text-[#888]">
                        {user.role}
                      </td>

                      <td className="px-6 py-5 text-[#888]">
                        {user.role === 'crew'
                          ? user.airline || '—'
                          : user.vehicle_type || '—'}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`px-2 py-1 text-xs border rounded-lg ${getStatusColor(
                            user.status
                          )}`}
                        >
                          {getStatusLabel(user.status)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-[#888] text-sm">
                        Actions
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}