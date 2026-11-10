// FEITURA · controlador da página de cotação (cotar.html).
// Liga eventos do DOM às ações do estado e decide o que re-renderizar.
//
//   catalog.js        banco técnico (somente leitura)
//   configurators.js  métodos e produtos especiais
//   store.js          estado transitório da cotação
//   pricing.js        regras de cálculo (puras)
//   view-*.js         renderização de cada seção
//   document-*.js     documento, exportação e revisão

import { findRecord } from "./catalog.js";
import { localDateTime, MASKS, upper } from "./format.js";
import { computeLine, computeTotals } from "./pricing.js";
import { addConfigured, addRecord, clearLines, createState, removeLine, resetOverrides, updateLine } from "./store.js";
import { nextPage, renderCatalog, renderSelectionStatus, renderSources, resetPage, visibleRecords } from "./view-catalog.js";
import { createConfigurator } from "./view-configurator.js";
import { LINE_FIELDS, patchDocument, renderDocument } from "./view-document.js";
import { initFormula } from "./view-formula.js";
import { buildPayload, exportDocument, openReview } from "./document-export.js";

const MODE_PARAM = { produzo: "producer", contrato: "contractor" };
const PARAM_OF = { producer: "produzo", contractor: "contrato" };

function initialMode() {
  const param = new URLSearchParams(window.location.search).get("perfil");
  return MODE_PARAM[param] || "producer";
}

function compute(state) {
  const ctx = { mode: state.mode, hourly: state.hourly, pricingBasis: state.pricingBasis };
  const rows = [...state.lines.values()].map(line => computeLine(line, ctx));
  return { rows, totals: computeTotals(rows) };
}

