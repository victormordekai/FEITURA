// FEITURA · documento autocontido (revisão transitória e HTML exportado).
// Precisa funcionar fora do site, por isso o CSS segue embutido no arquivo gerado.

import { duration, esc, minSec, money, number } from "./format.js";
import { MODES } from "./pricing.js";

const STYLE = `
@page{size:A4;margin:18mm 14mm 20mm}
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{font-family:"DM Sans",Arial,sans-serif;color:#171713;background:#eee9df;font-size:11px;line-height:1.45}
.paper{max-width:900px;margin:24px auto;background:#fbfaf6;padding:34px 38px 54px;box-shadow:0 10px 40px rgba(23,23,19,.08)}
header{border-bottom:4px solid #394337;padding-bottom:18px;margin-bottom:26px;color:#252d25}
header h1{margin:0;font:700 30px/1 "DM Sans",Arial,sans-serif;letter-spacing:-.04em}
header h2{margin:8px 0 0;font:600 12px/1.35 "DM Mono",monospace;letter-spacing:.08em;text-transform:uppercase}
header h3{margin:6px 0 0;font:500 10px "DM Mono",monospace;letter-spacing:.06em;text-transform:uppercase}
.review-title{display:flex;justify-content:space-between;gap:24px;align-items:flex-end}
.review-provider{display:flex;flex-direction:column;align-items:flex-end;text-align:right}
.review-provider span{font:600 8px "DM Mono",monospace;letter-spacing:.08em;color:#716f66}
.review-provider strong{margin-top:6px;font:500 10px "DM Mono",monospace;text-transform:uppercase;overflow-wrap:anywhere}
main h2{margin:0 0 4px;font:400 25px/1.15 Georgia,serif;color:#171713}
.eyebrow{font:600 9px "DM Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#394337}
.meta{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #cfc9bc;margin:18px 0 22px}
.meta div{padding:13px;border-right:1px solid #cfc9bc;min-height:68px}
.meta div:last-child{border-right:0}
.meta span,.field-block h3{display:block;font:600 8px "DM Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:#394337}
.meta strong{display:block;margin-top:8px;font:500 10px "DM Mono",monospace;text-transform:uppercase;word-break:break-word}
.field-block{margin:14px 0;padding:12px 14px;border:1px solid #d7d1c6}
.field-block h3{margin:0 0 7px}
.blank-line{font:500 10px "DM Mono",monospace}
.blank-area{height:32px;border-bottom:1px solid #888}
.table-wrap{margin-top:22px}
.table-title{font:600 9px "DM Mono",monospace;letter-spacing:.08em;color:#394337;margin-bottom:8px}
table{width:100%;border-collapse:collapse;border:1px solid #bfc0ba;table-layout:fixed}
thead{display:table-header-group}
th{background:#394337;color:#fbfaf6;text-align:left;font:600 8px "DM Mono",monospace;letter-spacing:.05em;padding:8px;text-transform:uppercase}
td{padding:9px 8px;border-top:1px solid #d2d0c8;vertical-align:top;font:500 9px "DM Mono",monospace;word-break:break-word}
td strong{display:block;font:700 10px Georgia,serif;color:#171713}
td small{display:block;margin-top:3px;font:500 7px "DM Mono",monospace;color:#716f66}
.summary{display:grid;grid-template-columns:repeat(5,1fr);border:1px solid #cfc9bc;border-top:0}
.summary div{padding:13px;border-right:1px solid #cfc9bc}
.summary div:last-child{border-right:0}
.summary span{display:block;font:600 8px "DM Mono",monospace;color:#394337}
.summary strong{display:block;margin-top:4px;font:400 18px Georgia,serif}
.trace{margin-top:18px;padding:10px 12px;background:#eee9df;color:#252d25;font:500 8px "DM Mono",monospace;word-break:break-all}
.validation{margin-top:28px;padding:18px;border:1px solid #394337;background:#eee9df;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.validation label{display:flex;gap:10px;align-items:flex-start;flex:1 1 58%;min-width:280px;font:500 9px/1.5 "DM Sans",Arial,sans-serif;color:#252d25}
.validation input{margin-top:2px;accent-color:#394337}
.validation button{border:0;background:#252d25;color:#fbfaf6;padding:11px 15px;font:600 9px "DM Mono",monospace;letter-spacing:.05em;cursor:pointer}
.validation button:disabled{opacity:.35;cursor:not-allowed}
.validation .secondary{background:transparent;color:#252d25;border:1px solid #252d25}
footer{margin-top:28px;padding-top:12px;border-top:2px solid #394337;color:#252d25;font:500 8px/1.5 "DM Mono",monospace;display:flex;justify-content:space-between;gap:20px}
footer a{color:inherit}
@media(max-width:700px){
  body{background:#fbfaf6}.paper{margin:0;padding:22px}
  .review-title{align-items:flex-start;flex-direction:column}.review-provider{align-items:flex-start;text-align:left}
  .meta{grid-template-columns:1fr}.meta div{border-right:0;border-bottom:1px solid #cfc9bc}.meta div:last-child{border-bottom:0}
  .summary{grid-template-columns:1fr 1fr}.summary div{border-right:0;border-bottom:1px solid #cfc9bc}.summary div:nth-child(2n){border-left:1px solid #cfc9bc}.summary div:last-child{grid-column:1/-1}
  footer{display:block}.validation button{width:100%}
}
@media print{
  body{background:#fff}.paper{max-width:none;margin:0;padding:0;box-shadow:none}
  .validation{display:none!important}
  footer{position:fixed;left:0;right:0;bottom:0;margin:0;padding:7px 0 0;border-top:1.5px solid #394337;background:#fff;font-size:7px}
  .trace,.field-block,tr{break-inside:avoid}
  a{color:#252d25;text-decoration:none}
}`;

