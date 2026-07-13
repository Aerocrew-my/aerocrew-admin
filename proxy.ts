import { type NextRequest, NextResponse } from 'next/server'
import { getAdminProfile } from '@/lib/auth/admin'
import { createProxyClient } from '@/lib/supabase/proxy'

export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createProxyClient(request)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/'
    loginUrl.search = ''
    return NextResponse.redirect(loginUrl)
  }

  const profile = await getAdminProfile(supabase, user.id)
  if (!profile) {
    const deniedUrl = request.nextUrl.clone()
    deniedUrl.pathname = '/access-denied'
    deniedUrl.search = ''
    return NextResponse.redirect(deniedUrl)
  }

  const response = getResponse()
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
