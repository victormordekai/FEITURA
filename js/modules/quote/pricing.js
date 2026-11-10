// FEITURA · regras de cálculo. Puras: sem DOM, sem estado global.
//
// Produzo (orçamento):  valor unitário = tempo (min) ÷ 60 × valor-hora   — ou ajuste manual
// Contrato (romaneio):  hora implícita = preço-alvo ÷ (tempo (min) ÷ 60)
// Ambos:                total = (matéria-prima unit. + valor unit.) × quantidade

import { ceilMoney } from "./format.js";

export const MODES = {
  producer:   { document: "Orçamento",            unitLabel: "OPERAÇÃO UNIT.",   byline: "POR:" },
  contractor: { document: "Romaneio de produção", unitLabel: "PREÇO-ALVO UNIT.", byline: "SOLICITANTE:" }
};

export const hourlyPrice = (minutes, hourly) =>
  hourly > 0 && minutes > 0 ? ceilMoney((minutes / 60) * hourly) : 0;

export const implicitHourly = (unitPrice, minutes) =>
  unitPrice > 0 && minutes > 0 ? unitPrice / (minutes / 60) : 0;

/** Valor de referência calculado para quem produz, com a origem do número. */
function producerReference(line, ctx) {
  if (line.fixedUnitPrice > 0) return { value: ceilMoney(line.fixedUnitPrice), basis: "MÉTODO · TARIFA" };
  if (ctx.pricingBasis === "standard" && line.origin === "base") {
    return line.standardPrice > 0
      ? { value: ceilMoney(line.standardPrice), basis: "VALOR PADRÃO" }
      : { value: 0, basis: "SEM VALOR PADRÃO" };
  }
  const value = hourlyPrice(line.minutes, ctx.hourly);
  return value > 0 ? { value, basis: "VALOR/HORA · CALCULADO" } : { value: 0, basis: "SEM VALOR/HORA" };
}

/** Linha do estado → linha calculada para exibição e exportação. */
export function computeLine(line, ctx) {
  let unitPrice, reference, basis, hourlyImplied = 0;

  if (ctx.mode === "contractor") {
    unitPrice = line.targetUnit;
    reference = 0;
    basis = unitPrice > 0 ? "PREÇO-ALVO" : "SEM PREÇO-ALVO";
    hourlyImplied = implicitHourly(unitPrice, line.minutes);
  } else {
    const ref = producerReference(line, ctx);
    reference = ref.value;
    const adjusted = line.operationalOverride !== null && line.operationalOverride !== undefined;
    unitPrice = adjusted ? line.operationalOverride : ref.value;
    basis = adjusted ? "VALOR · AJUSTADO" : ref.basis;
  }

  const quantity = line.quantity;
  const materialTotal = line.materialUnit * quantity;
  const operationalTotal = unitPrice * quantity;
  return {
    ...line,
    unitPrice,
    referencePrice: reference,
    hourlyImplied,
    basis,
    materialTotal,
    operationalTotal,
    total: materialTotal + operationalTotal
  };
}

export function computeTotals(rows) {
  const included = rows.filter(r => r.included);
  const sum = key => included.reduce((acc, r) => acc + r[key], 0);
  return {
    count: included.length,
    pieces: sum("quantity"),
    seconds: included.reduce((acc, r) => acc + r.minutes * 60 * r.quantity, 0),
    material: sum("materialTotal"),
    operational: sum("operationalTotal"),
    total: sum("total")
  };
}

/**
 * FEITURA(x) = a·x + b — resolve a incógnita escolhida.
 * Devolve { value, expression } ou null quando faltam componentes.
 */
export function solveLinear(unknown, { x, a, b, f }) {
  switch (unknown) {
    case "F": return x > 0 && (a > 0 || b > 0) ? { value: a * x + b } : null;
    case "x": return a > 0 && f >= b ? { value: (f - b) / a } : null;
    case "a": return x > 0 && f >= b ? { value: (f - b) / x } : null;
    case "b": return x > 0 && f >= a * x ? { value: f - a * x } : null;
    default:  return null;
  }
}
