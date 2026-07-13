import type { SupabaseClient, User } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const ADMIN_ROLES = [
  'super_admin',
  'operations_admin',
  'dispatcher',
  'support',
] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export type AdminProfile = {
  user_id: string
  role: AdminRole
  status: 'active' | 'disabled'
  created_at: string
}

export async function getAdminProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AdminProfile | null> {
  const { data, error } = await supabase
    .from('admin_profiles')
    .select('user_id, role, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !data || !ADMIN_ROLES.includes(data.role as AdminRole)) return null
  return data as AdminProfile
}

export async function getCurrentAdmin(): Promise<{
  user: User
  profile: AdminProfile
} | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profile = await getAdminProfile(supabase, user.id)
  return profile ? { user, profile } : null
}

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  const profile = await getAdminProfile(supabase, user.id)
  if (!profile) redirect('/access-denied')

  return { user, profile }
}
