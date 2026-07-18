export type TripStatus = 'draft' | 'requested' | 'matching' | 'assigned' | 'accepted' | 'driverEnRoute' | 'driverArrived' | 'boarding' | 'inTransit' | 'arrived' | 'completed' | 'cancelled' | 'failed'
export type AssignmentStatus = 'unassigned' | 'proposed' | 'assigned' | 'accepted' | 'rejected' | 'reassignmentRequired'
export type ServiceType = 'aeroPool' | 'aeroFlex' | 'aeroSolo'
export type PaymentStatus = 'pending' | 'authorised' | 'paid' | 'failed' | 'refunded'

export interface PickupStop { id: string; address: string; zone: string | null; scheduledAt: Date | null; sequence: number; completedAt: Date | null }
export interface CrewSummary { id: string; name: string | null; airline: string | null; staffId: string | null }
export interface OperatorSummary { id: string; name: string | null; companyName: string | null; status: string | null }
export interface VehicleSummary { id: string; registration: string | null; type: string | null; capacity: number | null }
export interface Trip {
  id: string; status: TripStatus; assignmentStatus: AssignmentStatus; serviceType: ServiceType
  airport: string | null; terminal: string | null; pickupZone: string | null
  pickupAt: Date | null; requiredArrivalAt: Date | null; createdAt: Date | null; updatedAt: Date | null
  crew: CrewSummary[]; pickupStops: PickupStop[]; operator: OperatorSummary | null
  driverName: string | null; vehicle: VehicleSummary | null; paymentStatus: PaymentStatus | null
  incidentIds: string[]; auditEventIds: string[]
}
export interface TransportRequirement { id: string; tripId: string | null; assignmentStatus: AssignmentStatus; serviceType: ServiceType; pickupZone: string | null; pickupAt: Date | null; requiredArrivalAt: Date | null; airport: string | null; terminal: string | null; crewCount: number; createdAt: Date | null }
export interface Incident { id: string; tripId: string | null; status: 'open' | 'investigating' | 'resolved' | 'closed'; category: string | null; summary: string | null; createdAt: Date | null; resolvedAt: Date | null }
export interface PaymentRecord { id: string; tripId: string | null; status: PaymentStatus; amountMinor: number; currency: string; createdAt: Date | null; updatedAt: Date | null }
export interface AuditEvent { id: string; actorAdminId: string; actorRole: string; action: string; entityType: string; entityId: string; previousValue: unknown; newValue: unknown; reason: string | null; createdAt: Date | null; ipAddress: string | null; metadata: Record<string, unknown> }

type UnknownRecord = Record<string, unknown>
const record = (value: unknown): UnknownRecord => value && typeof value === 'object' ? value as UnknownRecord : {}
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : null
const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null
export function asDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    const parsed = (value as { toDate(): Date }).toDate(); return Number.isNaN(parsed.valueOf()) ? null : parsed
  }
  if (typeof value === 'string' || typeof value === 'number') { const parsed = new Date(value); return Number.isNaN(parsed.valueOf()) ? null : parsed }
  return null
}
const oneOf = <T extends string>(value: unknown, values: readonly T[], fallback: T): T => values.includes(value as T) ? value as T : fallback
const tripStatuses: readonly TripStatus[] = ['draft','requested','matching','assigned','accepted','driverEnRoute','driverArrived','boarding','inTransit','arrived','completed','cancelled','failed']
const assignmentStatuses: readonly AssignmentStatus[] = ['unassigned','proposed','assigned','accepted','rejected','reassignmentRequired']
const serviceTypes: readonly ServiceType[] = ['aeroPool','aeroFlex','aeroSolo']
const paymentStatuses: readonly PaymentStatus[] = ['pending','authorised','paid','failed','refunded']
const stringArray = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []

export function parseTrip(id: string, value: unknown): Trip {
  const data = record(value); const assignment = record(data.assignment)
  const crew = Array.isArray(data.crew) ? data.crew.map((item) => { const c = record(item); return { id: text(c.id) ?? '', name: text(c.name), airline: text(c.airline), staffId: text(c.staffId) } }).filter(c => c.id) : []
  const pickupStops = Array.isArray(data.pickupStops) ? data.pickupStops.map((item, index) => { const s = record(item); return { id: text(s.id) ?? String(index), address: text(s.address) ?? 'Address unavailable', zone: text(s.zone), scheduledAt: asDate(s.scheduledAt), sequence: number(s.sequence) ?? index, completedAt: asDate(s.completedAt) } }) : []
  const operatorData = record(assignment.operator ?? data.operator); const vehicleData = record(assignment.vehicle ?? data.vehicle)
  return { id, status: oneOf(data.status, tripStatuses, 'draft'), assignmentStatus: oneOf(assignment.status ?? data.assignmentStatus, assignmentStatuses, 'unassigned'), serviceType: oneOf(data.serviceType, serviceTypes, 'aeroFlex'), airport: text(data.airport), terminal: text(data.terminal), pickupZone: text(data.pickupZone), pickupAt: asDate(data.pickupAt), requiredArrivalAt: asDate(data.requiredArrivalAt), createdAt: asDate(data.createdAt), updatedAt: asDate(data.updatedAt), crew, pickupStops, operator: text(operatorData.id) ? { id: text(operatorData.id)!, name: text(operatorData.name), companyName: text(operatorData.companyName), status: text(operatorData.status) } : null, driverName: text(assignment.driverName ?? data.driverName), vehicle: text(vehicleData.id) ? { id: text(vehicleData.id)!, registration: text(vehicleData.registration), type: text(vehicleData.type), capacity: number(vehicleData.capacity) } : null, paymentStatus: data.paymentStatus ? oneOf(data.paymentStatus, paymentStatuses, 'pending') : null, incidentIds: stringArray(data.incidentIds), auditEventIds: stringArray(data.auditEventIds) }
}

export function parseRequirement(id: string, value: unknown): TransportRequirement { const d=record(value); return { id, tripId:text(d.tripId), assignmentStatus:oneOf(d.assignmentStatus,assignmentStatuses,'unassigned'), serviceType:oneOf(d.serviceType,serviceTypes,'aeroFlex'), pickupZone:text(d.pickupZone), pickupAt:asDate(d.pickupAt), requiredArrivalAt:asDate(d.requiredArrivalAt), airport:text(d.airport), terminal:text(d.terminal), crewCount:number(d.crewCount) ?? 0, createdAt:asDate(d.createdAt) } }
export function parseIncident(id: string, value: unknown): Incident { const d=record(value); return { id, tripId:text(d.tripId), status:oneOf(d.status,['open','investigating','resolved','closed'] as const,'open'), category:text(d.category), summary:text(d.summary), createdAt:asDate(d.createdAt), resolvedAt:asDate(d.resolvedAt) } }
export function parseAuditEvent(id: string, value: unknown): AuditEvent { const d=record(value); return { id, actorAdminId:text(d.actorAdminId) ?? 'unknown', actorRole:text(d.actorRole) ?? 'unknown', action:text(d.action) ?? 'unknown', entityType:text(d.entityType) ?? 'unknown', entityId:text(d.entityId) ?? 'unknown', previousValue:d.previousValue ?? null, newValue:d.newValue ?? null, reason:text(d.reason), createdAt:asDate(d.createdAt), ipAddress:text(d.ipAddressOptional ?? d.ipAddress), metadata:record(d.metadata) } }

export const tripStatusLabel = (status: TripStatus) => ({ draft:'Draft', requested:'Requested', matching:'Matching', assigned:'Assigned', accepted:'Accepted', driverEnRoute:'Driver En Route', driverArrived:'Driver Arrived', boarding:'Boarding', inTransit:'In Transit', arrived:'Arrived', completed:'Completed', cancelled:'Cancelled', failed:'Failed' })[status]