function scrollTo(root, selector) {
  root.querySelector(selector)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initQuoteRoot(root) {
  const state = createState(initialMode());
  const $ = selector => root.querySelector(selector);

  // ---------- render ----------

  function renderAll() {
    const { rows, totals } = compute(state);
    renderCatalog(root, state);
    renderDocument(root, state, rows, totals);
    renderSelectionStatus(root, totals);
  }

  function refreshValues() {
    const { rows, totals } = compute(state);
    patchDocument(root, rows, totals, state.mode);
    renderSelectionStatus(root, totals);
  }

  function applyMode() {
    root.querySelectorAll("[data-show-in]").forEach(el => { el.hidden = el.dataset.showIn !== state.mode; });
    root.querySelectorAll("[data-mode]").forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.mode === state.mode)));
    const url = new URL(window.location.href);
    url.searchParams.set("perfil", PARAM_OF[state.mode]);
    window.history.replaceState(null, "", url);
    renderAll();
  }

  function applyProvider() {
    root.querySelectorAll("[data-provider-display]").forEach(el => { el.textContent = state.provider || "SUA FEITURA"; });
  }

  // ---------- documento ----------

  function documentFields() {
    const value = sel => $(sel)?.value || "";
    return {
      from: value("[data-document-from]"),
      to: value("[data-document-to]"),
      deadlineFrom: value("[data-deadline-from]"),
      deadlineTo: value("[data-deadline-to]")
    };
  }

  function currentDocument() {
    state.generatedAt = localDateTime(new Date());
    $("[data-generated-at]").textContent = state.generatedAt;
    return buildPayload(state, compute(state).rows, documentFields());
  }

  // ---------- configurador ----------

  const configurator = createConfigurator(root, props => {
    state.activeLineId = addConfigured(state, props);
    renderAll();
    scrollTo(root, "[data-document]");
  });

  // ---------- eventos ----------

  const CLICK = {
    "[data-mode]": el => { state.mode = el.dataset.mode; applyMode(); },
    "[data-configure-record]": el => configurator.open(findRecord(el.dataset.configureRecord)),
    "[data-toggle-panel]": el => {
      const panel = el.nextElementSibling;
      const open = el.getAttribute("aria-expanded") === "true";
      el.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
    },
    "[data-catalog-more]": () => { nextPage(state); renderCatalog(root, state); },
    "[data-quote-filtered]": () => {
      visibleRecords(state).filter(r => r.quoteable).forEach(r => addRecord(state, r));
      renderAll();
      scrollTo(root, "[data-document]");
    },
    "[data-clear-lines]": () => { clearLines(state); renderAll(); },
    "[data-goto-document]": () => scrollTo(root, "[data-document]"),
    "[data-configure-line]": el => {
      state.activeLineId = el.dataset.configureLine;
      renderAll();
      $("[data-config-panel]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    },
    "[data-close-config]": () => { state.activeLineId = ""; renderAll(); },
    "[data-remove-line]": el => { removeLine(state, el.dataset.removeLine); renderAll(); },
    "[data-open-review]": () => openReview(currentDocument()),
    "[data-export]": el => exportDocument(currentDocument(), el.dataset.export)
  };

  const CHANGE = {
    "[data-select-record]": el => {
      const key = el.dataset.selectRecord;
      if (el.checked) state.activeLineId = addRecord(state, findRecord(key));
      else removeLine(state, key);
      renderAll();
    },
    "[data-include-line]": el => { updateLine(state, el.dataset.includeLine, { included: el.checked }); renderAll(); },
    "[data-catalog-group]": el => { state.catalog.group = el.value; resetPage(state); renderCatalog(root, state); },
    "input[name=pricingBasis]": el => { state.pricingBasis = el.value; renderAll(); },
    "[data-include-option]": el => {
      state.include[el.dataset.includeOption] = el.checked;
      if (el.dataset.includeOption === "deadline") $("[data-deadline-fields]").hidden = !el.checked;
    }
  };

  function onLineInput(input) {
    const { line, field } = input.dataset;
    const mask = MASKS[LINE_FIELDS[field].mask];
    if (input.tagName === "INPUT" && LINE_FIELDS[field].mask !== "text") {
      const masked = mask.mask(input.value);
      if (masked !== input.value) input.value = masked;
    }
    updateLine(state, line, { [field]: mask.parse(input.value) });
    refreshValues();
  }

  const INPUT = {
    "[data-line][data-field]": onLineInput,
    "[data-catalog-search]": el => { state.catalog.query = el.value; resetPage(state); renderCatalog(root, state); },
    "[name=hourly]": el => { state.hourly = Math.max(0, Number(el.value) || 0); resetOverrides(state); renderAll(); },
    "[data-quote-provider]": el => { state.provider = el.value.trim(); applyProvider(); }
  };

  const dispatch = table => event => {
    for (const [selector, handler] of Object.entries(table)) {
      const el = event.target.closest(selector);
      if (el && root.contains(el)) { handler(el, event); return; }
    }
  };

  root.addEventListener("click", dispatch(CLICK));
  root.addEventListener("change", dispatch(CHANGE));
  root.addEventListener("input", event => {
    const t = event.target;
    // Campos de texto livres seguem a convenção visual da página: caixa alta.
    if (t.matches('input[type="text"]:not([data-quote-provider]):not([data-mask]), input[type="search"]')) {
      const pos = t.selectionStart;
      t.value = upper(t.value);
      try { t.setSelectionRange(pos, pos); } catch { /* tipos sem seleção */ }
    }
    dispatch(INPUT)(event);
  });

  // Campos com máscara: foco seleciona tudo; ao sair, o valor volta à forma canônica.
  root.addEventListener("focusin", event => {
    const t = event.target;
    if (t.matches("input[data-mask]:not([data-mask=text])")) requestAnimationFrame(() => t.select());
  });
  root.addEventListener("focusout", event => {
    if (event.target.matches("input[data-line][data-field]")) refreshValues();
  });

  // ---------- início ----------

  renderSources(root);
  initFormula(root, () => compute(state).totals);
  applyProvider();
  applyMode();
}

export function initQuote() {
  document.querySelectorAll("[data-feitura-quote]").forEach(initQuoteRoot);
}
