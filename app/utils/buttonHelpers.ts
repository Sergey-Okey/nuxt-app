// utils/buttonHelpers.ts
export const buttonSizeMap = {
  xs: { fontSize: 'text-xs', padding: 'p-1 px-2', height: 'h-7' },
  sm: { fontSize: 'text-sm', padding: 'p-2 px-3', height: 'h-9' },
  md: { fontSize: 'text-base', padding: 'p-3 px-4', height: 'h-11' },
  lg: { fontSize: 'text-lg', padding: 'p-3 px-5', height: 'h-13' },
  xl: { fontSize: 'text-xl', padding: 'p-4 px-6', height: 'h-15' },
} as const

export const buttonTypeStyles = {
  primary: {
    bg: 'bg-text-primary',
    text: 'text-text-inverse',
    border: 'border-text-primary',
    hover: 'hover:bg-text-secondary hover:border-text-secondary',
    active: 'active:bg-text-muted active:border-text-muted',
  },
  secondary: {
    bg: 'bg-surface-bg',
    text: 'text-text-primary',
    border: 'border-border-light',
    hover: 'hover:bg-card-bg hover:border-border-hover',
    active: 'active:bg-secondary-bg',
  },
  // ... остальные типы
} as const
