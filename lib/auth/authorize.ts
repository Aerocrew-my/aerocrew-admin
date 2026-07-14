import 'server-only'
import { redirect } from 'next/navigation'
import { requireAdmin } from './admin'
import { hasPermission, type Permission } from './permissions'

export async function requirePermission(permission: Permission) {
  const admin = await requireAdmin()
  if (!hasPermission(admin.profile.role, permission)) redirect('/access-denied')
  return admin
}
