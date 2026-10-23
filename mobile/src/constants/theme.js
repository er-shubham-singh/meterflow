export const COLORS = {
  // Enterprise Canvas & Card Surfaces (Light Mode)
  background: '#F8FAFC',       // Slate-50: crisp, modern, executive canvas
  bgApp: '#F8FAFC',
  card: '#FFFFFF',             // Pure elevated white
  bgCard: '#FFFFFF',
  bgCardElevated: '#FFFFFF',
  cardHover: '#F1F5F9',        // Slate-100: interactive hover
  surface: '#F1F5F9',
  surfaceSubtle: '#F8FAFC',
  bgHeader: '#FFFFFF',
  bgInput: '#F8FAFC',
  
  // High-End Borders
  border: '#E2E8F0',           // Slate-200: subtle hairline border
  borderSubtle: '#F1F5F9',
  borderStrong: '#CBD5E1',     // Slate-300: defined border
  borderFocus: '#2563EB',      // Primary Blue focus ring
  
  // Brand Gradients & Accents (Executive FinTech / Developer Cloud)
  primary: '#2563EB',          // Electric Royal Blue
  primaryHover: '#1D4ED8',
  primaryLight: '#3B82F6',
  primaryMuted: 'rgba(37, 99, 235, 0.08)',
  
  secondary: '#7C3AED',        // Deep Iris / Admin Violet
  secondaryLight: '#8B5CF6',
  secondaryMuted: 'rgba(124, 58, 237, 0.08)',
  
  accent: '#0284C7',           // Precision Cyan
  accentMuted: 'rgba(2, 132, 199, 0.08)',
  
  // Status Colors
  success: '#059669',          // Emerald Green
  successLight: 'rgba(5, 150, 105, 0.1)',
  successGlow: 'rgba(16, 185, 129, 0.25)',
  
  warning: '#D97706',          // Amber
  warningLight: 'rgba(217, 119, 6, 0.1)',
  
  danger: '#DC2626',           // Crimson Red
  dangerLight: 'rgba(220, 38, 38, 0.1)',
  
  info: '#0284C7',
  infoLight: 'rgba(2, 132, 199, 0.1)',
  
  // Role Accents
  adminPurple: '#7C3AED',
  adminPurpleLight: 'rgba(124, 58, 237, 0.1)',
  employeeCyan: '#2563EB',
  employeeCyanLight: 'rgba(37, 99, 235, 0.1)',

  // Typography (Ultra-crisp dark slate hierarchy)
  text: '#0F172A',             // Slate-900: high-contrast headers
  textPrimary: '#0F172A',
  textSecondary: '#334155',   // Slate-700: body copy
  textMuted: '#64748B',       // Slate-500: meta & captions
  textMutedLight: '#94A3B8',  // Slate-400: micro labels
  textWhite: '#FFFFFF',
  white: '#FFFFFF',

  // Terminal / Dark Ingestion Console
  darkSurface: '#0B1120',      // Deep Navy Console
  darkBorder: '#1E293B',
  darkCodeText: '#38BDF8',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  glow: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
};
