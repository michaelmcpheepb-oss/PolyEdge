// VideoSnap — Electric Blue Accent Theme
// Dark theme with vibrant cyan accent for video creator vibe

export const Colors = {
  bg: '#0A0A0F',
  bgCard: '#121218',
  bgInput: '#181820',
  tabBar: '#0D0D14',
  pillBg: '#181820',

  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#707080',

  accent: '#00D4FF',
  accentDark: '#00A8CC',
  accentLight: '#66E3FF',
  accentGradientStart: '#00D4FF',
  accentGradientEnd: '#0066FF',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',

  border: '#1E1E2A',
  borderLight: '#2E2E3A',

  overlay: 'rgba(0, 0, 0, 0.7)',
  shimmer: '#181820',
  gold: '#FFD700',
} as const

export const Fonts = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    '5xl': 48,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
} as const

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
} as const
