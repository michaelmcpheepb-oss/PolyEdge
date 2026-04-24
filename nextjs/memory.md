# Next.js Patterns

## Stack
- **Version:** 16.2.3 (Next.js 16 with React 19)
- **Router:** App Router
- **TypeScript:** Yes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Not yet implemented (planned: Supabase Auth)
- **Styling:** Tailwind CSS v4
- **Deployment:** Vercel (planned)

## Preferences
- **Proactive help:** Yes - flag caching gotchas, performance issues, server/client boundaries
- **Component naming:** PascalCase.tsx
- **File organization:** Feature-based in app/ directory

## Project Conventions
- **Project:** SubsidIA - Solar subsidy calculator platform
- **Components:** Located in components/ with subdirectories by feature
- **State:** Currently minimal, will likely use Zustand for complex state
- **Forms:** React Hook Form + Zod (to be implemented)
- **Animation:** Framer Motion for scroll animations and counters
- **Fonts:** Plus Jakarta Sans from Google Fonts
- **Colors:** Dark navy (#0F172A), solar yellow (#F59E0B), clean white

## Learned Patterns
1. **Premium landing page** built with mobile-first responsive design
2. **Framer Motion** used for animated counters and scroll-triggered animations
3. **Server Components** by default, 'use client' only for interactivity
4. **Color system:** CSS variables for theming
5. **Typography:** Dramatic size jumps for visual hierarchy
6. **Performance:** Lazy loading, code splitting, optimized images
7. **Accessibility:** Semantic HTML, proper contrast ratios, keyboard navigation