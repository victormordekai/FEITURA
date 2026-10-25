import { glossaryData } from "./glossary-data.js";

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const number = value => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value) || 0);
const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[char]));

const allItems = () => [
  ...glossaryData.models.map(item => ({ ...item, key: `model:${item.name}`, label: item.name, group: "Artigos e modelos", category: item.material_family || item.material_family || "Artigo" })),
  ...glossaryData.operations.map(item => ({ ...item, key: `operation:${item.id}`, label: item.name, group: "Operações", category: item.category || "Operação" })),
  ...glossaryData.repairs.filter(item => item.active !== false).map(item => ({ ...item, key: `repair:${item.id}`, label: item.name, group: "Consertos e serviços", category: "Conserto" }))
];

const itemMinutes = item => {
  const avg = Number(item.avg);
  if (Number.isFinite(avg) && avg > 0) return avg;
  const min = Number(item.min) || 0;
  const max = Number(item.max) || 0;
  return min || max ? (min + max) / 2 : 0;
};

function getOverride(state, key) {
  return state.overrides.get(key) || {};
}

function sourceLabel(item) {
  if (item.type === "model") return "Artigo / modelo";
  if (item.type === "operation") return "Operação";
  if (item.type === "repair") return "Conserto / serviço";
  return "Linha própria";
}

function createCatalogRow(item, state) {
  const checked = state.selected.has(item.key) ? "checked" : "";
  const minutes = itemMinutes(item);
  const override = getOverride(state, item.key);
  const selectedPrice = Number(override.price) > 0 ? Number(override.price) : 0;
  const selectedMinutes = Number(override.minutes) > 0 ? Number(override.minutes) : minutes;
  const sourcePrice = item.type === "repair" && Number(item.price_avg) > 0 ? Number(item.price_avg) : 0;
  const searchable = `${item.label} ${item.category || ""} ${item.material_family || item.material || ""} ${item.notes || ""}`.toLowerCase();

  return `
    <article class="glossary-item${checked ? " is-selected" : ""}" data-glossary-item data-key="${esc(item.key)}" data-search="${esc(searchable)}">
      <label class="glossary-select" aria-label="Selecionar ${esc(item.label)} para a cotação">
        <input type="checkbox" data-glossary-check ${checked}>
        <span aria-hidden="true"></span>
      </label>
      <div class="glossary-item-main">
        <div class="glossary-item-top">
          <span class="mono">${esc(item.group)}</span>
          <span class="glossary-category">${esc(item.category || "")}</span>
        </div>
        <h3>${esc(item.label)}</h3>
        <p>${esc(item.notes || item.scope || item.basis || "")}</p>
        <div class="glossary-meta">
          <span><b>${number(item.min)}–${number(item.max)}</b> min. faixa</span>
          <span><b>${number(minutes)}</b> min. médio</span>
          ${sourcePrice > 0 ? `<span><b>${money(sourcePrice)}</b> referência</span>` : ""}
        </div>
        <div class="glossary-personalize" ${checked ? "" : "hidden"}>
          <label>
            <span>Tempo aplicado <small>min./un.</small></span>
            <input type="number" min="0.01" step="0.01" value="${selectedMinutes}" data-override-minutes aria-label="Tempo aplicado para ${esc(item.label)}">
          </label>
          <label>
            <span>Valor unitário próprio <small>R$ / un.</small></span>
            <input type="number" min="0" step="0.01" value="${selectedPrice || ""}" placeholder="Usar valor-hora" data-override-price aria-label="Valor unitário próprio para ${esc(item.label)}">
          </label>
          <button type="button" class="text-button" data-reset-override>Usar base</button>
        </div>
      </div>
      <button type="button" class="glossary-detail" data-glossary-detail aria-expanded="false">Detalhes</button>
      <div class="glossary-detail-panel" hidden>
        ${item.type === "model" ? `<p><strong>Escopo:</strong> ${esc(item.scope)}</p><p><strong>Natureza:</strong> ${esc(item.data_nature)}</p><p><strong>Operações estimadas:</strong> ${esc(item.operations)}</p>` : ""}
        ${item.type === "operation" ? `<p><strong>Sequência:</strong> ${esc(item.sequence)}</p><p><strong>Máquinas:</strong> ${esc(item.machines)}</p><p><strong>Subprocessos:</strong> ${esc(item.subprocesses)}</p><p><strong>Base:</strong> ${esc(item.basis)}</p>` : ""}
        ${item.type === "repair" ? `<p><strong>Faixa de referência:</strong> ${money(item.price_min)} a ${money(item.price_max)}</p><p><strong>Base de tempo:</strong> ${esc(item.basis)}</p><p><strong>Confiança:</strong> ${esc(item.confidence)}</p>` : ""}
      </div>
    </article>`;
}

