import { PlaneTakeoff, ShieldX } from 'lucide-react'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import { ThemeToggle } from '@/components/admin/theme-toggle'
import { getAdminProfile } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AccessDeniedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const profile = await getAdminProfile(supabase, user.id)
  if (profile) redirect('/dashboard')

  return (
    <main className="login-page">
      <div className="login-theme"><ThemeToggle /></div>
      <div className="login-wrap">
        <div className="login-brand"><span><PlaneTakeoff size={21} aria-hidden="true" /></span><div><strong>AeroCrew</strong><small>Operations Control</small></div></div>
        <section className="login-card denied-card">
          <div className="login-icon denied-icon"><ShieldX size={20} aria-hidden="true" /></div>
          <p className="page-eyebrow">Authorisation required</p>
          <h1>Access denied</h1>
          <p>This account is authenticated but is not authorised for the AeroCrew operations portal. Contact an administrator if access is required.</p>
          <form action={signOut}><button type="submit">Sign out</button></form>
        </section>
      </div>
    </main>
  )
}
