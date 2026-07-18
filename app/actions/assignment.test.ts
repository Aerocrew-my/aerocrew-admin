import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only',()=>({}))
vi.mock('@/lib/auth/admin',()=>({getCurrentAdmin:vi.fn(async()=>({user:{id:'admin-1'},profile:{role:'operations_admin'}}))}))
vi.mock('@/lib/auth/permissions',()=>({hasPermission:vi.fn(()=>true)}))
vi.mock('@/lib/domain/operations',()=>({asDate:(value:unknown)=>value instanceof Date?value:null,parseRequirement:(id:string,data:Data)=>({id,tripId:data.tripId??null,assignmentStatus:data.assignmentStatus,serviceType:data.serviceType,pickupZone:null,pickupAt:data.pickupAt,requiredArrivalAt:data.requiredArrivalAt,airport:null,terminal:null,crewCount:data.crewCount,createdAt:null})}))

type Data=Record<string,unknown>
let requirement:Data
let operator:Data
let conflicts:Data[]
let writes:Array<{kind:string;path:string;data:Data}>

const snapshot=(id:string,data:Data|undefined)=>({id,exists:!!data,data:()=>data})
const doc=(path:string,id:string)=>({path:`${path}/${id}`,id,get:async()=>snapshot(id,path==='transport_requirements'?requirement:operator)})
const collection=(path:string)=>({path,doc:(id=Math.random().toString(36).slice(2))=>doc(path,id),where:()=>({where:()=>({path:'trips-query'})})})
const transaction={
  get:vi.fn(async(ref:{path:string;get?:()=>Promise<unknown>})=>ref.path==='trips-query'?{docs:conflicts.map((d,i)=>snapshot(`conflict-${i}`,d))}:ref.get!()),
  update:vi.fn((ref:{path:string},data:Data)=>writes.push({kind:'update',path:ref.path,data})),
  set:vi.fn((ref:{path:string},data:Data)=>writes.push({kind:'set',path:ref.path,data})),
}
const db={collection,runTransaction:vi.fn(async(fn:(tx:typeof transaction)=>unknown)=>fn(transaction))}
vi.mock('@/lib/firebase/admin',()=>({getAdminFirestore:()=>db}))

import { assignOperatorToRequirement } from './assignment'

describe('assignOperatorToRequirement',()=>{
  beforeEach(()=>{ requirement={assignmentStatus:'unassigned',tripId:'trip-1',serviceType:'aeroFlex',pickupAt:new Date('2026-07-18T01:00:00Z'),requiredArrivalAt:new Date('2026-07-18T02:00:00Z'),crewCount:6}; operator={role:'operator',status:'approved',name:'Op',companyName:'Operator Co',capacity:8}; conflicts=[]; writes=[]; db.runTransaction.mockClear(); transaction.get.mockClear(); transaction.update.mockClear(); transaction.set.mockClear() })

  it('rejects insufficient capacity without writes',async()=>{ operator.capacity=5; await expect(assignOperatorToRequirement('req-1','op-1')).resolves.toEqual({ok:false,reason:'capacity'}); expect(writes).toHaveLength(0) })
  it('rejects any overlapping assigned trip without writes',async()=>{ conflicts=[{status:'assigned',assignmentStatus:'assigned',requiredArrivalAt:new Date('2026-07-18T01:30:00Z')}]; await expect(assignOperatorToRequirement('req-1','op-1')).resolves.toEqual({ok:false,reason:'conflict'}); expect(writes).toHaveLength(0) })
  it('atomically updates the requirement, trip, and audit event',async()=>{ await expect(assignOperatorToRequirement('req-1','op-1','Selected for capacity')).resolves.toEqual({ok:true,tripId:'trip-1'}); expect(db.runTransaction).toHaveBeenCalledTimes(1); expect(writes.map(w=>w.path)).toEqual(expect.arrayContaining(['transport_requirements/req-1','trips/trip-1'])); expect(writes).toHaveLength(3); expect(writes.find(w=>w.path==='trips/trip-1')?.data).toMatchObject({status:'assigned',assignmentStatus:'assigned',operatorId:'op-1'}) })
})
