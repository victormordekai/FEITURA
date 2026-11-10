// FEITURA · estado transitório da cotação.
// Uma única coleção de linhas, cada uma com ID estável. Remover uma linha
// nunca desloca o estado das outras. Nada aqui é persistido.

import { referenceMinutes, standardPrice } from "./catalog.js";

let sequence = 0;
const newId = () => `line-${Date.now().toString(36)}-${++sequence}`;

export function createState(mode = "producer") {
  return {
    mode,                         // "producer" | "contractor"
    hourly: 0,
    pricingBasis: "hourly",       // "hourly" | "standard" (somente produzo)
    provider: "",
    include: { contact: true, priceTable: true, production: true, deadline: true },
    lines: new Map(),
    activeLineId: "",
    generatedAt: "",
    catalog: { query: "", group: "all", limit: 12 }
  };
}

const LINE_DEFAULTS = {
  processes: 1,
  machines: 1,
  quantity: 1,
  materialUnit: 0,
  operationalOverride: null,      // ajuste manual de quem produz; null = calculado
  targetUnit: 0,                  // preço-alvo de quem contrata
  fixedUnitPrice: 0,              // valor derivado do próprio método (ex.: tarifa de facção)
  standardPrice: 0,
  observation: "",
  variables: null,
  variablesText: "",
  included: true
};

/** Registro do banco → linha do documento. Mesmo resultado por qualquer caminho de seleção. */
export function addRecord(state, record) {
  if (state.lines.has(record.key)) return record.key;
  const price = standardPrice(record);
  state.lines.set(record.key, {
    ...LINE_DEFAULTS,
    id: record.key,
    origin: "base",
    refId: record.id,
    label: record.label,
    product: record.label,
    methodName: record.method || "REFERÊNCIA DIRETA",
    minutes: referenceMinutes(record),
    standardPrice: price,
    targetUnit: price,
    observation: record.notes || ""
  });
  return record.key;
}

/** Linha criada por um configurador (método ou produto especial). */
export function addConfigured(state, props) {
  const id = newId();
  state.lines.set(id, { ...LINE_DEFAULTS, ...props, id, targetUnit: props.fixedUnitPrice || 0 });
  return id;
}

export const removeLine = (state, id) => {
  state.lines.delete(id);
  if (state.activeLineId === id) state.activeLineId = "";
};

export function updateLine(state, id, patch) {
  const line = state.lines.get(id);
  if (line) Object.assign(line, patch);
}

export function clearLines(state) {
  state.lines.clear();
  state.activeLineId = "";
}

/** Novo valor-hora recalcula tudo: ajustes manuais anteriores deixam de valer. */
export function resetOverrides(state) {
  state.lines.forEach(line => { line.operationalOverride = null; });
}
