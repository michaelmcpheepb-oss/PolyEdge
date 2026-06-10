// VideoSnap — Constants & Style Presets

export const VIDEO_STYLES = [
  {
    key: 'cinematic',
    label: 'Cinematic',
    emoji: '🎬',
    gradient: ['#FF6F00', '#FFA000'] as [string, string],
    prompt: 'cinematic lighting, dramatic composition, film grain, movie still quality, smooth motion, professional cinematography',
  },
  {
    key: 'music-video',
    label: 'Music Vibe',
    emoji: '🎵',
    gradient: ['#E91E63', '#F06292'] as [string, string],
    prompt: 'energetic music video style, vibrant colors, dynamic movement, trendy aesthetic, saturated, high energy',
  },
  {
    key: 'anime',
    label: 'Anime',
    emoji: '🎨',
    gradient: ['#03A9F4', '#4FC3F7'] as [string, string],
    prompt: 'anime style, cel shaded, vibrant colors, manga aesthetics, smooth animation, dreamy atmosphere',
  },
  {
    key: 'vintage',
    label: 'Vintage Film',
    emoji: '📽️',
    gradient: ['#795548', '#A1887F'] as [string, string],
    prompt: 'vintage aesthetic, retro tones, film grain, warm color palette, nostalgic feel, classic film look',
  },
  {
    key: 'nature',
    label: 'Nature',
    emoji: '🌿',
    gradient: ['#4CAF50', '#8BC34A'] as [string, string],
    prompt: 'natural lighting, organic movement, soft transitions, peaceful atmosphere, earthy tones, gentle motion',
  },
  {
    key: 'sci-fi',
    label: 'Sci-Fi',
    emoji: '🚀',
    gradient: ['#7C4DFF', '#E040FB'] as [string, string],
    prompt: 'sci-fi aesthetic, neon lights, futuristic atmosphere, cyberpunk style, glowing effects, high tech',
  },
] as const

export type VideoStyle = (typeof VIDEO_STYLES)[number]['key']

export const FREEMIUM_LIMIT = 3 // free videos per month

export const PRICING = {
  monthly: {
    name: 'Monthly',
    priceId: 'price_monthly',
    price: 14.99,
    credits: 'Unlimited',
    features: ['Unlimited videos', 'All styles', 'Priority processing', 'HD export'],
  },
  pro: {
    name: 'Pro',
    priceId: 'price_pro',
    price: 44.99,
    credits: 'Unlimited',
    features: ['Unlimited videos', 'All styles', 'Highest priority', '4K export', 'Music library', 'Commercial license'],
  },
} as const

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || ''
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
