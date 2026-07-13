"use client";

import { useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ToggleSetting {
  key: string;
  label: string;
  description: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const notificationToggles: ToggleSetting[] = [
  {
    key: "email_new_booking",
    label: "New booking alerts",
    description: "Email when a new trip is booked",
  },
  {
    key: "email_cancellation",
    label: "Cancellation alerts",
    description: "Email when a trip is cancelled",
  },
  {
    key: "email_weekly_report",
    label: "Weekly summary",
    description: "Weekly performance digest every Monday",
  },
  {
    key: "push_new_operator",
    label: "New operator signup",
    description: "Push alert when a new operator registers",
  },
];

const platformToggles: ToggleSetting[] = [
  {
    key: "maintenance_mode",
    label: "Maintenance mode",
    description: "Temporarily suspend new bookings across the platform",
  },
  {
    key: "surge_pricing",
    label: "Surge pricing",
    description: "Enable dynamic pricing during peak demand",
  },
  {
    key: "guest_booking",
    label: "Guest bookings",
    description: "Allow bookings without a registered account",
  },
  {
    key: "auto_assign",
    label: "Auto-assign operators",
    description: "Automatically match trips to the nearest available operator",
  },
];

// ─── Subcomponents ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mb-0.5">
        {eyebrow}
      </p>
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
    </div>
  );
}

function Toggle({
  value,
  onChange,
  danger,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <button
      disabled
      title="Configuration service is not connected"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full opacity-60 cursor-not-allowed ${
        value
          ? danger
            ? "bg-red-500"
            : "bg-amber-500"
          : "bg-[var(--border)]"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          value ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  danger,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
      <div className="pr-4">
        <p className={`text-sm font-medium ${danger ? "text-red-400" : "text-[var(--text-primary)]"}`}>
          {label}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
      <Toggle value={value} onChange={onChange} danger={danger} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    email_new_booking: true,
    email_cancellation: true,
    email_weekly_report: true,
    push_new_operator: false,
    maintenance_mode: false,
    surge_pricing: true,
    guest_booking: false,
    auto_assign: true,
  });

  const [supportEmail, setSupportEmail] = useState("support@aerocrew.my");
  const [minNotice, setMinNotice] = useState("60");
  const [maxRadius, setMaxRadius] = useState("50");
  const [commissionPct, setCommissionPct] = useState("15");
  const [saved, setSaved] = useState(false);

  const setToggle = (key: string) => (value: boolean) =>
    setToggles((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas)] text-[var(--text-primary)] p-6 pb-16">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs text-amber-400 font-semibold tracking-widest uppercase mb-1">
          Admin
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configuration service is not connected. Controls are read-only.
        </p>
      </div>

      <div className="max-w-2xl space-y-8">
        {/* ── General ── */}
        <section>
          <SectionHeader eyebrow="General" title="Platform configuration" />
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-5 space-y-4">
            {[
              {
                label: "Support email",
                value: supportEmail,
                set: setSupportEmail,
                type: "email",
                placeholder: "support@aerocrew.my",
              },
              {
                label: "Minimum booking notice (mins)",
                value: minNotice,
                set: setMinNotice,
                type: "number",
                placeholder: "60",
              },
              {
                label: "Max operator radius (km)",
                value: maxRadius,
                set: setMaxRadius,
                type: "number",
                placeholder: "50",
              },
              {
                label: "Platform commission (%)",
                value: commissionPct,
                set: setCommissionPct,
                type: "number",
                placeholder: "15",
              },
            ].map((f) => (
              <div key={f.label}>
                <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                  {f.label}
                </label>
                <input
                  disabled
                  type={f.type}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-[var(--canvas)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-slate-600 opacity-60 cursor-not-allowed"
                />
              </div>
            ))}
          </div>
        </section>

        {/* ── Platform toggles ── */}
        <section>
          <SectionHeader eyebrow="Platform" title="Feature flags" />
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-5">
            {platformToggles.map((t) => (
              <ToggleRow
                key={t.key}
                label={t.label}
                description={t.description}
                value={toggles[t.key]}
                onChange={setToggle(t.key)}
                danger={t.key === "maintenance_mode"}
              />
            ))}
          </div>
        </section>

        {/* ── Notifications ── */}
        <section>
          <SectionHeader eyebrow="Notifications" title="Alert preferences" />
          <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] px-5">
            {notificationToggles.map((t) => (
              <ToggleRow
                key={t.key}
                label={t.label}
                description={t.description}
                value={toggles[t.key]}
                onChange={setToggle(t.key)}
              />
            ))}
          </div>
        </section>

        {/* ── Danger zone ── */}
        <section>
          <SectionHeader eyebrow="Danger zone" title="Destructive actions" />
          <div className="bg-[var(--surface)] rounded-2xl border border-red-500/20 p-5 space-y-3">
            {[
              { label: "Clear trip cache", desc: "Flush all cached trip data" },
              { label: "Reset zone pricing", desc: "Revert all zones to default rates" },
            ].map((action) => (
              <div
                key={action.label}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="text-sm font-medium text-red-400">
                    {action.label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                </div>
                <button disabled title="Configuration service is not connected" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 opacity-60 cursor-not-allowed">
                  Unavailable
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Save button ── */}
        <button
          disabled
          title="Configuration service is not connected"
          onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-semibold text-sm opacity-60 cursor-not-allowed ${
            saved
              ? "bg-emerald-500 text-[var(--text-primary)]"
              : "bg-amber-500 hover:bg-amber-400 text-[var(--text-primary)]"
          }`}
        >
          {saved ? "✓ Changes saved" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
