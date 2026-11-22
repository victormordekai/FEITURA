// FEITURA · documento gerado: payload rastreável, CSV, JSON, HTML e revisão.
// Tudo acontece no navegador; nada é enviado a servidor (Gate 1).

import { DATA_VERSION } from "./catalog.js";
import { localDateTime, minSec } from "./format.js";
import { MODES } from "./pricing.js";
import { documentHtml } from "./document-template.js";

const SCHEMA = "FEITURA-GATE1-DOCUMENTO-1.4";
export const APP_VERSION = "GATE 1.9.0";

/** Chave da revisão em andamento: a página documento.html lê daqui (mesmo navegador, mesmo site). */
export const REVIEW_KEY = "feitura:revisao";

/** Assinatura curta (FNV-1a) do conteúdo econômico do documento. */
function fingerprint(items) {
  const source = JSON.stringify(items.map(i => [i.name, i.quantity, Math.round(i.materialUnitPrice * 100), Math.round(i.unitPrice * 100), Math.round(i.minutes * 100)]));
  let hash = 2166136261;
  for (let i = 0; i < source.length; i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36).toUpperCase().slice(-4).padStart(4, "0");
}

function trackingId(date, items, total) {
  const pad = n => String(n).padStart(2, "0");
  const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const count = String(items.length).padStart(4, "0").slice(-4);
  const value = String(Math.floor(Math.max(0, total))).padStart(4, "0").slice(-4);
  return `suafeitura${stamp}${count}${value}${fingerprint(items)}`;
}

/**
 * Monta o registro do documento a partir das linhas calculadas incluídas.
 * Em "contrato" o valor-hora de quem produz nunca entra no documento.
 */
export function buildPayload(state, rows, fields) {
  const now = new Date();
  const included = rows.filter(r => r.included);
  const producer = state.mode === "producer";
  const items = included.map(r => ({
    id: r.id,
    origin: r.origin,
    referenceId: r.refId || null,
    name: r.label,
    product: r.product,
    method: r.methodName,
    minutes: r.minutes,
    processes: r.processes,
    machines: r.machines,
    quantity: r.quantity,
    materialUnitPrice: r.materialUnit,
    unitPrice: r.unitPrice,
    calculatedUnitPrice: producer ? r.referencePrice : null,
    implicitHourly: producer ? null : r.hourlyImplied,
    basis: r.basis,
    materialTotal: r.materialTotal,
    operationalTotal: r.operationalTotal,
    total: r.total,
    observations: r.observation,
    methodVariables: r.variablesText,
    variables: r.variables
  }));
  const sum = key => items.reduce((acc, i) => acc + i[key], 0);
  const total = sum("total");

  return {
    schema: SCHEMA,
    appVersion: APP_VERSION,
    dataVersion: DATA_VERSION,
    trackingId: trackingId(now, items, total),
    generatedISO: now.toISOString(),
    generatedAt: state.generatedAt || localDateTime(now),
    mode: state.mode,
    documentType: MODES[state.mode].document,
    providerName: state.provider,
    from: fields.from,
    to: fields.to,
    deadlineFrom: fields.deadlineFrom,
    deadlineTo: fields.deadlineTo,
    pricingBasis: producer ? state.pricingBasis : "target",
    hourly: producer && state.pricingBasis === "hourly" ? state.hourly : null,
    include: { ...state.include },
    items,
    materialTotal: sum("materialTotal"),
    operationalTotal: sum("operationalTotal"),
    total,
    persistence: "local-download-only; ingestion endpoint pending Gate 2",
    // Estado completo para "SUBIR REGISTRO DE FEITURA": refaz a cotação como estava.
    restore: {
      mode: state.mode,
      hourly: state.hourly,
      pricingBasis: state.pricingBasis,
      provider: state.provider,
      include: { ...state.include },
      lines: [...state.lines.values()].map(line => ({ ...line }))
    }
  };
}

export function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const csvCell = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
const fixed = value => (Number(value) || 0).toFixed(2);

function toCsv(data) {
  const producer = data.mode === "producer";
  const lines = [
    [`FEITURA: ${data.documentType.toUpperCase()}`],
    ["RASTREABILIDADE", data.trackingId],
    ["GERADO EM", data.generatedAt],
    ["BASE TÉCNICA", data.dataVersion],
    [MODES[data.mode].byline.replace(":", ""), data.providerName || "SUA FEITURA"],
    ["DE", data.from],
    ["PARA", data.to],
    ...(producer ? [["REFERÊNCIA", data.pricingBasis === "hourly" ? "VALOR/HORA" : "VALOR PADRÃO"], ["VALOR/HORA", data.hourly ? fixed(data.hourly) : ""]] : []),
    [],
    ["ITEM", "PROCESSOS", "MQs.", "TEMPO MIN:SEG", "MAT. PRIMA UNIT.", MODES[data.mode].unitLabel, ...(producer ? [] : ["HORA IMPLÍCITA"]), "QUANTIDADE", "TOTAL"],
    ...data.items.map(i => [i.name, i.processes, i.machines, minSec(i.minutes), fixed(i.materialUnitPrice), fixed(i.unitPrice), ...(producer ? [] : [fixed(i.implicitHourly)]), i.quantity, fixed(i.total)]),
    [],
    ["MATÉRIA-PRIMA TOTAL", fixed(data.materialTotal)],
    ["VALOR OPERACIONAL TOTAL", fixed(data.operationalTotal)],
    ["TOTAL", fixed(data.total)]
  ];
  return "﻿" + lines.map(row => row.map(csvCell).join(";")).join("\n");
}

export function exportDocument(data, format) {
  if (format === "json") return download(`${data.trackingId}.json`, JSON.stringify(data, null, 2), "application/json;charset=utf-8");
  if (format === "html") return download(`suafeitura-${data.trackingId}.html`, documentHtml(data), "text/html;charset=utf-8");
  return download(`${data.trackingId}.csv`, toCsv(data), "text/csv;charset=utf-8");
}

/**
 * Abre a revisão em pages/documento.html (página real do site).
 * Antes, a revisão era um endereço blob: temporário, revogado em 60 s; no celular
 * a impressão recarrega a página e encontrava o endereço já apagado: folha em branco.
 */
export function openReview(data) {
  try {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(data));
  } catch {
    // Sem armazenamento local (modo privado restrito): entrega o documento para baixar.
    download(`suafeitura-${data.trackingId}.html`, documentHtml(data), "text/html;charset=utf-8");
    return;
  }
  const url = new URL("documento.html", window.location.href);
  url.hash = data.trackingId;
  const win = window.open(url.href, "_blank");
  if (!win) window.location.assign(url.href); // pop-up bloqueado: abre na mesma aba
}
