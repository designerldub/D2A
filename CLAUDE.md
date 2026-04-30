# D2A — Data 2 Action

## Project Overview

D2A is a role-based data access portal built for Oregon. It provides product-gated access to three feature modules (Care Journey, Map, Story Template) and a fully built admin panel for managing organizations, users, and super admins.

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
    ├── story-template/
    │   ├── storiesData.ts             # Mock stories, types, categories, colors
    │   └── pages/
    │       ├── StoryTemplatePage.tsx + .module.css     # Landing (filters, story grid)
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
| alice        | Alice | care-journey, map, story-template | None              |
| bob          | Bob   | care-journey                      | None              |
| carol        | Carol | map, story-template               | None              |
| dana / admin | Dana  | care-journey, map, story-template | Super admin       |
| eve          | Eve   | care-journey, map                 | Org admin (Org A) |
| frank        | Frank | story-template                    | Org admin (B + E) |

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
type ProductKey = 'care-journey' | 'map' | 'story-template'
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
| `/story-template`       | StoryTemplatePage    | product: story-template      |
| `/story-template/create`| CreateStoryPage      | product: story-template      |
| `/story-template/:id`   | StoryPage            | product: story-template      |
| `/admin`                | AdminPage            | adminOnly                    |
| `/unauthorized`         | UnauthorizedPage     | Public (error)               |
| `/*`                    | NotFoundPage         | Public (error)               |

Root `/` renders `OverviewPage` (the dashboard home).

## Admin Panel

The admin panel is a single-page view-state machine — `AdminPage.tsx` manages all sub-views via a `View` discriminated union type. No nested routing.

### View States

```ts
type Tab = 'users' | 'resources'

type View =
  | { type: 'list' }
  | { type: 'add-admin' }
  | { type: 'edit-admin'; admin: SuperAdmin }
  | { type: 'add-org' }
  | { type: 'edit-org'; org: Organization }
  | { type: 'org-users'; org: Organization; tab?: Tab }   // optional tab to return to
  | { type: 'add-user'; org: Organization }
  | { type: 'edit-user'; org: Organization; user: OrgUser }
  | { type: 'add-resource'; org: Organization }
  | { type: 'edit-resource'; org: Organization; resource: ResourceOrg }
```

### Key Types (defined and exported from AdminPage.tsx)

```ts
type OrgStatus = 'green' | 'yellow' | 'red' | 'na'

type Organization = {
  id: number; name: string; address: string; website: string
  counties: string[]; category: string
  contactName: string; contactEmail: string; contactPhone: string
  hours: string; description: string
  services: string[]   // service names — icons mapped in serviceIcons.tsx
  status: OrgStatus
}

// Resource Organizations are a sub-type of participating org. Same shape as
// Organization minus `status` (resources don't carry status). Stored in a
// separate state list, shared globally across all org detail pages for now —
// no per-org association model yet.
type ResourceOrg = Omit<Organization, 'status'>

type OrgUser = {
  id: number; firstName: string; lastName: string; email: string
  county: string; orgId: string
  isResearchParticipant: boolean
  authorizationCapacity: boolean
  dataAccessUpload: boolean
  isAdmin: boolean
  careJourneyAccess: boolean
  storyTemplateAccess: boolean
  mapAccess: boolean
}
```

Also exported from AdminPage.tsx: `STATUS_RANK`, `STATUS_LABEL`, `STATUS_OPTIONS` for status-column rendering, sorting, and picker UI.

### List View (super admin)

- **Data Products card** — Care Journey, Story Template, Map (Active status). Title shows count `(3)`.
- **Super Admins card** — sortable name+email table, add/edit/delete via `SuperAdminForm`. Title shows count.
- **Participating Organizations card** — sortable table (Organization Name with stacked `Admins: N` / `Users: N` tokens, Status, Counties, Category, Services). No Edit column — editing happens at the next level via the "Edit" button on `OrgUsersPage`. Org name is clickable → org detail.

### List View (multi-org admin)

- Participating Organizations card only, filtered to their orgs (`tableWrapperAuto` removes the height cap so a small list fits without scroll).
- No Data Products / Org Admins cards on this view — those appear when they drill into a specific org.

### Single-org admin (Eve)

- Skips list view entirely — `useState` initializer routes straight to `org-users` for their one org.
- That `org-users` view shows the same Data Products + Org Admins cards row that any non-super-admin sees on drill-in (see below).

### Org-users drill-in (org-users view)

For both single- and multi-org admin, the org-users view renders a top cards row above the org detail:
- **Data Products card** (left)
- **Org Admins card** (right) — name+email of users with `isAdmin: true` for that org, sortable

Below the cards: `OrgUsersPage` showing tabs **Users** | **Resources**.

Super admin gets the org detail card alone (no cards row above) — they have those cards on the list view.

### Features per form

