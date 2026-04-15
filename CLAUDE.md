# D2A — Data 2 Action

## Project Overview

D2A is a role-based data access portal built for Oregon. It provides product-gated access to three feature modules (Care Journey, Map, User Stories) and a fully built admin panel for managing organizations, users, and super admins.

## Tech Stack

- **React 19** + **TypeScript 6**
- **React Router DOM 7** for routing
- **Vite 8** as build tool
- **CSS Modules** for component styling (no Tailwind, no styled-components)
- **React Context API** for auth state (no Redux/Zustand)

## Dev Commands

```bash
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # tsc -b && vite build
npm run preview   # Preview production build → http://localhost:4173
npm run lint      # ESLint
```

## Project Structure

```
src/
├── App.tsx
├── main.tsx
├── index.css                          # Global styles + CSS variables (brand tokens)
├── assets/                            # logo.png, logo-icon.png, auth-bg.jpg, hero.png
├── contexts/
│   └── AuthContext.tsx                # Mock auth state, user model, product + admin access
├── layouts/
│   └── AppLayout.tsx                  # Sidebar nav + main content shell
├── pages/                             # Auth & error pages
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── AuthShell.tsx
│   ├── authCard.module.css            # Shared auth-card styles (separate design language)
│   ├── StatusPage.module.css          # Shared 403/404 page styles
│   ├── UnauthorizedPage.tsx           # 403
│   └── NotFoundPage.tsx               # 404
├── router/
│   ├── index.tsx                      # All route definitions
│   └── ProtectedRoute.tsx             # Guards by product access or adminOnly
└── features/
    ├── _shared/
    │   ├── pageHeader.module.css      # Canonical page title + subtitle pattern (compose from this)
    │   └── PlaceholderPage.module.css # Shared placeholder page (Overview, Care Journey, Map, Guided Process)
    ├── overview/pages/OverviewPage.tsx                 # STUB (uses PlaceholderPage)
    ├── care-journey/pages/VisualizationPage.tsx        # STUB (uses PlaceholderPage)
    ├── map/pages/MapPage.tsx                            # STUB (uses PlaceholderPage)
    ├── user-stories/
    │   ├── storiesData.ts             # Mock stories, types, categories, colors
    │   └── pages/
    │       ├── UserStoriesPage.tsx + .module.css       # Landing (filters, story grid)
    │       ├── StoryPage.tsx + .module.css             # Story detail (all 7 render types)
    │       ├── CreateStoryPage.tsx + .module.css       # Wizard shell (5 steps, segmented bar)
    │       ├── Step1Topic.tsx + .module.css            # Select a Category + tips carousel
    │       ├── Step2StoryType.tsx + .module.css        # Pick formats
    │       ├── Step3Story.tsx + .module.css            # Upload / Write / Guided
    │       ├── Step4Review.tsx + .module.css           # Include/exclude formats
    │       ├── Step5Publish.tsx + .module.css          # Consent + signature + thank-you
    │       └── GuidedProcessPage.tsx                   # STUB (unused by router, kept for reference)
    └── admin/
        ├── adminIcons.tsx             # Shared SVG icon components for admin feature
        ├── adminForm.module.css       # Shared form styles (composed into form modules)
        └── pages/
            ├── AdminPage.tsx          # Main admin view — manages all sub-views via View state
            ├── AdminPage.module.css
            ├── OrgForm.tsx            # Add/edit organization form
            ├── OrgForm.module.css
            ├── OrgUsersPage.tsx       # User list for an org
            ├── OrgUsersPage.module.css
            ├── OrgUserForm.tsx        # Add/edit org user form
            ├── OrgUserForm.module.css
            ├── SuperAdminForm.tsx     # Add/edit super admin form
            ├── SuperAdminForm.module.css
            └── serviceIcons.tsx       # Service-type icon mapping
```

## Auth & Access Control

### Mock Users (dev only — any password accepted)

| Email prefix | User  | Products                          | Admin role        |
|--------------|-------|-----------------------------------|-------------------|
| alice        | Alice | care-journey, map, user-stories   | None              |
| bob          | Bob   | care-journey                      | None              |
| carol        | Carol | map, user-stories                 | None              |
| dana / admin | Dana  | care-journey, map, user-stories   | Super admin       |
| eve          | Eve   | care-journey, map                 | Org admin (Org A) |
| frank        | Frank | user-stories                      | Org admin (B + E) |

