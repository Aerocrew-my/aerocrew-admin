import { requirePermission } from '@/lib/auth/authorize'
export default async function TripsLayout({children}:{children:React.ReactNode}) { await requirePermission('trips:read'); return children }
