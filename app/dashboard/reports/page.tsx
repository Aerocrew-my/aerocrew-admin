"use client";

import { useState } from "react";

const PERIODS = ["Today", "This week", "This month", "All time"] as const;
type Period = (typeof PERIODS)[number];

interface StatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

interface TripRow {
  id: string;
  crew: string;
  route: string;
  date: string;
  fare: string;
  status: "completed" | "cancelled" | "pending";
}

const statsByPeriod: Record<Period, StatCard[]> = {
  Today: [
    { label: "Total trips", value: "34", change: "+12% vs yesterday", positive: true },
    { label: "Revenue", value: "RM 1,820", change: "+8% vs yesterday", positive: true },
    { label: "Cancellations", value: "2", change: "-1 vs yesterday", positive: true },
    { label: "Avg fare", value: "RM 53.50", change: "+3% vs yesterday", positive: true },
  ],
  "This week": [
    { label: "Total trips", value: "198", change: "+22% vs last week", positive: true },
    { label: "Revenue", value: "RM 10,540", change: "+18% vs last week", positive: true },
    { label: "Cancellations", value: "11", change: "+3 vs last week", positive: false },
    { label: "Avg fare", value: "RM 53.23", change: "+2% vs last week", positive: true },
  ],
  "This month": [
    { label: "Total trips", value: "843", change: "+31% vs last month", positive: true },
    { label: "Revenue", value: "RM 44,890", change: "+27% vs last month", positive: true },
    { label: "Cancellations", value: "38", change: "-5 vs last month", positive: true },
    { label: "Avg fare", value: "RM 53.25", change: "+1% vs last month", positive: true },
  ],
  "All time": [
    { label: "Total trips", value: "5,210", change: "Since launch", positive: true },
    { label: "Revenue", value: "RM 277,000", change: "Since launch", positive: true },
    { label: "Cancellations", value: "194", change: "3.7% rate", positive: true },
    { label: "Avg fare", value: "RM 53.17", change: "Platform average", positive: true },
  ],
};

const recentTrips: TripRow[] = [
  { id: "T-00891", crew: "Capt. Amir Razak", route: "Desa Petaling → KLIA T1", date: "Today, 06:40", fare: "RM 62.00", status: "completed" },
  { id: "T-00890", crew: "FO Sarah Lim", route: "Kuchai Lama → KLIA2", date: "Today, 05:55", fare: "RM 55.50", status: "completed" },
  { id: "T-00889", crew: "CC Priya Nair", route: "Cheras → Subang SZB", date: "Today, 04:20", fare: "RM 38.00", status: "cancelled" },
  { id: "T-00888", crew: "Capt. Johan Tan", route: "Bangsar → KLIA T1", date: "Yesterday, 22:10", fare: "RM 68.00", status: "completed" },
  { id: "T-00887", crew: "FO Nurul Ain", route: "Ampang → KLIA2", date: "Yesterday, 20:30", fare: "RM 57.00", status: "completed" },
  { id: "T-00886", crew: "CC Kevin Wong", route: "Sri Petaling → KLIA T1", date: "Yesterday, 14:15", fare: "RM 60.00", status: "pending" },
];

const statusStyle: Record<TripRow["status"], string> = {
  completed: "bg-emerald-500/10 text-emerald-400",
  cancelled: "bg-red-500/10 text-red-400",
  pending: "bg-amber-500/10 text-amber-400",
};

const topZones = [
  { name: "KLIA Terminal 1", trips: 412, pct: 82 },
  { name: "KLIA2", trips: 338, pct: 67 },
  { name: "Subang SZB", trips: 201, pct: 40 },
  { name: "Penang PEN", trips: 88, pct: 18 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("This week");

  const stats = statsByPeriod[period];

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] p-6">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports</h1>
        <p className="text-sm text-slate-400 mt-1">
          Platform performance at a glance
        </p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
              period === p
                ? "bg-amber-500 text-[var(--text-primary)] border-amber-500"
                : "bg-[var(--surface)] text-slate-400 border-[var(--border)] hover:border-amber-500/40"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-4"
          >
            <p className="text-xs text-slate-400 mb-2">{s.label}</p>
            <p className="text-xl font-bold text-[var(--text-primary)] mb-1">{s.value}</p>
            <p
              className={`text-xs font-medium ${
                s.positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {s.change}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent trips */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent trips</h2>
            <button disabled title="Export service is not connected" className="text-xs text-slate-500 font-medium cursor-not-allowed">
              Export unavailable
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-[var(--border)]">
                  <th className="text-left pb-3 font-semibold">Trip ID</th>
                  <th className="text-left pb-3 font-semibold">Crew</th>
                  <th className="text-left pb-3 font-semibold hidden md:table-cell">
                    Route
                  </th>
                  <th className="text-left pb-3 font-semibold hidden sm:table-cell">
                    Date
                  </th>
                  <th className="text-right pb-3 font-semibold">Fare</th>
                  <th className="text-right pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 text-amber-400 font-mono text-xs">
                      {t.id}
                    </td>
                    <td className="py-3 text-[var(--text-primary)] text-xs font-medium">
                      {t.crew}
                    </td>
                    <td className="py-3 text-slate-400 text-xs hidden md:table-cell">
                      {t.route}
                    </td>
                    <td className="py-3 text-slate-400 text-xs hidden sm:table-cell">
                      {t.date}
                    </td>
                    <td className="py-3 text-right text-[var(--text-primary)] text-xs font-semibold">
                      {t.fare}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded-lg text-xs font-semibold ${
                          statusStyle[t.status]
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top zones */}
        <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
            Top zones
          </h2>
          <div className="space-y-4">
            {topZones.map((z) => (
              <div key={z.name}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-[var(--text-primary)] font-medium">{z.name}</p>
                  <p className="text-xs text-slate-400">{z.trips} trips</p>
                </div>
                <div className="w-full h-1.5 bg-[var(--canvas)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${z.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)]">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest mb-3 font-semibold">
              Quick exports
            </h3>
            {["Trips report", "Revenue report", "Crew activity"].map((label) => (
              <button
                key={label}
                disabled
                title="Export service is not connected"
                className="flex items-center justify-between w-full py-2.5 px-3 mb-2 rounded-xl bg-[var(--canvas)] border border-[var(--border)] opacity-60 cursor-not-allowed group"
              >
                <span className="text-xs text-slate-300 group-hover:text-[var(--text-primary)] transition">
                  {label}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
