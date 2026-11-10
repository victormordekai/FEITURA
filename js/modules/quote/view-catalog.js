// FEITURA · seção 02: banco técnico paginado, situação da seleção e referências.

import { allRecords, filterRecords, referenceMinutes, standardPrice, sources } from "./catalog.js";
import { esc, minSec, money } from "./format.js";
import { hourlyPrice } from "./pricing.js";

const PAGE_SIZE = 12;

function quotePreview(record, state) {
  if (state.mode === "contractor") return "";
  const value = state.pricingBasis === "standard"
    ? standardPrice(record)
    : hourlyPrice(referenceMinutes(record), state.hourly);
  const text = value > 0 ? money(value) : (state.pricingBasis === "standard" ? "SEM VALOR PADRÃO" : "DEFINA O VALOR/HORA");
  return `<span><b>${text}</b> COTAÇÃO</span>`;
}

function details(record) {
  const p = (label, value) => (value ? `<p><strong>${label}:</strong> ${esc(value)}</p>` : "");
  switch (record.group) {
    case "models":     return p("ESCOPO", record.scope) + p("OPERAÇÕES ESTIMADAS", record.operations) + p("FONTES", record.sources);
    case "operations": return p("SEQUÊNCIA", record.sequence) + p("MÁQUINAS", record.machines) + p("BASE", record.basis);
    case "repairs":    return `<p><strong>FAIXA:</strong> ${money(record.price_min)} A ${money(record.price_max)}</p>` + p("BASE", record.basis) + p("CONFIANÇA", record.confidence);
    case "methods":    return p("REGRA", record.rule);
    default:           return p("VARIÁVEIS", record.variables.map(v => v.label).join(" · "));
  }
}

function cardHtml(record, state) {
  const selected = state.lines.has(record.key);
  const head = `<div class="glossary-item-top"><span class="mono">${esc(record.groupLabel)} · ${esc(record.id)}</span><span class="glossary-category">${esc(record.category || "")}</span></div>
      <h3>${esc(record.label)}</h3>
      <p>${esc(record.summary || "")}</p>`;

  if (!record.quoteable) {
    return `<article class="glossary-item is-reference">
      <div class="glossary-item-main">${head}
        <div class="glossary-meta"><span><b>${esc(record.category)}</b></span><span><b>CONFIGURÁVEL</b> PARA COTAÇÃO</span></div>
      </div>
      <button type="button" class="glossary-detail method-configure" data-configure-record="${esc(record.key)}" aria-haspopup="dialog">CONFIGURAR</button>
    </article>`;
  }

  const standard = standardPrice(record);
  return `<article class="glossary-item${selected ? " is-selected" : ""}">
    <label class="glossary-select" aria-label="Selecionar ${esc(record.label)} para a tabela de custos">
      <input type="checkbox" data-select-record="${esc(record.key)}" ${selected ? "checked" : ""}><span aria-hidden="true"></span>
    </label>
    <div class="glossary-item-main">${head}
      <div class="glossary-meta">
        <span><b>${minSec(referenceMinutes(record))}</b> MIN:SEG MÉDIO</span>
        <span><b>${standard > 0 ? money(standard) : "SEM VALOR"}</b> PADRÃO</span>
        ${quotePreview(record, state)}
      </div>
    </div>
    <button type="button" class="glossary-detail" data-toggle-panel aria-expanded="false">DETALHES</button>
    <div class="glossary-detail-panel" hidden>${details(record)}</div>
  </article>`;
}

/** Registros que o filtro atual exibe (todas as páginas). */
export const visibleRecords = state => filterRecords(state.catalog);

export function renderCatalog(root, state) {
  const list = root.querySelector("[data-catalog-list]");
  if (!list) return;
  const filtered = visibleRecords(state);
  const page = filtered.slice(0, state.catalog.limit);
  const remaining = filtered.length - page.length;

  list.innerHTML = page.length
    ? page.map(r => cardHtml(r, state)).join("")
    : `<div class="empty-state">NENHUM REGISTRO ENCONTRADO.</div>`;

  const more = root.querySelector("[data-catalog-more]");
  more.hidden = remaining <= 0;
  more.textContent = `MOSTRAR MAIS ${Math.min(PAGE_SIZE, remaining)} · ${remaining} RESTANTES`;

  const quoteable = filtered.filter(r => r.quoteable).length;
  const bulk = root.querySelector("[data-quote-filtered]");
  bulk.disabled = quoteable === 0;
  bulk.textContent = `COTAR FILTRADOS (${quoteable})`;

  root.querySelector("[data-catalog-count]").textContent = `${allRecords().length} REGISTROS`;
  root.querySelector("[data-catalog-status]").textContent = `EXIBINDO ${page.length} DE ${filtered.length}`;
}

export const nextPage = state => { state.catalog.limit += PAGE_SIZE; };
export const resetPage = state => { state.catalog.limit = PAGE_SIZE; };

export function renderSelectionStatus(root, totals) {
  const el = root.querySelector("[data-selection-status]");
  if (!el) return;
  el.textContent = totals.count
    ? `${totals.count} ${totals.count === 1 ? "ITEM" : "ITENS"} NO DOCUMENTO · ${money(totals.total)}`
    : "NENHUM ITEM NO DOCUMENTO";
}

export function renderSources(root) {
  const card = root.querySelector("[data-reference-card]");
  if (!card) return;
  const groups = new Map();
  sources().forEach(s => {
    const type = s.type || "Referência";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(s);
  });
  const groupsHtml = [...groups].map(([type, items]) => `
    <section class="database-reference-group">
      <div class="database-reference-group-head"><span class="mono">${esc(type)}</span><strong>${items.length} ${items.length === 1 ? "REFERÊNCIA" : "REFERÊNCIAS"}</strong></div>
      <div class="database-reference-list">${items.map(s => `
        <article class="database-reference-item">
          <h4>${esc(s.name)}</h4>
          <p>${esc(s.limitation || "Referência utilizada para contextualização e estruturação do banco de dados público.")}</p>
          <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">ABRIR FONTE ↗</a>
        </article>`).join("")}
      </div>
    </section>`).join("");

  card.innerHTML = `
    <div class="database-reference-head">
      <div>
        <span class="kicker">Banco de dados FEITURA</span>
        <h3 id="database-reference-title">REFERÊNCIAS DO BANCO DE DADOS</h3>
        <p>Referências bibliográficas, técnicas, acadêmicas e visuais usadas para contextualizar e organizar a base pública da FEITURA. A existência de uma referência não significa que cada valor, tempo ou parâmetro publicado derive diretamente dela; cada registro conserva sua própria natureza e limitação metodológica.</p>
      </div>
      <div class="database-reference-summary"><strong>${sources().length}</strong><span>REFERÊNCIAS INDEXADAS</span></div>
    </div>
    <button type="button" class="glossary-detail database-reference-toggle" data-toggle-panel aria-expanded="false">DETALHES</button>
    <div class="database-reference-panel" hidden>${groupsHtml}</div>`;
}
