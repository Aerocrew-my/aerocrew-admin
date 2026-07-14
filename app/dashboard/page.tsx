import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Card, EmptyState, Metric, PageHeader, StatusBadge } from '@/components/admin/ui'
import { TripRepository } from '@/lib/repositories/trips'
import { IncidentRepository, OperatorRepository, RequirementRepository } from '@/lib/repositories/operations'

export const dynamic = 'force-dynamic'
const date = (value: Date | null) => value ? new Intl.DateTimeFormat('en-MY',{dateStyle:'medium',timeStyle:'short'}).format(value) : 'Not recorded'

export default async function DashboardOverview() {
  let error: string|null=null; let attention:Awaited<ReturnType<TripRepository['listRequiringAttention']>>=[]; let active:Awaited<ReturnType<TripRepository['listActive']>>=[]; let requirements:Awaited<ReturnType<RequirementRepository['listUnassigned']>>=[]; let incidents:Awaited<ReturnType<IncidentRepository['listOpen']>>=[]; let operators:Awaited<ReturnType<OperatorRepository['listPending']>>=[]
  try { [attention,active,requirements,incidents,operators]=await Promise.all([new TripRepository().listRequiringAttention(),new TripRepository().listActive(),new RequirementRepository().listUnassigned(20),new IncidentRepository().listOpen(20),new OperatorRepository().listPending(20)]) } catch(e) { error=e instanceof Error?e.message:'Operational data could not be loaded' }
  const late=active.filter(t=>t.pickupAt && t.pickupAt<new Date() && t.status!=='in_progress')
  return <div className="overview-page">
    <PageHeader eyebrow="Operational data" title="Operations overview" description="Read-only control-centre view backed by the canonical Firestore operational database." actions={<Link className="button secondary" href="/dashboard">Refresh</Link>} />
    {error && <div className="notice danger" role="alert"><AlertTriangle size={17}/><span>Operational data unavailable: {error}. Check server configuration and retry.</span></div>}
    <Card className="priority-metrics"><Metric label="Requires attention" value={error?'—':attention.length} detail="Unassigned or time-risk trips" tone={attention.length?'danger':'success'} href="/dashboard/trips?attention=true"/><Metric label="Unassigned requirements" value={error?'—':requirements.length} detail="Awaiting safe matching" tone={requirements.length?'warning':'success'} href="/dashboard/matching"/><Metric label="Active trips" value={error?'—':active.length} detail="Real active Firestore records" tone="info" href="/dashboard/operations"/><Metric label="Late pickup risks" value={error?'—':late.length} detail="Active pickup time has passed" tone={late.length?'danger':'neutral'} href="/dashboard/trips?risk=late"/><Metric label="Pending operators" value={error?'—':operators.length} detail="Awaiting documented review" href="/dashboard/operators"/><Metric label="Open incidents" value={error?'—':incidents.length} detail="Open or investigating" href="/dashboard/audit"/></Card>
    <Card><div className="card-heading"><div><span>Priority queue</span><h2>Trips requiring attention</h2></div><Link className="text-link" href="/dashboard/trips?attention=true">View trips <ArrowRight size={14}/></Link></div>{!error&&attention.length===0?<EmptyState title="No trips require attention" description="Firestore returned no currently actionable trip records."/>:<div className="attention-list">{attention.slice(0,8).map(t=><Link className="attention-row" key={t.id} href={`/dashboard/trips/${t.id}`}><span className="risk-marker"/><div><strong>{t.pickupZone??'Pickup unset'} → {t.airport??'Airport unset'} {t.terminal??''}</strong><small>{date(t.pickupAt)} · {t.crew.length} crew</small></div><StatusBadge tone="danger">{t.assignmentStatus.replaceAll('_',' ')}</StatusBadge></Link>)}</div>}</Card>
  </div>
}
