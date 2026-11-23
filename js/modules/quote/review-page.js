// FEITURA · página de revisão (pages/documento.html) · GATE 1.9.1.
// Um PDF é gerado após o consentimento e reutilizado por impressão e compartilhamento.
// O registro JSON permanece uma saída independente. Nenhum dado é enviado a servidor.

import { STYLE, documentBody } from "./document-template.js";
import { REVIEW_KEY, download } from "./document-export.js";
import { localDateTime } from "./format.js";

function readRecord() {
  try {
    const raw = localStorage.getItem(REVIEW_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const isHandheld = () =>
  matchMedia("(pointer:coarse)").matches ||
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  navigator.pdfViewerEnabled === false;

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
  const consent = $("consent");
  const printBtn = $("print");
  const shareBtn = $("share");
  const status = $("status");
  const say = message => { status.textContent = message; };

  // Cache da validação: uma Promise, um File e uma URL para toda a sessão.
  let validatedAt = null;
  let pdfPromise = null;
  let pdfFile = null;
  let pdfUrl = null;
  let validationRun = 0;

  const releasePdf = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    pdfUrl = null;
    pdfFile = null;
    pdfPromise = null;
    validatedAt = null;
  };

  const preparePdf = () => {
    if (!pdfPromise) {
      const run = validationRun;
      validatedAt = localDateTime(new Date());
      say("Preparando o PDF A4 do documento validado…");

      pdfPromise = import("./pdf-builder.js")
        .then(module => module.buildPdf(record, { validatedAt }))
        .then(file => {
          if (run !== validationRun || !consent.checked) {
            throw new Error("A validação foi cancelada antes da conclusão da geração.");
          }
          pdfFile = file;
          pdfUrl = URL.createObjectURL(file);
          say("PDF pronto. O mesmo arquivo será utilizado para imprimir ou compartilhar.");
          return file;
        })
        .catch(error => {
          if (run === validationRun) {
            pdfPromise = null;
            pdfFile = null;
            if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            pdfUrl = null;
            say(error?.message || "Não foi possível gerar o PDF. Tente novamente.");
          }
          throw error;
        });
    }
    return pdfPromise;
  };

  const setEnabled = enabled => {
    printBtn.disabled = shareBtn.disabled = !enabled;
  };

  consent.addEventListener("change", () => {
    validationRun++;
    if (!consent.checked) {
      releasePdf();
      setEnabled(false);
      say("Validação cancelada. Marque novamente para gerar o documento.");
      return;
    }
    setEnabled(true);
    preparePdf().catch(() => {});
  });

  printBtn.addEventListener("click", () => {
    if (!consent.checked) return;
    if (!pdfFile || !pdfUrl) {
      say("O PDF ainda está sendo preparado. Aguarde a confirmação e toque novamente.");
      return;
    }

    if (isHandheld()) {
      // A abertura ocorre diretamente no gesto do usuário; o leitor do aparelho assume o PDF.
      const opened = window.open(pdfUrl, "_blank");
      if (!opened) say("O navegador bloqueou a abertura. Permita pop-ups para visualizar e imprimir o PDF.");
      else say("PDF aberto no leitor do aparelho. Utilize a opção Imprimir do leitor.");
      return;
    }

    const previous = document.getElementById("feitura-pdf-print-frame");
    previous?.remove();
    const frame = document.createElement("iframe");
    frame.id = "feitura-pdf-print-frame";
    frame.title = "PDF FEITURA para impressão";
    frame.style.cssText = "position:fixed;width:1px;height:1px;right:0;bottom:0;border:0;opacity:0";
    frame.onload = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
        say("Janela de impressão aberta para o PDF validado.");
      } catch {
        window.open(pdfUrl, "_blank");
        say("PDF aberto em nova aba. Utilize a opção de impressão do leitor.");
      }
    };
    frame.src = pdfUrl;
    document.body.appendChild(frame);
  });

  shareBtn.addEventListener("click", async () => {
    if (!consent.checked) return;
    if (!pdfFile) {
      say("O PDF ainda está sendo preparado. Aguarde a confirmação e toque novamente.");
      return;
    }

    try {
      if (navigator.canShare?.({ files: [pdfFile] }) && navigator.share) {
        await navigator.share({
          files: [pdfFile],
          title: `FEITURA · ${record.documentType}`,
          text: `${record.documentType} FEITURA · ${record.trackingId}`
        });
        say("Documento compartilhado.");
      } else {
        download(pdfFile.name, pdfFile, "application/pdf");
        say("Este navegador não oferece compartilhamento de arquivos. O PDF foi baixado para envio.");
      }
    } catch (error) {
      if (error?.name === "AbortError") {
        say("Compartilhamento cancelado. O PDF permanece disponível nesta revisão.");
        return;
      }
      say(error?.message || "Não foi possível compartilhar o PDF. Tente novamente.");
    }
  });

  $("record").addEventListener("click", () => {
    download(`${record.trackingId}.json`, JSON.stringify(record, null, 2), "application/json;charset=utf-8");
    say("Registro JSON baixado. Use SUBIR REGISTRO DE FEITURA na cotação para reaproveitar estes dados.");
  });

  window.addEventListener("pagehide", releasePdf, { once: true });
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
