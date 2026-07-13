import Link from 'next/link'
import { Inbox, LoaderCircle } from 'lucide-react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}

export function Card({
  children,
  className = '',
  ...props
}: React.ComponentPropsWithoutRef<'section'>) {
  return <section className={`ui-card ${className}`} {...props}>{children}</section>
}

export function StatusBadge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
}) {
  return <span className={`status-badge ${tone}`}>{children}</span>
}

export function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="empty-state">
      <Inbox size={24} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  )
}

export function LoadingState({ label = 'Loading data' }: { label?: string }) {
  return (
    <div className="loading-state" role="status">
      <LoaderCircle className="spin" size={22} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function Metric({
  label,
  value,
  detail,
  tone = 'default',
  href,
}: {
  label: string
  value: React.ReactNode
  detail: string
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  href?: string
}) {
  const content = (
    <>
      <span className="metric-label">{label}</span>
      <strong className={`metric-value ${tone}`}>{value}</strong>
      <span className="metric-detail">{detail}</span>
    </>
  )

  return href ? (
    <Link href={href} className="metric metric-link">{content}</Link>
  ) : (
    <div className="metric">{content}</div>
  )
}
