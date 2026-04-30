# D2A Design Notes

Visual + UX patterns and the rationale behind them. Companion to `CLAUDE.md` — that doc is for codebase orientation, this one is for design decisions.

## Brand tokens (from `src/index.css`)

| Token | Hex | Where it shows up |
|---|---|---|
| `--brand-green` | `#274844` | Page titles (h1), card titles, sidebar active state, body text in headers |
| `--brand-blue` | `#77AFD8` | Primary blue accents — borders, button outlines, the title underline animation, status dots |
| `--brand-blue-dark` | `#1F5C8E` | Any blue text or icon that needs to read against white or `--brand-blue-tint`. WCAG AA on white (~7:1) and on the tint (~6.5:1). |
| `--brand-blue-hover` | `#5e9bc8` | Darker border on hover only (low contrast — never use for text) |
| `--brand-blue-tint` | `#f0f7fc` | Subtle hover backgrounds AND the table-header band fill |
| `--brand-tan` | `#DEDCCA` | Warm neutral, sparingly |

**Always reference via `var(--name)`.** Never hardcode the hex.

## Accessibility (WCAG AA validated)

All text passes 4.5:1 against its background. Combinations checked and the values they hit:

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| `--brand-green` (#274844) | white | 10.0 | Card titles, page h1 |
| `--brand-blue-dark` (#1F5C8E) | white | 7.05 | Org-name links, body links |
| `--brand-blue-dark` | `--brand-blue-tint` | 6.52 | **Table header text** (canonical) |
| `#374151` (gray-700) | `#f3f4f6` (gray-100) | 9.4 | Service chips |
| `#4b5563` (gray-600) | `#f3f4f6` | 6.9 | Count tokens (`Admins: N`) |
| `#15803d` (green-700) | white | 5.0 | "Active" Data Products status |
| `#6b7280` (gray-500) | white | 4.83 | Secondary text — emails, "(N)" counts, back-link, table-header in tint |

Avoid: `--brand-blue` and `--brand-blue-hover` for text — both fail AA (~2-2.8:1).

If introducing a new text style, run the contrast check before merging — a small dev-only helper script lives in the chat history; happy to formalize as a CI check if useful.

## Section / card patterns

### Cards

White surface, 12px radius, 1px gray border, no shadow. Title in `--brand-green`. The header has a min-height of 76px so cards with and without an action button align side-by-side. **No `border-bottom` on the cardHeader** — the table's blue fill band acts as the divider.

### Tables in cards

Consistent header treatment across the admin panel:
- Background: `--brand-blue-tint`
- Text: `--brand-blue-dark`, weight 500, font-size 0.78rem
- No top or bottom border on the th
- Data rows have a `1px solid #f3f4f6` separator
- Hover state: `#f9fafb` row background

Sortable headers show a chevron icon (filled for active sort, dim for inactive). Clicking toggles asc/desc.

For non-table content cards that should still align visually with sibling tables (e.g., Data Products), render an empty header band of the same height (`42px`, matching the th rendered height) with the same `--brand-blue-tint` fill.

### Page titles

Two distinct pages-style patterns:

**Story-template pages** (User Stories landing, Story detail, Create Story wizard) compose `.title` and `.subtitle` from `features/_shared/pageHeader.module.css`:
- Title 1.875rem, weight 400, `--brand-green`, with an animated `--brand-blue` underline that scales in on mount
- Subtitle 0.9rem, `--brand-green`

**Admin pages** use plain h1/h2 with `--brand-green` — no underline animation. Admin is functional density-driven; the story flow is more lyrical.

## Navigation

### Back link (story-template style)

Small ghost link with a left-arrow icon. Label is the **destination name** ("Admin" or the org name), not the word "Back".

```css
.backLink {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: none; border: none; padding: 0;
  color: #6b7280; font-size: 0.85rem;
  cursor: pointer;
}
.backLink:hover { color: #111827; }
```

Renders **above the card**, never inside it. The `BackLink` helper in `AdminPage.tsx` is the canonical implementation for the admin panel.

### Tabs

Underline-style tabs (`OrgUsersPage`'s Users / Resources). Active tab gets `--brand-blue` 2px bottom border, `--brand-blue-dark` text. Tab count appears in muted text after the label: `Users (3)`.

## Status & state indicators

### Org status (green / yellow / red / n/a)

Solid colored dot (10px) + label (`Green` / `Yellow` / `Red` / `N/A`) — the label is always paired with the dot so the indicator is accessible to non-sighted users and screen readers, never color-only. Sort order: `green < yellow < red < na` ascending; N/A items fall to the bottom.

Surfaces:
- **Status column** in the Participating Organizations table (super admin landing) — sortable
- **Status pill** in the OrgUsersPage header next to the org name — pill-shaped chip on `#f3f4f6`, dot + label
- **Status picker** in the OrgForm — row of four pill-style radio buttons under the County field. Selected state uses `--brand-blue-tint` background and `--brand-blue` border. Resource form does NOT show the picker; resources have no status.

Dot palette: green `#22c55e`, yellow `#eab308`, red `#ef4444`, na `#9ca3af`.

### "Active" text

Used in Data Products card for product status. Color `#15803d` (green-700) — passes AA on white.

### Research participant

Green check on light green pill for yes; muted dash for no. Centered in the column. Yes/no is also conveyed by symbol shape, not just color.

## Forms (admin)

All admin forms (`OrgForm`, `OrgUserForm`, `SuperAdminForm`) share styles via `composes` from `features/admin/adminForm.module.css`:
- Single-column layout with occasional `.twoCol` rows for related pairs (e.g., contact name + email, address + website)
- Light gray input fields, blue focus ring
- Section dividers between groups
- Confirm-delete pattern: first click → toast warning, second click → execute. Toast auto-dismisses after 4s.
- Primary button: dark gray fill. Cancel: ghost. Delete: red ghost → red fill on confirm.

`OrgForm` is reusable for both Organizations and Resources via an `entityName` prop. The form data shape is `Omit<Organization, 'id' | 'status'>`, which is exactly the `ResourceOrg` shape — so resources flow through the same component.

## Role-aware affordances

The admin panel adapts to who's logged in:

| Affordance | Super admin | Multi-org admin (Frank) | Single-org admin (Eve) |
|---|---|---|---|
| Data Products card | List view | Drill-in view | Drill-in view (her landing) |
| Super Admins card | List view (with edit) | — | — |
| Org Admins card | — | Drill-in view | Drill-in view |
| Participating Orgs table | List view (all orgs) | List view (own orgs only) | — (skipped) |
| `+ Add Resource` | hidden (read-only) | shown | shown |
| `Edit organization` button | shown | hidden | hidden |
| Resource row click → edit | hidden | enabled | enabled |
| Back link from drill-in | "Admin" | "Admin" | none (it IS her landing) |

Rationale: org admins manage what's *inside* their orgs (users, resources). Org metadata (name, status, etc.) is super-admin territory. Single-org admins skip the list level since there's only ever one row; multi-org admins keep the list as their action surface.

## What we deliberately don't have

- **No third-party UI library** — every component is hand-rolled to keep the visual language tight.
- **No CSS-in-JS / Tailwind** — CSS Modules with explicit class names, co-located with components.
- **No design system component library** — primitives (cards, tables, forms) are inlined per-feature; shared styles only when truly reused (`adminForm.module.css`, `pageHeader.module.css`).
- **No animation framework** — the title underline uses a plain `@keyframes`. Keep motion subtle.
