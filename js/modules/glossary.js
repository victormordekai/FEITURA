import { glossaryData } from "./glossary-data.js";

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);
const number = value => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(value || 0);
const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[char]));

const allItems = () => [
  ...glossaryData.models.map(item => ({ ...item, key: `model:${item.name}`, label: item.name, group: "Artigos e modelos", category: item.material_family })),
  ...glossaryData.operations.map(item => ({ ...item, key: `operation:${item.id}`, label: item.name, group: "Operações", category: item.category })),
  ...glossaryData.repairs.filter(item => item.active).map(item => ({ ...item, key: `repair:${item.id}`, label: item.name, group: "Consertos e serviços", category: "Conserto" }))
];

const itemMinutes = item => Number(item.avg) || ((Number(item.min) + Number(item.max)) / 2);

function createCatalogRow(item, state) {
  const checked = state.selected.has(item.key) ? "checked" : "";
  const minutes = itemMinutes(item);
  const price = state.hourly > 0 ? minutes / 60 * state.hourly : null;
  const sourcePrice = item.type === "repair" ? item.price_avg : null;
  return `
    <article class="glossary-item" data-glossary-item data-key="${esc(item.key)}" data-search="${esc(`${item.label} ${item.category} ${item.material_family || ""}`.toLowerCase())}">
      <label class="glossary-select" aria-label="Incluir ${esc(item.label)} no orçamento">
        <input type="checkbox" data-glossary-check ${checked}>
        <span></span>
      </label>
      <div class="glossary-item-main">
        <div class="glossary-item-top">
          <span class="mono">${esc(item.group)}</span>
          <span class="glossary-category">${esc(item.category || "")}</span>
        </div>
        <h3>${esc(item.label)}</h3>
        <p>${esc(item.notes || item.scope || item.basis || "")}</p>
        <div class="glossary-meta">
          <span><b>${number(item.min)}–${number(item.max)}</b> min.</span>
          <span><b>${number(minutes)}</b> min. médios</span>
          ${sourcePrice !== null ? `<span><b>${money(sourcePrice)}</b> referência de fonte</span>` : ""}
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
  URL.revokeObjectURL(url);
}

function csvValue(value) {
  const text = String(value ?? "").replace(/"/g, '""');
  return `"${text}"`;
}

function selectedRows(state) {
  return allItems().filter(item => state.selected.has(item.key));
}

function calculate(state) {
  const rows = selectedRows(state);
  const quantity = Math.max(1, Number(state.quantity) || 1);
  const hourly = Math.max(0, Number(state.hourly) || 0);
  return rows.map(item => {
    const minutes = itemMinutes(item);
    const unitPrice = hourly > 0 ? minutes / 60 * hourly : (item.type === "repair" ? Number(item.price_avg) || 0 : 0);
    return { item, minutes, unitPrice, total: unitPrice * quantity };
  });
}

function renderResults(root, state) {
  const rows = calculate(state);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const totalHours = rows.reduce((sum, row) => sum + row.minutes / 60 * Number(state.quantity || 1), 0);
  root.querySelector("[data-catalog-count]").textContent = `${rows.length} item${rows.length === 1 ? "" : "s"} selecionado${rows.length === 1 ? "" : "s"}`;
  root.querySelector("[data-catalog-total]").textContent = money(total);
  root.querySelector("[data-catalog-hours]").textContent = `${number(totalHours)}h`;
  root.querySelector("[data-catalog-table]").innerHTML = rows.length ? rows.map(row => `
    <tr><td>${esc(row.item.label)}</td><td>${number(row.minutes)} min.</td><td>${state.hourly ? money(row.unitPrice) : "Defina seu valor-hora"}</td><td>${state.hourly ? money(row.total) : ""}</td></tr>`).join("") : `<tr><td colspan="4" class="empty-state">Selecione itens na base técnica para montar o catálogo.</td></tr>`;
}

function renderGlossary(root, state) {
  const list = root.querySelector("[data-glossary-list]");
  const query = (root.querySelector("[data-glossary-search]")?.value || "").trim().toLowerCase();
  const filter = root.querySelector("[data-glossary-filter]")?.value || "all";
  const groups = { all: allItems(), models: allItems().filter(i => i.type === "model"), operations: allItems().filter(i => i.type === "operation"), repairs: allItems().filter(i => i.type === "repair") };
  if (filter === "sources") {
    const filteredSources = glossaryData.sources.filter(item => !query || `${item.name} ${item.type} ${item.limitation}`.toLowerCase().includes(query));
    list.innerHTML = filteredSources.map(item => `<article class="glossary-reference"><span class="mono">${esc(item.type)}</span><h3>${esc(item.name)}</h3><p>${esc(item.limitation)}</p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">Abrir fonte ↗</a></article>`).join("") || `<div class="empty-state">Nenhuma fonte corresponde à busca.</div>`;
    return;
  }
  if (filter === "methods") {
    const filteredMethods = glossaryData.methods.filter(item => !query || `${item.term} ${item.rule}`.toLowerCase().includes(query));
    list.innerHTML = filteredMethods.map(item => `<article class="glossary-reference"><span class="mono">MÉTODO</span><h3>${esc(item.term)}</h3><p>${esc(item.rule)}</p></article>`).join("") || `<div class="empty-state">Nenhum princípio metodológico corresponde à busca.</div>`;
    return;
  }
  const source = groups[filter] || groups.all;
  const filtered = source.filter(item => !query || `${item.label} ${item.category || ""} ${item.material_family || ""}`.toLowerCase().includes(query));
  list.innerHTML = filtered.map(item => createCatalogRow(item, state)).join("") || `<div class="empty-state">Nenhum registro corresponde à busca.</div>`;
}

