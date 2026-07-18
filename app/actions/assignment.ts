'use server'

import 'server-only'
import { FieldValue } from 'firebase-admin/firestore'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { hasPermission } from '@/lib/auth/permissions'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { asDate, parseRequirement } from '@/lib/domain/operations'

export type AssignmentFailureReason = 'capacity' | 'conflict' | 'not_found' | 'unauthorized' | 'already_assigned' | 'invalid_schedule' | 'failed'
export type AssignmentResult = { ok:true; tripId:string } | { ok:false; reason:AssignmentFailureReason }

export async function assignOperatorToRequirement(requirementId:string,operatorId:string,reason?:string):Promise<AssignmentResult> {
  const admin=await getCurrentAdmin(); if(!admin||!hasPermission(admin.profile.role,'matching:assign'))return {ok:false,reason:'unauthorized'}
  if(!requirementId.trim()||!operatorId.trim())return {ok:false,reason:'not_found'}
  const db=getAdminFirestore(); const requirementRef=db.collection('transport_requirements').doc(requirementId); const operatorRef=db.collection('users').doc(operatorId)
  try { return await db.runTransaction(async transaction=>{
    const [requirementDoc,operatorDoc]=await Promise.all([transaction.get(requirementRef),transaction.get(operatorRef)])
    if(!requirementDoc.exists||!operatorDoc.exists)return {ok:false,reason:'not_found'} as const
    const requirement=parseRequirement(requirementDoc.id,requirementDoc.data()); if(requirement.assignmentStatus!=='unassigned')return {ok:false,reason:'already_assigned'} as const
    const operator=operatorDoc.data()!; if(operator.role!=='operator'||operator.status!=='approved')return {ok:false,reason:'not_found'} as const
    if(typeof operator.capacity!=='number'||!Number.isFinite(operator.capacity)||operator.capacity<requirement.crewCount)return {ok:false,reason:'capacity'} as const
    if(!requirement.pickupAt||!requirement.requiredArrivalAt||requirement.pickupAt>=requirement.requiredArrivalAt)return {ok:false,reason:'invalid_schedule'} as const
    const conflicts=await transaction.get(db.collection('trips').where('operatorId','==',operatorId).where('pickupAt','<',requirement.requiredArrivalAt))
    if(conflicts.docs.some(doc=>{ const d=doc.data(); const end=asDate(d.requiredArrivalAt); return !['cancelled','completed','failed'].includes(String(d.status))&&d.assignmentStatus!=='rejected'&&d.assignmentStatus!=='unassigned'&&end!==null&&end>requirement.pickupAt!&&doc.id!==(requirement.tripId??requirement.id) }))return {ok:false,reason:'conflict'} as const
    const tripId=requirement.tripId??requirement.id; const tripRef=db.collection('trips').doc(tripId); const auditRef=db.collection('audit_events').doc(); const assignment={status:'assigned',operator:{id:operatorId,name:typeof operator.name==='string'?operator.name:null,companyName:typeof operator.companyName==='string'?operator.companyName:null,status:operator.status},vehicle:{id:operatorId,registration:typeof operator.plateNumber==='string'?operator.plateNumber:null,type:typeof operator.vehicleType==='string'?operator.vehicleType:null,capacity:operator.capacity}}
    transaction.update(requirementRef,{assignmentStatus:'assigned',tripId,updatedAt:FieldValue.serverTimestamp()})
    transaction.set(tripRef,{status:'assigned',assignmentStatus:'assigned',operatorId,vehicleId:operatorId,serviceType:requirement.serviceType,pickupZone:requirement.pickupZone,pickupAt:requirement.pickupAt,requiredArrivalAt:requirement.requiredArrivalAt,airport:requirement.airport,terminal:requirement.terminal,assignment,updatedAt:FieldValue.serverTimestamp()},{merge:true})
    transaction.set(auditRef,{actorAdminId:admin.user.id,actorRole:admin.profile.role,action:'operator_assigned',entityType:'transport_requirement',entityId:requirementId,previousValue:{assignmentStatus:'unassigned'},newValue:{assignmentStatus:'assigned',tripId,operatorId},reason:reason?.trim()||null,createdAt:FieldValue.serverTimestamp(),ipAddress:null,metadata:{tripId,operatorId,crewCount:requirement.crewCount}})
    return {ok:true,tripId} as const
  }) } catch { return {ok:false,reason:'failed'} }
}
