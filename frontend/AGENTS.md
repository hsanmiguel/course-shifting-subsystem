# Course Shifting Subsystem (CSS) - AI Agent Codex

This is a **Vite + HeroUI v3 React 19** application for a university course shifting system. This codex helps AI agents understand the project architecture, conventions, and development patterns for immediate productivity.

## 🎯 Project Overview

**Purpose**: Frontend for a university course shifting system where students apply to shift courses, and approvers/registrars review and manage requests.

**User Roles**:
- Students: Apply for shifts, track status, view equivalencies
- Approvers: Review and approve/reject applications
- Registrars: Override approver decisions
- Admins: System management

**Key Domain Terms**:
- **Application States**: `draft`, `submitted`, `under_review`, `approved`, `rejected`, `completed`
- **Equivalency**: When a student can shift to an alternative course (not just the same course)
- **CSS**: "Course Shifting Subsystem" (not Cascading Style Sheets)

## 📚 Design Documentation

**READ THESE FIRST** — comprehensive specifications exist:

| Document | Purpose | When to Read |
|----------|---------|--------------|
| [IMPLEMENTATION_QUICKSTART.md](./DESIGN_DOCS/IMPLEMENTATION_QUICKSTART.md) | Step-by-step implementation roadmap (10 phases) | Starting new features or phases |
| [CSS_FRONTEND_DESIGN.md](./DESIGN_DOCS/CSS_FRONTEND_DESIGN.md) | Complete architecture, pages, state management, 15K words | Understanding overall structure |
| [CSS_COMPONENTS_SPECS.md](./DESIGN_DOCS/CSS_COMPONENTS_SPECS.md) | Detailed component specs with HeroUI v3 code examples | Implementing components |
| [CSS_USER_JOURNEYS_INTEGRATION.md](./DESIGN_DOCS/CSS_USER_JOURNEYS_INTEGRATION.md) | User workflows, API integration, error handling | Implementing features end-to-end |
| [VISUAL_REFERENCE.md](./DESIGN_DOCS/VISUAL_REFERENCE.md) | Wireframes and visual structure (ASCII diagrams) | Understanding UI layouts |

**Critical**: Design docs contain detailed component code, API contracts, and implementation checklists. Always check docs before asking about implementation details.

## 🏗️ Architecture

### Component Structure (Atomic Design)

```
src/components/
├── atoms/              # Single-purpose, reusable components
│   ├── StatCard.tsx    # Color/state variants for displaying stats
│   └── StatusBadge.tsx # Status indicators (draft, approved, etc.)
├── molecules/          # Composed atoms with logic
│   └── ApplicationCard.tsx  # Shows application with callbacks
├── organisms/          # Complex multi-molecule compositions (empty - ready to fill)
├── layouts/            # Page-level layouts
│   ├── SidebarLayout.tsx    # Dark sidebar + top nav + breadcrumb + footer
│   └── default.tsx          # Standard page wrapper
├── icons.tsx           # Custom SVG icons (as React components)
├── navbar.tsx          # Top navigation bar
├── primitives.ts       # Tailwind Variants helpers (title, subtitle, etc.)
└── theme-switch.tsx    # Dark/light theme toggle
```

**Pattern**: Components are **Tailwind + HeroUI** only. No CSS-in-JS, no CSS modules. Use HeroUI's composition model (Card.Header, Card.Body, etc.).

### Pages Structure

```
src/pages/
├── index.tsx           # Home / landing page
├── docs.tsx            # Documentation page
├── pricing.tsx         # Pricing page
├── blog.tsx            # Blog page
├── about.tsx           # About page
└── student/
    └── Dashboard.tsx   # Student dashboard (currently empty - ready for development)
```

**Routing**: React Router v6 in `App.tsx`. No nested routing yet; each page is complete route.

### Type Definitions

All types centralized in `src/types/index.ts`. Examples:
- `ShiftingApplication` — the main domain model
- `ApplicationStatus` — union type for valid states
- `UserRole` — student, approver, registrar, admin
- `Equivalency`, `Notification`, etc.

**Convention**: Always check types before creating state or API models.

## 🛠️ Development Setup

### Build & Dev Scripts

```bash
npm run dev      # Vite dev server with HMR
npm run build    # TypeScript check + Vite build → dist/
npm run lint     # ESLint with --fix (includes Prettier)
npm run preview  # Preview production build
```

### Technology Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | React | 19.0 | Latest, with React Router 6.23 |
| Build | Vite | 6.0.11 | Fast dev server & bundling |
| Styling | Tailwind CSS | 4.1 | Via `@tailwindcss/vite` |
| Components | HeroUI | 3.0.3 | React Aria Components based |
| Language | TypeScript | 5.6.3 | Strict mode; no `any` types |
| Linting | ESLint 9 + Prettier | Latest | Unused imports, hooks, JSX a11y |
| Deployment | Vercel | - | SPA model; `vercel.json` configured |

### Path Aliases

All imports use `@/` prefix for `src/`:
```typescript
import { StatCard } from '@/components/atoms/StatCard'
import { siteConfig } from '@/config/site'
import type { ShiftingApplication } from '@/types'
```

## 📋 Development Conventions

