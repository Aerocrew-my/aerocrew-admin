export type LiveTripStatus = 'pickup' | 'in_progress' | 'scheduled' | 'unassigned'
export type RiskLevel = 'on_track' | 'watch' | 'late'

export interface LiveTripFixture {
  id: string
  route: string
  airport: string
  flightTime: string
  pickupTime: string
  pickupCountdown: string
  crewCount: number
  status: LiveTripStatus
  risk: RiskLevel
  operator: string | null
  driver: string | null
  vehicle: string | null
  stopProgress: { current: number; total: number }
}

/**
 * Non-production scenario fixtures used only to establish the dispatch UI.
 * Replace this module with a live trips repository once tracking is available.
 */
export const liveTripFixtures: LiveTripFixture[] = [
  { id: 'TRP-2048', route: 'Subang Jaya', airport: 'KUL T1', flightTime: '14:20', pickupTime: '11:35', pickupCountdown: '18 min', crewCount: 5, status: 'pickup', risk: 'watch', operator: 'Metro Transit Services', driver: 'Driver assigned', vehicle: 'WXY 4821 · 10-seat van', stopProgress: { current: 2, total: 4 } },
  { id: 'TRP-2051', route: 'Cyberjaya', airport: 'KUL T2', flightTime: '15:10', pickupTime: '12:20', pickupCountdown: '1 hr 03 min', crewCount: 4, status: 'scheduled', risk: 'on_track', operator: 'KL Crew Mobility', driver: 'Driver assigned', vehicle: 'VBN 7712 · MPV', stopProgress: { current: 0, total: 3 } },
  { id: 'TRP-2054', route: 'Petaling Jaya', airport: 'KUL T1', flightTime: '13:55', pickupTime: '11:05', pickupCountdown: 'Overdue 12 min', crewCount: 6, status: 'unassigned', risk: 'late', operator: null, driver: null, vehicle: null, stopProgress: { current: 0, total: 5 } },
  { id: 'TRP-2043', route: 'Putrajaya', airport: 'KUL T1', flightTime: '13:10', pickupTime: '10:15', pickupCountdown: 'En route', crewCount: 3, status: 'in_progress', risk: 'on_track', operator: 'Airport Link Transport', driver: 'Driver assigned', vehicle: 'WA 3208 K · MPV', stopProgress: { current: 3, total: 4 } },
]