Login with e.g. `alice@anything.com` / any password.

### Admin Role Levels

Three distinct admin roles, each with different access to the Admin panel:

| Role | Access |
|------|--------|
| **Super admin** | Full admin panel: Data Products, Super Admins table, all Organizations, full edit/add/delete |
| **Multi-org admin** | Filtered org list (only their orgs), click through to user lists — no org editing |
| **Single-org admin** | Lands directly on their org's user list — no list view at all |

Roles are determined by `isSuperAdmin: boolean` and `orgAdminIds: number[]` on `MockUser`.

### MockUser Shape

```ts
interface MockUser {
  id: string
  name: string
  products: ProductKey[]
  isAdmin: boolean       // true for any admin role — gates the Admin nav link
  isSuperAdmin: boolean  // full access to all admin features
  orgAdminIds: number[]  // org IDs this user can administer
}
```

### Product Keys

```ts
type ProductKey = 'care-journey' | 'map' | 'user-stories'
```

### ProtectedRoute Usage

```tsx
<ProtectedRoute />                        // Login required
<ProtectedRoute product="care-journey" /> // Product access required
<ProtectedRoute adminOnly />              // isAdmin required
```

## Routes

| Path                    | Component            | Guard                        |
|-------------------------|----------------------|------------------------------|
| `/login`                | LoginPage            | Public                       |
| `/register`             | RegisterPage         | Public                       |
| `/forgot-password`      | ForgotPasswordPage   | Public                       |
| `/` + `/overview`       | OverviewPage         | Login required               |
| `/care-journey`         | VisualizationPage    | product: care-journey        |
| `/map`                  | MapPage              | product: map                 |
| `/user-stories`         | UserStoriesPage      | product: user-stories        |
| `/user-stories/create`  | CreateStoryPage      | product: user-stories        |
| `/user-stories/:id`     | StoryPage            | product: user-stories        |
| `/admin`                | AdminPage            | adminOnly                    |
| `/unauthorized`         | UnauthorizedPage     | Public (error)               |
| `/*`                    | NotFoundPage         | Public (error)               |

Root `/` renders `OverviewPage` (the dashboard home).

## Admin Panel

The admin panel is a single-page view-state machine — `AdminPage.tsx` manages all sub-views via a `View` discriminated union type. No nested routing.

### View States

```ts
type View =
  | { type: 'list' }
  | { type: 'add-admin' }
  | { type: 'edit-admin'; admin: SuperAdmin }
  | { type: 'add-org' }
  | { type: 'edit-org'; org: Organization }
  | { type: 'org-users'; org: Organization }
  | { type: 'add-user'; org: Organization }
  | { type: 'edit-user'; org: Organization; user: OrgUser }
```

### Key Types (defined and exported from AdminPage.tsx)

```ts
type Organization = {
  id: number; name: string; address: string; counties: string[]
  category: string; contactName: string; contactEmail: string
  contactPhone: string; hours: string; description: string
  services: string[]   // service names — icons mapped in serviceIcons.tsx
}

type OrgUser = {
  id: number; firstName: string; lastName: string; email: string
  county: string; orgId: string
  isResearchParticipant: boolean
  authorizationCapacity: boolean
  dataAccessUpload: boolean
  isAdmin: boolean
  careJourneyAccess: boolean
  userStoriesAccess: boolean
  mapAccess: boolean
}
```

### List View (super admin)

- **Data Products card** — Care Journey, User Stories, Map (Active status)
- **Super Admins card** — sortable table, add/edit/delete via `SuperAdminForm`
- **Organizations card** — sortable table (name, county, category, services with icons), org name is clickable → user list

### List View (multi-org admin)

- Organizations card only, filtered to their orgs, no edit buttons, no Add

### List View (single-org admin)

- Skips list entirely — opens directly on org-users view

### Features per form

All admin forms share:
- Back button in title row
- Confirm-delete flow: first click shows a toast warning, second click executes delete
- Toast auto-dismisses after 4 seconds

**OrgForm** — org name, address, counties (multi-select), category, contact fields, hours, description, services (checkbox list with icons)

**SuperAdminForm** — first name, last name, email

**OrgUsersPage** — table: Edit | User Name + email | Data Product Access chips | Permissions badges | Research Participant checkmark

**OrgUserForm** — toggles: Research Participant; fields: name, email, county, org; toggles: Authorization Capacity, Data access/upload, Admin, Care Journey, User Stories, Map access

