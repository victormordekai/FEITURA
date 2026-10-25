import { glossaryData } from "./glossary-data.js";

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const number = value => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value) || 0);
const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[char]));
const upper = value => String(value ?? "").toLocaleUpperCase("pt-BR");

const records = () => [
  ...glossaryData.models.map(item => ({ ...item, key:`model:${item.name}`, label:item.name, group:"models", groupLabel:"Artigos e modelos", category:item.material_family || "Artigo", quoteable:true })),
  ...glossaryData.operations.map(item => ({ ...item, key:`operation:${item.id}`, label:item.name, group:"operations", groupLabel:"Operações", category:item.category || "Operação", quoteable:true })),
  ...glossaryData.repairs.filter(item => item.active !== false).map(item => ({ ...item, key:`repair:${item.id}`, label:item.name, group:"repairs", groupLabel:"Consertos e serviços", category:"Conserto", quoteable:true })),
  ...glossaryData.methods.map((item,index) => ({ ...item, key:`method:${index}`, label:item.term, group:"methods", groupLabel:"Método de cronoanálise", category:"Método", quoteable:false })),
  ...glossaryData.sources.map((item,index) => ({ ...item, key:`source:${index}`, label:item.name, group:"sources", groupLabel:"Fontes e referências", category:item.type || "Fonte", quoteable:false }))
];

const quoteableRecords = () => records().filter(item => item.quoteable);
const minutesFor = item => {
  const avg = Number(item.avg);
  if (Number.isFinite(avg) && avg > 0) return avg;
  const min = Number(item.min) || 0;
  const max = Number(item.max) || 0;
  return min || max ? (min + max) / 2 : 0;
};
const standardPriceFor = item => Number(item.price_avg) > 0 ? Number(item.price_avg) : 0;

function stateFor(root){
  if(!root._quoteState){
    root._quoteState = {
      selected:new Set(),
      quantities:new Map(),
      hourly:0,
      pricingBasis:"hourly",
      customRows:[],
      include:{contact:true,priceTable:true,production:true,deadline:true},
      generatedAt:""
    };
  }
  return root._quoteState;
}

function filteredRecords(root){
  const q = (root.querySelector("[data-glossary-search]")?.value || "").trim().toLocaleLowerCase("pt-BR");
  const filter = root.querySelector("[data-glossary-filter]")?.value || "all";
  return records().filter(item => {
    const matchesFilter = filter === "all" || item.group === filter;
    const haystack = `${item.label} ${item.category || ""} ${item.material_family || item.material || ""} ${item.notes || ""} ${item.scope || ""} ${item.term || ""}`.toLocaleLowerCase("pt-BR");
    return matchesFilter && (!q || haystack.includes(q));
  });
}

function pricingText(item,state){
  if(state.pricingBasis === "standard"){
    return standardPriceFor(item) > 0 ? money(standardPriceFor(item)) : "SEM VALOR PADRÃO";
  }
  const mins = minutesFor(item);
  return state.hourly > 0 && mins > 0 ? money(mins / 60 * state.hourly) : "DEFINA O VALOR/HORA";
}

