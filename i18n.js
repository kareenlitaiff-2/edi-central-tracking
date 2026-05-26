/**
 * Minimal i18n layer for the EDI Central Tracking prototype.
 *
 * Three supported languages: English (en), Portuguese (pt), Spanish (es).
 * Persists the user's choice in localStorage and exposes:
 *   window.I18N.t(key, params)         — translate a key (with {placeholder} substitution)
 *   window.I18N.setLang(lang)          — switch language + re-apply static labels
 *   window.I18N.getLang()              — current language code
 *   window.I18N.SUPPORTED              — supported language codes
 *   window.I18N.applyStatic(root?)     — translate every [data-i18n*] element under root
 *   window.I18N.onChange(cb)           — subscribe to language changes
 *   window.I18N.locale()               — Intl locale string for the current language
 */
window.I18N = (function () {
  const STORAGE_KEY = 'edi.lang';
  const SUPPORTED = ['en', 'pt', 'es'];
  const LOCALE_MAP = { en: 'en-US', pt: 'pt-BR', es: 'es-MX' };
  const LANG_LABEL = { en: 'English', pt: 'Português', es: 'Español' };
  const LANG_SHORT = { en: 'EN', pt: 'PT', es: 'ES' };

  function detectInitial() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.includes(stored)) return stored;
    } catch (_) { /* ignore */ }
    const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.includes(nav) ? nav : 'en';
  }

  let current = detectInitial();
  const listeners = [];

  // -------------------------------------------------------------
  // Translation dictionaries
  // -------------------------------------------------------------
  const DICT = {
    en: {
      // Sidebar / top chrome
      'nav.home': 'Home',
      'nav.edi': 'EDI Tracking',
      'nav.catalog': 'Catalog',
      'nav.customers': 'Customer list',
      'nav.agreements': 'Agreements',
      'nav.chains': 'Chain management',
      'nav.offers': 'Offers',
      'nav.campaigns': 'Campaigns',
      'nav.back': 'Back',
      'nav.expand': 'Expand menu',
      'topbar.brand_home': 'BEES one home',
      'topbar.module_selector': 'Module selector',
      'topbar.notifications': 'Notifications',
      'topbar.user_menu': 'User menu',
      'topbar.language': 'Language',
      'topbar.change_language': 'Change language',

      // Landing page
      'landing.title': 'Link admin',
      'landing.subtitle': "Access and manage the team's plans and customer information.",
      'card.commercial_control.title': 'Commercial control',
      'card.commercial_control.desc': 'Track priority information from chains and stores.',
      'card.chain_management.title': 'Chain management',
      'card.chain_management.desc': 'Add or remove POCs from chains.',
      'card.customer_list.title': 'Customer list',
      'card.customer_list.desc': 'Manage KAMs or BDRs customers catalog.',
      'card.commercial_agreements.title': 'Commercial agreements',
      'card.commercial_agreements.desc': 'Manage and track customers JBP contracts.',
      'card.campaigns.title': 'Campaigns',
      'card.campaigns.desc': 'Manage and track campaigns.',
      'card.offers.title': 'Offers',
      'card.offers.desc': 'Create and manage offers.',
      'card.edi.title': 'EDI Central Tracking',
      'card.edi.desc': 'Monitor and manage EDI order processing, reprocess failures, and track delivery status.',

      // EDI list page
      'edi.title': 'EDI Central Tracking',
      'filter.toggle': 'Filter',
      'filter.status': 'Status',
      'filter.business_rule': 'Business rule',
      'filter.retailer_chain': 'Retailer chain',
      'filter.poc': 'POC',
      'filter.vendor': 'Vendor',
      'filter.region_zone': 'Region / Zone',
      'filter.sales_rep': 'Sales rep',
      'filter.po_number': 'PO number',
      'filter.po_placeholder': 'e.g. 12345678',
      'filter.period': 'Period (max 90 days · default last 30 days)',
      'filter.all_statuses': 'All statuses',
      'filter.all_rules': 'All rules',
      'filter.all_chains': 'All chains',
      'filter.all_pocs': 'All POCs',
      'filter.all_vendors': 'All vendors',
      'filter.all_regions': 'All regions',
      'filter.all_reps': 'All reps',
      'filter.apply': 'Apply filters',
      'filter.clear_all': 'Clear all',
      'filter.period_hint': 'Maximum interval: 90 days · default: last 30 days',
      'filter.period_capped': 'Period capped at 90 days (ops scope).',
      'filter.group.blocked': 'Blocked',
      'filter.group.rejected': 'Rejected',
      'filter.search_poc': 'Search POC name, id, city…',
      'filter.no_poc_match': 'No POC matches.',

      // Bulk actions toolbar
      'bulk.select_all': 'Select all on this page',
      'bulk.select_all_n': 'Select all on this page ({n})',
      'bulk.no_eligible': 'No eligible orders on this page',
      'bulk.count_selected': '{n} selected',
      'bulk.count_selected_one': '1 selected',
      'bulk.clear_selection': 'Clear selection',
      'bulk.reprocess_selected': 'Reprocess selected',
      'bulk.reprocess_selected_n': 'Reprocess selected ({n})',
      'bulk.pinned_to': 'Bulk pinned to: {rule} — only orders with this rule can be added.',
      'bulk.help': 'Bulk reprocess: select Blocked orders sharing the same rule.',
      'bulk.must_share_rule': 'Bulk reprocess works only on Blocked orders sharing the same rule.',
      'bulk.must_share_rule_all': 'All selected orders must share the same blocking rule.',
      'bulk.confirm': 'You are about to reprocess {n} orders, all blocked by "{rule}". Continue?',

      // Empty state
      'empty.title': 'No orders match your filters',
      'empty.body': 'Try widening the period or clearing some filters.',
      'empty.clear_btn': 'Clear all filters',

      // Order list table
      'column.status': 'Status',
      'column.receive_date': 'Receive date',
      'column.poc_chain': 'POC / Chain',
      'column.business_rule': 'Business rule',
      'column.po_number': 'PO number',
      'column.bees_order_number': 'BEES order number',
      'column.value': 'Value',
      'cell.not_yet_assigned': 'Not yet assigned',
      'row.view_summary': 'View order summary',
      'row.take_action': 'Take corrective action',
      'row.cannot_reprocess': "{status} orders can't be reprocessed",
      'row.select_for_bulk': 'Select for bulk reprocess',

      // Pagination
      'pagination.lines_per_page': 'Lines per page:',
      'pagination.range': '{start} - {end} of {total}',
      'pagination.first': 'First page',
      'pagination.prev': 'Previous page',
      'pagination.next': 'Next page',
      'pagination.last': 'Last page',
      'pagination.page_n': 'Page {n}',

      // Summary KPI cards
      'summary.acceptance_rate_html': 'Acceptance rate: <strong>{n}%</strong>',
      'summary.of': '{count} of {total}',
      'summary.filter': 'Filter',
      'summary.clear': 'Clear',
      'summary.tooltip': '{label} — {count} of {total}',

      // Order details (item-level page)
      'details.title': 'Order details',
      'details.bc_home': 'Home',
      'details.bc_edi': 'EDI Central Tracking',
      'details.bc_current': 'Order details',
      'details.add_note': 'Add resolution note',
      'details.take_action': 'Take action',
      'items.list_title': 'Products in this order',
      'items.count_one': '1 item',
      'items.count_n': '{n} items',
      'items.requested_qty': 'Requested Qty',
      'items.requested_unit_price': 'Requested Unit Price',
      'items.requested_line_total': 'Requested line total',
      'items.requested_was': 'Requested {value}',

      // Drawer
      'drawer.label': 'Order detail',
      'drawer.section_order': 'Order',
      'drawer.field.receive_date': 'Receive date',
      'drawer.field.retailer_chain': 'Retailer chain',
      'drawer.field.poc': 'POC',
      'drawer.field.vendor': 'Vendor',
      'drawer.field.sales_rep': 'Sales rep',
      'drawer.field.po_number': 'PO number',
      'drawer.field.bees_order': 'BEES order #',
      'drawer.field.items': 'Items',
      'drawer.field.total_value': 'Total value',
      'drawer.notes': 'Resolution notes ({n})',
      'drawer.no_notes': 'No resolution notes yet.',
      'drawer.add_note': 'Add note',
      'drawer.timeline': 'Timeline',
      'drawer.close': 'Close',
      'drawer.cancel': 'Cancel',
      'drawer.why_rejected': 'Why was this rejected?',
      'drawer.why_blocked': 'Why is this on hold?',
      'drawer.no_action_title': 'No action available',
      'drawer.accepted_msg': 'This order was accepted and is in the BEES OMS.',
      'drawer.in_queue_msg': 'This order is in queue and is being processed by BEES. Wait for the next state.',
      'drawer.corrective_action': 'Corrective action',
      'drawer.select_correct_upcs': 'Select correct UPCs',
      'drawer.choose_price': 'Choose price',
      'drawer.choose_reprocess': 'Choose how to reprocess',
      'drawer.line_n': 'Line {n}',
      'drawer.requested_sku': 'Requested SKU: {sku}',
      'drawer.choose_upc': 'Choose correct UPC…',
      'drawer.price_explainer': 'Retailer requested {req} · BEES contract {contract}',
      'drawer.price_use_bees': 'Use BEES contract price',
      'drawer.price_use_requested': "Accept retailer's requested price",
      'drawer.rejected_as_is': 'Reprocess without fixes (re-include as-is)',
      'drawer.rejected_bypass': 'Bypass the rule and reprocess',
      'drawer.pick_upc_required': 'Pick a UPC for every affected line before reprocessing.',

      // Chips
      'chip.n_pocs_selected_one': '1 POC selected',
      'chip.n_pocs_selected': '{n} POCs selected',
      'chip.po_prefix': 'PO: {po}',

      // Status labels (order-level)
      'status.ACCEPTED': 'Accepted',
      'status.BLOCKED': 'Blocked',
      'status.REJECTED': 'Rejected',
      'status.IN_QUEUE': 'In queue',

      // Line-level statuses
      'line.OK': 'OK',
      'line.BLOCKED': 'Blocked',
      'line.REJECTED': 'Rejected',
      'line.PENDING': 'In queue',

      // Business rule labels
      'rule.POC_NOT_FOUND.label': 'POC not found',
      'rule.PO_DUPLICATED.label': 'PO duplicated',
      'rule.UPC_NOT_FOUND.label': 'UPC not found',
      'rule.PRICE_MISMATCH.label': 'Price mismatch',
      'rule.INVALID_PACKAGING.label': 'Invalid product packaging',
      'rule.INVALID_DELIVERY_RANGE.label': 'Invalid delivery range',
      'rule.INVALID_DELIVERY_WINDOW.label': 'Invalid delivery window',
      'rule.MIN_ORDER_QUANTITY.label': 'Minimum order quantity',
      'rule.MAX_ORDER_QUANTITY.label': 'Maximum order quantity',

      // Business rule action labels (drawer footer button text)
      'rule.POC_NOT_FOUND.actionLabel': 'Reprocess without fixes',
      'rule.PO_DUPLICATED.actionLabel': 'Bypass duplication and reprocess',
      'rule.UPC_NOT_FOUND.actionLabel': 'Reprocess with selected UPCs',
      'rule.PRICE_MISMATCH.actionLabel': 'Reprocess with chosen price',
      'rule.INVALID_PACKAGING.actionLabel': 'Reprocess without fixes',
      'rule.INVALID_DELIVERY_RANGE.actionLabel': 'Reprocess',
      'rule.INVALID_DELIVERY_WINDOW.actionLabel': 'Reprocess',
      'rule.MIN_ORDER_QUANTITY.actionLabel': 'Reprocess',
      'rule.MAX_ORDER_QUANTITY.actionLabel': 'Reprocess',

      // Business rule blurbs (drawer body description)
      'rule.POC_NOT_FOUND.blurb': 'The POC referenced by this order is not mapped to the vendor. Reprocess to re-include the order in the queue as-is — fix the POC mapping upstream if you want this rule to stop firing for this account.',
      'rule.PO_DUPLICATED.blurb': 'BEES detected a previous order with the same PO number. Bypass the duplication validation to re-include this order in the queue. Use this when the retailer intentionally resubmitted the same PO.',
      'rule.UPC_NOT_FOUND.blurb': 'One or more lines reference a UPC that is not in the BEES catalog. Pick the correct UPC for each affected line, then reprocess.',
      'rule.PRICE_MISMATCH.blurb': 'One or more lines have a unit price that does not match the BEES contract price. Choose which price to apply, then reprocess — the price validation will be skipped for this order.',
      'rule.INVALID_PACKAGING.blurb': 'One or more lines reference an invalid packaging / unit-of-measure for the product. Reprocess to re-include the order in the queue — fix the product packaging configuration upstream if you want this rule to stop firing.',
      'rule.INVALID_DELIVERY_RANGE.blurb': 'The requested delivery date is outside the valid range. Either reprocess as-is (no fix) or bypass the delivery-range rule for this order.',
      'rule.INVALID_DELIVERY_WINDOW.blurb': 'The requested delivery slot is outside the valid delivery window for this POC. Either reprocess as-is or bypass the delivery-window rule for this order.',
      'rule.MIN_ORDER_QUANTITY.blurb': 'The order total is below the minimum order quantity for this account. Either reprocess as-is or bypass the minimum-order-quantity rule for this order.',
      'rule.MAX_ORDER_QUANTITY.blurb': 'The order total exceeds the maximum order quantity allowed for this account. Either reprocess as-is or bypass the maximum-order-quantity rule for this order.',

      // Business rule order-level copy (short reason shown to user)
      'rule.POC_NOT_FOUND.orderCopy': 'The POC referenced in this order is not mapped to your vendor.',
      'rule.PO_DUPLICATED.orderCopy': 'A previous order with the same PO number was already processed.',
      'rule.UPC_NOT_FOUND.orderCopy': 'Some product UPCs in this order were not found in the BEES catalog.',
      'rule.PRICE_MISMATCH.orderCopy': 'The unit price requested differs from the BEES contract price on one or more lines.',
      'rule.INVALID_PACKAGING.orderCopy': 'Invalid product packaging (UoM) was detected on one or more lines.',
      'rule.INVALID_DELIVERY_RANGE.orderCopy': 'The requested delivery date falls outside the valid range for this account.',
      'rule.INVALID_DELIVERY_WINDOW.orderCopy': 'The requested delivery slot is outside the valid window for this POC.',
      'rule.MIN_ORDER_QUANTITY.orderCopy': 'The order total falls below the minimum order quantity for this account.',
      'rule.MAX_ORDER_QUANTITY.orderCopy': 'The order total exceeds the maximum order quantity allowed for this account.',

      // Filter by rule badge tooltip
      'rule.filter_tooltip': 'Filter the list by this rule',

      // Audit / timeline events
      'audit.received': 'Order received via EDI',
      'audit.accepted_oms': 'Order accepted into BEES OMS',
      'audit.status_with_rule': '{status}: {rule}',
      'audit.reprocess_requested': 'Reprocess requested — {detail}',
      'audit.outcome': 'Outcome: {status}',
      'audit.note_added': 'Resolution note added ({category})',

      // Actor names
      'actor.system': 'system',
      'actor.bre': 'BRE',
      'actor.ops_user': 'Ops user',

      // Reprocess action descriptions
      'action.reprocess_no_fix': '{rule}: reprocess without fixes',
      'action.bypass': '{rule}: bypassed rule',
      'action.upc_selector': '{rule}: selected new UPCs for {n} line(s)',
      'action.price_choice': "{rule}: applied {priceChoice}, price validation bypassed",
      'action.rejected_as_is': '{rule}: reprocessed without fixes',
      'action.rejected_bypass': '{rule}: bypassed rule and reprocessed',
      'action.price_bees': 'BEES contract price',
      'action.price_requested': "retailer's requested price",

      // Note dialog + categories
      'note.category_prompt': 'Note category ({list}):',
      'note.body_prompt': 'Note content:',
      'note.cat.catalog_fix': 'catalog fix',
      'note.cat.pricing_update': 'pricing update',
      'note.cat.poc_config': 'POC configuration',
      'note.cat.delivery_window': 'delivery window',
      'note.cat.packaging': 'packaging',
      'note.cat.retailer_side': 'retailer-side issue',
      'note.cat.other': 'other',
    },

    pt: {
      // Sidebar / top chrome
      'nav.home': 'Início',
      'nav.edi': 'Tracking EDI',
      'nav.catalog': 'Catálogo',
      'nav.customers': 'Lista de clientes',
      'nav.agreements': 'Contratos',
      'nav.chains': 'Gestão de redes',
      'nav.offers': 'Ofertas',
      'nav.campaigns': 'Campanhas',
      'nav.back': 'Voltar',
      'nav.expand': 'Expandir menu',
      'topbar.brand_home': 'Início BEES one',
      'topbar.module_selector': 'Seletor de módulo',
      'topbar.notifications': 'Notificações',
      'topbar.user_menu': 'Menu do usuário',
      'topbar.language': 'Idioma',
      'topbar.change_language': 'Trocar idioma',

      // Landing page
      'landing.title': 'Link admin',
      'landing.subtitle': 'Acesse e gerencie os planos da equipe e as informações dos clientes.',
      'card.commercial_control.title': 'Controle comercial',
      'card.commercial_control.desc': 'Acompanhe informações prioritárias de redes e lojas.',
      'card.chain_management.title': 'Gestão de redes',
      'card.chain_management.desc': 'Adicione ou remova PDVs das redes.',
      'card.customer_list.title': 'Lista de clientes',
      'card.customer_list.desc': 'Gerencie o catálogo de clientes de KAMs ou BDRs.',
      'card.commercial_agreements.title': 'Acordos comerciais',
      'card.commercial_agreements.desc': 'Gerencie e acompanhe os contratos JBP dos clientes.',
      'card.campaigns.title': 'Campanhas',
      'card.campaigns.desc': 'Gerencie e acompanhe campanhas.',
      'card.offers.title': 'Ofertas',
      'card.offers.desc': 'Crie e gerencie ofertas.',
      'card.edi.title': 'EDI Central Tracking',
      'card.edi.desc': 'Monitore e gerencie o processamento de pedidos EDI, reprocesse falhas e acompanhe o status de entrega.',

      // EDI list page
      'edi.title': 'EDI Central Tracking',
      'filter.toggle': 'Filtro',
      'filter.status': 'Status',
      'filter.business_rule': 'Regra de negócio',
      'filter.retailer_chain': 'Rede varejista',
      'filter.poc': 'PDV',
      'filter.vendor': 'Fornecedor',
      'filter.region_zone': 'Região / Zona',
      'filter.sales_rep': 'Representante',
      'filter.po_number': 'Número PO',
      'filter.po_placeholder': 'ex. 12345678',
      'filter.period': 'Período (máx. 90 dias · padrão últimos 30 dias)',
      'filter.all_statuses': 'Todos os status',
      'filter.all_rules': 'Todas as regras',
      'filter.all_chains': 'Todas as redes',
      'filter.all_pocs': 'Todos os PDVs',
      'filter.all_vendors': 'Todos os fornecedores',
      'filter.all_regions': 'Todas as regiões',
      'filter.all_reps': 'Todos os representantes',
      'filter.apply': 'Aplicar filtros',
      'filter.clear_all': 'Limpar tudo',
      'filter.period_hint': 'Intervalo máximo: 90 dias · padrão: últimos 30 dias',
      'filter.period_capped': 'Período limitado a 90 dias (escopo de operações).',
      'filter.group.blocked': 'Bloqueado',
      'filter.group.rejected': 'Rejeitado',
      'filter.search_poc': 'Buscar PDV por nome, id ou cidade…',
      'filter.no_poc_match': 'Nenhum PDV encontrado.',

      // Bulk actions toolbar
      'bulk.select_all': 'Selecionar todos desta página',
      'bulk.select_all_n': 'Selecionar todos desta página ({n})',
      'bulk.no_eligible': 'Nenhum pedido elegível nesta página',
      'bulk.count_selected': '{n} selecionados',
      'bulk.count_selected_one': '1 selecionado',
      'bulk.clear_selection': 'Limpar seleção',
      'bulk.reprocess_selected': 'Reprocessar selecionados',
      'bulk.reprocess_selected_n': 'Reprocessar selecionados ({n})',
      'bulk.pinned_to': 'Lote fixado em: {rule} — apenas pedidos com esta regra podem ser adicionados.',
      'bulk.help': 'Reprocessamento em lote: selecione pedidos Bloqueados com a mesma regra.',
      'bulk.must_share_rule': 'Reprocessamento em lote funciona apenas em pedidos Bloqueados que compartilham a mesma regra.',
      'bulk.must_share_rule_all': 'Todos os pedidos selecionados devem compartilhar a mesma regra de bloqueio.',
      'bulk.confirm': 'Você está prestes a reprocessar {n} pedidos, todos bloqueados por "{rule}". Continuar?',

      // Empty state
      'empty.title': 'Nenhum pedido corresponde aos seus filtros',
      'empty.body': 'Tente ampliar o período ou limpar alguns filtros.',
      'empty.clear_btn': 'Limpar todos os filtros',

      // Order list table
      'column.status': 'Status',
      'column.receive_date': 'Data de recebimento',
      'column.poc_chain': 'PDV / Rede',
      'column.business_rule': 'Regra de negócio',
      'column.po_number': 'Número PO',
      'column.bees_order_number': 'Número do pedido BEES',
      'column.value': 'Valor',
      'cell.not_yet_assigned': 'Ainda não atribuído',
      'row.view_summary': 'Ver resumo do pedido',
      'row.take_action': 'Tomar ação corretiva',
      'row.cannot_reprocess': 'Pedidos {status} não podem ser reprocessados',
      'row.select_for_bulk': 'Selecionar para reprocessamento em lote',

      // Pagination
      'pagination.lines_per_page': 'Linhas por página:',
      'pagination.range': '{start} - {end} de {total}',
      'pagination.first': 'Primeira página',
      'pagination.prev': 'Página anterior',
      'pagination.next': 'Próxima página',
      'pagination.last': 'Última página',
      'pagination.page_n': 'Página {n}',

      // Summary KPI cards
      'summary.acceptance_rate_html': 'Taxa de aceitação: <strong>{n}%</strong>',
      'summary.of': '{count} de {total}',
      'summary.filter': 'Filtrar',
      'summary.clear': 'Limpar',
      'summary.tooltip': '{label} — {count} de {total}',

      // Order details (item-level page)
      'details.title': 'Detalhes do pedido',
      'details.bc_home': 'Início',
      'details.bc_edi': 'EDI Central Tracking',
      'details.bc_current': 'Detalhes do pedido',
      'details.add_note': 'Adicionar nota de resolução',
      'details.take_action': 'Tomar ação',
      'items.list_title': 'Produtos deste pedido',
      'items.count_one': '1 item',
      'items.count_n': '{n} itens',
      'items.requested_qty': 'Qtd. solicitada',
      'items.requested_unit_price': 'Preço unitário solicitado',
      'items.requested_line_total': 'Total da linha solicitado',
      'items.requested_was': 'Solicitado {value}',

      // Drawer
      'drawer.label': 'Detalhe do pedido',
      'drawer.section_order': 'Pedido',
      'drawer.field.receive_date': 'Data de recebimento',
      'drawer.field.retailer_chain': 'Rede varejista',
      'drawer.field.poc': 'PDV',
      'drawer.field.vendor': 'Fornecedor',
      'drawer.field.sales_rep': 'Representante',
      'drawer.field.po_number': 'Número PO',
      'drawer.field.bees_order': 'Pedido BEES #',
      'drawer.field.items': 'Itens',
      'drawer.field.total_value': 'Valor total',
      'drawer.notes': 'Notas de resolução ({n})',
      'drawer.no_notes': 'Nenhuma nota de resolução ainda.',
      'drawer.add_note': 'Adicionar nota',
      'drawer.timeline': 'Linha do tempo',
      'drawer.close': 'Fechar',
      'drawer.cancel': 'Cancelar',
      'drawer.why_rejected': 'Por que foi rejeitado?',
      'drawer.why_blocked': 'Por que está em espera?',
      'drawer.no_action_title': 'Nenhuma ação disponível',
      'drawer.accepted_msg': 'Este pedido foi aceito e está no BEES OMS.',
      'drawer.in_queue_msg': 'Este pedido está na fila e sendo processado pelo BEES. Aguarde o próximo estado.',
      'drawer.corrective_action': 'Ação corretiva',
      'drawer.select_correct_upcs': 'Selecionar UPCs corretos',
      'drawer.choose_price': 'Escolher preço',
      'drawer.choose_reprocess': 'Escolher como reprocessar',
      'drawer.line_n': 'Linha {n}',
      'drawer.requested_sku': 'SKU solicitado: {sku}',
      'drawer.choose_upc': 'Escolha o UPC correto…',
      'drawer.price_explainer': 'Varejista solicitou {req} · Contrato BEES {contract}',
      'drawer.price_use_bees': 'Usar preço do contrato BEES',
      'drawer.price_use_requested': 'Aceitar preço solicitado pelo varejista',
      'drawer.rejected_as_is': 'Reprocessar sem correções (re-incluir como está)',
      'drawer.rejected_bypass': 'Ignorar a regra e reprocessar',
      'drawer.pick_upc_required': 'Escolha um UPC para cada linha afetada antes de reprocessar.',

      // Chips
      'chip.n_pocs_selected_one': '1 PDV selecionado',
      'chip.n_pocs_selected': '{n} PDVs selecionados',
      'chip.po_prefix': 'PO: {po}',

      // Status labels (order-level)
      'status.ACCEPTED': 'Aceito',
      'status.BLOCKED': 'Bloqueado',
      'status.REJECTED': 'Rejeitado',
      'status.IN_QUEUE': 'Na fila',

      // Line-level statuses
      'line.OK': 'OK',
      'line.BLOCKED': 'Bloqueado',
      'line.REJECTED': 'Rejeitado',
      'line.PENDING': 'Na fila',

      // Business rule labels
      'rule.POC_NOT_FOUND.label': 'PDV não encontrado',
      'rule.PO_DUPLICATED.label': 'PO duplicado',
      'rule.UPC_NOT_FOUND.label': 'UPC não encontrado',
      'rule.PRICE_MISMATCH.label': 'Divergência de preço',
      'rule.INVALID_PACKAGING.label': 'Embalagem de produto inválida',
      'rule.INVALID_DELIVERY_RANGE.label': 'Intervalo de entrega inválido',
      'rule.INVALID_DELIVERY_WINDOW.label': 'Janela de entrega inválida',
      'rule.MIN_ORDER_QUANTITY.label': 'Quantidade mínima do pedido',
      'rule.MAX_ORDER_QUANTITY.label': 'Quantidade máxima do pedido',

      // Business rule action labels
      'rule.POC_NOT_FOUND.actionLabel': 'Reprocessar sem correções',
      'rule.PO_DUPLICATED.actionLabel': 'Ignorar duplicação e reprocessar',
      'rule.UPC_NOT_FOUND.actionLabel': 'Reprocessar com UPCs selecionados',
      'rule.PRICE_MISMATCH.actionLabel': 'Reprocessar com preço escolhido',
      'rule.INVALID_PACKAGING.actionLabel': 'Reprocessar sem correções',
      'rule.INVALID_DELIVERY_RANGE.actionLabel': 'Reprocessar',
      'rule.INVALID_DELIVERY_WINDOW.actionLabel': 'Reprocessar',
      'rule.MIN_ORDER_QUANTITY.actionLabel': 'Reprocessar',
      'rule.MAX_ORDER_QUANTITY.actionLabel': 'Reprocessar',

      // Business rule blurbs
      'rule.POC_NOT_FOUND.blurb': 'O PDV referenciado por este pedido não está mapeado para o fornecedor. Reprocesse para re-incluir o pedido na fila como está — corrija o mapeamento do PDV upstream se quiser que esta regra pare de disparar para esta conta.',
      'rule.PO_DUPLICATED.blurb': 'O BEES detectou um pedido anterior com o mesmo número de PO. Ignore a validação de duplicação para re-incluir este pedido na fila. Use isto quando o varejista reenviou intencionalmente o mesmo PO.',
      'rule.UPC_NOT_FOUND.blurb': 'Uma ou mais linhas referenciam um UPC que não está no catálogo BEES. Escolha o UPC correto para cada linha afetada e reprocesse.',
      'rule.PRICE_MISMATCH.blurb': 'Uma ou mais linhas têm um preço unitário diferente do preço do contrato BEES. Escolha qual preço aplicar e reprocesse — a validação de preço será ignorada para este pedido.',
      'rule.INVALID_PACKAGING.blurb': 'Uma ou mais linhas referenciam uma embalagem/unidade de medida inválida para o produto. Reprocesse para re-incluir o pedido na fila — corrija a configuração da embalagem upstream se quiser que esta regra pare de disparar.',
      'rule.INVALID_DELIVERY_RANGE.blurb': 'A data de entrega solicitada está fora do intervalo válido. Reprocesse como está (sem correção) ou ignore a regra de intervalo de entrega para este pedido.',
      'rule.INVALID_DELIVERY_WINDOW.blurb': 'O horário de entrega solicitado está fora da janela de entrega válida para este PDV. Reprocesse como está ou ignore a regra de janela de entrega para este pedido.',
      'rule.MIN_ORDER_QUANTITY.blurb': 'O total do pedido está abaixo da quantidade mínima para esta conta. Reprocesse como está ou ignore a regra de quantidade mínima para este pedido.',
      'rule.MAX_ORDER_QUANTITY.blurb': 'O total do pedido excede a quantidade máxima permitida para esta conta. Reprocesse como está ou ignore a regra de quantidade máxima para este pedido.',

      // Business rule order copy
      'rule.POC_NOT_FOUND.orderCopy': 'O PDV referenciado neste pedido não está mapeado para o seu fornecedor.',
      'rule.PO_DUPLICATED.orderCopy': 'Um pedido anterior com o mesmo número de PO já foi processado.',
      'rule.UPC_NOT_FOUND.orderCopy': 'Alguns UPCs de produtos deste pedido não foram encontrados no catálogo BEES.',
      'rule.PRICE_MISMATCH.orderCopy': 'O preço unitário solicitado difere do preço do contrato BEES em uma ou mais linhas.',
      'rule.INVALID_PACKAGING.orderCopy': 'Embalagem de produto inválida (UoM) foi detectada em uma ou mais linhas.',
      'rule.INVALID_DELIVERY_RANGE.orderCopy': 'A data de entrega solicitada está fora do intervalo válido para esta conta.',
      'rule.INVALID_DELIVERY_WINDOW.orderCopy': 'O horário de entrega solicitado está fora da janela válida para este PDV.',
      'rule.MIN_ORDER_QUANTITY.orderCopy': 'O total do pedido está abaixo da quantidade mínima para esta conta.',
      'rule.MAX_ORDER_QUANTITY.orderCopy': 'O total do pedido excede a quantidade máxima permitida para esta conta.',

      // Filter by rule badge tooltip
      'rule.filter_tooltip': 'Filtrar a lista por esta regra',

      // Audit / timeline events
      'audit.received': 'Pedido recebido via EDI',
      'audit.accepted_oms': 'Pedido aceito no BEES OMS',
      'audit.status_with_rule': '{status}: {rule}',
      'audit.reprocess_requested': 'Reprocessamento solicitado — {detail}',
      'audit.outcome': 'Resultado: {status}',
      'audit.note_added': 'Nota de resolução adicionada ({category})',

      // Actor names
      'actor.system': 'sistema',
      'actor.bre': 'BRE',
      'actor.ops_user': 'Usuário de operações',

      // Reprocess action descriptions
      'action.reprocess_no_fix': '{rule}: reprocessar sem correções',
      'action.bypass': '{rule}: regra ignorada',
      'action.upc_selector': '{rule}: novos UPCs selecionados para {n} linha(s)',
      'action.price_choice': '{rule}: aplicado {priceChoice}, validação de preço ignorada',
      'action.rejected_as_is': '{rule}: reprocessado sem correções',
      'action.rejected_bypass': '{rule}: regra ignorada e reprocessado',
      'action.price_bees': 'preço do contrato BEES',
      'action.price_requested': 'preço solicitado pelo varejista',

      // Note dialog + categories
      'note.category_prompt': 'Categoria da nota ({list}):',
      'note.body_prompt': 'Conteúdo da nota:',
      'note.cat.catalog_fix': 'correção de catálogo',
      'note.cat.pricing_update': 'atualização de preço',
      'note.cat.poc_config': 'configuração de PDV',
      'note.cat.delivery_window': 'janela de entrega',
      'note.cat.packaging': 'embalagem',
      'note.cat.retailer_side': 'problema do varejista',
      'note.cat.other': 'outro',
    },

    es: {
      // Sidebar / top chrome
      'nav.home': 'Inicio',
      'nav.edi': 'Tracking EDI',
      'nav.catalog': 'Catálogo',
      'nav.customers': 'Lista de clientes',
      'nav.agreements': 'Acuerdos',
      'nav.chains': 'Gestión de cadenas',
      'nav.offers': 'Ofertas',
      'nav.campaigns': 'Campañas',
      'nav.back': 'Volver',
      'nav.expand': 'Expandir menú',
      'topbar.brand_home': 'Inicio BEES one',
      'topbar.module_selector': 'Selector de módulo',
      'topbar.notifications': 'Notificaciones',
      'topbar.user_menu': 'Menú de usuario',
      'topbar.language': 'Idioma',
      'topbar.change_language': 'Cambiar idioma',

      // Landing page
      'landing.title': 'Link admin',
      'landing.subtitle': 'Accede y gestiona los planes del equipo y la información de clientes.',
      'card.commercial_control.title': 'Control comercial',
      'card.commercial_control.desc': 'Da seguimiento a información prioritaria de cadenas y tiendas.',
      'card.chain_management.title': 'Gestión de cadenas',
      'card.chain_management.desc': 'Agrega o quita PDVs de las cadenas.',
      'card.customer_list.title': 'Lista de clientes',
      'card.customer_list.desc': 'Gestiona el catálogo de clientes de KAMs o BDRs.',
      'card.commercial_agreements.title': 'Acuerdos comerciales',
      'card.commercial_agreements.desc': 'Gestiona y da seguimiento a los contratos JBP de los clientes.',
      'card.campaigns.title': 'Campañas',
      'card.campaigns.desc': 'Gestiona y da seguimiento a campañas.',
      'card.offers.title': 'Ofertas',
      'card.offers.desc': 'Crea y gestiona ofertas.',
      'card.edi.title': 'EDI Central Tracking',
      'card.edi.desc': 'Monitorea y gestiona el procesamiento de pedidos EDI, reprocesa fallas y da seguimiento al estado de entrega.',

      // EDI list page
      'edi.title': 'EDI Central Tracking',
      'filter.toggle': 'Filtro',
      'filter.status': 'Estado',
      'filter.business_rule': 'Regla de negocio',
      'filter.retailer_chain': 'Cadena minorista',
      'filter.poc': 'PDV',
      'filter.vendor': 'Proveedor',
      'filter.region_zone': 'Región / Zona',
      'filter.sales_rep': 'Representante',
      'filter.po_number': 'Número PO',
      'filter.po_placeholder': 'ej. 12345678',
      'filter.period': 'Período (máx. 90 días · predet. últimos 30 días)',
      'filter.all_statuses': 'Todos los estados',
      'filter.all_rules': 'Todas las reglas',
      'filter.all_chains': 'Todas las cadenas',
      'filter.all_pocs': 'Todos los PDVs',
      'filter.all_vendors': 'Todos los proveedores',
      'filter.all_regions': 'Todas las regiones',
      'filter.all_reps': 'Todos los representantes',
      'filter.apply': 'Aplicar filtros',
      'filter.clear_all': 'Limpiar todo',
      'filter.period_hint': 'Intervalo máximo: 90 días · predet.: últimos 30 días',
      'filter.period_capped': 'Período limitado a 90 días (alcance de operaciones).',
      'filter.group.blocked': 'Bloqueado',
      'filter.group.rejected': 'Rechazado',
      'filter.search_poc': 'Buscar PDV por nombre, id o ciudad…',
      'filter.no_poc_match': 'No se encontraron PDVs.',

      // Bulk actions toolbar
      'bulk.select_all': 'Seleccionar todos en esta página',
      'bulk.select_all_n': 'Seleccionar todos en esta página ({n})',
      'bulk.no_eligible': 'No hay pedidos elegibles en esta página',
      'bulk.count_selected': '{n} seleccionados',
      'bulk.count_selected_one': '1 seleccionado',
      'bulk.clear_selection': 'Limpiar selección',
      'bulk.reprocess_selected': 'Reprocesar seleccionados',
      'bulk.reprocess_selected_n': 'Reprocesar seleccionados ({n})',
      'bulk.pinned_to': 'Lote fijado en: {rule} — solo se pueden agregar pedidos con esta regla.',
      'bulk.help': 'Reproceso en lote: selecciona pedidos Bloqueados con la misma regla.',
      'bulk.must_share_rule': 'El reproceso en lote solo funciona con pedidos Bloqueados que comparten la misma regla.',
      'bulk.must_share_rule_all': 'Todos los pedidos seleccionados deben compartir la misma regla de bloqueo.',
      'bulk.confirm': 'Estás a punto de reprocesar {n} pedidos, todos bloqueados por "{rule}". ¿Continuar?',

      // Empty state
      'empty.title': 'Ningún pedido coincide con tus filtros',
      'empty.body': 'Intenta ampliar el período o limpiar algunos filtros.',
      'empty.clear_btn': 'Limpiar todos los filtros',

      // Order list table
      'column.status': 'Estado',
      'column.receive_date': 'Fecha de recepción',
      'column.poc_chain': 'PDV / Cadena',
      'column.business_rule': 'Regla de negocio',
      'column.po_number': 'Número PO',
      'column.bees_order_number': 'Número de pedido BEES',
      'column.value': 'Valor',
      'cell.not_yet_assigned': 'Aún no asignado',
      'row.view_summary': 'Ver resumen del pedido',
      'row.take_action': 'Tomar acción correctiva',
      'row.cannot_reprocess': 'Los pedidos {status} no pueden reprocesarse',
      'row.select_for_bulk': 'Seleccionar para reproceso en lote',

      // Pagination
      'pagination.lines_per_page': 'Líneas por página:',
      'pagination.range': '{start} - {end} de {total}',
      'pagination.first': 'Primera página',
      'pagination.prev': 'Página anterior',
      'pagination.next': 'Página siguiente',
      'pagination.last': 'Última página',
      'pagination.page_n': 'Página {n}',

      // Summary KPI cards
      'summary.acceptance_rate_html': 'Tasa de aceptación: <strong>{n}%</strong>',
      'summary.of': '{count} de {total}',
      'summary.filter': 'Filtrar',
      'summary.clear': 'Limpiar',
      'summary.tooltip': '{label} — {count} de {total}',

      // Order details (item-level page)
      'details.title': 'Detalle del pedido',
      'details.bc_home': 'Inicio',
      'details.bc_edi': 'EDI Central Tracking',
      'details.bc_current': 'Detalle del pedido',
      'details.add_note': 'Agregar nota de resolución',
      'details.take_action': 'Tomar acción',
      'items.list_title': 'Productos de este pedido',
      'items.count_one': '1 ítem',
      'items.count_n': '{n} ítems',
      'items.requested_qty': 'Cant. solicitada',
      'items.requested_unit_price': 'Precio unitario solicitado',
      'items.requested_line_total': 'Total de línea solicitado',
      'items.requested_was': 'Solicitado {value}',

      // Drawer
      'drawer.label': 'Detalle del pedido',
      'drawer.section_order': 'Pedido',
      'drawer.field.receive_date': 'Fecha de recepción',
      'drawer.field.retailer_chain': 'Cadena minorista',
      'drawer.field.poc': 'PDV',
      'drawer.field.vendor': 'Proveedor',
      'drawer.field.sales_rep': 'Representante',
      'drawer.field.po_number': 'Número PO',
      'drawer.field.bees_order': 'Pedido BEES #',
      'drawer.field.items': 'Ítems',
      'drawer.field.total_value': 'Valor total',
      'drawer.notes': 'Notas de resolución ({n})',
      'drawer.no_notes': 'Aún no hay notas de resolución.',
      'drawer.add_note': 'Agregar nota',
      'drawer.timeline': 'Cronología',
      'drawer.close': 'Cerrar',
      'drawer.cancel': 'Cancelar',
      'drawer.why_rejected': '¿Por qué fue rechazado?',
      'drawer.why_blocked': '¿Por qué está en espera?',
      'drawer.no_action_title': 'Ninguna acción disponible',
      'drawer.accepted_msg': 'Este pedido fue aceptado y está en el BEES OMS.',
      'drawer.in_queue_msg': 'Este pedido está en cola y siendo procesado por BEES. Espera al siguiente estado.',
      'drawer.corrective_action': 'Acción correctiva',
      'drawer.select_correct_upcs': 'Seleccionar UPCs correctos',
      'drawer.choose_price': 'Elegir precio',
      'drawer.choose_reprocess': 'Elegir cómo reprocesar',
      'drawer.line_n': 'Línea {n}',
      'drawer.requested_sku': 'SKU solicitado: {sku}',
      'drawer.choose_upc': 'Elige el UPC correcto…',
      'drawer.price_explainer': 'Minorista solicitó {req} · Contrato BEES {contract}',
      'drawer.price_use_bees': 'Usar precio del contrato BEES',
      'drawer.price_use_requested': 'Aceptar precio solicitado por el minorista',
      'drawer.rejected_as_is': 'Reprocesar sin correcciones (re-incluir como está)',
      'drawer.rejected_bypass': 'Ignorar la regla y reprocesar',
      'drawer.pick_upc_required': 'Elige un UPC para cada línea afectada antes de reprocesar.',

      // Chips
      'chip.n_pocs_selected_one': '1 PDV seleccionado',
      'chip.n_pocs_selected': '{n} PDVs seleccionados',
      'chip.po_prefix': 'PO: {po}',

      // Status labels (order-level)
      'status.ACCEPTED': 'Aceptado',
      'status.BLOCKED': 'Bloqueado',
      'status.REJECTED': 'Rechazado',
      'status.IN_QUEUE': 'En cola',

      // Line-level statuses
      'line.OK': 'OK',
      'line.BLOCKED': 'Bloqueado',
      'line.REJECTED': 'Rechazado',
      'line.PENDING': 'En cola',

      // Business rule labels
      'rule.POC_NOT_FOUND.label': 'PDV no encontrado',
      'rule.PO_DUPLICATED.label': 'PO duplicado',
      'rule.UPC_NOT_FOUND.label': 'UPC no encontrado',
      'rule.PRICE_MISMATCH.label': 'Discrepancia de precio',
      'rule.INVALID_PACKAGING.label': 'Empaque de producto inválido',
      'rule.INVALID_DELIVERY_RANGE.label': 'Rango de entrega inválido',
      'rule.INVALID_DELIVERY_WINDOW.label': 'Ventana de entrega inválida',
      'rule.MIN_ORDER_QUANTITY.label': 'Cantidad mínima del pedido',
      'rule.MAX_ORDER_QUANTITY.label': 'Cantidad máxima del pedido',

      // Business rule action labels
      'rule.POC_NOT_FOUND.actionLabel': 'Reprocesar sin correcciones',
      'rule.PO_DUPLICATED.actionLabel': 'Ignorar duplicación y reprocesar',
      'rule.UPC_NOT_FOUND.actionLabel': 'Reprocesar con UPCs seleccionados',
      'rule.PRICE_MISMATCH.actionLabel': 'Reprocesar con precio elegido',
      'rule.INVALID_PACKAGING.actionLabel': 'Reprocesar sin correcciones',
      'rule.INVALID_DELIVERY_RANGE.actionLabel': 'Reprocesar',
      'rule.INVALID_DELIVERY_WINDOW.actionLabel': 'Reprocesar',
      'rule.MIN_ORDER_QUANTITY.actionLabel': 'Reprocesar',
      'rule.MAX_ORDER_QUANTITY.actionLabel': 'Reprocesar',

      // Business rule blurbs
      'rule.POC_NOT_FOUND.blurb': 'El PDV referenciado por este pedido no está mapeado al proveedor. Reprocesa para re-incluir el pedido en la cola tal cual — corrige el mapeo del PDV upstream si quieres que esta regla deje de dispararse para esta cuenta.',
      'rule.PO_DUPLICATED.blurb': 'BEES detectó un pedido anterior con el mismo número de PO. Ignora la validación de duplicación para re-incluir este pedido en la cola. Usa esto cuando el minorista reenvió intencionalmente el mismo PO.',
      'rule.UPC_NOT_FOUND.blurb': 'Una o más líneas referencian un UPC que no está en el catálogo BEES. Elige el UPC correcto para cada línea afectada y reprocesa.',
      'rule.PRICE_MISMATCH.blurb': 'Una o más líneas tienen un precio unitario que no coincide con el precio del contrato BEES. Elige qué precio aplicar y reprocesa — la validación de precio se omitirá para este pedido.',
      'rule.INVALID_PACKAGING.blurb': 'Una o más líneas referencian un empaque/unidad de medida inválido para el producto. Reprocesa para re-incluir el pedido en la cola — corrige la configuración del empaque upstream si quieres que esta regla deje de dispararse.',
      'rule.INVALID_DELIVERY_RANGE.blurb': 'La fecha de entrega solicitada está fuera del rango válido. Reprocesa tal cual (sin corrección) o ignora la regla de rango de entrega para este pedido.',
      'rule.INVALID_DELIVERY_WINDOW.blurb': 'El horario de entrega solicitado está fuera de la ventana de entrega válida para este PDV. Reprocesa tal cual o ignora la regla de ventana de entrega para este pedido.',
      'rule.MIN_ORDER_QUANTITY.blurb': 'El total del pedido está por debajo de la cantidad mínima para esta cuenta. Reprocesa tal cual o ignora la regla de cantidad mínima para este pedido.',
      'rule.MAX_ORDER_QUANTITY.blurb': 'El total del pedido excede la cantidad máxima permitida para esta cuenta. Reprocesa tal cual o ignora la regla de cantidad máxima para este pedido.',

      // Business rule order copy
      'rule.POC_NOT_FOUND.orderCopy': 'El PDV referenciado en este pedido no está mapeado a tu proveedor.',
      'rule.PO_DUPLICATED.orderCopy': 'Un pedido anterior con el mismo número de PO ya fue procesado.',
      'rule.UPC_NOT_FOUND.orderCopy': 'Algunos UPCs de productos de este pedido no fueron encontrados en el catálogo BEES.',
      'rule.PRICE_MISMATCH.orderCopy': 'El precio unitario solicitado difiere del precio del contrato BEES en una o más líneas.',
      'rule.INVALID_PACKAGING.orderCopy': 'Se detectó empaque de producto inválido (UoM) en una o más líneas.',
      'rule.INVALID_DELIVERY_RANGE.orderCopy': 'La fecha de entrega solicitada está fuera del rango válido para esta cuenta.',
      'rule.INVALID_DELIVERY_WINDOW.orderCopy': 'El horario de entrega solicitado está fuera de la ventana válida para este PDV.',
      'rule.MIN_ORDER_QUANTITY.orderCopy': 'El total del pedido está por debajo de la cantidad mínima para esta cuenta.',
      'rule.MAX_ORDER_QUANTITY.orderCopy': 'El total del pedido excede la cantidad máxima permitida para esta cuenta.',

      // Filter by rule badge tooltip
      'rule.filter_tooltip': 'Filtrar la lista por esta regla',

      // Audit / timeline events
      'audit.received': 'Pedido recibido vía EDI',
      'audit.accepted_oms': 'Pedido aceptado en BEES OMS',
      'audit.status_with_rule': '{status}: {rule}',
      'audit.reprocess_requested': 'Reproceso solicitado — {detail}',
      'audit.outcome': 'Resultado: {status}',
      'audit.note_added': 'Nota de resolución agregada ({category})',

      // Actor names
      'actor.system': 'sistema',
      'actor.bre': 'BRE',
      'actor.ops_user': 'Usuario de operaciones',

      // Reprocess action descriptions
      'action.reprocess_no_fix': '{rule}: reprocesar sin correcciones',
      'action.bypass': '{rule}: regla ignorada',
      'action.upc_selector': '{rule}: nuevos UPCs seleccionados para {n} línea(s)',
      'action.price_choice': '{rule}: se aplicó {priceChoice}, validación de precio omitida',
      'action.rejected_as_is': '{rule}: reprocesado sin correcciones',
      'action.rejected_bypass': '{rule}: regla ignorada y reprocesado',
      'action.price_bees': 'precio del contrato BEES',
      'action.price_requested': 'precio solicitado por el minorista',

      // Note dialog + categories
      'note.category_prompt': 'Categoría de la nota ({list}):',
      'note.body_prompt': 'Contenido de la nota:',
      'note.cat.catalog_fix': 'corrección de catálogo',
      'note.cat.pricing_update': 'actualización de precio',
      'note.cat.poc_config': 'configuración de PDV',
      'note.cat.delivery_window': 'ventana de entrega',
      'note.cat.packaging': 'empaque',
      'note.cat.retailer_side': 'problema del minorista',
      'note.cat.other': 'otro',
    },
  };

  // -------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------
  function t(key, params) {
    const lang = current;
    let str = (DICT[lang] && DICT[lang][key]);
    if (str == null) str = (DICT.en && DICT.en[key]);
    if (str == null) return key;
    if (params) {
      Object.keys(params).forEach((k) => {
        str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return str;
  }

  function applyStatic(root) {
    const scope = root || document;
    document.documentElement.lang = current;
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
  }

  function setLang(lang) {
    if (!SUPPORTED.includes(lang)) return;
    if (lang === current) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (_) {}
    applyStatic();
    listeners.forEach((cb) => { try { cb(lang); } catch (e) { /* ignore */ } });
  }

  function getLang() { return current; }
  function locale() { return LOCALE_MAP[current] || 'en-US'; }
  function languageLabel(lang) { return LANG_LABEL[lang] || lang; }
  function languageShort(lang) { return LANG_SHORT[lang] || (lang || '').toUpperCase(); }
  function onChange(cb) { if (typeof cb === 'function') listeners.push(cb); }

  return {
    t,
    setLang,
    getLang,
    locale,
    onChange,
    applyStatic,
    languageLabel,
    languageShort,
    SUPPORTED,
  };
})();