function download(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvValue(value) { return `"${String(value ?? "").replace(/"/g, '""')}"`; }
function selectedRows(state) { return allItems().filter(item => state.selected.has(item.key)); }

function calculate(state) {
  const quantity = Math.max(1, Number(state.quantity) || 1);
  const hourly = Math.max(0, Number(state.hourly) || 0);
  const buyerPrice = Math.max(0, Number(state.maxUnitPrice) || 0);

  const baseRows = selectedRows(state).map(item => {
    const override = getOverride(state, item.key);
    const minutes = Number(override.minutes) > 0 ? Number(override.minutes) : itemMinutes(item);
    let unitPrice = Number(override.price) > 0 ? Number(override.price) : 0;
    let pricingBasis = "Valor-hora";

    if (!unitPrice && state.mode === "buyer" && buyerPrice > 0) {
      unitPrice = buyerPrice;
      pricingBasis = "Teto informado";
    } else if (!unitPrice && hourly > 0) {
      unitPrice = minutes / 60 * hourly;
    } else if (!unitPrice && item.type === "repair") {
      unitPrice = Number(item.price_avg) || 0;
      pricingBasis = "Referência da base";
    } else if (Number(override.price) > 0) {
      pricingBasis = "Valor próprio";
    }

    return {
      key: item.key,
      item,
      minutes,
      unitPrice,
      total: unitPrice * quantity,
      source: "base",
      pricingBasis
    };
  });

  const customRows = state.customRows.map((row, index) => {
    const minutes = Math.max(0, Number(row.minutes) || 0);
    const explicitPrice = Number(row.price) > 0 ? Number(row.price) : 0;
    const unitPrice = explicitPrice || (hourly > 0 ? minutes / 60 * hourly : (state.mode === "buyer" ? buyerPrice : 0));
    return {
      key: `custom:${index}`,
      item: { label: row.name, type: "custom" },
      minutes,
      unitPrice,
      total: unitPrice * quantity,
      source: "custom",
      pricingBasis: explicitPrice ? "Valor próprio" : "Valor-hora"
    };
  });

  return [...baseRows, ...customRows];
}

function updateBuyerResult(root, state) {
  const result = root.querySelector("[data-buyer-result]");
  if (!result) return;
  const first = selectedRows(state)[0];
  const quantity = Math.max(1, Number(state.quantity) || 1);
  const maxUnitPrice = Number(state.maxUnitPrice) || 0;
  if (!first || maxUnitPrice <= 0) {
    result.hidden = true;
    return;
  }
  const minutes = Number(getOverride(state, first.key).minutes) > 0 ? Number(getOverride(state, first.key).minutes) : itemMinutes(first);
  const implied = minutes > 0 ? maxUnitPrice / (minutes / 60) : 0;
  result.hidden = false;
  result.querySelector("[data-reference-minutes]").textContent = `${number(minutes)} min./un.`;
  result.querySelector("[data-implied-hourly]").textContent = money(implied);
  result.querySelector("[data-reference-total-hours]").textContent = `${number(minutes / 60 * quantity)}h`;
}

function renderResults(root, state) {
  const table = root.querySelector("[data-catalog-table]");
  const countEl = root.querySelector("[data-catalog-count]");
  const totalEl = root.querySelector("[data-catalog-total]");
  const hoursEl = root.querySelector("[data-catalog-hours]");
  if (!table || !countEl || !totalEl || !hoursEl) return;

  const rows = calculate(state);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const totalHours = rows.reduce((sum, row) => sum + row.minutes / 60 * Math.max(1, Number(state.quantity) || 1), 0);
  const incomplete = rows.filter(row => row.unitPrice <= 0).length;

  countEl.textContent = `${rows.length} item${rows.length === 1 ? "" : "s"}`;
  totalEl.textContent = money(total);
  hoursEl.textContent = `${number(totalHours)}h`;
  root.querySelector("[data-catalog-status]")?.replaceChildren(document.createTextNode(incomplete ? `${incomplete} item(ns) sem valor calculado` : rows.length ? "Cálculo pronto" : "Nenhum item selecionado"));

  table.innerHTML = rows.length ? rows.map(row => `
    <tr data-quote-row="${esc(row.key)}">
      <td><strong>${esc(row.item.label)}</strong><small>${row.source === "base" ? `${sourceLabel(row.item)} · ${esc(row.pricingBasis)}` : "Linha própria"}</small></td>
      <td>${number(row.minutes)} min.</td>
      <td>${row.unitPrice > 0 ? money(row.unitPrice) : "Defina referência"}</td>
      <td>${row.total > 0 ? money(row.total) : ""}</td>
      <td>${row.source === "custom" ? `<button type="button" class="quote-row-remove" data-remove-custom="${esc(row.key)}">Remover</button>` : ""}</td>
    </tr>`).join("") : `<tr><td colspan="5" class="empty-state">Selecione registros na base técnica para montar o orçamento.</td></tr>`;
}

function renderGlossary(root, state) {
  const list = root.querySelector("[data-glossary-list]");
  if (!list) return;
  const query = (root.querySelector("[data-glossary-search]")?.value || "").trim().toLowerCase();
  const filter = root.querySelector("[data-glossary-filter]")?.value || "all";
  const items = allItems();

  if (filter === "sources") {
    const rows = glossaryData.sources.filter(item => !query || `${item.name} ${item.type} ${item.limitation}`.toLowerCase().includes(query));
    list.innerHTML = rows.map(item => `<article class="glossary-reference"><span class="mono">${esc(item.type)}</span><h3>${esc(item.name)}</h3><p>${esc(item.limitation)}</p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a></article>`).join("") || `<div class="empty-state">Nenhuma fonte corresponde à busca.</div>`;
    return;
  }

  if (filter === "methods") {
    const rows = glossaryData.methods.filter(item => !query || `${item.term} ${item.rule}`.toLowerCase().includes(query));
    list.innerHTML = rows.map(item => `<article class="glossary-reference"><span class="mono">MÉTODO</span><h3>${esc(item.term)}</h3><p>${esc(item.rule)}</p></article>`).join("") || `<div class="empty-state">Nenhum princípio metodológico corresponde à busca.</div>`;
    return;
  }

  const source = filter === "all" ? items : items.filter(item => item.type === ({ models: "model", operations: "operation", repairs: "repair" }[filter]));
  const filtered = source.filter(item => !query || `${item.label} ${item.category || ""} ${item.material_family || item.material || ""} ${item.notes || ""}`.toLowerCase().includes(query));
  list.innerHTML = filtered.map(item => createCatalogRow(item, state)).join("") || `<div class="empty-state">Nenhum registro corresponde à busca.</div>`;
}

function exportCatalog(state, format = "csv") {
  const rows = calculate(state);
  const generatedAt = new Date().toLocaleString("pt-BR");
  const payload = {
    schema: "FEITURA/quote/v3",
    generatedAt,
    mode: state.mode,
    quantity: Number(state.quantity) || 1,
    hourly: state.mode === "producer" ? Number(state.hourly) || null : null,
    maxUnitPrice: state.mode === "buyer" ? Number(state.maxUnitPrice) || null : null,
    items: rows.map(row => ({
      key: row.key,
      name: row.item.label,
      origin: row.source,
      pricingBasis: row.pricingBasis,
      averageMinutes: row.minutes,
      unitPrice: row.unitPrice,
      total: row.total
    })),
    total: rows.reduce((sum, row) => sum + row.total, 0)
  };

  if (format === "json") {
    download(state.mode === "buyer" ? "feitura-romaneio.json" : "feitura-orcamento.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    return;
  }

  if (format === "html") {
    download(state.mode === "buyer" ? "feitura-romaneio.html" : "feitura-orcamento.html", buildDocumentHtml(payload), "text/html;charset=utf-8");
    return;
  }

  const lines = [
    ["FEITURA®", state.mode === "buyer" ? "Romaneio de referência" : "Orçamento"],
    ["Gerado em", generatedAt],
    ["Quantidade", payload.quantity],
    ["Valor-hora", payload.hourly ? money(payload.hourly) : ""],
    ["Teto por unidade", payload.maxUnitPrice ? money(payload.maxUnitPrice) : ""],
    [],
    ["Item", "Origem", "Base de preço", "Tempo médio (min)", "Valor unitário", "Total"],
    ...payload.items.map(item => [item.name, item.origin === "base" ? "Base técnica" : "Linha própria", item.pricingBasis, item.averageMinutes.toFixed(2), item.unitPrice ? item.unitPrice.toFixed(2) : "", item.total ? item.total.toFixed(2) : ""]),
    [],
    ["TOTAL", "", "", "", "", payload.total.toFixed(2)]
  ];
  download(state.mode === "buyer" ? "feitura-romaneio.csv" : "feitura-orcamento.csv", "\uFEFF" + lines.map(line => line.map(csvValue).join(";")).join("\n"), "text/csv;charset=utf-8");
}

function buildDocumentHtml(payload) {
  const title = payload.mode === "buyer" ? "Romaneio de referência FEITURA®" : "Orçamento FEITURA®";
  const rows = payload.items.map(item => `<tr><td>${esc(item.name)}</td><td>${number(item.averageMinutes)} min.</td><td>${item.unitPrice ? money(item.unitPrice) : "Sem valor"}</td><td>${item.total ? money(item.total) : ""}</td></tr>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:Arial,sans-serif;max-width:1000px;margin:40px auto;padding:0 24px;color:#252d25}h1{font-weight:400}table{width:100%;border-collapse:collapse;margin-top:28px}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}th{font-size:12px;text-transform:uppercase;color:#666}.meta{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:24px 0}.meta strong{display:block;font-size:18px}.total{margin-top:28px;font-size:22px;font-weight:bold}</style></head><body><p>FEITURA®</p><h1>${esc(title)}</h1><div class="meta"><div>Gerado em<strong>${esc(payload.generatedAt)}</strong></div><div>Quantidade<strong>${number(payload.quantity)} un.</strong></div><div>${payload.hourly ? "Valor-hora" : "Teto por unidade"}<strong>${money(payload.hourly || payload.maxUnitPrice || 0)}</strong></div></div><table><thead><tr><th>Item / serviço</th><th>Tempo</th><th>Valor unitário</th><th>Total</th></tr></thead><tbody>${rows || '<tr><td colspan="4">Nenhum item selecionado.</td></tr>'}</tbody></table><div class="total">Total: ${money(payload.total)}</div><p>Documento gerado localmente pela FEITURA®. Os dados técnicos são referências e devem ser validados nas condições reais de produção.</p></body></html>`;
}

function solveFormula(root) {
  const unknown = root.querySelector("[data-formula-unknown]")?.value;
  const xEl = root.querySelector("[data-formula-x]"), aEl = root.querySelector("[data-formula-a]"), bEl = root.querySelector("[data-formula-b]"), fEl = root.querySelector("[data-formula-f]");
  const resultEl = root.querySelector("[data-formula-result]"), displayEl = root.querySelector("[data-formula-display]"), explanationEl = root.querySelector("[data-formula-explanation]");
  if (!resultEl) return;
  const x = Number(xEl?.value) || 0, a = Number(aEl?.value) || 0, b = Number(bEl?.value) || 0, f = Number(fEl?.value) || 0;
  let result = null, expression = "FEITURA(x) = ax + b";
  if (unknown === "F" && x > 0 && (a > 0 || b > 0)) { result = a * x + b; expression = `FEITURA(${number(x)}) = ${money(a)} × ${number(x)} + ${money(b)} = ${money(result)}`; fEl.value = result.toFixed(2); }
  else if (unknown === "x" && a > 0 && f >= b) { result = (f - b) / a; expression = `x = (${money(f)} − ${money(b)}) ÷ ${money(a)} = ${number(result)}`; if (Number.isFinite(result)) xEl.value = result.toFixed(2); }
  else if (unknown === "a" && x > 0 && f >= b) { result = (f - b) / x; expression = `a = (${money(f)} − ${money(b)}) ÷ ${number(x)} = ${money(result)}`; if (Number.isFinite(result)) aEl.value = result.toFixed(2); }
  else if (unknown === "b" && x > 0 && f >= a * x) { result = f - a * x; expression = `b = ${money(f)} − (${money(a)} × ${number(x)}) = ${money(result)}`; if (Number.isFinite(result)) bEl.value = result.toFixed(2); }
  resultEl.textContent = result !== null && Number.isFinite(result) && result >= 0 ? money(result) : "Informe os componentes conhecidos.";
  displayEl.textContent = expression;
  explanationEl.textContent = "O cálculo permanece local no navegador. A função explicita a composição do valor e não representa um preço universal de mercado.";
}

function syncMode(root, state, mode) {
  state.mode = mode;
  root.dataset.quoteMode = mode;
  root.querySelectorAll("[data-mode-panel]").forEach(panel => { panel.hidden = panel.dataset.modePanel !== mode; });
  root.querySelectorAll("[data-mode-button]").forEach(button => {
    const active = button.dataset.modeButton === mode;
    button.setAttribute("aria-selected", String(active));
    button.setAttribute("tabindex", active ? "0" : "-1");
  });
  renderResults(root, state);
  updateBuyerResult(root, state);
}

export function initGlossary() {
  document.querySelectorAll("[data-feitura-quote]").forEach(root => {
    const state = { selected: new Set(), overrides: new Map(), hourly: 0, quantity: 100, maxUnitPrice: 0, customRows: [], mode: "producer" };
    root._quoteState = state;

    const baseCount = root.querySelector("[data-base-count]");
    if (baseCount) baseCount.textContent = `${allItems().length} registros`;
    renderGlossary(root, state);
    renderResults(root, state);

    root.addEventListener("input", event => {
      const target = event.target;
      if (target.matches("[data-glossary-search]")) { renderGlossary(root, state); return; }
      if (target.matches("[name=hourly]")) state.hourly = Number(target.value) || 0;
      if (target.matches("[name=quantity]")) state.quantity = Math.max(1, Number(target.value) || 1);
      if (target.matches("[name=maxUnitPrice]")) state.maxUnitPrice = Number(target.value) || 0;
      if (target.matches("[data-override-minutes], [data-override-price]")) {
        const item = target.closest("[data-glossary-item]");
        if (item) {
          const current = getOverride(state, item.dataset.key);
          if (target.matches("[data-override-minutes]")) current.minutes = Number(target.value) || 0;
          if (target.matches("[data-override-price]")) current.price = Number(target.value) || 0;
          state.overrides.set(item.dataset.key, current);
        }
      }
      renderResults(root, state);
      updateBuyerResult(root, state);
      if (target.matches("[data-formula-x], [data-formula-a], [data-formula-b], [data-formula-f]")) solveFormula(root);
    });

    root.addEventListener("change", event => {
      const target = event.target;
      if (target.matches("[data-formula-unknown]")) solveFormula(root);
      if (target.matches("[data-glossary-filter]")) { renderGlossary(root, state); return; }
      if (target.matches("[data-glossary-check]")) {
        const item = target.closest("[data-glossary-item]");
        if (!item) return;
        if (target.checked && state.mode === "buyer") {
          state.selected.clear();
          state.overrides.clear();
        }
        if (target.checked) state.selected.add(item.dataset.key); else state.selected.delete(item.dataset.key);
        renderGlossary(root, state);
        renderResults(root, state);
        updateBuyerResult(root, state);
      }
    });

    root.addEventListener("click", event => {
      const mode = event.target.closest("[data-mode-button]");
      if (mode) { syncMode(root, state, mode.dataset.modeButton); return; }

      const detail = event.target.closest("[data-glossary-detail]");
      if (detail) {
        const panel = detail.closest("[data-glossary-item]")?.querySelector(".glossary-detail-panel");
        if (!panel) return;
        const open = detail.getAttribute("aria-expanded") === "true";
        detail.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
        return;
      }

      const reset = event.target.closest("[data-reset-override]");
      if (reset) {
        const item = reset.closest("[data-glossary-item]");
        if (item) {
          state.overrides.delete(item.dataset.key);
          renderGlossary(root, state);
          renderResults(root, state);
          updateBuyerResult(root, state);
        }
        return;
      }

      if (event.target.closest("[data-add-custom-line]")) {
        const nameEl = root.querySelector("[data-custom-name]"), minutesEl = root.querySelector("[data-custom-minutes]"), priceEl = root.querySelector("[data-custom-price]");
        const name = nameEl.value.trim(), minutes = Number(minutesEl.value) || 0, price = Number(priceEl.value) || 0;
        if (!name || (minutes <= 0 && price <= 0)) { nameEl.focus(); return; }
        state.customRows.push({ name, minutes, price });
        nameEl.value = ""; minutesEl.value = ""; priceEl.value = "";
        renderResults(root, state);
        return;
      }

      const remove = event.target.closest("[data-remove-custom]");
      if (remove) {
        const index = Number(remove.dataset.removeCustom.split(":")[1]);
        if (Number.isInteger(index)) state.customRows.splice(index, 1);
        renderResults(root, state);
        return;
      }

      if (event.target.closest("[data-generate-document]")) {
        renderResults(root, state);
        root.querySelector(".quote-document")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      if (event.target.closest("[data-print-catalog]")) { window.print(); return; }
      if (event.target.closest("[data-export-catalog]")) { exportCatalog(state, "csv"); return; }
      if (event.target.closest("[data-export-json]")) { exportCatalog(state, "json"); return; }
      if (event.target.closest("[data-export-html]")) { exportCatalog(state, "html"); return; }
      if (event.target.closest("[data-select-all]")) { root.querySelectorAll("[data-glossary-item]").forEach(item => state.selected.add(item.dataset.key)); renderGlossary(root, state); renderResults(root, state); updateBuyerResult(root, state); return; }
      if (event.target.closest("[data-clear-selection]")) { state.selected.clear(); state.overrides.clear(); renderGlossary(root, state); renderResults(root, state); updateBuyerResult(root, state); return; }
      if (event.target.closest("[data-open-database]")) { root.querySelector("#base-tecnica")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    });

    syncMode(root, state, "producer");
    solveFormula(root);
  });
}
