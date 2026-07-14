import { requirePermission } from '@/lib/auth/authorize'
export default async function MatchingLayout({children}:{children:React.ReactNode}) { await requirePermission('matching:read'); return children }
