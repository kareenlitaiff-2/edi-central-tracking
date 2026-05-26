# Offers & Promotions Hub

## Hypothesis
> Giving BEES Link retailers a **single, discoverable Hub** that consolidates all available offers — with status-aware filtering, an expiry signal, and a one-click "Activate" CTA — will materially increase **offer click-through rate** and **shorten time to first activation** versus today's fragmented discovery (banners + category pages + sales-rep calls).

## Variant
**A** — Hub-first discovery with summary cards, filters, table, and non-modal detail drawer.

## Requirements source
This prototype is built **directly from a PRD**: `PRD-offers-promotions-hub.md` (BEES Link — Commercial Management — *Offers & Promotions Hub*, draft 2026-05-14, author: Product Management / BRE squad).

The PRD is the single source of truth for scope, screens, states, and success metrics. This file maps the PRD into testable hypothesis terms.

## Target audience
| Persona | Description |
|---|---|
| **Retailer (POC owner / buyer)** | Primary tester. Logs into BEES Link to manage purchases. Should be able to find a relevant offer and activate it within 90 seconds without help. |
| **Key Account (KA) manager** | Secondary. Will demo the Hub to retailers in-person. Tests "first impression" coherence and information density. |

Sample size target: **8–12 moderated sessions** plus **30+ unmoderated participants** through the prototype link.

## Success metrics

| # | Metric | Source event(s) | Target |
|---|---|---|---|
| 1 | Offer card click-through rate | `click` where `track` matches `offer-row-*` or `summary-card-*` / `pageview` on the Hub | ≥ 50% of Hub sessions click at least one offer row or card |
| 2 | Filter engagement | `click` where `track == "cta-filter-apply"` or any `summary-card-*` quick-filter | Median ≥ 1 filter interaction per session |
| 3 | Drawer-to-activation conversion | `click` where `track == "cta-activate-drawer"` / `click` where `track == "cta-view-details"` or `offer-row-*` | ≥ 25% of sessions that open the drawer also activate |
| 4 | Time to first activation | First `cta-activate-*` `click` ts − first `pageview` ts on the Hub | Median < 90 s |
| 5 | Status comprehension (qualitative) | Post-test interview question | ≥ 80% of testers correctly explain the meaning of "Expiring soon" and "Active" pills |

## In scope (this prototype)
Per PRD §13 — *Prototype scope (for Design team demo)*:

- **Offers Hub** — main list with summary cards, collapsible filter panel, full offers table (12 mock offers across the 4 statuses: `new`, `expiring`, `active`, `used`).
- **Detail drawer** — opens on row click; populated header, key facts grid, terms & conditions, eligible SKUs, and status-contextual alert.
- **Activated state** — clicking "Activate" triggers row flash + status pill flip to `Active` + button shows "Activated ✓" and becomes inert.
- **Empty state** — surfaces `NoSearchResults` illustration when all filters yield zero rows (e.g. `Status: Used` + `Category: Spirits`).
- **Topbar nav** — BEES topbar with `Commercial management` active in the secondary nav and `Offers` highlighted with the yellow underline in the commercial sub-tabs row. Clicking the topbar `Order` link routes to a placeholder screen; other topbar links are inert.

## Tracked CTAs

| `data-track` id | Meaning |
|---|---|
| `nav-order`, `nav-product-categories`, `nav-commercial`, `nav-payments`, `nav-help` | Topbar secondary nav clicks |
| `subtab-overview`, `subtab-offers`, `subtab-catalog`, `subtab-reports` | Commercial Mgmt sub-tabs |
| `summary-card-all`, `summary-card-new`, `summary-card-expiring`, `summary-card-active`, `summary-card-used` | Quick-filter cards |
| `cta-filter-toggle`, `cta-filter-apply`, `cta-filter-clear` | Filter panel interactions |
| `offer-row-<OFF-ID>` | Whole-row click for a given offer |
| `cta-view-details` | "View details" icon button in a row |
| `cta-activate-row` | "Activate" button inside the row |
| `cta-activate-drawer` | "Activate" button inside the detail drawer |
| `cta-close-drawer` | Drawer close (X / scrim / Esc) |
| `cta-empty-clear-filters` | "Clear filters" link in the empty state |

Custom `HT.track` events:
- `offer_activated` `{ offerId, source: "row" | "drawer" }`
- `filter_applied` `{ status: [...], categories: [...], brands: [...] }`
- `drawer_opened` `{ offerId }`

## What "validated" looks like
- **Strongly supports** the hypothesis if **all** of the following hold across ≥ 25 sessions:
  - Median time to first activation < 90 s
  - ≥ 50% of Hub sessions register at least one `offer-row-*` or `summary-card-*` click
  - ≥ 25% drawer→activation conversion
- **Partially supports** if 2 of 3 thresholds are met but qualitative feedback confirms the discovery story.
- **Rejects** if median activation time stays above 3 minutes OR fewer than 20% of testers ever open the drawer.

## Privacy
- No PII captured by default — form values are not tracked.
- Filter selections are tracked as **shape only** (which fields were touched / how many options selected), not the literal values, except for the high-level status filter (non-PII).

## Out of scope (this prototype)
Per PRD §12 + §13:

- Push or email notifications about new offers.
- Personalised / ML-ranked recommendations.
- Offer creation or editing (KA back-office tooling).
- Real backend / persistence — all data is mocked in `data.js`.
- Real integration with checkout — `Activate` is a standalone optimistic action.
- Multi-brand comparison, bundle builder, negotiation flow.
- Mobile layout (web only — tested at 1440 / 1280 / 1024 widths).
- Pagination beyond page 1 (controls render but the demo dataset fits on a single page).
- Error state with "Retry" button (stretch goal, not in this version).

## Open questions (from the PRD)
| # | Question | Status in prototype |
|---|---|---|
| Q1 | Max simultaneous active offers? | Not enforced — testers can activate any number. |
| Q2 | Should `Activate` need a confirmation dialog? | **Single click in this prototype** — we will compare friction perception in post-test interviews. |
| Q3 | Can a retailer de-activate an offer? | Not implemented — `Activate` is one-way for now. |
| Q4 | Server-side vs. client-side pagination? | Out of scope. |
| Q5 | Region-configurable "Expiring soon" threshold? | Hard-coded to 7 days for the demo. |

## Data
Open the [dashboard](../_shared/dashboard.html?id=offers-promotions-hub) to see live metrics from your browser. Ask testers to use **Download JSON** to export their session for offline collation.
