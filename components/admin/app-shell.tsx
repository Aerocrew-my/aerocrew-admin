'use client'

import {
  Activity,
  BarChart3,
  Bell,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileClock,
  Headphones,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MapPinned,
  Menu,
  PlaneTakeoff,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ThemeToggle } from './theme-toggle'

type NavItem = {
  label: string
  href?: string
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
  soon?: boolean
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Live Operations', href: '/dashboard/operations', icon: Activity },
      { label: 'Trips', icon: PlaneTakeoff, soon: true },
      { label: 'Matching', icon: SlidersHorizontal, soon: true },
    ],
  },
  {
    label: 'Network',
    items: [
      { label: 'Crew', href: '/dashboard?view=crew#records', icon: Users },
      { label: 'Operators', href: '/dashboard?view=operators#records', icon: CarFront },
      { label: 'Vehicles', icon: CarFront, soon: true },
      { label: 'Roster Imports', icon: FileClock, soon: true },
      { label: 'Pricing & Zones', href: '/dashboard/zones', icon: MapPinned },
    ],
  },
  {
    label: 'Control',
    items: [
      { label: 'Payments', href: '/dashboard/reconciliation', icon: WalletCards },
      { label: 'Incidents', icon: ShieldAlert, soon: true },
      { label: 'Support', icon: Headphones, soon: true },
      { label: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
      { label: 'Revenue', href: '/dashboard/revenue', icon: CircleDollarSign },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { label: 'Configuration', href: '/dashboard/settings', icon: Settings },
      { label: 'Audit Log', icon: ClipboardCheck, soon: true },
    ],
  },
]

const routeTitles: Record<string, string> = {
  '/dashboard': 'Operations overview',
  '/dashboard/operations': 'Live Operations',
  '/dashboard/zones': 'Pricing and Zones',
  '/dashboard/reconciliation': 'Payments',
  '/dashboard/reports': 'Reports',
  '/dashboard/revenue': 'Revenue',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/leaderboard': 'Operator performance',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/settings': 'Configuration',
}

function Brand() {
  return (
    <Link href="/dashboard" className="brand" aria-label="AeroCrew operations overview">
      <span className="brand-mark"><PlaneTakeoff size={19} aria-hidden="true" /></span>
      <span><strong>AeroCrew</strong><small>Operations Control</small></span>
    </Link>
  )
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="sidebar-nav" aria-label="Primary navigation">
      {navGroups.map((group) => (
        <div className="nav-group" key={group.label}>
          <p>{group.label}</p>
          {group.items.map(({ label, href, icon: Icon, soon }) => {
            const active = href
              ? href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(href.split('?')[0])
              : false
            if (!href) {
              return (
                <span className="nav-item unavailable" key={label} aria-disabled="true" title="Foundation not available yet">
                  <Icon size={18} /><span>{label}</span>{soon && <small>Soon</small>}
                </span>
              )
            }
            return (
              <Link className={active ? 'nav-item active' : 'nav-item'} href={href} key={label} onClick={onNavigate}>
                <Icon size={18} /><span>{label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

export function AppShell({
  children,
  email,
  role,
}: {
  children: React.ReactNode
  email: string
  role: string
}) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  const roleLabel = role.replaceAll('_', ' ')
  const initials = email.slice(0, 2).toUpperCase()

  const title = pathname.startsWith('/dashboard/user/')
    ? 'Record detail'
    : routeTitles[pathname] ?? 'AeroCrew Admin'

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Brand />
        <Navigation />
        <div className="sidebar-footer">
          <ThemeToggle />
          <p><LifeBuoy size={15} aria-hidden="true" /> Internal operations workspace</p>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={20} aria-hidden="true" />
            </button>
            <div><span>Control centre</span><strong>{title}</strong></div>
          </div>
          <div className="topbar-actions">
            <Link className="icon-button" href="/dashboard/notifications" aria-label="Notifications"><Bell size={18} aria-hidden="true" /></Link>
            <div className="account-menu">
              <button type="button" className="account-trigger" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
                <span className="account-avatar">{initials}</span><span className="account-copy"><strong>{email}</strong><small>{roleLabel}</small></span><ChevronDown size={15} aria-hidden="true" />
              </button>
              {accountOpen && (
                <div className="account-popover">
                  <form action={signOut}><button type="submit"><LogOut size={16} aria-hidden="true" /> Sign out</button></form>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="dashboard-content legacy-dashboard">{children}</main>
      </div>

      {mobileOpen && (
        <div className="mobile-overlay" role="presentation" onMouseDown={() => setMobileOpen(false)}>
          <aside className="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation" onMouseDown={(event) => event.stopPropagation()}>
            <div className="mobile-drawer-head"><Brand /><button className="icon-button" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            <Navigation onNavigate={() => setMobileOpen(false)} />
            <div className="sidebar-footer"><ThemeToggle /></div>
          </aside>
        </div>
      )}
    </div>
  )
}