function renderRecord(item,state){
  const selected = state.selected.has(item.key);
  const mins = minutesFor(item);
  const standard = standardPriceFor(item);
  const searchable = `${item.label} ${item.category || ""} ${item.material_family || item.material || ""} ${item.notes || ""}`;
  const disabled = item.quoteable ? "" : "disabled";
  return `<article class="glossary-item${selected ? " is-selected" : ""}${item.quoteable ? "" : " is-reference"}" data-glossary-item data-key="${esc(item.key)}">
    ${item.quoteable ? `<label class="glossary-select" aria-label="Selecionar ${esc(item.label)} para a tabela de custos"><input type="checkbox" data-glossary-check ${selected ? "checked" : ""}><span aria-hidden="true"></span></label>` : `<span class="glossary-reference-mark mono">REF.</span>`}
    <div class="glossary-item-main">
      <div class="glossary-item-top"><span class="mono">${esc(item.groupLabel)}</span><span class="glossary-category">${esc(item.category || "")}</span></div>
      <h3>${esc(item.label)}</h3>
      <p>${esc(item.notes || item.scope || item.rule || item.limitation || "")}</p>
      ${item.quoteable ? `<div class="glossary-meta"><span><b>${number(mins)}</b> MIN. MÉDIO</span><span><b>${standard > 0 ? money(standard) : "SEM VALOR"}</b> PADRÃO</span><span><b>${pricingText(item,state)}</b> COTAÇÃO</span></div>` : `<div class="glossary-meta"><span><b>${esc(item.category || item.type || "REFERÊNCIA")}</b></span></div>`}
    </div>
    <button type="button" class="glossary-detail" data-glossary-detail aria-expanded="false">DETALHES</button>
    <div class="glossary-detail-panel" hidden>
      ${item.type === "model" ? `<p><strong>ESCOPO:</strong> ${esc(item.scope)}</p><p><strong>OPERAÇÕES ESTIMADAS:</strong> ${esc(item.operations)}</p>` : ""}
      ${item.type === "operation" ? `<p><strong>SEQUÊNCIA:</strong> ${esc(item.sequence)}</p><p><strong>MÁQUINAS:</strong> ${esc(item.machines)}</p><p><strong>BASE:</strong> ${esc(item.basis)}</p>` : ""}
      ${item.type === "repair" ? `<p><strong>FAIXA:</strong> ${money(item.price_min)} A ${money(item.price_max)}</p><p><strong>BASE:</strong> ${esc(item.basis)}</p><p><strong>CONFIANÇA:</strong> ${esc(item.confidence)}</p>` : ""}
      ${item.type === undefined && item.rule ? `<p><strong>REGRA:</strong> ${esc(item.rule)}</p>` : ""}
      ${item.type === undefined && item.url ? `<p><strong>TIPO:</strong> ${esc(item.type || "FONTE")}</p><p><strong>LIMITAÇÃO:</strong> ${esc(item.limitation)}</p>` : ""}
    </div>
  </article>`;
}

function renderGlossary(root,state){
  const list = root.querySelector("[data-glossary-list]");
  if(!list) return;
  const visible = filteredRecords(root);
  list.innerHTML = visible.length ? visible.map(item => renderRecord(item,state)).join("") : `<div class="empty-state">NENHUM REGISTRO ENCONTRADO.</div>`;
  root.querySelector("[data-base-count]")?.replaceChildren(document.createTextNode(`${records().length} REGISTROS`));
}

function selectedItems(state){ return quoteableRecords().filter(item => state.selected.has(item.key)); }
function quantityFor(state,key){ return Math.max(1, Number(state.quantities.get(key)) || 1); }

function calculate(state){
  const rows = selectedItems(state).map(item => {
    const quantity = quantityFor(state,item.key);
    const minutes = minutesFor(item);
    let unitPrice = 0;
    let basis = "";
    if(state.pricingBasis === "standard"){
      unitPrice = standardPriceFor(item);
      basis = unitPrice > 0 ? "VALOR PADRÃO" : "SEM VALOR PADRÃO";
    }else{
      unitPrice = state.hourly > 0 && minutes > 0 ? minutes / 60 * state.hourly : 0;
      basis = unitPrice > 0 ? "VALOR/HORA" : "SEM VALOR/HORA";
    }
    return { key:item.key,item,minutes,quantity,unitPrice,total:unitPrice*quantity,basis };
  });
  const custom = state.customRows.map((row,index)=>{
    const quantity = Math.max(1,Number(row.quantity)||1);
    const minutes = Math.max(0,Number(row.minutes)||0);
    const unitPrice = Number(row.price)>0 ? Number(row.price) : (state.pricingBasis === "hourly" && state.hourly>0 ? minutes/60*state.hourly : 0);
    return {key:`custom:${index}`,item:{label:row.name,type:"custom"},minutes,quantity,unitPrice,total:unitPrice*quantity,basis:Number(row.price)>0?"VALOR PRÓPRIO":"VALOR/HORA"};
  });
  return [...rows,...custom];
}

