import { requirePermission } from '@/lib/auth/authorize'
export default async function AuditLayout({children}:{children:React.ReactNode}) { await requirePermission('audit:read'); return children }
