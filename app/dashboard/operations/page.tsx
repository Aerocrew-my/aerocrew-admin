'use client'

import { Card, EmptyState, Metric, PageHeader, StatusBadge } from '@/components/admin/ui'
import { liveTripFixtures, type LiveTripFixture, type LiveTripStatus } from '@/lib/fixtures/live-operations'
import { AlertTriangle, Clock3, Map, MapPin, Phone, Radio, Route, ShieldAlert, UserRoundCog } from 'lucide-react'
import { useMemo, useState } from 'react'

type Filter = 'all' | LiveTripStatus | 'risk'

function statusTone(status: LiveTripStatus): 'neutral' | 'info' | 'warning' | 'danger' {
  if (status === 'unassigned') return 'danger'
  if (status === 'pickup') return 'warning'
  if (status === 'in_progress') return 'info'
  return 'neutral'
}

function label(value: string) {
  return value.replaceAll('_', ' ').replace(/^./, (character) => character.toUpperCase())
}

function TripCard({ trip }: { trip: LiveTripFixture }) {
  const progress = Math.round((trip.stopProgress.current / Math.max(trip.stopProgress.total, 1)) * 100)
  return (
    <Card className={`live-trip ${trip.risk === 'late' ? 'late-risk' : ''}`}>
      <div className="trip-head">
        <div><div className="trip-id"><strong>{trip.id}</strong><StatusBadge tone={statusTone(trip.status)}>{label(trip.status)}</StatusBadge>{trip.risk !== 'on_track' && <StatusBadge tone={trip.risk === 'late' ? 'danger' : 'warning'}>{trip.risk === 'late' ? 'Late risk' : 'Watch'}</StatusBadge>}</div><p><MapPin size={13} /> {trip.route} → {trip.airport} · Flight {trip.flightTime}</p></div>
        <div className="countdown"><span>Pickup</span><strong>{trip.pickupCountdown}</strong><small>{trip.pickupTime} · {trip.crewCount} crew</small></div>
      </div>
      <div className="assignment-block">
        <div className="operator-mark"><Route size={17} aria-hidden="true" /></div>
        {trip.operator ? <div><strong>{trip.operator}</strong><span>{trip.driver}</span><small>{trip.vehicle}</small></div> : <div><strong>No operator assigned</strong><span>Manual assignment service is not connected</span></div>}
        <div className="trip-actions">
          <button type="button" disabled title="Contact integration is not connected"><Phone size={14} /> Contact</button>
          <button type="button" disabled title="Assignment integration is not connected"><UserRoundCog size={14} /> {trip.operator ? 'Reassign' : 'Assign'}</button>
          <button type="button" disabled title="Incident service is not connected"><ShieldAlert size={14} /> Incident</button>
        </div>
      </div>
      <div className="trip-progress"><div><span>Pickup sequence</span><strong>{trip.stopProgress.current} of {trip.stopProgress.total} stops</strong></div><div className="progress-track" aria-label={`${progress}% of stops complete`}><span style={{ width: `${progress}%` }} /></div></div>
    </Card>
  )
}

export default function LiveOperations() {
  const [filter, setFilter] = useState<Filter>('all')
  const trips = useMemo(() => liveTripFixtures.filter((trip) => filter === 'all' ? true : filter === 'risk' ? trip.risk !== 'on_track' : trip.status === filter), [filter])
  const unassigned = liveTripFixtures.filter((trip) => trip.status === 'unassigned').length
  const risks = liveTripFixtures.filter((trip) => trip.risk !== 'on_track').length
  const active = liveTripFixtures.filter((trip) => trip.status === 'pickup' || trip.status === 'in_progress').length

  return (
    <div className="live-page">
      <PageHeader eyebrow="Dispatch workspace" title="Live Operations" description="Foundation for monitoring pickups, assignments and late risk. The current records are isolated scenario fixtures—not a live tracking feed." actions={<StatusBadge tone="warning"><Radio size={12} /> Scenario data</StatusBadge>} />

      <div className="notice warning"><AlertTriangle size={17} aria-hidden="true" /><span>Live trip, location and contact services are not connected. Dispatch actions remain visibly disabled to prevent false operational use.</span></div>

      <Card className="live-metrics">
        <Metric label="Active trips" value={active} detail="Pickup or in progress" tone="info" />
        <Metric label="Late pickup risks" value={risks} detail="Watch and late scenarios" tone={risks ? 'danger' : 'success'} />
        <Metric label="Unmatched" value={unassigned} detail="No operator assigned" tone={unassigned ? 'warning' : 'success'} />
        <Metric label="Crew in movement" value={liveTripFixtures.reduce((total, trip) => total + trip.crewCount, 0)} detail="Scenario fixture total" />
      </Card>

      <div className="live-layout">
        <div className="map-panel">
          <Card className="map-card">
            <div className="map-toolbar"><div><Map size={17} /><strong>Dispatch map</strong></div><StatusBadge>Telemetry unavailable</StatusBadge></div>
            <div className="map-canvas"><div className="airport-ring ring-one" /><div className="airport-ring ring-two" /><span className="map-route route-one" /><span className="map-route route-two" /><span className="map-pin pin-one">KUL</span><span className="map-pin pin-two">T2</span><div className="map-message"><MapPin size={22} /><strong>Map provider not connected</strong><p>This reserved operational canvas will show live vehicle positions and pickup sequencing when telemetry is available.</p></div></div>
          </Card>
        </div>

        <Card className="dispatch-queue">
          <div className="card-heading"><div><span>Attention queue</span><h2>Dispatch priorities</h2></div><StatusBadge tone="danger">{risks} risks</StatusBadge></div>
          {liveTripFixtures.filter((trip) => trip.risk !== 'on_track').map((trip) => <div className="queue-row" key={trip.id}><span className={trip.risk} /><div><strong>{trip.id} · {trip.route}</strong><small>{trip.pickupCountdown}</small></div><StatusBadge tone={trip.risk === 'late' ? 'danger' : 'warning'}>{trip.risk === 'late' ? 'Action needed' : 'Monitor'}</StatusBadge></div>)}
          <div className="queue-note"><Clock3 size={14} /><span>Countdowns are static scenario values.</span></div>
        </Card>
      </div>

      <div className="operations-toolbar"><div><span>Trip board</span><strong>Pickup and assignment status</strong></div><div className="filter-tabs" aria-label="Filter live operations">{([{ id: 'all', text: 'All' }, { id: 'risk', text: 'At risk' }, { id: 'pickup', text: 'Pickup' }, { id: 'in_progress', text: 'In progress' }, { id: 'scheduled', text: 'Scheduled' }, { id: 'unassigned', text: 'Unassigned' }] as { id: Filter; text: string }[]).map((item) => <button type="button" className={filter === item.id ? 'active' : ''} aria-pressed={filter === item.id} key={item.id} onClick={() => setFilter(item.id)}>{item.text}</button>)}</div></div>
      <div className="trip-list">{trips.length ? trips.map((trip) => <TripCard key={trip.id} trip={trip} />) : <Card><EmptyState title="No trips in this view" description="Choose another status filter." /></Card>}</div>
    </div>
  )
}
