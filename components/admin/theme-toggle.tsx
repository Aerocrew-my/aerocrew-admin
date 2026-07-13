'use client'

import { Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const options = [
  { value: 'system', label: 'Use device setting', icon: Laptop },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  if (!mounted) {
    return <div className={compact ? 'theme-placeholder compact' : 'theme-placeholder'} aria-hidden="true" />
  }

  return (
    <div className={compact ? 'theme-control compact' : 'theme-control'} aria-label="Appearance">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          type="button"
          key={value}
          className={theme === value ? 'theme-option active' : 'theme-option'}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          title={label}
        >
          <Icon size={15} aria-hidden="true" />
          {!compact && <span>{label}</span>}
        </button>
      ))}
    </div>
  )
}
