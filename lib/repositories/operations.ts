import 'server-only'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { parseAuditEvent, parseIncident, parseRequirement } from '@/lib/domain/operations'

export class RequirementRepository { async listUnassigned(limit=50) { const s=await getAdminFirestore().collection('transport_requirements').where('assignmentStatus','==','unassigned').orderBy('pickupAt','asc').limit(limit).get(); return s.docs.map(d=>parseRequirement(d.id,d.data())) } }
export class IncidentRepository { async listOpen(limit=50) { const s=await getAdminFirestore().collection('incidents').where('status','in',['open','investigating']).orderBy('createdAt','desc').limit(limit).get(); return s.docs.map(d=>parseIncident(d.id,d.data())) } }
export class AuditRepository { async list(limit=100) { const s=await getAdminFirestore().collection('audit_events').orderBy('createdAt','desc').limit(limit).get(); return s.docs.map(d=>parseAuditEvent(d.id,d.data())) } }
export interface OperatorApplication { id:string; name:string|null; companyName:string|null; email:string|null; phone:string|null; documents:unknown[]; vehicles:unknown[]; status:string; submittedAt:Date|null }
export class OperatorRepository { async listPending(limit=50):Promise<OperatorApplication[]> { const s=await getAdminFirestore().collection('operators').where('applicationStatus','==','pending').orderBy('submittedAt','asc').limit(limit).get(); return s.docs.map(doc=>{ const d=doc.data(); return { id:doc.id,name:typeof d.name==='string'?d.name:null,companyName:typeof d.companyName==='string'?d.companyName:null,email:typeof d.email==='string'?d.email:null,phone:typeof d.phone==='string'?d.phone:null,documents:Array.isArray(d.documents)?d.documents:[],vehicles:Array.isArray(d.vehicles)?d.vehicles:[],status:'pending',submittedAt:d.submittedAt?.toDate?.() ?? null } }) } }
export class CrewRepository { async list(limit=50) { const s=await getAdminFirestore().collection('crew').limit(limit).get(); return s.docs.map(d=>({id:d.id,...d.data()})) } }
export class VehicleRepository { async list(limit=50) { const s=await getAdminFirestore().collection('vehicles').limit(limit).get(); return s.docs.map(d=>({id:d.id,...d.data()})) } }
