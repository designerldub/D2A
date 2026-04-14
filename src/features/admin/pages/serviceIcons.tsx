type ServiceIconProps = {
  name: string
  size?: number
  className?: string
}

export function ServiceIcon({ name, size = 14, className }: ServiceIconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  }

  switch (name) {
    case 'Emergency Department':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      )
    case 'Behavioral Health Resources':
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )
    case 'Housing':
      return (
        <svg {...props}>
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <polyline points="9 21 9 12 15 12 15 21" />
        </svg>
      )
    case 'Food Resources':
      return (
        <svg {...props}>
          <line x1="8" y1="3" x2="8" y2="21" />
          <path d="M5 3a3 3 0 0 1 6 0" />
          <line x1="5" y1="12" x2="11" y2="12" />
          <path d="M16 3c0 0 2 2 2 5s-2 5-2 5" />
          <line x1="16" y1="21" x2="16" y2="13" />
        </svg>
      )
    case 'naloxone availability':
      return (
        <svg {...props}>
          <rect x="4" y="9" width="16" height="6" rx="3" ry="3" />
          <line x1="12" y1="9" x2="12" y2="15" />
        </svg>
      )
    case 'stabilization center':
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
  }
}
