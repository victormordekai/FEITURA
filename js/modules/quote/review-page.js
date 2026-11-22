// FEITURA · página de revisão (pages/documento.html).
// Lê o documento que cotar.html guardou no navegador, mostra a versão não editável e
// libera, após o consentimento: imprimir, compartilhar PDF e baixar o registro (.json).
// Nada é enviado a servidor: o PDF é montado no próprio aparelho.

import { STYLE, documentBody } from "./document-template.js";
import { REVIEW_KEY, download } from "./document-export.js";

// Biblioteca carregada só quando o PDF é pedido (gera o PDF localmente, no aparelho).
const PDF_LIB = "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

function readRecord() {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (window.html2pdf) return resolve();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Não foi possível carregar o gerador de PDF."));
    document.head.appendChild(s);
  });
}

/** Gera o PDF do papel (sem a área de validação) e devolve um File. */
async function buildPdf(record) {
  await loadScript(PDF_LIB);
  if (document.fonts?.ready) await document.fonts.ready;
  const paper = document.querySelector(".paper").cloneNode(true);
  paper.querySelector(".validation")?.remove();
  paper.style.cssText = "margin:0;box-shadow:none;max-width:none;width:794px;padding:34px 38px 40px";
  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fbfaf6";
  holder.appendChild(paper);
  document.body.appendChild(holder);
  try {
    const blob = await window.html2pdf().set({
      margin: [8, 6, 10, 6],
      image: { type: "jpeg", quality: 0.96 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fbfaf6", windowWidth: 794 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"], avoid: ["tr", ".field-block", ".trace", ".summary"] }
    }).from(paper).outputPdf("blob");
    return new File([blob], `suafeitura-${record.trackingId}.pdf`, { type: "application/pdf" });
  } finally {
    holder.remove();
  }
}

function init() {
  const style = document.createElement("style");
  style.textContent = STYLE + "@media print{.ffh{display:none!important}}";
  document.head.appendChild(style);

  const root = document.getElementById("documento");
  const record = readRecord();
  if (!record || !record.trackingId) {
    root.innerHTML = `<div class="empty"><p>Nenhum documento em revisão neste navegador.</p><p><a href="cotar.html">Voltar para a cotação FEITURA</a></p></div>`;
    return;
  }

  document.title = `sua FEITURA | ${record.trackingId}`;
  root.innerHTML = documentBody(record, { review: true });

  const $ = id => document.getElementById(id);
  const consent = $("consent"), printBtn = $("print"), shareBtn = $("share"), status = $("status");
  const say = text => { status.textContent = text; };

  let pdfPromise = null;   // PDF preparado em segundo plano após o consentimento
  let pdfFile = null;

  const preparePdf = () => {
    if (!pdfPromise) {
      pdfPromise = buildPdf(record)
        .then(file => { pdfFile = file; return file; })
        .catch(err => { pdfPromise = null; throw err; });
    }
    return pdfPromise;
  };

  consent.addEventListener("change", () => {
    printBtn.disabled = shareBtn.disabled = !consent.checked;
    if (consent.checked) preparePdf().catch(() => {});
  });

  // Imprimir: a página é um endereço real, então a impressão do celular encontra o conteúdo.
  printBtn.addEventListener("click", () => window.print());

  $("record").addEventListener("click", () => {
    download(`${record.trackingId}.json`, JSON.stringify(record, null, 2), "application/json;charset=utf-8");
    say("Registro baixado. Use SUBIR REGISTRO DE FEITURA na cotação para reaproveitar estes dados.");
  });

  shareBtn.addEventListener("click", async () => {
    try {
      let file = pdfFile;
      if (!file) {
        say("Preparando o PDF…");
        file = await preparePdf();
        // O compartilhamento exige um toque recente; se o PDF demorou, pede um novo toque.
        if (navigator.canShare?.({ files: [file] })) {
          shareBtn.textContent = "PDF PRONTO · TOQUE PARA COMPARTILHAR";
          say("PDF pronto.");
          return;
        }
      }
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `FEITURA · ${record.documentType}`, text: `${record.documentType} FEITURA · ${record.trackingId}` });
        say("Documento compartilhado.");
      } else {
        download(file.name, file, "application/pdf");
        say("Este navegador não abre a lista de aplicativos; o PDF foi baixado para você enviar.");
      }
      shareBtn.textContent = "COMPARTILHAR PDF AGORA";
    } catch (err) {
      if (err?.name === "AbortError") { say(""); return; }
      say(err?.message || "Não foi possível gerar o PDF agora. Use VALIDAR E IMPRIMIR e salve como PDF.");
    }
  });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
