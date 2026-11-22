// FEITURA · SUBIR REGISTRO DE FEITURA.
// Lê um registro .json baixado antes e devolve a cotação como estava: perfil, empresa,
// valor-hora, opções do documento, linhas (serviços de rotina), DE / PARA, prazos e data.
// Tudo acontece no navegador; o arquivo não sai do aparelho.

const SCHEMA_PREFIX = "FEITURA-GATE1-DOCUMENTO-";

const LINE_DEFAULTS = {
  processes: 1, machines: 1, quantity: 1, materialUnit: 0, operationalOverride: null,
  targetUnit: 0, fixedUnitPrice: 0, standardPrice: 0, observation: "", variables: null,
  variablesText: "", included: true
};

const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
const text = v => (v == null ? "" : String(v));

export function readRecordFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error("Nenhum arquivo escolhido."));
    if (file.size > 2 * 1024 * 1024) return reject(new Error("Arquivo grande demais para um registro FEITURA."));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      let record;
      try { record = JSON.parse(reader.result); } catch { return reject(new Error("O arquivo não é um registro FEITURA válido (.json).")); }
      if (!record || typeof record !== "object" || !String(record.schema || "").startsWith(SCHEMA_PREFIX)) {
        return reject(new Error("Este .json não foi gerado pela FEITURA."));
      }
      resolve(record);
    };
    reader.readAsText(file, "utf-8");
  });
}

/** Linha do registro antigo (sem bloco "restore") → linha da cotação. */
function lineFromItem(item, mode) {
  const unit = num(item.unitPrice);
  return {
    ...LINE_DEFAULTS,
    id: text(item.id) || `import-${Math.random().toString(36).slice(2, 9)}`,
    origin: item.origin === "base" ? "base" : "configured",
    refId: item.referenceId || null,
    label: text(item.name),
    product: text(item.product || item.name),
    methodName: text(item.method || "REFERÊNCIA DIRETA"),
    minutes: num(item.minutes),
    processes: num(item.processes) || 1,
    machines: num(item.machines) || 1,
    quantity: num(item.quantity) || 1,
    materialUnit: num(item.materialUnitPrice),
    operationalOverride: mode === "producer" && unit > 0 ? unit : null,
    targetUnit: mode === "contractor" ? unit : 0,
    observation: text(item.observations),
    variables: item.variables || null,
    variablesText: text(item.methodVariables)
  };
}

/**
 * Aplica o registro ao estado. Devolve os campos de tela (DE, PARA, prazos, data)
 * para o controlador preencher.
 */
export function applyRecord(state, record) {
  const r = record.restore;
  const mode = (r?.mode || record.mode) === "contractor" ? "contractor" : "producer";
  state.mode = mode;
  state.provider = text(r ? r.provider : record.providerName).trim();
  state.hourly = Math.max(0, num(r ? r.hourly : record.hourly));
  state.pricingBasis = (r ? r.pricingBasis : record.pricingBasis) === "standard" ? "standard" : "hourly";
  state.include = { contact: true, priceTable: true, production: true, deadline: true, ...(r?.include || record.include || {}) };

  state.lines.clear();
  state.activeLineId = "";
  const lines = Array.isArray(r?.lines) ? r.lines.map(l => ({ ...LINE_DEFAULTS, ...l })) : (record.items || []).map(i => lineFromItem(i, mode));
  lines.forEach(line => { if (line.id) state.lines.set(line.id, line); });

  // A data da FEITURA importada é mantida até a pessoa pedir a data de hoje.
  state.generatedAt = text(record.generatedAt);
  state.keepDate = Boolean(state.generatedAt);

  return {
    from: text(record.from),
    to: text(record.to),
    deadlineFrom: text(record.deadlineFrom),
    deadlineTo: text(record.deadlineTo),
    lines: state.lines.size
  };
}
