/**
 * Mock EDI orders for the ops-team central tracker prototype.
 *
 * Aligned to HLR BEESEDI-51860 — EDI Central Tracking — Operational Tool for
 * Vendor Operations Teams (Confluence page 6218907975).
 *
 * Order status taxonomy (4 only):
 *   ACCEPTED  — fully accepted
 *   BLOCKED   — on hold by a business rule; analyst must act
 *   REJECTED  — order will not be processed unless bypassed/reprocessed
 *   IN_QUEUE  — in the queue to be processed (or being processed)
 *
 * Business rules (9 only) and rule-specific corrective actions per the HLR.
 */
window.EDI_DATA = (function () {

  // ----------------------------------------------------------------
  // Retailer chains — ops users see orders across many chains.
  // ----------------------------------------------------------------
  const CHAINS = [
    { code: 'OXXO',     name: 'OXXO' },
    { code: 'SORIANA',  name: 'Soriana' },
    { code: 'WALMART',  name: 'Walmart' },
    { code: 'CHEDRAUI', name: 'Chedraui' },
    { code: 'HEB',      name: 'H-E-B' },
    { code: 'CITY',     name: 'City Market' },
  ];

  // Vendors managed by this ops team (single tenant in this prototype).
  const VENDORS = [
    { code: 'AMBEV',   name: 'Ambev' },
    { code: 'GRUPO_M', name: 'Grupo Modelo' },
    { code: 'AB_BRWY', name: 'AB Brewery' },
    { code: 'AB_INBV', name: 'AB InBev US' },
  ];

  // Sales reps assigned per retailer chain (mock data only — drives the
  // Sales rep filter dimension required by HLR FR-2).
  const SALES_REPS = [
    { id: 'rep-001', name: 'María González',  chains: ['OXXO', 'SORIANA'] },
    { id: 'rep-002', name: 'Carlos Rodríguez', chains: ['WALMART', 'CHEDRAUI'] },
    { id: 'rep-003', name: 'Ana Martínez',    chains: ['HEB', 'CITY'] },
    { id: 'rep-004', name: 'Juan Hernández',  chains: ['OXXO', 'WALMART'] },
  ];

  // Region/zone the POC sits in — used by the Region filter dimension.
  const REGIONS = [
    { code: 'NORTE',   name: 'Norte' },
    { code: 'CENTRO',  name: 'Centro' },
    { code: 'BAJIO',   name: 'Bajío' },
    { code: 'SURESTE', name: 'Sureste' },
    { code: 'PACIF',   name: 'Pacífico' },
  ];

  // ~30 POCs across the chains + regions, enough that the ops user is
  // managing many retailer points-of-contact at once.
  const POCS = (function () {
    const cities = {
      NORTE:   ['Monterrey', 'Saltillo', 'Torreón', 'Chihuahua'],
      CENTRO:  ['Mexico City', 'Toluca', 'Puebla', 'Querétaro'],
      BAJIO:   ['Guadalajara', 'León', 'Aguascalientes'],
      SURESTE: ['Mérida', 'Cancún', 'Villahermosa'],
      PACIF:   ['Tijuana', 'Hermosillo', 'Mazatlán'],
    };
    const out = [];
    let n = 1000;
    CHAINS.forEach((c) => {
      const regions = ['NORTE', 'CENTRO', 'BAJIO', 'SURESTE', 'PACIF'];
      regions.forEach((r) => {
        cities[r].slice(0, 2).forEach((city) => {
          n += 1;
          out.push({
            id: 'POC-' + n,
            name: c.name + ' ' + city,
            chainCode: c.code,
            city,
            region: r,
          });
        });
      });
    });
    return out;
  })();

  // ----------------------------------------------------------------
  // Order status taxonomy — exactly 4 statuses per HLR.
  // weight = how many mock orders to generate per status (must sum > 0)
  // ----------------------------------------------------------------
  const STATUSES = [
    { id: 'ACCEPTED', label: 'Accepted', tone: 'success', weight: 45 },
    { id: 'BLOCKED',  label: 'Blocked',  tone: 'blocked', weight: 22 },
    { id: 'REJECTED', label: 'Rejected', tone: 'error',   weight: 18 },
    { id: 'IN_QUEUE', label: 'In queue', tone: 'info',    weight: 15 },
  ];

  // ----------------------------------------------------------------
  // Business rules per the HLR. Each rule maps to a corrective action
  // pattern that the drawer will render. Bulk reprocess is permitted
  // only for BLOCKED orders that share the same rule code, per FR-8.
  //
  // action patterns:
  //   'reprocess-no-fix' — single primary button, no extra config
  //   'bypass-only'      — single primary button labeled "Bypass rule"
  //   'upc-selector'     — analyst picks the correct UPC per affected line
  //   'price-choice'     — analyst picks Retailer price OR BEES price
  //   'rejected-choice'  — analyst picks (1) reprocess as-is OR (2) bypass rule
  //
  // scope:
  //   'order' — rule applies to the whole order
  //   'line'  — rule applies to specific lines (drawer shows the lines)
  // ----------------------------------------------------------------
  const RULES = [
    // ---------- Blocked rules ----------
    {
      code: 'POC_NOT_FOUND',
      label: 'POC not found',
      status: 'BLOCKED',
      scope: 'order',
      action: 'reprocess-no-fix',
      actionLabel: 'Reprocess without fixes',
      blurb: 'The POC referenced by this order is not mapped to the vendor. Reprocess to re-include the order in the queue as-is — fix the POC mapping upstream if you want this rule to stop firing for this account.',
      orderCopy: 'The POC referenced in this order is not mapped to your vendor.',
      bulkAllowed: true,
    },
    {
      code: 'PO_DUPLICATED',
      label: 'PO duplicated',
      status: 'BLOCKED',
      scope: 'order',
      action: 'bypass-only',
      actionLabel: 'Bypass duplication and reprocess',
      blurb: 'BEES detected a previous order with the same PO number. Bypass the duplication validation to re-include this order in the queue. Use this when the retailer intentionally resubmitted the same PO.',
      orderCopy: 'A previous order with the same PO number was already processed.',
      bulkAllowed: true,
    },
    {
      code: 'UPC_NOT_FOUND',
      label: 'UPC not found',
      status: 'BLOCKED',
      scope: 'line',
      action: 'upc-selector',
      actionLabel: 'Reprocess with selected UPCs',
      blurb: 'One or more lines reference a UPC that is not in the BEES catalog. Pick the correct UPC for each affected line, then reprocess.',
      orderCopy: 'Some product UPCs in this order were not found in the BEES catalog.',
      bulkAllowed: true,
    },
    {
      code: 'PRICE_MISMATCH',
      label: 'Price mismatch',
      status: 'BLOCKED',
      scope: 'line',
      action: 'price-choice',
      actionLabel: 'Reprocess with chosen price',
      blurb: 'One or more lines have a unit price that does not match the BEES contract price. Choose which price to apply, then reprocess — the price validation will be skipped for this order.',
      orderCopy: 'The unit price requested differs from the BEES contract price on one or more lines.',
      bulkAllowed: true,
    },
    {
      code: 'INVALID_PACKAGING',
      label: 'Invalid product packaging',
      status: 'BLOCKED',
      scope: 'line',
      action: 'reprocess-no-fix',
      actionLabel: 'Reprocess without fixes',
      blurb: 'One or more lines reference an invalid packaging / unit-of-measure for the product. Reprocess to re-include the order in the queue — fix the product packaging configuration upstream if you want this rule to stop firing.',
      orderCopy: 'Invalid product packaging (UoM) was detected on one or more lines.',
      bulkAllowed: true,
    },
    // ---------- Rejected rules (all use the 2-option pattern) ----------
    {
      code: 'INVALID_DELIVERY_RANGE',
      label: 'Invalid delivery range',
      status: 'REJECTED',
      scope: 'order',
      action: 'rejected-choice',
      actionLabel: 'Reprocess',
      blurb: 'The requested delivery date is outside the valid range. Either reprocess as-is (no fix) or bypass the delivery-range rule for this order.',
      orderCopy: 'The requested delivery date falls outside the valid range for this account.',
      bulkAllowed: false,
    },
    {
      code: 'INVALID_DELIVERY_WINDOW',
      label: 'Invalid delivery window',
      status: 'REJECTED',
      scope: 'order',
      action: 'rejected-choice',
      actionLabel: 'Reprocess',
      blurb: 'The requested delivery slot is outside the valid delivery window for this POC. Either reprocess as-is or bypass the delivery-window rule for this order.',
      orderCopy: 'The requested delivery slot is outside the valid window for this POC.',
      bulkAllowed: false,
    },
    {
      code: 'MIN_ORDER_QUANTITY',
      label: 'Minimum order quantity',
      status: 'REJECTED',
      scope: 'order',
      action: 'rejected-choice',
      actionLabel: 'Reprocess',
      blurb: 'The order total is below the minimum order quantity for this account. Either reprocess as-is or bypass the minimum-order-quantity rule for this order.',
      orderCopy: 'The order total falls below the minimum order quantity for this account.',
      bulkAllowed: false,
    },
    {
      code: 'MAX_ORDER_QUANTITY',
      label: 'Maximum order quantity',
      status: 'REJECTED',
      scope: 'order',
      action: 'rejected-choice',
      actionLabel: 'Reprocess',
      blurb: 'The order total exceeds the maximum order quantity allowed for this account. Either reprocess as-is or bypass the maximum-order-quantity rule for this order.',
      orderCopy: 'The order total exceeds the maximum order quantity allowed for this account.',
      bulkAllowed: false,
    },
  ];

  const RULE_BY_CODE = Object.fromEntries(RULES.map((r) => [r.code, r]));
  const BLOCKING_RULES = RULES.filter((r) => r.status === 'BLOCKED');
  const REJECTING_RULES = RULES.filter((r) => r.status === 'REJECTED');

  // ----------------------------------------------------------------
  // Catalog of mock SKUs and a small pool of "alternative UPCs"
  // surfaced by the UPC selector for the UPC_NOT_FOUND blocking rule.
  // ----------------------------------------------------------------
  const CATALOG = [
    { sku: '7891000100103', name: 'Corona Extra 355ml — 24-pack',      family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100110', name: 'Stella Artois 330ml — 24-pack',     family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100127', name: 'Budweiser 350ml — 12-pack',         family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100134', name: 'Bohemia Pilsen 355ml — 6-pack',     family: 'Pilsner', uom: 'CASE' },
    { sku: '7891000100141', name: 'Modelo Especial 355ml — 12-pack',   family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100158', name: 'Negra Modelo 355ml — 6-pack',       family: 'Dark',    uom: 'CASE' },
    { sku: '7891000100165', name: 'Pacífico 355ml — 12-pack',          family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100172', name: 'Victoria 355ml — 12-pack',          family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100189', name: 'Hoegaarden 330ml — 6-pack',         family: 'Wheat',   uom: 'CASE' },
    { sku: '7891000100196', name: 'Leffe Blonde 330ml — 6-pack',       family: 'Abbey',   uom: 'CASE' },
    { sku: '7891000100202', name: 'Goose Island IPA 355ml — 6-pack',   family: 'IPA',     uom: 'CASE' },
    { sku: '7891000100219', name: 'Michelob Ultra 355ml — 12-pack',    family: 'Light',   uom: 'CASE' },
    { sku: '7891000100226', name: "Beck's 330ml — 6-pack",             family: 'Pilsner', uom: 'CASE' },
    { sku: '7891000100233', name: 'Brahma Chopp 350ml — 12-pack',      family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100240', name: 'Skol 350ml — 12-pack',              family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100257', name: 'Antarctica Original 355ml — 6-pack',family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100264', name: 'Quilmes Cristal 340ml — 12-pack',   family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100271', name: 'Patagonia Amber Lager 355ml — 6-pack', family: 'Amber', uom: 'CASE' },
  ];

  // ----------------------------------------------------------------
  // Deterministic pseudo-random so every reload renders the same mock.
  // ----------------------------------------------------------------
  let seed = 51860;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const pickWeighted = (arr) => {
    const total = arr.reduce((s, x) => s + x.weight, 0);
    let r = rand() * total;
    for (const x of arr) { r -= x.weight; if (r <= 0) return x; }
    return arr[arr.length - 1];
  };

  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;

  // ~120 orders across the last 90 days (ops scope = wider than retailer's 30d).
  const ORDER_COUNT = 120;
  const orders = [];
  for (let i = 0; i < ORDER_COUNT; i++) {
    const poc = pick(POCS);
    const chain = CHAINS.find((c) => c.code === poc.chainCode);
    const vendor = pick(VENDORS);
    const status = pickWeighted(STATUSES);
    const minutesAgo = Math.floor(rand() * 90 * 24 * 60);
    const receivedAt = new Date(now - minutesAgo * 60 * 1000);
    const po = (10000000 + Math.floor(rand() * 89999999)).toString();
    const itemCount = 3 + Math.floor(rand() * 9);

    // Sales rep: pick a rep whose chains[] contains this retailer chain.
    const eligibleReps = SALES_REPS.filter((r) => r.chains.includes(chain.code));
    const salesRep = eligibleReps.length ? pick(eligibleReps) : SALES_REPS[0];

    // Pick a rule based on status.
    let rule = null;
    if (status.id === 'BLOCKED')  rule = pick(BLOCKING_RULES);
    if (status.id === 'REJECTED') rule = pick(REJECTING_RULES);

    // BEES order number is assigned only once an order is in the BEES OMS.
    const beesOrderNumber = status.id === 'ACCEPTED'
      ? 'BEES-' + (1000000000 + Math.floor(rand() * 8999999999)).toString()
      : null;

    // Build line items.
    const items = [];
    let totalValue = 0;
    let requestedTotalValue = 0;

    for (let li = 0; li < itemCount; li++) {
      const sku = pick(CATALOG);
      const requestedQty = 1 + Math.floor(rand() * 40);
      const requestedUnitPrice = 80 + Math.floor(rand() * 1200);
      const requestedLineValue = requestedQty * requestedUnitPrice;
      requestedTotalValue += requestedLineValue;

      let qty = requestedQty;
      let unitPrice = requestedUnitPrice;
      // Per-line status: OK | PENDING | BLOCKED | REJECTED
      // Lines never go to ALERT — the HLR taxonomy has no "accepted with alerts".
      let lineStatus = 'OK';
      let lineRuleCode = null;

      if (status.id === 'IN_QUEUE') {
        lineStatus = 'PENDING';
      } else if (status.id === 'BLOCKED' && rule.scope === 'line') {
        // ~50% of lines carry the blocking rule for the mock dataset.
        if (rand() < 0.5) {
          lineStatus = 'BLOCKED';
          lineRuleCode = rule.code;
          // For PRICE_MISMATCH, divergence between requested and contract price
          // — the contract price is what BEES *would* use if the analyst picks
          // "Use BEES price". We store both so the drawer can show them.
          if (rule.code === 'PRICE_MISMATCH') {
            unitPrice = Math.max(50, Math.round(requestedUnitPrice * (0.78 + rand() * 0.14)));
          }
        }
      } else if (status.id === 'BLOCKED' && rule.scope === 'order') {
        // Order-level blocked rule (POC not found, PO duplicated) — lines are
        // not individually tagged; show as PENDING because nothing has run yet.
        lineStatus = 'PENDING';
      } else if (status.id === 'REJECTED') {
        // All rejection rules are order-level — every line shares the verdict.
        lineStatus = 'REJECTED';
        lineRuleCode = rule.code;
      }

      const lineValue = qty * unitPrice;
      totalValue += lineValue;

      items.push({
        lineNumber: li + 1,
        sku: sku.sku,
        name: sku.name,
        family: sku.family,
        uom: sku.uom,
        qty,
        unitPrice,
        lineValue,
        requestedQty,
        requestedUnitPrice,
        requestedLineValue,
        status: lineStatus,
        ruleCode: lineRuleCode,
      });
    }

    // Guarantee at least one tagged line for BLOCKED + line-scope rules,
    // so the UPC selector / price-choice UI always has something to act on.
    if (status.id === 'BLOCKED' && rule && rule.scope === 'line') {
      if (!items.some((it) => it.status === 'BLOCKED')) {
        const it = items[0];
        it.status = 'BLOCKED';
        it.ruleCode = rule.code;
        if (rule.code === 'PRICE_MISMATCH') {
          it.unitPrice = Math.max(50, Math.round(it.requestedUnitPrice * 0.82));
          it.lineValue = it.qty * it.unitPrice;
        }
      }
    }

    orders.push({
      id: 'EDI-' + String(100000 + i),
      receivedAt: receivedAt.toISOString(),
      vendorCode: vendor.code,
      vendorName: vendor.name,
      chainCode: chain.code,
      chainName: chain.name,
      pocId: poc.id,
      pocName: poc.name,
      pocCity: poc.city,
      pocRegion: poc.region,
      salesRepId: salesRep.id,
      salesRepName: salesRep.name,
      poNumber: po,
      beesOrderNumber,
      statusId: status.id,
      statusLabel: status.label,
      statusTone: status.tone,
      ruleCode: rule ? rule.code : null,
      ruleLabel: rule ? rule.label : null,
      itemCount,
      totalValue,
      requestedTotalValue,
      items,
      // Audit trail starts with the original system events; ops actions are
      // appended at runtime by index.html when the analyst reprocesses /
      // bypasses / adds a note.
      audit: [
        { ts: receivedAt.toISOString(), eventType: 'received', actorKey: 'actor.system' },
        ...(rule ? [{
          ts: new Date(receivedAt.getTime() + 30 * 1000).toISOString(),
          eventType: 'status_with_rule',
          eventData: { statusId: status.id, ruleCode: rule.code },
          actorKey: 'actor.bre',
        }] : (status.id === 'ACCEPTED' ? [{
          ts: new Date(receivedAt.getTime() + 60 * 1000).toISOString(),
          eventType: 'accepted_oms',
          actorKey: 'actor.system',
        }] : [])),
      ],
      // Resolution notes (FR-9). Empty by default; analyst adds notes at runtime.
      notes: [],
    });
  }

  orders.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));

  return {
    CHAINS, VENDORS, SALES_REPS, REGIONS, POCS,
    STATUSES, RULES, RULE_BY_CODE, BLOCKING_RULES, REJECTING_RULES,
    CATALOG, orders,
  };
})();
