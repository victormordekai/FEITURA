// FEITURA · gerador único do PDF do documento (GATE 1.9.1).
// PDF A4 vetorial: texto e tabelas reais, sem captura de tela.
// O mesmo File é reutilizado para impressão e compartilhamento. Execução local.

import { duration, minSec, money, number } from "./format.js";
import { MODES } from "./pricing.js";

const LIBS = [
  "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
  "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"
];

const LOGO_FONT = "Feitura Display Prototype";
const LOGO_URL = "https://victormordekai.github.io/FEITURA/assets/fonts/feitura-fonte.otf";
const C = {
  olive: [57, 67, 55], ink: [23, 23, 19], deep: [37, 45, 37],
  muted: [113, 111, 102], line: [207, 201, 188],
  sand: [238, 233, 223], paper: [251, 250, 246], white: [255, 255, 255]
};
const PAGE = { w: 210, h: 297, margin: 14, top: 14, bottom: 18 };
const CONTENT_W = PAGE.w - PAGE.margin * 2;

let libsPromise = null;

function loadLibs() {
  if (window.jspdf?.jsPDF?.API?.autoTable) return Promise.resolve();
  if (!libsPromise) {
    libsPromise = LIBS.reduce((chain, src) => chain.then(() => new Promise((resolve, reject) => {
      const existing = [...document.scripts].find(s => s.src === src);
      if (existing?.dataset.loaded === "true") {
        if (window.jspdf?.jsPDF?.API?.autoTable) return resolve();
        existing.remove();
      } else if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Não foi possível carregar o gerador de PDF.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => { script.dataset.loaded = "true"; resolve(); };
      script.onerror = () => reject(new Error("Não foi possível carregar o gerador de PDF. Confira a conexão e tente novamente."));
      document.head.appendChild(script);
    })), Promise.resolve()).catch(error => {
      libsPromise = null;
      throw error;
    });
  }
  return libsPromise;
}

// Normaliza caracteres incompatíveis com as fontes-padrão incorporadas ao jsPDF.
const text = value => String(value ?? "")
  .replace(/[  ]/g, " ")
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/[–—]/g, "-").replace(/…/g, "...")
  .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");

const upper = value => text(value).toLocaleUpperCase("pt-BR");
const dateBR = value => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : text(value);
};

async function logoImage() {
  try {
    if (![...document.fonts].some(font => font.family.replace(/"/g, "") === LOGO_FONT)) {
      const face = new FontFace(LOGO_FONT, `url("${LOGO_URL}") format("opentype")`);
      document.fonts.add(await face.load());
    }
    await document.fonts.load(`400 160px "${LOGO_FONT}"`);
    if (!document.fonts.check(`400 160px "${LOGO_FONT}"`)) return null;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.font = `400 160px "${LOGO_FONT}"`;
    const metrics = ctx.measureText("FEITURA");
    const ascent = Math.ceil(metrics.actualBoundingBoxAscent || 120);
    const descent = Math.ceil(metrics.actualBoundingBoxDescent || 0);
    canvas.width = Math.ceil(metrics.width) + 12;
    canvas.height = ascent + descent + 12;
    ctx.font = `400 160px "${LOGO_FONT}"`;
    ctx.fillStyle = "rgb(57,67,55)";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("FEITURA", 6, ascent + 4);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function drawBrand(doc, logo) {
  if (logo) {
    doc.addImage(logo, "PNG", PAGE.margin, 10, 43, 10);
  } else {
    doc.setFont("times", "normal");
    doc.setFontSize(25);
    doc.setTextColor(...C.olive);
    doc.text("FEITURA", PAGE.margin, 20);
  }
  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.muted);
  doc.text("PRODUÇÃO · PESSOAS · POSSIBILIDADES", PAGE.w - PAGE.margin, 15, { align: "right" });
  doc.text("ECOSSISTEMA RETEAR | BY VICTOR MORDEKAI", PAGE.w - PAGE.margin, 19, { align: "right" });
  doc.setDrawColor(...C.olive);
  doc.setLineWidth(1.1);
  doc.line(PAGE.margin, 25, PAGE.w - PAGE.margin, 25);
}

function drawFooter(doc, record, page, totalPages) {
  const y = PAGE.h - 11;
  doc.setDrawColor(...C.olive);
  doc.setLineWidth(0.45);
  doc.line(PAGE.margin, y - 4, PAGE.w - PAGE.margin, y - 4);
  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...C.deep);
  doc.text(`FEITURA · ${text(record.trackingId)}`, PAGE.margin, y);
  doc.text(`VALIDADO EM ${text(record.validatedAt || "")}`, PAGE.w / 2, y, { align: "center" });
  doc.text(`PÁGINA ${page}/${totalPages}`, PAGE.w - PAGE.margin, y, { align: "right" });
}

function drawSectionLabel(doc, label, x, y) {
  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...C.olive);
  doc.text(upper(label), x, y);
}

function drawMeta(doc, record, y) {
  const gap = 3;
  const widths = [(CONTENT_W - gap * 2) / 3, (CONTENT_W - gap * 2) / 3, (CONTENT_W - gap * 2) / 3];
  const labels = ["DE", "PARA", "DATA DA FEITURA"];
  const values = [record.from || "—", record.to || "—", dateBR(record.generatedAt)];
  let x = PAGE.margin;
  for (let i = 0; i < 3; i++) {
    doc.setFillColor(...C.paper);
    doc.setDrawColor(...C.line);
    doc.roundedRect(x, y, widths[i], 17, 1, 1, "FD");
    drawSectionLabel(doc, labels[i], x + 3, y + 5);
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...C.ink);
    const value = doc.splitTextToSize(text(values[i]), widths[i] - 6);
    doc.text(value.slice(0, 2), x + 3, y + 11);
    x += widths[i] + gap;
  }
  return y + 21;
}

