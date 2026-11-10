// FEITURA · diálogo de configuração de métodos e produtos especiais.
// Recebe um registro, monta o formulário a partir do configurador e devolve,
// ao confirmar, as propriedades da nova linha do documento.

import { configuratorFor, describeValues } from "./configurators.js";
import { ceilMoney, esc, minSec } from "./format.js";

const TEMPLATE = `
  <div class="method-ref-backdrop" data-dialog-close></div>
  <section class="method-ref-dialog" role="dialog" aria-modal="true" aria-labelledby="configurator-title">
    <button type="button" class="method-ref-close" data-dialog-close>FECHAR</button>
    <div class="section-index mono">CONFIGURAÇÃO DE COTAÇÃO</div>
    <p class="kicker" data-dialog-eyebrow></p>
    <h2 id="configurator-title" data-dialog-title></h2>
    <p class="method-ref-description" data-dialog-description></p>
    <form class="method-ref-form" data-dialog-form></form>
    <div class="method-ref-actions">
      <button type="button" class="button button-dark" data-dialog-confirm>ADICIONAR AO DOCUMENTO</button>
      <button type="button" class="text-button" data-dialog-close>CANCELAR</button>
    </div>
  </section>`;

function fieldHtml(f) {
  const label = `<span>${esc(f.label)}${f.unit ? ` <small>${esc(f.unit)}</small>` : ""}</span>`;
  if (f.type === "select") {
    const options = f.options.map(o => `<option>${esc(o)}</option>`).join("");
    return `<label>${label}<select name="${esc(f.key)}">${options}</select></label>`;
  }
  const numeric = f.type === "number" ? ` min="0" step="${f.step || "0.01"}" inputmode="decimal"` : "";
  return `<label>${label}<input name="${esc(f.key)}" type="${f.type}"${numeric} value="${esc(f.value ?? "")}" placeholder="${esc(f.placeholder || "")}"></label>`;
}

const DERIVED = `<div class="method-ref-derived">
  <span class="mono">TEMPO RESULTANTE</span>
  <strong data-dialog-minutes>INFORME AS VARIÁVEIS</strong>
  <small>O tempo é derivado apenas quando a regra possui parâmetros suficientes; caso contrário, permanece como referência informada.</small>
</div>`;

export function createConfigurator(root, onConfirm) {
  const modal = document.createElement("div");
  modal.className = "method-ref-modal";
  modal.hidden = true;
  modal.innerHTML = TEMPLATE;
  root.appendChild(modal);

  const form = modal.querySelector("[data-dialog-form]");
  let current = null;        // { record, config }
  let lastFocus = null;

  const values = () => Object.fromEntries(current.config.fields.map(f => [f.key, form.elements[f.key]?.value ?? ""]));

  function refresh() {
    const minutes = current.config.minutes(values());
    modal.querySelector("[data-dialog-minutes]").textContent = minutes > 0 ? `${minSec(minutes)} MIN:SEG/UN.` : "INFORME AS VARIÁVEIS";
  }

  function close() {
    modal.classList.remove("is-open");
    setTimeout(() => { modal.hidden = true; }, 180);
    lastFocus?.focus();
    current = null;
  }

  function confirm() {
    const v = values();
    const { record, config } = current;
    const minutes = config.minutes(v);
    const product = String(v.product || "").trim() || "Produto não informado";
    const summary = describeValues(config.fields, v);
    const positive = key => Math.max(0, Math.round(Number(v[key]) || 0));
    onConfirm({
      origin: record.group === "methods" ? "method" : "special",
      refId: record.id,
      label: `${product} | ${config.title}${summary ? ` | ${summary}` : ""}`,
      product,
      methodName: config.methodName,
      minutes,
      processes: positive("processes"),
      machines: positive("machines"),
      quantity: positive("quantity"),
      fixedUnitPrice: config.unitPrice ? ceilMoney(config.unitPrice(v, minutes)) : 0,
      variables: v,
      variablesText: summary.replace(/ · /g, "\n")
    });
    close();
  }

  modal.addEventListener("click", e => {
    if (e.target.closest("[data-dialog-close]")) close();
    if (e.target.closest("[data-dialog-confirm]")) confirm();
  });
  modal.addEventListener("keydown", e => { if (e.key === "Escape") close(); });
  form.addEventListener("input", refresh);
  form.addEventListener("submit", e => { e.preventDefault(); confirm(); });

  return {
    open(record) {
      const config = configuratorFor(record);
      current = { record, config };
      lastFocus = document.activeElement;
      modal.querySelector("[data-dialog-eyebrow]").textContent = config.eyebrow;
      modal.querySelector("[data-dialog-title]").textContent = config.title;
      modal.querySelector("[data-dialog-description]").textContent = config.description;
      form.innerHTML = config.fields.map(fieldHtml).join("") + DERIVED;
      refresh();
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add("is-open"));
      form.querySelector("input, select")?.focus();
    }
  };
}
