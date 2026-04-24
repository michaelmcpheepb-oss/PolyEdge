# SubsidIA - Solar Subsidy Calculator

## Overview
- **Type:** SaaS platform for calculating and managing solar subsidies in Spain
- **Status:** Phase 1 (Foundation) complete, ready for Month 1 validation
- **Repo:** https://github.com/michaelmcpheepb-oss/SubsidIA

## Architecture Decisions
1. **Next.js 16 with App Router** - Latest features, server components by default
2. **TypeScript** - Type safety for better developer experience
3. **Tailwind CSS v4** - Utility-first styling with design tokens
4. **Supabase** - PostgreSQL database with Row Level Security
5. **Framer Motion** - Performant animations for premium feel
6. **Mobile-first responsive design** - Critical for Spanish homeowners

## Caching Strategy
- **Static pages:** Landing page with ISR for content updates
- **Dynamic data:** Calculator results with on-demand revalidation
- **API routes:** Supabase queries with appropriate cache headers
- **Images:** Next.js Image component with optimization

## Gotchas
1. **PostgreSQL function signatures** must match backend API calls exactly
2. **Framer Motion** animations need proper scroll triggers and viewport detection
3. **Color contrast** must meet WCAG AA standards (4.5:1 for text)
4. **Mobile touch targets** minimum 44x44px
5. **Server/client boundaries** - 'use client' only for interactivity
6. **Font loading** - Plus Jakarta Sans needs proper display swap
7. **Form validation** - Need React Hook Form + Zod for type-safe validation

## Key Components Built
1. **PremiumHeader** - Clean navigation with mobile menu
2. **PremiumHero** - Animated €7.000 counter, dual CTAs
3. **StatsBar** - Scroll-triggered animated counters
4. **HowItWorks** - 3-step process visualization
5. **Pricing** - Three-tier cards with popular highlight
6. **Trust** - Independent platform verification
7. **FAQ** - Expandable questions with smooth animations
8. **PremiumFooter** - Comprehensive legal and contact info

## Performance Targets
- **LCP:** < 2.5 seconds
- **CLS:** < 0.1
- **FID:** < 100ms
- **Mobile score:** > 90

## Next Features to Implement
1. **Calculator form** integration with backend API
2. **Authentication** with Supabase Auth
3. **Dashboard** for users to track applications
4. **Admin panel** for subsidy program management
5. **Email notifications** for application status
6. **Payment processing** for premium services