function drawOptionalBlocks(doc, record, y) {
  const include = record.include || {};
  const blocks = [];
  if (include.contact) blocks.push(["DADOS DE CONTATO E ENDEREÇO", ""]);
  if (include.production) blocks.push(["SOLICITAÇÃO DE PRODUÇÃO", ""]);
  if (include.deadline) blocks.push(["PRAZO VIGENTE", `${dateBR(record.deadlineFrom) || "____/____/________"} A ${dateBR(record.deadlineTo) || "____/____/________"}`]);

  for (const [label, value] of blocks) {
    if (y > PAGE.h - PAGE.bottom - 22) {
      doc.addPage();
      y = 36;
    }
    const h = value ? 15 : 18;
    doc.setDrawColor(...C.line);
    doc.setFillColor(...C.paper);
    doc.roundedRect(PAGE.margin, y, CONTENT_W, h, 1, 1, "FD");
    drawSectionLabel(doc, label, PAGE.margin + 3, y + 5);
    if (value) {
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...C.ink);
      doc.text(text(value), PAGE.margin + 3, y + 11);
    } else {
      doc.setDrawColor(...C.muted);
      doc.line(PAGE.margin + 3, y + h - 4, PAGE.w - PAGE.margin - 3, y + h - 4);
    }
    y += h + 3;
  }
  return y;
}

function itemCells(item, producer) {
  const notes = [
    item.observations ? `OBS.: ${item.observations}` : "",
    item.methodVariables ? `VAR.: ${String(item.methodVariables).replace(/\n/g, " · ")}` : ""
  ].filter(Boolean).join("\n");
  const itemName = [text(item.name), text(item.basis), notes].filter(Boolean).join("\n");
  const unit = money(item.unitPrice) + (!producer && Number(item.implicitHourly) > 0 ? `\n${money(item.implicitHourly)}/H IMPLÍCITA` : "");
  return [
    itemName, text(item.processes), text(item.machines), minSec(item.minutes),
    money(item.materialUnitPrice), unit, number(item.quantity), money(item.total)
  ];
}

function drawSummary(doc, record, y) {
  const values = [
    ["ITENS", String(record.items?.length || 0)],
    ["TEMPO TOTAL", duration((record.items || []).reduce((sum, item) => sum + (Number(item.minutes) || 0) * 60 * (Number(item.quantity) || 0), 0))],
    ["MATÉRIA-PRIMA", money(record.materialTotal)],
    ["VALOR OPERACIONAL", money(record.operationalTotal)],
    ["TOTAL", money(record.total)]
  ];
  const gap = 0;
  const w = CONTENT_W / values.length;
  const h = 20;
  if (y + h > PAGE.h - PAGE.bottom - 4) {
    doc.addPage();
    y = 36;
  }
  values.forEach(([label, value], index) => {
    const x = PAGE.margin + index * w;
    doc.setFillColor(...(index === 4 ? C.olive : C.paper));
    doc.setDrawColor(...C.line);
    doc.rect(x, y, w, h, "FD");
    doc.setFont("courier", "bold");
    doc.setFontSize(5.8);
    doc.setTextColor(...(index === 4 ? C.white : C.olive));
    doc.text(label, x + 2, y + 5);
    doc.setFont("times", "normal");
    doc.setFontSize(index === 4 ? 10 : 8.5);
    doc.setTextColor(...(index === 4 ? C.white : C.ink));
    doc.text(text(value), x + 2, y + 13);
  });
  return y + h + 7;
}

