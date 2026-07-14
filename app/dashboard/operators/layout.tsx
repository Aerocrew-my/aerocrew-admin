import { requirePermission } from '@/lib/auth/authorize'
export default async function OperatorsLayout({children}:{children:React.ReactNode}) { await requirePermission('operators:read'); return children }