### File & Component Naming

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase | `StatCard.tsx`, `ApplicationCard.tsx` |
| Files | Match component name | `src/components/atoms/StatCard.tsx` |
| Props interfaces | `ComponentNameProps` | `StatCardProps` |
| Page components | Match route | `src/pages/student/Dashboard.tsx` |
| Hooks | `use*` prefix | `useApplication`, `useRealtime` (from design docs) |

### TypeScript Practices

- Strict mode enabled; no `any` types
- Props always typed with interfaces
- Use union types for enums (e.g., `ApplicationStatus`)
- Centralize types in `src/types/index.ts`

### Styling Pattern

1. Use HeroUI components first (Button, Card, Input, etc.)
2. Layer Tailwind utilities for layout/spacing
3. Use semantic color names: `primary`, `success`, `warning`, `danger`
4. Support dark/light themes via HeroUI's theme system

**Example**:
```typescript
<Button color="success" size="lg" className="w-full mt-4">
  Apply for Shift
</Button>
```

### Configuration

- Site metadata (nav, links, branding): `src/config/site.ts`
- No environment variables in use; config is static
- To add env vars: create `.env.local`, update `vite.config.ts`

## 🔄 State Management & Integration

### Current Status

- **Provider** (`src/provider.tsx`): Empty wrapper, ready for state management
- **Global State**: Not yet implemented
- **State Management**: Ready for Redux, Zustand, Jotai, or Context

### When Adding State Management

1. Check `CSS_FRONTEND_DESIGN.md` for recommended state shape
2. Update `Provider` component to wrap the app
3. Create custom hooks (e.g., `useApplication`, `useNotifications`)
4. Document in this file for future agents

### API Integration Points

See [CSS_USER_JOURNEYS_INTEGRATION.md](./DESIGN_DOCS/CSS_USER_JOURNEYS_INTEGRATION.md) for:
- Exact request/response formats
- Authentication strategy
- Real-time synchronization approach
- Error handling patterns

## ✅ Quick Productivity Checklist

When starting work:

- [ ] Read the relevant design doc (see table above)
- [ ] Check `src/types/index.ts` for existing types
- [ ] Use `@/` alias for imports (configured in `tsconfig.json`)
- [ ] Follow atomic design: atoms → molecules → pages
- [ ] Use HeroUI components, not custom HTML
- [ ] Apply Tailwind for layout/spacing, not custom CSS
- [ ] Ensure TypeScript strict mode compliance (no `any`)
- [ ] Run `npm run lint` before committing
- [ ] Reference `site.ts` for config values (nav items, links, etc.)
- [ ] For student pages: Start with [IMPLEMENTATION_QUICKSTART.md](./DESIGN_DOCS/IMPLEMENTATION_QUICKSTART.md) Phase 4+

## 🚀 Common Tasks

### Adding a New Component

1. Decide: Atom (single purpose) or Molecule (composed)?
2. Check `CSS_COMPONENTS_SPECS.md` for specification
3. Create in appropriate folder (`atoms/`, `molecules/`, `organisms/`)
4. Type props with `ComponentNameProps` interface
5. Export from index if needed
6. Use HeroUI + Tailwind only

### Adding a New Page

1. Create in `src/pages/` matching the route
2. Choose layout: `SidebarLayout` or `DefaultLayout`
3. Check routing in `App.tsx`
4. Types from `src/types/index.ts`
5. Follow component patterns

### Implementing a Feature

1. Read the user journey in `CSS_USER_JOURNEYS_INTEGRATION.md`
2. Review component specs in `CSS_COMPONENTS_SPECS.md`
3. Check data models in `src/types/index.ts`
4. Follow phase roadmap in `IMPLEMENTATION_QUICKSTART.md`
5. Implement components (atoms → molecules → pages)

## 📖 Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions, page mapping |
| `src/provider.tsx` | Root provider (context, state mgmt goes here) |
| `src/types/index.ts` | All type definitions |
| `src/config/site.ts` | Site metadata, nav config |
| `src/components/primitives.ts` | Tailwind Variants utilities |
| `src/styles/globals.css` | Global styles, Tailwind directives |
| `tailwind.config.ts` | Tailwind theme configuration |
| `tsconfig.json` | TypeScript config, path aliases |
| `vite.config.ts` | Vite config, plugins, aliases |

## ⚠️ Common Pitfalls

1. **Don't hardcode domain strings** — Use type enums (ApplicationStatus, UserRole)
2. **Don't use raw HTML** — Use HeroUI components (Card, Button, Input, etc.)
3. **Don't create custom CSS** — Use Tailwind utilities
4. **Don't put types in components** — Centralize in `src/types/index.ts`
5. **Don't forget path alias** — Use `@/` not relative imports
6. **Don't skip TypeScript** — Strict mode catches bugs early
7. **Don't ignore error codes** — Design docs specify expected errors

## 🔗 Related Resources

- [HeroUI v3 Documentation](https://v3.heroui.com)
- [React Router v6 Guide](https://reactrouter.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Vite Guide](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 📝 Contributing

When working on this project:

1. Always link to design docs for architectural decisions
2. Update this AGENTS.md if conventions change
3. Keep `src/types/index.ts` as the single source of truth for types
4. Follow the atomic design pattern
5. Run `npm run lint` before submitting changes

---

**Last Updated**: May 2026  
**Stack**: React 19 + HeroUI v3 + Tailwind CSS 4 + TypeScript 5 + Vite 6  
**Deployment**: Vercel (SPA model)
