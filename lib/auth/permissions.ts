import type { AdminRole } from './admin'

export type Permission = 'trips:read' | 'matching:read' | 'operators:read' | 'vehicles:read' | 'incidents:read' | 'payments:read' | 'audit:read' | 'configuration:manage' | 'users:provision'
const rolePermissions: Record<AdminRole, ReadonlySet<Permission>> = {
  super_admin: new Set(['trips:read','matching:read','operators:read','vehicles:read','incidents:read','payments:read','audit:read','configuration:manage','users:provision']),
  operations_admin: new Set(['trips:read','matching:read','operators:read','vehicles:read','incidents:read','audit:read']),
  dispatcher: new Set(['trips:read','matching:read']),
  support: new Set(['trips:read','incidents:read']),
}
export const hasPermission = (role: AdminRole, permission: Permission) => rolePermissions[role].has(permission)
