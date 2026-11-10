// FEITURA · seção 04: FEITURA(x) = a·x + b.
// Resolve a variável escolhida e pode importar x e a do documento atual.

import { money, number } from "./format.js";
import { solveLinear } from "./pricing.js";

const NOTE = "O cálculo permanece local no navegador. A função explicita a composição do valor e não representa um preço universal de mercado.";

function expression(unknown, { x, a, b, f }, value) {
  switch (unknown) {
    case "F": return `FEITURA(${number(x)}) = ${money(a)} × ${number(x)} + ${money(b)} = ${money(value)}`;
    case "x": return `x = (${money(f)} − ${money(b)}) ÷ ${money(a)} = ${number(value)}`;
    case "a": return `a = (${money(f)} − ${money(b)}) ÷ ${number(x)} = ${money(value)}`;
    case "b": return `b = ${money(f)} − (${money(a)} × ${number(x)}) = ${money(value)}`;
    default:  return "FEITURA(x) = ax + b";
  }
}

export function initFormula(root, getTotals) {
  const section = root.querySelector("[data-formula]");
  if (!section) return;
  const el = name => section.querySelector(`[data-formula-${name}]`);
  const inputs = { x: el("x"), a: el("a"), b: el("b"), f: el("f") };

  function solve(note = NOTE) {
    const unknown = el("unknown").value;
    const values = Object.fromEntries(Object.entries(inputs).map(([k, input]) => [k, Number(input.value) || 0]));
    const solved = solveLinear(unknown, values);
    const ok = solved && Number.isFinite(solved.value) && solved.value >= 0;
    if (ok) inputs[unknown === "F" ? "f" : unknown].value = solved.value.toFixed(2);

    const result = el("result");
    result.textContent = ok ? (unknown === "x" ? number(solved.value) : money(solved.value)) : "INFORME OS COMPONENTES CONHECIDOS.";
    result.classList.toggle("is-message", !ok);
    el("display").textContent = ok ? expression(unknown, values, solved.value) : "FEITURA(x) = ax + b";
    el("explanation").textContent = note;
  }

  /** x = peças incluídas; a = custo variável médio por peça (matéria-prima + valor unitário). */
  function importFromDocument() {
    const totals = getTotals();
    if (!totals.pieces) {
      el("explanation").textContent = "O documento ainda não possui peças incluídas para importar.";
      return;
    }
    inputs.x.value = totals.pieces;
    inputs.a.value = (totals.total / totals.pieces).toFixed(2);
    el("unknown").value = "F";
    solve(`Importado do documento: x = ${number(totals.pieces)} peças incluídas; a = média ponderada de matéria-prima + valor unitário por peça. Informe b para o custo fixo do lote. ${NOTE}`);
  }

  section.addEventListener("input", e => { if (e.target.matches("input")) solve(); });
  section.addEventListener("change", e => { if (e.target.matches("[data-formula-unknown]")) solve(); });
  section.addEventListener("click", e => { if (e.target.closest("[data-formula-import]")) importFromDocument(); });
  solve();
}