function exportCatalog(state) {
  const rows = calculate(state);
  const lines = [
    ["FEITURA®","Catálogo de referência produtiva"],
    ["Data", new Date().toLocaleDateString("pt-BR")],
    ["Valor-hora informado", state.hourly ? money(state.hourly) : "não informado"],
    ["Quantidade de referência", state.quantity],
    [],
    ["Item","Tipo","Tempo médio (min)","Valor unitário","Total"],
    ...rows.map(row => [row.item.label, row.item.type, row.minutes.toFixed(2), state.hourly ? row.unitPrice.toFixed(2) : row.item.type === "repair" ? Number(row.item.price_avg || 0).toFixed(2) : "", state.hourly ? row.total.toFixed(2) : ""])
  ];
  download("feitura-catalogo-referencia.csv", lines.map(line => line.map(csvValue).join(";")).join("\n"), "text/csv;charset=utf-8");
}

function exportBriefing(state, mode) {
  const rows = selectedRows(state);
  const payload = {
    schema: "FEITURA/briefing/v1",
    generatedAt: new Date().toISOString(),
    mode,
    quantity: Number(state.quantity) || 1,
    hourly: mode === "producer" ? Number(state.hourly) || null : null,
    maxUnitPrice: mode === "buyer" ? Number(state.maxUnitPrice) || null : null,
    items: rows.map(item => ({ key: item.key, name: item.label, type: item.type, averageMinutes: itemMinutes(item) }))
  };
  download(mode === "buyer" ? "feitura-romaneio-referencia.json" : "feitura-orcamento-referencia.json", JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
}


function solveFormula(root) {
  const unknown = root.querySelector("[data-formula-unknown]")?.value;
  const xEl = root.querySelector("[data-formula-x]");
  const aEl = root.querySelector("[data-formula-a]");
  const bEl = root.querySelector("[data-formula-b]");
  const fEl = root.querySelector("[data-formula-f]");
  const resultEl = root.querySelector("[data-formula-result]");
  const displayEl = root.querySelector("[data-formula-display]");
  const explanationEl = root.querySelector("[data-formula-explanation]");
  if (!resultEl) return;

  const x = Number(xEl?.value) || 0;
  const a = Number(aEl?.value) || 0;
  const b = Number(bEl?.value) || 0;
  const f = Number(fEl?.value) || 0;
  let result = null;
  let expression = "FEITURA(x) = ax + b";
  let explanation = "O cálculo permanece local no navegador. Valores derivados de estimativas devem ser tratados como referências, não como preço universal de mercado.";

  if (unknown === "F" && x > 0 && (a > 0 || b > 0)) {
    result = a * x + b;
    expression = `FEITURA(${number(x)}) = ${money(a)} × ${number(x)} + ${money(b)} = ${money(result)}`;
    fEl.value = result.toFixed(2);
  } else if (unknown === "x" && a > 0 && f >= b) {
    result = (f - b) / a;
    expression = `x = (${money(f)} − ${money(b)}) ÷ ${money(a)} = ${number(result)}`;
    xEl.value = Number.isFinite(result) ? result.toFixed(2) : "";
    explanation = result >= 0 ? explanation : "A combinação informada produz uma quantidade inválida.";
  } else if (unknown === "a" && x > 0 && f >= b) {
    result = (f - b) / x;
    expression = `a = (${money(f)} − ${money(b)}) ÷ ${number(x)} = ${money(result)}`;
    aEl.value = Number.isFinite(result) ? result.toFixed(2) : "";
  } else if (unknown === "b" && x > 0 && f >= a * x) {
    result = f - a * x;
    expression = `b = ${money(f)} − (${money(a)} × ${number(x)}) = ${money(result)}`;
    bEl.value = Number.isFinite(result) ? result.toFixed(2) : "";
  }

  if (result === null || !Number.isFinite(result) || result < 0) {
    resultEl.textContent = "Informe os componentes conhecidos.";
    displayEl.textContent = expression;
    explanationEl.textContent = explanation;
    return;
  }

  resultEl.textContent = money(result);
  displayEl.textContent = expression;
  explanationEl.textContent = explanation;
}

function syncMode(root, mode) {
  root.dataset.quoteMode = mode;
  root.querySelectorAll("[data-mode-panel]").forEach(panel => panel.hidden = panel.dataset.modePanel !== mode);
  root.querySelectorAll("[data-mode-button]").forEach(button => button.setAttribute("aria-selected", String(button.dataset.modeButton === mode)));
}

export function initGlossary() {
  document.querySelectorAll("[data-feitura-quote]").forEach(root => {
    const state = { selected: new Set(), hourly: 0, quantity: 1, maxUnitPrice: 0 };
    renderGlossary(root, state);

    root.addEventListener("input", event => {
      if (event.target.matches("[data-glossary-search]")) renderGlossary(root, state);
      if (event.target.matches("[name=hourly]")) state.hourly = Number(event.target.value) || 0;
      if (event.target.matches("[name=quantity]")) state.quantity = Number(event.target.value) || 1;
      if (event.target.matches("[name=maxUnitPrice]")) state.maxUnitPrice = Number(event.target.value) || 0;
      renderResults(root, state);
      const selected = selectedRows(state);
      const first = selected[0];
      const buyerResult = root.querySelector("[data-buyer-result]");
      if (buyerResult && first && state.maxUnitPrice > 0) {
        const minutes = itemMinutes(first);
        const implied = state.maxUnitPrice / (minutes / 60);
        buyerResult.hidden = false;
        buyerResult.querySelector("[data-implied-hourly]").textContent = money(implied);
        buyerResult.querySelector("[data-reference-minutes]").textContent = `${number(minutes)} min./un.`;
        buyerResult.querySelector("[data-reference-total-hours]").textContent = `${number(minutes / 60 * state.quantity)}h`;
      } else if (buyerResult) buyerResult.hidden = true;
    });

    root.addEventListener("input", event => {
      if (event.target.matches("[data-formula-x], [data-formula-a], [data-formula-b], [data-formula-f]")) solveFormula(root);
    });

    root.addEventListener("change", event => {
      if (event.target.matches("[data-formula-unknown]")) solveFormula(root);
      if (event.target.matches("[data-glossary-check]")) {
        const item = event.target.closest("[data-glossary-item]");
        if (event.target.checked && root.dataset.quoteMode === "buyer") state.selected.clear();
        if (event.target.checked) state.selected.add(item.dataset.key); else state.selected.delete(item.dataset.key);
        renderResults(root, state);
        return;
      }
      if (event.target.matches("[data-glossary-filter]")) renderGlossary(root, state);
    });

    root.addEventListener("click", event => {
      const mode = event.target.closest("[data-mode-button]");
      if (mode) syncMode(root, mode.dataset.modeButton);
      const detail = event.target.closest("[data-glossary-detail]");
      if (detail) {
        const panel = detail.closest("[data-glossary-item]").querySelector(".glossary-detail-panel");
        const open = detail.getAttribute("aria-expanded") === "true";
        detail.setAttribute("aria-expanded", String(!open));
        panel.hidden = open;
      }
      if (event.target.closest("[data-export-catalog]")) exportCatalog(state);
      if (event.target.closest("[data-export-briefing]")) exportBriefing(state, root.dataset.quoteMode || "producer");
      if (event.target.closest("[data-print-catalog]")) window.print();
      if (event.target.closest("[data-select-all]")) {
        allItems().forEach(item => state.selected.add(item.key));
        renderGlossary(root, state);
        renderResults(root, state);
      }
      if (event.target.closest("[data-clear-selection]")) {
        state.selected.clear();
        renderGlossary(root, state);
        renderResults(root, state);
      }
    });

    syncMode(root, "producer");
    renderResults(root, state);
    solveFormula(root);
  });
}
