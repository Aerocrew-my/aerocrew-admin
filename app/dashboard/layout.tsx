import { AppShell } from '@/components/admin/app-shell'
import { requireAdmin } from '@/lib/auth/admin'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await requireAdmin()
  return <AppShell email={user.email ?? 'Admin'} role={profile.role}>{children}</AppShell>
}