All admin forms share:
- **Back link rendered above the card** by the parent (`AdminPage`). Story-template style — small, no border, label is the destination name ("Admin", or the org name when returning to a specific org's detail). Defined as a local `BackLink` helper in `AdminPage.tsx` using `.backLink` from `AdminPage.module.css`.
- Confirm-delete flow: first click shows a toast warning, second click executes delete. Toast auto-dismisses after 4 seconds.

**OrgForm** — reusable for both Organizations and Resources via an `entityName` prop (default `"Organization"`). Title, submit button label, description placeholder, and delete button label all interpolate the entity name. Fields: name, address, website, counties (multi-select), category, contact name/email/phone, hours, description, services (checkbox list with icons + add-custom-type). The form's `onSave` shape is `Omit<Organization, 'id'>` (always includes `status`). Org handlers use `data.status`; resource handlers destructure and drop it. A `showStatus` prop (passed by the org-form views, not the resource-form views) toggles the status picker — a row of four pill-style radio buttons (Green / Yellow / Red / N/A) under the County field. New orgs default to `'na'` if the picker isn't surfaced.

**SuperAdminForm** — first name, last name, email.

**OrgUserForm** — toggles: Research Participant; fields: name, email, county, org; toggles: Authorization Capacity, Data access/upload, Admin, Care Journey, Story Template, Map access.

**OrgUsersPage** — header (org name in `var(--brand-green)` + status pill (dot + label) + optional "Edit" button + counties stacked beneath), tabs row, then either:
- **Users tab** — table: Edit | User Name + email | Data Product Access chips | Permissions badges | Research Participant (centered). `+ Add User` button in the header.
- **Resources tab** — table: Organization Name | Counties | Category | Services. Sortable. Resource names are clickable to edit when `onEditResource` is provided. Org admins get a `+ Add Resource` button in the header; super admin sees the resources tab as view-only.

The "Edit" button next to the org name in the header is super-admin-only (`onEditOrg` is only passed for super admins) — org admins can't edit their org's metadata.

### Table treatment

Card tables across the admin panel use a consistent header treatment:
- Header row background: `var(--brand-blue-tint)` (`#f0f7fc`)
- Header text: `var(--brand-blue-dark)` (passes WCAG AA on the tint at ~6.5:1)
- No top/bottom border on the th — the fill provides the visual separator from data rows
- The card's `cardHeader` no longer has a `border-bottom`; the blue header band sits flush under the title
- Data Products card (which uses a `<ul>`, not a `<table>`) renders an empty `.productHeader` div before its list to mirror the header band visually for layout parity with sibling cards

Sortable column headers add a chevron via the local `IconSortIndicator` and toggle asc/desc on click.

## Shared Utilities

### `features/_shared/pageHeader.module.css`
Canonical page title + subtitle pattern — **all main page titles compose from this, never duplicate**. Exports:
- `.title` — `1.875rem` / weight 400 / `var(--brand-green)`, `width: fit-content`, with a `::after` pseudo rendering an animated soft-blue underline (`rgba(119, 175, 216, 0.36)`, 12px tall, scales in on load via `titleUnderlineIn` keyframe).
- `.subtitle` — `0.9rem` / `var(--brand-green)`.

Used by: `StoryTemplatePage`, `CreateStoryPage`, `StoryPage`, `PlaceholderPage` (Overview / Care Journey / Map), `StatusPage` (403/404). Auth pages and admin forms use their own styling intentionally.

### `features/admin/adminIcons.tsx`
Single source for all admin SVG icons. Import from here, never define locally:
- `IconArrowLeft`, `IconTrash({ size? })`, `IconWarning`, `IconX`, `IconEdit`, `IconCheck`

### `features/admin/adminForm.module.css`
Shared form styles used via CSS Modules `composes`. Each form module composes from here and only defines what's unique. Shared classes: `card`, `title`, `divider`, `section`, `sectionTitle`, `twoCol`, `field`, `label`, `input`, `select`, `actions`, `actionsLeft`, `primaryBtn`, `cancelBtn`, `deleteBtn`, `deleteConfirmBtn`, `toast`, `toastIcon`, `toastMessage`, `toastClose`. Note: `titleRow` and `backBtn` still exist in the file but are no longer composed by any form — back navigation lives outside the card now (see `BackLink` in `AdminPage.tsx`).

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
- Full admin panel with role-based views: super admin / multi-org admin / single-org admin. Manages super admins, participating organizations (with status, multi-county, admin/user counts), org users, and resource organizations. Org admins can add/edit/delete resources within their orgs; super admin sees resources view-only.
- **Story Template** — full landing (filters, search, story grid), story detail (7 render types: text, audio, brochure, journey, infographic, quotes, wordcloud), and Create a Story wizard (5 steps: Category → Type → Story → Review → Publish, with segmented progress bar and animated thank-you)

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
