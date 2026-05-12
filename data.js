/**
 * Mock EDI orders for the central tracker prototype.
 * Generated client-side so the prototype works offline / via file://.
 */
window.EDI_DATA = (function () {
  const VENDORS = [
    { code: 'AMBEV', name: 'Ambev' },
    { code: 'GRUPO_M', name: 'Grupo Modelo' },
    { code: 'AB_BRWY', name: 'AB Brewery' },
    { code: 'AB_INBV', name: 'AB InBev US' },
  ];

  // The "logged-in" retailer has access to these 4 POCs by default.
  // The full POC list (12) is searchable in the filter dropdown.
  const POCS = [
    { id: 'POC-1001', name: "OXXO Insurgentes",        city: 'Mexico City',  user: true  },
    { id: 'POC-1002', name: "OXXO Reforma 222",         city: 'Mexico City',  user: true  },
    { id: 'POC-1003', name: "OXXO Polanco",             city: 'Mexico City',  user: true  },
    { id: 'POC-1004', name: "OXXO Santa Fe",            city: 'Mexico City',  user: true  },
    { id: 'POC-2001', name: "Soriana Centro",           city: 'Monterrey',    user: false },
    { id: 'POC-2002', name: "Soriana Cumbres",          city: 'Monterrey',    user: false },
    { id: 'POC-3001', name: "Walmart Roma Norte",       city: 'Mexico City',  user: false },
    { id: 'POC-3002', name: "Walmart Coyoacán",         city: 'Mexico City',  user: false },
    { id: 'POC-3003', name: "Walmart Satélite",         city: 'Mexico City',  user: false },
    { id: 'POC-4001', name: "Chedraui Las Águilas",     city: 'Guadalajara',  user: false },
    { id: 'POC-4002', name: "Chedraui Providencia",     city: 'Guadalajara',  user: false },
    { id: 'POC-4003', name: "Chedraui Chapalita",       city: 'Guadalajara',  user: false },
  ];

  // Status taxonomy:
  //   WAITING / PROCESSING — transient, system-driven
  //   ACCEPTED             — terminal success
  //   ALERTS               — terminal success but with non-blocking deviations
  //   BLOCKED              — on-hold by a business rule, awaiting human action.
  //                          If not resolved within the SLA, the order auto-rejects.
  //   REJECTED             — terminal failure
  const STATUSES = [
    { id: 'WAITING',     label: 'Waiting process',     tone: 'info',    weight: 7  },
    { id: 'PROCESSING',  label: 'Processing',          tone: 'info',    weight: 6  },
    { id: 'ACCEPTED',    label: 'Accepted',            tone: 'success', weight: 42 },
    { id: 'ALERTS',      label: 'Accepted with alerts',tone: 'warning', weight: 20 },
    { id: 'BLOCKED',     label: 'Blocked',             tone: 'blocked', weight: 10 },
    { id: 'REJECTED',    label: 'Rejected',            tone: 'error',   weight: 15 },
  ];

  // Reasons keyed by status
  const ALERT_REASONS = [
    'Item out of stock — substituted',
    'Price mismatch — adjusted to contract',
    'Delivery date adjusted to next available slot',
    'Minimum order quantity rounded up',
    'Discount applied differs from request',
  ];
  // Blocked = order is on hold pending human resolution (e.g. a buyer or vendor
  // ops user adjusts the underlying configuration). After the SLA window
  // (typically 24–72h depending on rule), the order auto-transitions to REJECTED.
  const BLOCKED_REASONS = [
    'Credit limit exceeded — awaiting credit team review',
    'Suspicious order volume — fraud check in progress',
    'Vendor catalog under maintenance — retry pending',
    'Delivery window outside vendor calendar — manual override required',
    'Tax configuration mismatch — finance review pending',
    'POC missing required certification — compliance check pending',
  ];
  const REJECT_REASONS = [
    'Invalid POC code in order header',
    'Item not in vendor catalog for this POC',
    'Order placed outside delivery window',
    'Credit limit exceeded',
    'Duplicate PO number — already processed',
    'Invalid GTIN on line item',
    'Invalid UoM for line item',
  ];

  // ----------------------------------------------------------------
  // Catalog of mock SKUs. Used to populate per-item lines on each order
  // so the Item-level page can show *which products* failed and why.
  // ----------------------------------------------------------------
  const CATALOG = [
    { sku: '7891000100103', name: 'Corona Extra 355ml — 24-pack',     family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100110', name: 'Stella Artois 330ml — 24-pack',    family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100127', name: 'Budweiser 350ml — 12-pack',        family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100134', name: 'Bohemia Pilsen 355ml — 6-pack',    family: 'Pilsner', uom: 'CASE' },
    { sku: '7891000100141', name: 'Modelo Especial 355ml — 12-pack',  family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100158', name: 'Negra Modelo 355ml — 6-pack',      family: 'Dark',    uom: 'CASE' },
    { sku: '7891000100165', name: 'Pacífico 355ml — 12-pack',         family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100172', name: 'Victoria 355ml — 12-pack',         family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100189', name: 'Hoegaarden 330ml — 6-pack',        family: 'Wheat',   uom: 'CASE' },
    { sku: '7891000100196', name: 'Leffe Blonde 330ml — 6-pack',      family: 'Abbey',   uom: 'CASE' },
    { sku: '7891000100202', name: 'Goose Island IPA 355ml — 6-pack',  family: 'IPA',     uom: 'CASE' },
    { sku: '7891000100219', name: 'Michelob Ultra 355ml — 12-pack',   family: 'Light',   uom: 'CASE' },
    { sku: '7891000100226', name: 'Beck\'s 330ml — 6-pack',           family: 'Pilsner', uom: 'CASE' },
    { sku: '7891000100233', name: 'Brahma Chopp 350ml — 12-pack',     family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100240', name: 'Skol 350ml — 12-pack',             family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100257', name: 'Antarctica Original 355ml — 6pk',  family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100264', name: 'Quilmes Cristal 340ml — 12-pack',  family: 'Lager',   uom: 'CASE' },
    { sku: '7891000100271', name: 'Patagonia Amber Lager 355ml — 6pk',family: 'Amber',   uom: 'CASE' },
  ];

  // ----------------------------------------------------------------
  // Per-line-item issues. Each issue is tied to a *matching rule* that
  // BEES ran against the EDI line — the rule explains the policy that
  // fired, the reason explains the user-facing outcome.
  // ----------------------------------------------------------------
  // User-facing issue descriptions for each line. The `rule` field is kept
  // internally for analytics/debug, but the UI shows only the `label` —
  // copy is written for the retailer reading their order, not for the
  // engineer who configured the matching rule.
  const ITEM_ISSUES = {
    ALERTS: [
      // Price issue → unit price was rewritten to match the current contract.
      { code: 'PRICE_ADJUSTED', rule: 'Price issue',
        label: 'Unit price was adjusted from {req} to {del} to match the current contract.' },
      // SKU Availability → we couldn't fulfil the full quantity requested.
      { code: 'PARTIAL_FILL',   rule: 'SKU Availability',
        label: 'Only {pct}% of the requested quantity is available — we will deliver {del} of the {req} {uom} requested.' },
      // Pack size → quantity was rounded to the nearest valid pack multiple.
      { code: 'PACK_ADJUSTED',  rule: 'Pack size',
        label: 'Quantity was adjusted from {req} to {del} {uom} to match the contracted pack size.' },
    ],
    // BLOCKED-level: line is on hold, awaiting human action upstream.
    BLOCKED: [
      { code: 'UPC_NOT_MATCHED', rule: 'UPC Matching',
        label: 'We could not match this product to the BEES catalog. The order is on hold until the SKU is registered or the EDI line is corrected.' },
    ],
    // REJECTED-level: line is terminal. Copy explains *why* in plain language.
    REJECTED: [
      { code: 'UPC_NOT_MATCHED', rule: 'UPC Matching',
        label: 'Product could not be matched to the BEES catalog within the retry window. The line was rejected.' },
      { code: 'INVALID_UOM',     rule: 'Pack size',
        label: 'The pack size requested is not available for this POC. The line was rejected.' },
      { code: 'NOT_IN_CATALOG',  rule: 'SKU Availability',
        label: 'This SKU is out of stock for the delivery window and could not be substituted.' },
      { code: 'PRICE_REJECTED',  rule: 'Price issue',
        label: 'The submitted price is below the contract floor. The line was rejected for review.' },
    ],
  };

  // Deterministic pseudo-random so the page is the same on every reload.
  let seed = 42;
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

  // Generate ~80 orders across the last 30 days, weighted to the user's POCs (because they are who we're testing for).
  const orders = [];
  const userPocs = POCS.filter((p) => p.user);
  for (let i = 0; i < 80; i++) {
    const isUserPoc = rand() < 0.78; // user sees mostly their own POCs
    const poc = isUserPoc ? pick(userPocs) : pick(POCS);
    const vendor = pick(VENDORS);
    const status = pickWeighted(STATUSES);
    const minutesAgo = Math.floor(rand() * 30 * 24 * 60);
    const receivedAt = new Date(now - minutesAgo * 60 * 1000);
    const po = (10000000 + Math.floor(rand() * 89999999)).toString();
    let reason = '';
    if (status.id === 'ALERTS') reason = pick(ALERT_REASONS);
    else if (status.id === 'BLOCKED') reason = pick(BLOCKED_REASONS);
    else if (status.id === 'REJECTED') reason = pick(REJECT_REASONS);
    const itemCount = 3 + Math.floor(rand() * 9);    // 3..11 lines per order

    // BEES order number — only assigned once an EDI order has actually been
    // ingested into the BEES OMS. Statuses without a BEES record (Waiting,
    // Processing, Blocked, Rejected) leave this null.
    const hasBeesNumber = (status.id === 'ACCEPTED' || status.id === 'ALERTS');
    const beesOrderNumber = hasBeesNumber
      ? 'BEES-' + (1000000000 + Math.floor(rand() * 8999999999)).toString()
      : null;

    // Build line items. The order-level status implies a per-line distribution:
    //   ACCEPTED  → 100% OK
    //   ALERTS    → 1..N lines have an alert; rest OK
    //   BLOCKED   → 1..N lines have a block (the rest may be OK or have alerts)
    //   REJECTED  → 1..N lines rejected (the rest may be OK / alerts / blocked)
    //   WAITING/PROCESSING → all lines pending
    //
    // Each line records both the *requested* values (what the retailer
    // submitted via EDI) and the *delivered* values (what BEES will fulfil
    // after running the matching rules). For OK lines they're identical;
    // for ALERTs they diverge in a way explained by the rule that fired.
    const items = [];
    let totalValue = 0;          // sum of delivered (or pending) line values
    let requestedTotalValue = 0; // sum of requested line values (audit trail)

    for (let li = 0; li < itemCount; li++) {
      const sku = pick(CATALOG);
      const requestedQty = 1 + Math.floor(rand() * 40);
      const requestedUnitPrice = 80 + Math.floor(rand() * 1200);
      const requestedLineValue = requestedQty * requestedUnitPrice;
      requestedTotalValue += requestedLineValue;

      // Defaults — line accepted as requested
      let qty = requestedQty;
      let unitPrice = requestedUnitPrice;
      let lineStatus = 'OK', issue = null, issueLabel = null;

      function fmtMoneyMx(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      function interpolate(template, vars) {
        return template
          .replace('{req}',  vars.req  != null ? vars.req  : '')
          .replace('{del}',  vars.del  != null ? vars.del  : '')
          .replace('{pct}',  vars.pct  != null ? String(vars.pct) : '')
          .replace('{uom}',  vars.uom  || '');
      }
      function applyAlert(spec) {
        // Diverge requested vs delivered based on which rule fired,
        // then interpolate the diff into the user-facing label.
        if (spec.code === 'PRICE_ADJUSTED') {
          unitPrice = Math.max(50, Math.round(requestedUnitPrice * (0.85 + rand() * 0.10)));
          issueLabel = interpolate(spec.label, {
            req: fmtMoneyMx(requestedUnitPrice),
            del: fmtMoneyMx(unitPrice),
          });
        } else if (spec.code === 'PARTIAL_FILL') {
          const pct = 30 + Math.floor(rand() * 60);
          qty = Math.max(1, Math.round(requestedQty * pct / 100));
          issueLabel = interpolate(spec.label, {
            pct, req: requestedQty.toLocaleString(), del: qty.toLocaleString(), uom: sku.uom,
          });
        } else if (spec.code === 'PACK_ADJUSTED') {
          const packMultiple = pick([6, 12, 24]);
          qty = Math.max(packMultiple, Math.round(requestedQty / packMultiple) * packMultiple);
          issueLabel = interpolate(spec.label, {
            req: requestedQty.toLocaleString(), del: qty.toLocaleString(), uom: sku.uom,
          });
        } else {
          issueLabel = spec.label;
        }
        issue = spec;
      }

      if (status.id === 'WAITING' || status.id === 'PROCESSING') {
        lineStatus = 'PENDING';
      } else if (status.id === 'ACCEPTED') {
        lineStatus = 'OK';
      } else if (status.id === 'ALERTS') {
        if (rand() < 0.5) { lineStatus = 'ALERT'; applyAlert(pick(ITEM_ISSUES.ALERTS)); }
      } else if (status.id === 'BLOCKED') {
        const r = rand();
        if (r < 0.4)      { lineStatus = 'BLOCKED'; issue = pick(ITEM_ISSUES.BLOCKED); issueLabel = issue.label; }
        else if (r < 0.6) { lineStatus = 'ALERT';   applyAlert(pick(ITEM_ISSUES.ALERTS)); }
      } else if (status.id === 'REJECTED') {
        const r = rand();
        if (r < 0.4)      { lineStatus = 'REJECTED'; issue = pick(ITEM_ISSUES.REJECTED); issueLabel = issue.label; }
        else if (r < 0.55){ lineStatus = 'BLOCKED';  issue = pick(ITEM_ISSUES.BLOCKED);  issueLabel = issue.label; }
        else if (r < 0.7) { lineStatus = 'ALERT';    applyAlert(pick(ITEM_ISSUES.ALERTS)); }
      }

      const lineValue = qty * unitPrice;
      totalValue += lineValue;

      items.push({
        lineNumber: li + 1,
        sku: sku.sku,
        name: sku.name,
        family: sku.family,
        uom: sku.uom,
        // Delivered (post-matching) — what BEES will actually fulfil
        qty,
        unitPrice,
        lineValue,
        // Requested (pre-matching) — what the retailer submitted via EDI
        requestedQty,
        requestedUnitPrice,
        requestedLineValue,
        status: lineStatus,           // OK | PENDING | ALERT | BLOCKED | REJECTED
        issueCode:  issue ? issue.code : null,
        issueRule:  issue ? issue.rule : null,
        issueLabel,
      });
    }

    // Guarantee the order has *at least one* problem line that matches its status,
    // applying the same alert helper so the requested/delivered split is consistent.
    function ensureAtLeastOne(targetLineStatus, issueBucket, applyHelper) {
      if (!items.some(it => it.status === targetLineStatus)) {
        const it = pick(items);
        const spec = pick(issueBucket);
        if (applyHelper) {
          // Re-derive delivered values from requested using the same logic
          // as the in-loop helper, then interpolate the user-facing label.
          let qty = it.requestedQty, unitPrice = it.requestedUnitPrice;
          let vars = { uom: it.uom };
          if (spec.code === 'PRICE_ADJUSTED') {
            unitPrice = Math.max(50, Math.round(it.requestedUnitPrice * (0.85 + rand() * 0.10)));
            vars.req = '$' + it.requestedUnitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            vars.del = '$' + unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else if (spec.code === 'PARTIAL_FILL') {
            const pct = 30 + Math.floor(rand() * 60);
            qty = Math.max(1, Math.round(it.requestedQty * pct / 100));
            vars.pct = pct; vars.req = it.requestedQty.toLocaleString(); vars.del = qty.toLocaleString();
          } else if (spec.code === 'PACK_ADJUSTED') {
            const packMultiple = pick([6, 12, 24]);
            qty = Math.max(packMultiple, Math.round(it.requestedQty / packMultiple) * packMultiple);
            vars.req = it.requestedQty.toLocaleString(); vars.del = qty.toLocaleString();
          }
          it.qty = qty;
          it.unitPrice = unitPrice;
          it.lineValue = qty * unitPrice;
          it.issueLabel = spec.label
            .replace('{req}', vars.req || '')
            .replace('{del}', vars.del || '')
            .replace('{pct}', vars.pct != null ? String(vars.pct) : '')
            .replace('{uom}', vars.uom || '');
        } else {
          it.issueLabel = spec.label;
        }
        it.status = targetLineStatus;
        it.issueCode = spec.code;
        it.issueRule = spec.rule;
      }
    }
    if (status.id === 'ALERTS')   ensureAtLeastOne('ALERT',    ITEM_ISSUES.ALERTS,   true);
    if (status.id === 'BLOCKED')  ensureAtLeastOne('BLOCKED',  ITEM_ISSUES.BLOCKED,  false);
    if (status.id === 'REJECTED') ensureAtLeastOne('REJECTED', ITEM_ISSUES.REJECTED, false);

    orders.push({
      id: 'EDI-' + String(100000 + i),
      receivedAt: receivedAt.toISOString(),
      vendorCode: vendor.code,
      vendorName: vendor.name,
      pocId: poc.id,
      pocName: poc.name,
      pocCity: poc.city,
      poNumber: po,
      beesOrderNumber,
      statusId: status.id,
      statusLabel: status.label,
      statusTone: status.tone,
      reason,
      itemCount,
      totalValue,
      requestedTotalValue,
      items,
    });
  }
  // Sort newest first
  orders.sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));

  return { VENDORS, POCS, STATUSES, CATALOG, ITEM_ISSUES, ALERT_REASONS, BLOCKED_REASONS, REJECT_REASONS, orders };
})();