function renderResults(root,state){
  const table = root.querySelector("[data-catalog-table]");
  if(!table) return;
  const rows = calculate(state);
  const total = rows.reduce((sum,row)=>sum+row.total,0);
  const totalHours = rows.reduce((sum,row)=>sum+(row.minutes/60)*row.quantity,0);
  root.querySelector("[data-catalog-count]")?.replaceChildren(document.createTextNode(String(rows.length)));
  root.querySelector("[data-catalog-hours]")?.replaceChildren(document.createTextNode(`${number(totalHours)}H`));
  root.querySelector("[data-catalog-total]")?.replaceChildren(document.createTextNode(money(total)));
  table.innerHTML = rows.length ? rows.map(row=>`<tr data-quote-row="${esc(row.key)}">
    <td><strong>${esc(row.item.label)}</strong><small>${esc(row.basis)}</small></td>
    <td>${number(row.minutes)} MIN.</td>
    <td>${row.unitPrice>0 ? money(row.unitPrice) : "SEM VALOR"}</td>
    <td><input class="quote-quantity" type="number" min="1" step="1" value="${row.quantity}" data-item-quantity="${esc(row.key)}" aria-label="Quantidade de ${esc(row.item.label)}"></td>
    <td>${row.total>0 ? money(row.total) : ""}</td>
    <td>${row.item.type === "custom" ? `<button type="button" class="quote-row-remove" data-remove-custom="${esc(row.key)}">REMOVER</button>` : ""}</td>
  </tr>`).join("") : `<tr><td colspan="6" class="empty-state">COTE REGISTROS NO BANCO DE DADOS TÉCNICO PARA MONTAR A TABELA.</td></tr>`;
}

function payload(state){
  const rows = calculate(state);
  return { mode:state.pricingBasis, pricingBasis:state.pricingBasis, hourly:state.hourly, include:state.include, generatedAt:state.generatedAt || new Date().toLocaleString("pt-BR"), from:document.querySelector("[data-document-from]")?.value || "", to:document.querySelector("[data-document-to]")?.value || "", deadlineFrom:document.querySelector("[data-deadline-from]")?.value || "", deadlineTo:document.querySelector("[data-deadline-to]")?.value || "", items:rows.map(row=>({name:row.item.label,minutes:row.minutes,quantity:row.quantity,unitPrice:row.unitPrice,total:row.total,basis:row.basis})), total:rows.reduce((sum,row)=>sum+row.total,0)};
}

function markGenerated(root,state){
  state.generatedAt = new Date().toLocaleString("pt-BR");
  root.querySelector("[data-document-generated-at]")?.replaceChildren(document.createTextNode(state.generatedAt));
}

