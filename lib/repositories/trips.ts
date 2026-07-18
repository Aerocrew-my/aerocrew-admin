import 'server-only'
import { FieldPath, Timestamp, type Query } from 'firebase-admin/firestore'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { parseTrip, type ServiceType, type Trip, type TripStatus } from '@/lib/domain/operations'

export interface TripFilters { search?: string; status?: TripStatus; airport?: string; terminal?: string; operatorId?: string; serviceType?: ServiceType; from?: Date; to?: Date; sort?: 'pickup_asc'|'pickup_desc'|'created_desc'; pageSize?: number; cursor?: string }
export interface TripPage { items: Trip[]; nextCursor: string | null }
export class TripRepository {
  async list(filters: TripFilters = {}): Promise<TripPage> {
    let query: Query = getAdminFirestore().collection('trips')
    if (filters.status) query=query.where('status','==',filters.status)
    if (filters.airport) query=query.where('airport','==',filters.airport)
    if (filters.terminal) query=query.where('terminal','==',filters.terminal)
    if (filters.operatorId) query=query.where('assignment.operator.id','==',filters.operatorId)
    if (filters.serviceType) query=query.where('serviceType','==',filters.serviceType)
    if (filters.from) query=query.where('pickupAt','>=',Timestamp.fromDate(filters.from))
    if (filters.to) query=query.where('pickupAt','<=',Timestamp.fromDate(filters.to))
    const field = filters.sort === 'created_desc' ? 'createdAt' : 'pickupAt'; const direction = filters.sort === 'pickup_asc' ? 'asc' : 'desc'
    query=query.orderBy(field,direction).orderBy(FieldPath.documentId()).limit(Math.min(filters.pageSize ?? 25, 100) + 1)
    if (filters.cursor) { const cursor=await getAdminFirestore().collection('trips').doc(filters.cursor).get(); if (cursor.exists) query=query.startAfter(cursor) }
    const snapshot=await query.get(); let items=snapshot.docs.map(doc=>parseTrip(doc.id,doc.data()))
    if (filters.search) { const q=filters.search.toLowerCase(); items=items.filter(t=>`${t.id} ${t.pickupZone ?? ''} ${t.airport ?? ''} ${t.operator?.companyName ?? ''}`.toLowerCase().includes(q)) }
    const pageSize=Math.min(filters.pageSize ?? 25,100); const hasMore=items.length>pageSize; items=items.slice(0,pageSize)
    return { items, nextCursor:hasMore ? items.at(-1)?.id ?? null : null }
  }
  async get(id: string) { const doc=await getAdminFirestore().collection('trips').doc(id).get(); return doc.exists ? parseTrip(doc.id,doc.data()) : null }
  async listRequiringAttention() { const result=await this.list({ pageSize:20 }); return result.items.filter(t=>t.assignmentStatus==='unassigned' || ['driverEnRoute','driverArrived'].includes(t.status) && !!t.pickupAt && t.pickupAt<new Date()) }
  async listActive() { const snapshots=await Promise.all(['driverEnRoute','driverArrived','inTransit'].map(status=>getAdminFirestore().collection('trips').where('status','==',status).limit(50).get())); return snapshots.flatMap(s=>s.docs.map(d=>parseTrip(d.id,d.data()))) }
}
