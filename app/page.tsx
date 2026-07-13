import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form'
import { getAdminProfile } from '@/lib/auth/admin'
import { createClient } from '@/lib/supabase/server'

export default async function AdminAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const profile = await getAdminProfile(supabase, user.id)
    redirect(profile ? '/dashboard' : '/access-denied')
  }

  return <LoginForm />
}