function exportFile(name,content,type){
  const blob = new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const csv = value => `"${String(value ?? "").replace(/"/g,'""')}"`;

function exportCatalog(root,state,format){
  markGenerated(root,state);
  const data = payload(state);
  if(format === "json") return exportFile("feitura-orcamento.json",JSON.stringify(data,null,2),"application/json;charset=utf-8");
  if(format === "html") return exportFile("feitura-orcamento.html",buildHtml(data),"text/html;charset=utf-8");
  const lines = [["FEITURA: ORÇAMENTO / ROMANEIO"],["GERADO EM",data.generatedAt],["DE",data.from],["PARA",data.to],["REFERÊNCIA",data.pricingBasis === "hourly" ? "VALOR/HORA" : "VALOR PADRÃO"],["VALOR/HORA",data.hourly ? data.hourly.toFixed(2) : ""],[],["ITEM","TEMPO MIN.","VALOR UNIT.","QUANTIDADE","TOTAL"],...data.items.map(i=>[i.name,i.minutes.toFixed(2),i.unitPrice.toFixed(2),i.quantity,i.total.toFixed(2)]),[],["TOTAL","","","",data.total.toFixed(2)]];
  exportFile("feitura-orcamento.csv","\uFEFF"+lines.map(row=>row.map(csv).join(";")).join("\n"),"text/csv;charset=utf-8");
}

function buildHtml(data){
  const option = (data.include || {});
  const rows = data.items.map(i=>`<tr><td>${esc(i.name)}</td><td>${number(i.minutes)} MIN.</td><td>${i.unitPrice?money(i.unitPrice):"SEM VALOR"}</td><td>${number(i.quantity)}</td><td>${i.total?money(i.total):""}</td></tr>`).join("");
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>FEITURA: ORÇAMENTO / ROMANEIO</title><style>body{font-family:Arial,sans-serif;max-width:1100px;margin:36px auto;padding:0 24px;color:#202820}h1{font-weight:400}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{padding:11px;border-bottom:1px solid #ccc;text-align:left}th{text-transform:uppercase;font-size:11px}.meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin:20px 0}.meta strong{display:block;margin-top:5px}.total{margin-top:24px;font-size:20px;font-weight:bold}.romaneio{border-top:1px solid #ccc;margin-top:28px;padding-top:18px}</style></head><body><p>FEITURA®</p><h1>ORÇAMENTO / ROMANEIO</h1><div class="meta"><div>DE<strong>${esc(data.from || "")}</strong></div><div>PARA<strong>${esc(data.to || "")}</strong></div><div>DATA DA FEITURA<strong>${esc(data.generatedAt)}</strong></div></div>${option.contact ? `<p class="romaneio"><b>DADOS DE CONTATO E ENDEREÇO</b><br>______________________________________________</p>` : ""}${option.production ? `<p><b>SOLICITAÇÃO DE PRODUÇÃO</b><br>______________________________________________</p>` : ""}${option.deadline ? `<p><b>PRAZO VIGENTE</b><br>${esc(data.deadlineFrom || "____/____/________")} A ${esc(data.deadlineTo || "____/____/________")}</p>` : ""}${option.priceTable ? `<table><thead><tr><th>ITEM / SERVIÇO</th><th>TEMPO</th><th>VALOR UNIT.</th><th>QUANTIDADE</th><th>TOTAL</th></tr></thead><tbody>${rows || '<tr><td colspan="5">NENHUM ITEM.</td></tr>'}</tbody></table><div class="total">TOTAL: ${money(data.total)}</div>` : ""}<p class="romaneio">DOCUMENTO GERADO LOCALMENTE PELA FEITURA®. DADOS TÉCNICOS SÃO REFERÊNCIAS E DEVEM SER VALIDADOS NAS CONDIÇÕES REAIS DE PRODUÇÃO.</p></body></html>`;
}

function solveFormula(root){
  const unknown=root.querySelector("[data-formula-unknown]")?.value; const xEl=root.querySelector("[data-formula-x]"),aEl=root.querySelector("[data-formula-a]"),bEl=root.querySelector("[data-formula-b]"),fEl=root.querySelector("[data-formula-f]"); const resultEl=root.querySelector("[data-formula-result]"),displayEl=root.querySelector("[data-formula-display]"),explanationEl=root.querySelector("[data-formula-explanation]"); if(!resultEl)return; const x=Number(xEl?.value)||0,a=Number(aEl?.value)||0,b=Number(bEl?.value)||0,f=Number(fEl?.value)||0; let result=null,expression="FEITURA(x) = ax + b"; if(unknown==="F"&&x>0&&(a>0||b>0)){result=a*x+b;expression=`FEITURA(${number(x)}) = ${money(a)} × ${number(x)} + ${money(b)} = ${money(result)}`;fEl.value=result.toFixed(2)} else if(unknown==="x"&&a>0&&f>=b){result=(f-b)/a;expression=`x = (${money(f)} − ${money(b)}) ÷ ${money(a)} = ${number(result)}`;xEl.value=Number.isFinite(result)?result.toFixed(2):xEl.value} else if(unknown==="a"&&x>0&&f>=b){result=(f-b)/x;expression=`a = (${money(f)} − ${money(b)}) ÷ ${number(x)} = ${money(result)}`;aEl.value=Number.isFinite(result)?result.toFixed(2):aEl.value} else if(unknown==="b"&&x>0&&f>=a*x){result=f-a*x;expression=`b = ${money(f)} − (${money(a)} × ${number(x)}) = ${money(result)}`;bEl.value=Number.isFinite(result)?result.toFixed(2):bEl.value} resultEl.textContent=result!==null&&Number.isFinite(result)&&result>=0?money(result):"INFORME OS COMPONENTES CONHECIDOS.";displayEl.textContent=expression;explanationEl.textContent="O cálculo permanece local no navegador. A função explicita a composição do valor e não representa um preço universal de mercado.";
}

function normalizeTextInputs(root){
  root.querySelectorAll('input[type="text"], input[type="search"]').forEach(input=>input.addEventListener("input",()=>{const pos=input.selectionStart;input.value=upper(input.value);try{input.setSelectionRange(pos,pos)}catch{}}));
}

export function initGlossary(){
  document.querySelectorAll("[data-feitura-quote]").forEach(root=>{
    const state=stateFor(root);
    renderGlossary(root,state); renderResults(root,state); solveFormula(root); normalizeTextInputs(root);
    root.addEventListener("input",event=>{
      const t=event.target;
      if(t.matches("[data-glossary-search]")){renderGlossary(root,state);return;}
      if(t.matches("[name=hourly]")){state.hourly=Number(t.value)||0;renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-document-from], [data-document-to]")){return;}
      if(t.matches("[data-formula-x], [data-formula-a], [data-formula-b], [data-formula-f]")){solveFormula(root);return;}
      if(t.matches("[data-item-quantity]")){const key=t.dataset.itemQuantity; if(key.startsWith("custom:")){const i=Number(key.split(":")[1]);if(state.customRows[i])state.customRows[i].quantity=Math.max(1,Number(t.value)||1)}else state.quantities.set(key,Math.max(1,Number(t.value)||1)); renderResults(root,state);}
    });
    root.addEventListener("change",event=>{
      const t=event.target;
      if(t.matches("[data-glossary-filter]")){renderGlossary(root,state);return;}
      if(t.matches("input[name=pricingBasis]")){state.pricingBasis=t.value;renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-glossary-check]")){const item=t.closest("[data-glossary-item]");if(!item)return;if(t.checked){state.selected.add(item.dataset.key);if(!state.quantities.has(item.dataset.key))state.quantities.set(item.dataset.key,1)}else{state.selected.delete(item.dataset.key);state.quantities.delete(item.dataset.key)}renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-include-contact]"))state.include.contact=t.checked;
      if(t.matches("[data-include-price-table]"))state.include.priceTable=t.checked;
      if(t.matches("[data-include-production]"))state.include.production=t.checked;
      if(t.matches("[data-include-deadline]"))state.include.deadline=t.checked;
      if(t.matches("[data-formula-unknown]"))solveFormula(root);
    });
    root.addEventListener("click",event=>{
      const detail=event.target.closest("[data-glossary-detail]"); if(detail){const panel=detail.closest("[data-glossary-item]")?.querySelector(".glossary-detail-panel");if(panel){const open=detail.getAttribute("aria-expanded")==="true";detail.setAttribute("aria-expanded",String(!open));panel.hidden=open}return;}
      if(event.target.closest("[data-quote-visible]")){filteredRecords(root).filter(i=>i.quoteable).forEach(item=>{state.selected.add(item.key);if(!state.quantities.has(item.key))state.quantities.set(item.key,1)});renderGlossary(root,state);renderResults(root,state);root.querySelector(".quote-document")?.scrollIntoView({behavior:"smooth",block:"start"});return;}
      if(event.target.closest("[data-clear-selection]")){state.selected.clear();state.quantities.clear();state.customRows=[];renderGlossary(root,state);renderResults(root,state);return;}
      const remove=event.target.closest("[data-remove-custom]"); if(remove){const index=Number(remove.dataset.removeCustom.split(":")[1]);if(Number.isInteger(index))state.customRows.splice(index,1);renderResults(root,state);return;}
      if(event.target.closest("[data-print-catalog]")){markGenerated(root,state);renderResults(root,state);window.print();return;}
      if(event.target.closest("[data-export-catalog]")){exportCatalog(root,state,"csv");return;}
      if(event.target.closest("[data-export-json]")){exportCatalog(root,state,"json");return;}
      if(event.target.closest("[data-export-html]")){exportCatalog(root,state,"html");return;}
    });
  });
}