function drawTrace(doc, record, y) {
  const trace = [
    `RASTREABILIDADE: ${record.trackingId}`,
    `GERADO LOCALMENTE: ${record.generatedAt}`,
    `VALIDADO EM: ${record.validatedAt || "—"}`,
    `ESQUEMA: ${record.schema} · BASE TÉCNICA: ${record.dataVersion} · APLICATIVO: ${record.appVersion || "GATE 1.9.1"}`
  ].map(text);
  const lines = trace.flatMap(line => doc.splitTextToSize(line, CONTENT_W - 8));
  const h = Math.max(18, lines.length * 3.4 + 7);
  if (y + h > PAGE.h - PAGE.bottom - 3) {
    doc.addPage();
    y = 36;
  }
  doc.setFillColor(...C.sand);
  doc.roundedRect(PAGE.margin, y, CONTENT_W, h, 1, 1, "F");
  doc.setFont("courier", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...C.deep);
  doc.text(lines, PAGE.margin + 4, y + 6);
}

export async function buildPdf(record, { validatedAt } = {}) {
  if (!record?.trackingId) throw new Error("Documento sem identificador de rastreabilidade.");
  await loadLibs();

  const JsPDF = window.jspdf.jsPDF;
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  const logo = await logoImage();
  const producer = record.mode === "producer";
  const mode = MODES[record.mode] || MODES.producer;
  const validatedRecord = { ...record, validatedAt: validatedAt || record.validatedAt || "" };

  doc.setProperties({
    title: `FEITURA · ${record.documentType || mode.document}`,
    subject: `Documento ${record.trackingId}`,
    author: "FEITURA | RETEAR",
    creator: "FEITURA GATE 1.9.1"
  });

  drawBrand(doc, logo);
  let y = 34;

  doc.setFont("courier", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...C.olive);
  doc.text("DOCUMENTO VALIDADO", PAGE.margin, y);
  y += 8;

  doc.setFont("times", "normal");
  doc.setFontSize(19);
  doc.setTextColor(...C.ink);
  doc.text(text(mode.document), PAGE.margin, y);
  y += 7;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...C.muted);
  doc.text(upper(mode.byline), PAGE.w - PAGE.margin, y - 7, { align: "right" });
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...C.ink);
  doc.text(doc.splitTextToSize(text(record.providerName || "SUA FEITURA"), 65), PAGE.w - PAGE.margin, y, { align: "right" });
  y += 5;

  y = drawMeta(doc, record, y);
  y = drawOptionalBlocks(doc, record, y);

  if (record.include?.priceTable !== false) {
    doc.setFont("courier", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...C.olive);
    doc.text("TABELA DE CUSTOS", PAGE.margin, y + 2);
    y += 5;

    const head = [[
      "ITEM / SERVIÇO", "PROCESSOS", "MQs.", "TEMPO",
      "MAT. PRIMA\nUNIT.", mode.unitLabel.replace(" UNIT.", "\nUNIT."),
      "QTD.", "TOTAL"
    ]];
    const body = (record.items || []).map(item => itemCells(item, producer));
    if (!body.length) body.push(["NENHUM ITEM COTADO.", "", "", "", "", "", "", ""]);

    doc.autoTable({
      startY: y,
      head,
      body,
      theme: "grid",
      margin: { left: PAGE.margin, right: PAGE.margin, top: 31, bottom: PAGE.bottom },
      showHead: "everyPage",
      rowPageBreak: "avoid",
      styles: {
        font: "courier", fontSize: 6.2, cellPadding: 2.1,
        textColor: C.ink, lineColor: C.line, lineWidth: 0.15,
        overflow: "linebreak", valign: "top"
      },
      headStyles: {
        fillColor: C.olive, textColor: C.paper, fontStyle: "bold",
        fontSize: 5.8, cellPadding: 2, valign: "middle"
      },
      columnStyles: {
        0: { cellWidth: 49 }, 1: { cellWidth: 17 }, 2: { cellWidth: 12 },
        3: { cellWidth: 15 }, 4: { cellWidth: 23 }, 5: { cellWidth: 26 },
        6: { cellWidth: 13, halign: "right" }, 7: { cellWidth: 27, halign: "right" }
      },
      didParseCell: data => {
        if (data.section === "body" && data.column.index === 0) {
          data.cell.styles.fontStyle = "bold";
        }
      }
    });
    y = doc.lastAutoTable.finalY + 5;
    y = drawSummary(doc, record, y);
  }

  drawTrace(doc, validatedRecord, y);

  const totalPages = doc.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    drawBrand(doc, logo);
    drawFooter(doc, validatedRecord, page, totalPages);
  }

  const blob = doc.output("blob");
  const filename = `suafeitura-${record.trackingId}.pdf`;
  return new File([blob], filename, { type: "application/pdf", lastModified: Date.now() });
}
