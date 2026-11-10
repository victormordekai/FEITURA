// FEITURA · seção 03: tabela de custos, resumo e painel de configuração.
// Tabela e painel usam o mesmo contrato de campo: data-line="ID" data-field="campo".
// Assim um único handler edita os dois, e patchDocument sincroniza sem re-renderizar.

import { MASKS, esc, money, duration } from "./format.js";
import { MODES } from "./pricing.js";

/** Campo editável → máscara e de onde vem o valor exibido na linha calculada. */
export const LINE_FIELDS = {
  quantity:            { mask: "integer", read: r => r.quantity },
  processes:           { mask: "integer", read: r => r.processes },
  machines:            { mask: "integer", read: r => r.machines },
  minutes:             { mask: "time",    read: r => r.minutes },
  materialUnit:        { mask: "money",   read: r => r.materialUnit },
  operationalOverride: { mask: "money",   read: r => r.unitPrice },
  targetUnit:          { mask: "money",   read: r => r.targetUnit },
  observation:         { mask: "text",    read: r => r.observation },
  variablesText:       { mask: "text",    read: r => r.variablesText }
};

export const unitField = mode => (mode === "contractor" ? "targetUnit" : "operationalOverride");

const fieldValue = (row, field) => MASKS[LINE_FIELDS[field].mask].show(LINE_FIELDS[field].read(row));

function cellInput(row, field, label) {
  const mask = LINE_FIELDS[field].mask;
  const cls = mask === "money" ? "quote-money-input" : "quote-scalar-input";
  return `<input class="quote-cell-input ${cls}" type="text" inputmode="numeric" autocomplete="off"
    data-line="${esc(row.id)}" data-field="${field}" data-mask="${mask}"
    value="${esc(fieldValue(row, field))}" aria-label="${esc(`${label} · ${row.label}`)}">`;
}

function unitHint(row, mode) {
  if (mode === "contractor") {
    return row.hourlyImplied > 0 ? `HORA IMPLÍCITA: ${money(row.hourlyImplied)}/H` : "INFORME O PREÇO-ALVO";
  }
  if (row.referencePrice > 0 && Math.abs(row.unitPrice - row.referencePrice) > 0.005) return `CALC.: ${money(row.referencePrice)}`;
  return row.unitPrice > 0 ? "AUTOMÁTICO · EDITÁVEL" : row.basis;
}

function rowHtml(row, mode) {
  const unit = unitField(mode);
  return `<tr data-row="${esc(row.id)}" class="${row.included ? "" : "is-excluded"}">
    <td><strong>${esc(row.label)}</strong><small data-out="basis">${esc(row.basis)}</small>${row.included ? "" : "<small>EXCLUÍDO DA REVISÃO E IMPRESSÃO</small>"}</td>
    <td>${cellInput(row, "processes", "Processos")}</td>
    <td>${cellInput(row, "machines", "Máquinas")}</td>
    <td>${cellInput(row, "minutes", "Tempo")}</td>
    <td>${cellInput(row, "materialUnit", "Matéria-prima unitária")}</td>
    <td><div class="quote-price-editor">${cellInput(row, unit, MODES[mode].unitLabel)}<small data-out="hint">${esc(unitHint(row, mode))}</small></div></td>
    <td>${cellInput(row, "quantity", "Quantidade")}</td>
    <td data-out="total">${money(row.total)}</td>
    <td>
      <label class="quote-row-include" title="Incluir na revisão e impressão"><input type="checkbox" data-include-line="${esc(row.id)}" ${row.included ? "checked" : ""}><span>INCLUIR</span></label>
      <button type="button" class="quote-row-configure" data-configure-line="${esc(row.id)}">CONFIGURAR</button>
      <button type="button" class="quote-row-remove" data-remove-line="${esc(row.id)}">REMOVER</button>
    </td>
  </tr>`;
}

function panelHtml(row, mode) {
  const unit = unitField(mode);
  const input = (field, label, small) => `<label><span>${label}${small ? ` <small>${small}</small>` : ""}</span>${cellInput(row, field, label)}</label>`;
  const area = (field, label, rows, placeholder = "") => `<label class="quote-config-wide"><span>${label}</span><textarea data-line="${esc(row.id)}" data-field="${field}" data-mask="text" rows="${rows}" placeholder="${esc(placeholder)}">${esc(fieldValue(row, field))}</textarea></label>`;
  return `
    <div class="quote-config-head">
      <div>
        <span class="kicker">Painel de configuração da cotação</span>
        <h3>${esc(row.product || row.label)}</h3>
        <p>Os valores desta configuração pertencem à cotação atual. A referência original do banco de dados permanece inalterada.</p>
      </div>
      <button type="button" class="text-button" data-close-config>FECHAR</button>
    </div>
    <div class="quote-config-grid">
      <label class="is-readonly"><span>Produto / item</span><input type="text" value="${esc(row.product || row.label)}" readonly></label>
      ${input("quantity", "Quantidade", "UN.")}
      <label class="is-readonly"><span>Método de cronoanálise</span><input type="text" value="${esc(row.methodName)}" readonly></label>
      ${input("processes", "Processos")}
      ${input("machines", "Máquinas")}
      ${input("minutes", "Tempo", "MIN:SEG / UN.")}
      ${input("materialUnit", "Matéria-prima", "R$/UN.")}
      ${input(unit, mode === "contractor" ? "Preço-alvo" : "Operação unitária", "R$/UN.")}
      ${area("observation", "Observações", 3)}
      ${area("variablesText", "Variáveis específicas do método", 4, "Registrar somente as variáveis necessárias ao método.")}
    </div>`;
}

function renderSummary(root, totals) {
  const set = (key, text) => { const el = root.querySelector(`[data-summary="${key}"]`); if (el) el.textContent = text; };
  set("count", String(totals.count));
  set("time", duration(totals.seconds));
  set("material", money(totals.material));
  set("operational", money(totals.operational));
  set("total", money(totals.total));
}

/** Render completo: chamado em mudanças estruturais (entrar/sair linha, perfil, configuração). */
export function renderDocument(root, state, rows, totals) {
  const body = root.querySelector("[data-document-rows]");
  if (!body) return;
  root.querySelector("[data-unit-header]").innerHTML = MODES[state.mode].unitLabel.replace(" UNIT.", "<br>UNIT.");
  body.innerHTML = rows.length
    ? rows.map(row => rowHtml(row, state.mode)).join("")
    : `<tr><td colspan="9" class="empty-state">COTE REGISTROS NO BANCO DE DADOS TÉCNICO PARA MONTAR A TABELA.</td></tr>`;

  const panel = root.querySelector("[data-config-panel]");
  const active = rows.find(r => r.id === state.activeLineId);
  panel.hidden = !active;
  panel.innerHTML = active ? panelHtml(active, state.mode) : "";
  renderSummary(root, totals);
}

/** Atualização leve durante a digitação: valores derivados e campos espelhados, sem perder o foco. */
export function patchDocument(root, rows, totals, mode) {
  const focused = document.activeElement;
  rows.forEach(row => {
    root.querySelectorAll(`[data-line="${CSS.escape(row.id)}"][data-field]`).forEach(input => {
      if (input !== focused) input.value = fieldValue(row, input.dataset.field);
    });
    const tr = root.querySelector(`[data-row="${CSS.escape(row.id)}"]`);
    if (!tr) return;
    tr.querySelector('[data-out="total"]').textContent = money(row.total);
    tr.querySelector('[data-out="basis"]').textContent = row.basis;
    tr.querySelector('[data-out="hint"]').textContent = unitHint(row, mode);
  });
  renderSummary(root, totals);
}
