export const Typography = {
  screenTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#A0A0B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#A0A0B8',
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#00D4AA',
  },
  changePositive: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#27AE60',
  },
  changeNegative: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#E74C3C',
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#A0A0B8',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export const Layout = {
  screenPadding: 16,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 8,
  borderRadius: {
    card: 12,
    button: 12,
    chip: 20,
    input: 10,
  },
  buttonHeight: 52,
};

// Helper function to combine styles
export function combineStyles<T>(...styles: T[]): T {
  return Object.assign({}, ...styles);
}