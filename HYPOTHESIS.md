# EDI Central Tracking — Operational Tool for Vendor Operations Teams

## Requirements source

- **HLR (authoritative for this build):** [HLR — BEESEDI-51860 — EDI Central Tracking — Operational Tool for Vendor Operations Teams](https://ab-inbev.atlassian.net/wiki/spaces/BLK/pages/6218907975) (Confluence page `6218907975`).
- **Companion retailer-facing HLR:** [HLR — BEESEDI-51859 — Self-Service Order Visibility for Retailers](https://ab-inbev.atlassian.net/wiki/spaces/BLK/pages/6220185829) — same data and taxonomy, no corrective actions.
- **Live prototype (publish target):** https://github.com/silarerenan-cmyk/edi-central-tracking-ops-tool

## Hypothesis

> **Vendor operations analysts will resolve blocked and rejected EDI orders within SLA — without escalating to BEES support — when the Link Admin EDI Central Tracking tool exposes (a) the full order pipeline across all retailer chains and POCs, (b) the specific business rule that fired, and (c) a rule-specific corrective action they can apply in a single click.**

## Variant

**A** — Desktop-dense ops queue + extended filters (90-day window) + rule-aware drawer with rule-specific corrective actions + bulk reprocess pinned to a single blocking rule.

## Target audience

Vendor operations analysts and managers inside the Link Admin app (internal). Not retailers — the read-only retailer experience lives in the BEESEDI-51859 prototype.

## Order status taxonomy (HLR-mandated, exactly 4)

| Status | Meaning | Has corrective action? |
|---|---|---|
| **Accepted** | Fully accepted, in BEES OMS | No |
| **Blocked** | On hold by a business rule | Yes — rule-specific |
| **Rejected** | Will not be processed unless re-queued | Yes — 2-option reprocess |
| **In queue** | Being processed (waiting or processing) | No |

## Business rules (HLR-mandated, exactly 9)

**Blocked:**
1. `POC_NOT_FOUND` — Reprocess without fixes
2. `PO_DUPLICATED` — Bypass duplication rule
3. `UPC_NOT_FOUND` — Select the correct UPC per affected line
4. `PRICE_MISMATCH` — Choose retailer price OR BEES contract price (bypass further price validation)
5. `INVALID_PACKAGING` — Reprocess without fixes

**Rejected (all use the 2-option reprocess pattern):**
6. `INVALID_DELIVERY_RANGE`
7. `INVALID_DELIVERY_WINDOW`
8. `MIN_ORDER_QUANTITY`
9. `MAX_ORDER_QUANTITY`

For every Rejected rule the analyst picks either **(1) reprocess as-is** or **(2) bypass the rule and reprocess**.

## Metrics

Confirmed against the HLR's Data Tracking section (Confluence page 6218907975). All metrics are observable via `data-track` attributes or `HT.track()` calls already wired into `index.html`.

| # | Name | Type | Threshold | Tracks (`data-track` / `HT.track`) |
|---|---|---|---|---|
| 1 | **Triage depth** | Primary | ≥ 40 % of sessions open ≥ 1 order detail (drawer or item page) | `row-open-items`, `row-summary`, `order_drawer_opened`, `item_page_rendered` |
| 2 | **Ops filter use** | Discovery | ≥ 70 % of sessions apply ≥ 1 structured filter | `filters_applied_explicit`, `summary_card_clicked`, `filter_from_rule_badge` |
| 3 | **Rule-specific action completion** | Primary | ≥ 60 % of drawer opens on Blocked/Rejected orders end with a `reprocess_completed` event | `drawer-action-poc_not_found`, `drawer-action-po_duplicated`, `drawer-action-upc_not_found`, `drawer-action-price_mismatch`, `drawer-action-invalid_packaging`, `drawer-action-invalid_delivery_range`, `drawer-action-invalid_delivery_window`, `drawer-action-min_order_quantity`, `drawer-action-max_order_quantity`, `reprocess_completed` |
| 4 | **Bulk workflow adoption** | Engagement | ≥ 25 % of sessions that reprocess use a bulk-rule path (same-rule batch) | `bulk_select_all_filtered`, `bulk_reprocess_triggered`, `bulk_reprocess_completed` |
| 5 | **Resolution documentation** | Engagement | ≥ 30 % of sessions that open the drawer add ≥ 1 resolution note (facilitated tests) | `resolution_note_dialog_opened`, `resolution_note_added` |

> The HLR also listed a "Sales loop" qualitative metric. **Dropped** in the final HLR revision — the prototype does not expose a "Notify sales rep" action and the metric is therefore not measurable.

## Tracked events (non-exhaustive)

- **Filters:** `filters_applied_explicit`, `filters_cleared`, `filter_chip_removed`, `filter_drafted`, `filter_from_rule_badge`
- **Summary cards:** `summary_card_clicked` (Accepted / Blocked / Rejected / In queue)
- **Row interaction:** `row-open-items`, `row-summary`, `row-take-action-blocked`, `row-take-action-rejected`
- **Drawer:** `order_drawer_opened`, `order_drawer_closed`, `drawer-action-<rule_code>`, `drawer-rule-badge`, `drawer-add-note`
- **Rule-specific UI:** `drawer-upc-pick`, `drawer-price-bees`, `drawer-price-requested`, `drawer-rejected-as-is`, `drawer-rejected-bypass`
- **Reprocess outcomes:** `reprocess_triggered`, `reprocess_completed` (with `rule_category`, `chosen_action`, `outcome`)
- **Bulk:** `bulk-select-all`, `bulk_select_all_filtered`, `bulk_selection_cleared`, `bulk_confirmation_shown`, `bulk_reprocess_triggered`, `bulk_reprocess_completed`
- **Item page:** `item_page_rendered`, `rule-badge-click`, `item-take-action`, `item-add-note`
- **Resolution notes:** `resolution_note_dialog_opened`, `resolution_note_added`

## Data (mock)

`data.js` generates ~120 deterministic EDI orders across the last 90 days, distributed across 4 vendors, 6 retailer chains, 5 regions, 4 sales reps, and ~30 POCs. Status distribution is weighted Accepted 45 / Blocked 22 / Rejected 18 / In queue 15. Every Blocked / Rejected order is tagged with one of the nine canonical business rule codes. Lines on Blocked orders with `scope: 'line'` rules (UPC not found, Price mismatch, Invalid packaging) carry the rule on the affected line; order-scope rules (POC not found, PO duplicated) do not tag individual lines.

## In scope (this prototype)

- **Operations queue page (FR-1, FR-2, FR-3, FR-4):**
  - 4-card KPI summary (Accepted / Blocked / Rejected / In queue) with quick-filter behaviour.
  - 7-dimension filter panel (Status, Business rule, Retailer chain, POC, Vendor, Region, Sales rep) + PO search + 90-day period (default 30 d).
  - Active-filter chips with one-click removal.
- **Order table (FR-5):**
  - Status + receive date + POC/chain + business rule badge + PO# + BEES order# + value.
  - Pagination + page-size selector.
- **Rule-aware drawer (FR-6, FR-7, FR-9, FR-14):**
  - Rule-specific corrective action UI for the five blocking rules + the four rejection rules.
  - Audit timeline (system events + ops actions + resolution notes).
  - Resolution-notes list with category-tagged add note flow.
- **Bulk reprocess pinned to a single blocking rule (FR-8):**
  - Toolbar selection pins the rule of the first selected order; only matching-rule orders can be added.
  - Confirmation dialog when batch size > 50.
- **Filter-by-rule shortcut from item page / drawer (FR-11):**
  - Clicking the rule badge anywhere applies it to the queue and clamps the status filter.
- **Item-level page:**
  - Order facts grid + line-level cards (status pill, requested vs. delivered diff, line-level rule note).

## Out of scope (this prototype — deferred to next iteration)

- Operational health analytics view (FR-15: top failing rules, top affected POCs, reprocess success rate, status trend).
- Notifications & subscriptions for high-priority breaches (FR-13).
- Configurable saved filter views (FR-16).
- Cross-vendor / multi-tenant entitlement enforcement (NFR-3).
- Streaming refresh (today's pipeline refresh is on-load only).
- Real APIs / persistence / SSO / email delivery — all reprocess outcomes are mocked.
- Mobile / responsive < 900px (desktop-first scope per NFR-9).

## Assumptions

- The order pipeline refresh of "near real time (≤ 60 s)" (NFR-1) is mocked — local actions resolve in 900 ms via `setTimeout`.
- The "audit trail" requirement (FR-14) is implemented in-memory via `o.audit`; reset on page reload.
- The Link Admin app shell is approximated by the BEES one rail + topbar already in the prototype.

## Privacy

- Do not log PO numbers, retailer names, sales rep names, or free-text note bodies in `HT.track` payloads — use rule codes, status IDs, and counts only. Compliant with HLR NFR-7.

## Dashboard

Open the [live dashboard](_shared/dashboard.html?id=edi-central-tracking-ops-tool) after clicking through the prototype locally — heatmap available via the **🗺 Heatmap** button on the dashboard toolbar.