## Shared Utilities

### `features/_shared/pageHeader.module.css`
Canonical page title + subtitle pattern — **all main page titles compose from this, never duplicate**. Exports:
- `.title` — `1.875rem` / weight 400 / `var(--brand-green)`, `width: fit-content`, with a `::after` pseudo rendering an animated soft-blue underline (`rgba(119, 175, 216, 0.36)`, 12px tall, scales in on load via `titleUnderlineIn` keyframe).
- `.subtitle` — `0.9rem` / `var(--brand-green)`.

Used by: `UserStoriesPage`, `CreateStoryPage`, `StoryPage`, `PlaceholderPage` (Overview / Care Journey / Map), `StatusPage` (403/404). Auth pages and admin forms use their own styling intentionally.

### `features/admin/adminIcons.tsx`
Single source for all admin SVG icons. Import from here, never define locally:
- `IconArrowLeft`, `IconTrash({ size? })`, `IconWarning`, `IconX`, `IconEdit`, `IconCheck`

### `features/admin/adminForm.module.css`
Shared form styles used via CSS Modules `composes`. Each form module composes from here and only defines what's unique. Shared classes: `card`, `titleRow`, `backBtn`, `title`, `divider`, `section`, `sectionTitle`, `twoCol`, `field`, `label`, `input`, `select`, `actions`, `actionsLeft`, `primaryBtn`, `cancelBtn`, `deleteBtn`, `deleteConfirmBtn`, `toast`, `toastIcon`, `toastMessage`, `toastClose`.

### `features/admin/pages/serviceIcons.tsx`
Maps service name strings to SVG icons: Emergency Department, Behavioral Health Resources, Housing, Food Resources, naloxone availability, stabilization center.

## Design Tokens

Defined in `src/index.css` under `:root`. Always reference via `var(--name)` — never hardcode these hex values:

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-blue` | `#77AFD8` | Primary blue — borders, buttons, progress segments, title underline |
| `--brand-blue-dark` | `#1F5C8E` | Text & icons that need contrast on white (WCAG AAA ~7:1) |
| `--brand-blue-hover` | `#5e9bc8` | Darker border on hover |
| `--brand-blue-tint` | `#f0f7fc` | Subtle hover background |
| `--brand-green` | `#274844` | Page titles, page subtitles, sidebar active, body text in headers |
| `--brand-tan` | `#DEDCCA` | Warm neutral |

## App Shell

- **Sidebar** — logo (full on wide screens, icon-only crop on ≤900px), nav links filtered by product access + admin role, user name, logout
- **Logo assets** — `logo.png` (full), `logo-icon.png` (icon-only for small screens)
- Sidebar collapses to icon-only at ≤900px via CSS media query

## What's Built vs. Stubbed

### Complete
- Auth UI (login, register, forgot password) with form validation, password visibility toggles
- Mock auth with product-based access control and three-tier admin roles
- Route protection (`ProtectedRoute`)
- App shell with responsive sidebar
- Error pages (403, 404)
- Full admin panel (super admins, organizations, org user management) with role-based views
- **User Stories** — full landing (filters, search, story grid), story detail (7 render types: text, audio, brochure, journey, infographic, quotes, wordcloud), and Create a Story wizard (5 steps: Category → Type → Story → Review → Publish, with segmented progress bar and animated thank-you)

### Stubbed (empty canvases — ready for implementation)
- `/` + `/overview` — OverviewPage
- `/care-journey` — VisualizationPage
- `/map` — MapPage
- Password reset (no API wired)
- No real backend — all data is in-memory mock state

## Conventions

- **CSS Modules** for all component styles — co-located with their component
- **Shared page title/subtitle** — compose `.title` and `.subtitle` from `features/_shared/pageHeader.module.css`, never re-implement the animated underline or subtitle color
- **Shared admin styles** — compose from `adminForm.module.css`, never duplicate
- **Shared admin icons** — import from `adminIcons.tsx`, never define locally
- **Brand colors** — reference via `var(--brand-*)` tokens from `index.css`, never hardcode the hex
- **Feature modules** live under `src/features/<feature-name>/` with a `pages/` subdirectory
- **Category vs Topic**: the user-facing term is **"category"** (matches the `StoryCategory` type and `STORY_CATEGORIES` constant). Internal prop/var names like `topic` on the wizard are private wiring.
- TypeScript strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- No default exports from context files — use named exports