const BLANK = "________________________________";

function itemRow(i, producer) {
  const notes = [
    i.observations ? `<small>OBS.: ${esc(i.observations)}</small>` : "",
    i.methodVariables ? `<small>VAR.: ${esc(i.methodVariables).replace(/\n/g, " · ")}</small>` : ""
  ].join("");
  const unitNote = !producer && i.implicitHourly > 0 ? `<small>${money(i.implicitHourly)}/H IMPLÍCITA</small>` : "";
  return `<tr>
    <td><strong>${esc(i.name)}</strong><small>${esc(i.basis)}</small>${notes}</td>
    <td>${esc(i.processes)}</td><td>${esc(i.machines)}</td><td>${minSec(i.minutes)}</td>
    <td>${money(i.materialUnitPrice)}</td><td>${money(i.unitPrice)}${unitNote}</td>
    <td>${number(i.quantity)}</td><td>${money(i.total)}</td>
  </tr>`;
}

function priceTable(data) {
  const producer = data.mode === "producer";
  const seconds = data.items.reduce((s, i) => s + i.minutes * 60 * i.quantity, 0);
  const rows = data.items.map(i => itemRow(i, producer)).join("") || '<tr><td colspan="8">NENHUM ITEM COTADO.</td></tr>';
  const widths = [24, 8, 8, 10, 11, 11, 9, 13];
  const heads = ["ITEM / SERVIÇO", "PROCESSOS", "MQs.", "TEMPO", "MAT. PRIMA<br>UNIT.", MODES[data.mode].unitLabel.replace(" UNIT.", "<br>UNIT."), "QTD.", "TOTAL"];
  return `<div class="table-wrap">
    <div class="table-title">TABELA DE CUSTOS</div>
    <table><thead><tr>${heads.map((h, n) => `<th style="width:${widths[n]}%">${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
    <div class="summary">
      <div><span>ITENS</span><strong>${data.items.length}</strong></div>
      <div><span>TEMPO TOTAL</span><strong>${duration(seconds)}</strong></div>
      <div><span>MATÉRIA-PRIMA</span><strong>${money(data.materialTotal)}</strong></div>
      <div><span>VALOR OPERACIONAL</span><strong>${money(data.operationalTotal)}</strong></div>
      <div><span>TOTAL</span><strong>${money(data.total)}</strong></div>
    </div>
  </div>`;
}

function optionalBlocks(data) {
  const o = data.include || {};
  return [
    o.contact ? `<section class="field-block"><h3>DADOS DE CONTATO E ENDEREÇO</h3><div class="blank-line">______________________________________________</div></section>` : "",
    o.production ? `<section class="field-block"><h3>SOLICITAÇÃO DE PRODUÇÃO</h3><div class="blank-area">&nbsp;</div></section>` : "",
    o.deadline ? `<section class="field-block"><h3>PRAZO VIGENTE</h3><p>${esc(data.deadlineFrom || "____/____/________")} A ${esc(data.deadlineTo || "____/____/________")}</p></section>` : "",
    o.priceTable ? priceTable(data) : ""
  ].join("");
}

const VALIDATION = `<div class="validation">
  <label><input id="consent" type="checkbox"><span>Declaro que compreendo que os dados utilizados nesta revisão são tratados como dados públicos ou informações fornecidas para a composição do documento. Concordo com o manuseio necessário à geração e impressão deste documento, observados os princípios aplicáveis da LGPD.</span></label>
  <button id="print" type="button" disabled>VALIDAR E IMPRIMIR</button>
  <button id="record" class="secondary" type="button">BAIXAR REGISTRO</button>
</div>`;

// Script mínimo da revisão: libera a impressão após o consentimento e baixa o registro JSON.
const REVIEW_SCRIPT = `
const consent=document.getElementById("consent"),print=document.getElementById("print");
consent.addEventListener("change",()=>{print.disabled=!consent.checked;});
function record(){
  const url=URL.createObjectURL(new Blob([JSON.stringify(RECORD,null,2)],{type:"application/json;charset=utf-8"}));
  const a=Object.assign(document.createElement("a"),{href:url,download:RECORD.trackingId+".json"});
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
document.getElementById("record").addEventListener("click",record);
print.addEventListener("click",()=>{record();window.print();});`;

/** JSON seguro dentro de <script>: impede que um texto digitado feche a tag. */
const scriptJson = value => JSON.stringify(value).replace(/</g, "\\u003c");

export function documentHtml(data, { review }) {
  const mode = MODES[data.mode];
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>sua FEITURA | ${esc(data.trackingId)}</title><style>${STYLE}</style></head><body><div class="paper">
<header><h1>FEITURA<sup>®</sup></h1><h2>produção · pessoas · possibilidades</h2><h3>Ecossistema RETEAR® | By Victor Mordekai</h3></header>
<main>
  <div class="review-title">
    <div><div class="eyebrow">${review ? "05 / revisão final · documento não editável" : "documento exportado"}</div><h2>${esc(mode.document)}</h2></div>
    <div class="review-provider"><span>${mode.byline}</span><strong>${esc(data.providerName) || "SUA FEITURA"}</strong></div>
  </div>
  <div class="meta">
    <div><span>DE</span><strong>${esc(data.from) || BLANK}</strong></div>
    <div><span>PARA</span><strong>${esc(data.to) || BLANK}</strong></div>
    <div><span>DATA DA FEITURA</span><strong>${esc(data.generatedAt)}</strong></div>
  </div>
  ${optionalBlocks(data)}
  <div class="trace"><strong>RASTREABILIDADE:</strong> ${esc(data.trackingId)}<br>GERADO LOCALMENTE · ${esc(data.generatedAt)} · ${esc(data.schema)} · BASE TÉCNICA ${esc(data.dataVersion)}</div>
  ${review ? VALIDATION : ""}
</main>
<footer><span><strong>RETEAR® ©</strong> · <a href="https://victormordekai.github.io/FEITURA/">FEITURA®</a> · <a href="https://www.linkedin.com/in/victormordekai/">LinkedIn / Victor Mordekai</a></span><span>${esc(data.trackingId)}</span></footer>
</div>${review ? `<script>const RECORD=${scriptJson(data)};${REVIEW_SCRIPT}</script>` : ""}</body></html>`;
}
