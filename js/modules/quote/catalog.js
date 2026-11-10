// FEITURA · adaptador do banco técnico público.
// Transforma glossary-data.js (gerado da planilha) em registros uniformes e consultáveis.
// Somente leitura: nenhuma cotação altera estes registros.

import { glossaryData } from "../../data/glossary-data.js";

export const DATA_VERSION = `${glossaryData.version} (${glossaryData.updated})`;

/** kind: "quote" entra direto no documento; "configure" abre o configurador antes. */
export const GROUPS = {
  models:     { label: "Artigos e modelos",      kind: "quote" },
  operations: { label: "Operações",              kind: "quote" },
  repairs:    { label: "Consertos e serviços",   kind: "quote" },
  specials:   { label: "Produtos especiais",     kind: "configure" },
  methods:    { label: "Método de cronoanálise", kind: "configure" }
};

const toRecord = (group, item, extra) => ({
  ...item,
  key: `${group}:${item.id}`,
  group,
  groupLabel: GROUPS[group].label,
  quoteable: GROUPS[group].kind === "quote",
  ...extra
});

const RECORDS = Object.freeze([
  ...glossaryData.models.map(i => toRecord("models", i, { label: i.name, category: i.material_family || "Artigo", summary: i.notes || i.scope })),
  ...glossaryData.operations.map(i => toRecord("operations", i, { label: i.name, category: i.category || "Operação", summary: i.notes })),
  ...glossaryData.repairs.filter(i => i.active !== false).map(i => toRecord("repairs", i, { label: i.name, category: "Conserto", summary: i.notes })),
  ...glossaryData.specialReferences.map(i => toRecord("specials", i, { label: i.name, category: i.category, summary: i.notes })),
  ...glossaryData.methods.map(i => toRecord("methods", i, { label: i.term, category: "Método", summary: i.rule }))
]);

const BY_KEY = new Map(RECORDS.map(r => [r.key, r]));

export const allRecords = () => RECORDS;
export const findRecord = key => BY_KEY.get(key);
export const sources = () => glossaryData.sources;

export function filterRecords({ query = "", group = "all" } = {}) {
  const q = query.trim().toLocaleLowerCase("pt-BR");
  return RECORDS.filter(r => {
    if (group !== "all" && r.group !== group) return false;
    if (!q) return true;
    const haystack = [r.label, r.category, r.material_family, r.material, r.summary, r.scope, r.id]
      .filter(Boolean).join(" ").toLocaleLowerCase("pt-BR");
    return haystack.includes(q);
  });
}

/** Tempo de referência em minutos: média publicada ou ponto médio da faixa. */
export function referenceMinutes(record) {
  const avg = Number(record?.avg);
  if (Number.isFinite(avg) && avg > 0) return avg;
  const min = Number(record?.min) || 0;
  const max = Number(record?.max) || 0;
  return min || max ? (min + max) / 2 : 0;
}

/** Preço de referência publicado (hoje só consertos possuem). */
export const standardPrice = record => Math.max(0, Number(record?.price_avg) || 0);
