import { glossaryData } from "./glossary-data.js";

const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value) || 0);
const number = value => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(Number(value) || 0);
const esc = value => String(value ?? "").replace(/[&<>\"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" }[char]));
const upper = value => String(value ?? "").toLocaleUpperCase("pt-BR");
const isoNow = () => new Date().toISOString();
const localDateTime = date => new Intl.DateTimeFormat("pt-BR", { dateStyle:"short", timeStyle:"medium" }).format(date);

const records = () => [
  ...glossaryData.models.map(item => ({ ...item, key:`model:${item.name}`, label:item.name, group:"models", groupLabel:"Artigos e modelos", category:item.material_family || "Artigo", quoteable:true, referenceType:"direct", referenceTypeLabel:"REFERÊNCIA DIRETA" })),
  ...glossaryData.operations.map(item => ({ ...item, key:`operation:${item.id}`, label:item.name, group:"operations", groupLabel:"Operações", category:item.category || "Operação", quoteable:true, referenceType:"direct", referenceTypeLabel:"REFERÊNCIA DIRETA" })),
  ...glossaryData.repairs.filter(item => item.active !== false).map(item => ({ ...item, key:`repair:${item.id}`, label:item.name, group:"repairs", groupLabel:"Consertos e serviços", category:"Conserto", quoteable:true, referenceType:"direct", referenceTypeLabel:"REFERÊNCIA DIRETA" })),
  ...glossaryData.methods.map((item,index) => ({ ...item, key:`method:${index}`, label:item.term, group:"methods", groupLabel:"Método de cronoanálise", category:"Método", quoteable:false, methodReference:true, referenceType:"method", referenceTypeLabel:"REFERÊNCIA METODOLÓGICA" }))
];

const referenceRecords = () => glossaryData.sources.map((item,index) => ({ ...item, key:`source:${index}` }));
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
      customPrices:new Map(),
      itemCosts:new Map(),
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

function calculatedPrice(item,state){
  const mins = minutesFor(item);
  return state.hourly > 0 && mins > 0 ? mins / 60 * state.hourly : 0;
}

function pricingText(item,state){
  if(state.pricingBasis === "standard") return standardPriceFor(item) > 0 ? money(standardPriceFor(item)) : "SEM VALOR PADRÃO";
  const custom = state.customPrices.get(item.key);
  if(Number(custom) > 0) return `${money(custom)} AJUSTADO`;
  const calculated = calculatedPrice(item,state);
  return calculated > 0 ? money(calculated) : "DEFINA O VALOR/HORA";
}

function renderRecord(item,state){
  const selected = state.selected.has(item.key);
  const mins = minutesFor(item);
  const standard = standardPriceFor(item);
  return `<article class="glossary-item${selected ? " is-selected" : ""}${item.quoteable ? "" : " is-reference"}" data-glossary-item data-key="${esc(item.key)}">
    ${item.quoteable ? `<label class="glossary-select" aria-label="Selecionar ${esc(item.label)} para a tabela de custos"><input type="checkbox" data-glossary-check ${selected ? "checked" : ""}><span aria-hidden="true"></span></label>` : ""}
    <div class="glossary-item-main">
      <div class="glossary-item-top"><span class="mono">${esc(item.referenceTypeLabel || item.groupLabel)}</span><span class="glossary-category">${esc(item.category || "")}</span></div>
      <h3>${esc(item.label)}</h3>
      <p>${esc(item.notes || item.scope || item.rule || item.limitation || "")}</p>
      ${item.quoteable ? `<div class="glossary-meta"><span><b>${number(mins)}</b> MIN. MÉDIO</span><span><b>${standard > 0 ? money(standard) : "SEM VALOR"}</b> PADRÃO</span><span><b>${pricingText(item,state)}</b> COTAÇÃO</span></div>` : `<div class="glossary-meta"><span><b>${esc(item.category || "MÉTODO")}</b></span><span><b>CONFIGURÁVEL</b> PARA COTAÇÃO</span></div>`}
    </div>
    <button type="button" class="glossary-detail ${item.methodReference ? "method-configure" : ""}" data-glossary-detail ${item.methodReference ? `data-method-ref="${esc(item.key)}" aria-haspopup="dialog"` : `aria-expanded="false"`}>${item.methodReference ? "CONFIGURAR MÉTODO" : "DETALHES"}</button>
    <div class="glossary-detail-panel" hidden>
      ${item.type === "model" ? `<p><strong>ESCOPO:</strong> ${esc(item.scope)}</p><p><strong>OPERAÇÕES ESTIMADAS:</strong> ${esc(item.operations)}</p>` : ""}
      ${item.type === "operation" ? `<p><strong>SEQUÊNCIA:</strong> ${esc(item.sequence)}</p><p><strong>MÁQUINAS:</strong> ${esc(item.machines)}</p><p><strong>BASE:</strong> ${esc(item.basis)}</p>` : ""}
      ${item.type === "repair" ? `<p><strong>FAIXA:</strong> ${money(item.price_min)} A ${money(item.price_max)}</p><p><strong>BASE:</strong> ${esc(item.basis)}</p><p><strong>CONFIANÇA:</strong> ${esc(item.confidence)}</p>` : ""}
      ${item.methodReference ? `<p><strong>REGRA:</strong> ${esc(item.rule)}</p>` : ""}
    </div>
  </article>`;
}

function renderReferences(root){
  const card=root.querySelector("[data-reference-card]");
  if(!card) return;
  const groups=new Map();
  referenceRecords().forEach(item=>{
    const type=item.type || "Referência";
    if(!groups.has(type)) groups.set(type,[]);
    groups.get(type).push(item);
  });
  const count=referenceRecords().length;
  const groupsHtml=[...groups.entries()].map(([type,items])=>`
    <section class="database-reference-group">
      <div class="database-reference-group-head"><span class="mono">${esc(type)}</span><strong>${items.length} ${items.length===1 ? "REFERÊNCIA" : "REFERÊNCIAS"}</strong></div>
      <div class="database-reference-list">
        ${items.map(item=>`<article class="database-reference-item">
          <h4>${esc(item.name)}</h4>
          <p>${esc(item.limitation || "Referência utilizada para contextualização e estruturação do banco de dados público.")}</p>
          <a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">ABRIR FONTE ↗</a>
        </article>`).join("")}
      </div>
    </section>`).join("");
  card.innerHTML=`
    <div class="database-reference-head">
      <div>
        <span class="kicker">Banco de dados FEITURA</span>
        <h3 id="database-reference-title">REFERÊNCIAS DO BANCO DE DADOS</h3>
        <p>Estas são as referências bibliográficas, técnicas, acadêmicas e visuais utilizadas para contextualizar e organizar a base pública da FEITURA. A existência de uma referência no banco não significa que cada valor, tempo ou parâmetro publicado derive diretamente dela; cada registro conserva sua própria natureza e limitação metodológica.</p>
      </div>
      <div class="database-reference-summary"><strong>${count}</strong><span>REFERÊNCIAS INDEXADAS</span></div>
    </div>
    <button type="button" class="glossary-detail database-reference-toggle" data-reference-details aria-expanded="false">DETALHES</button>
    <div class="database-reference-panel" data-reference-panel hidden>${groupsHtml}</div>`;
}

function renderGlossary(root,state){
  const list = root.querySelector("[data-glossary-list]");
  if(!list) return;
  const visible = filteredRecords(root);
  list.innerHTML = visible.length ? visible.map(item => renderRecord(item,state)).join("") : `<div class="empty-state">NENHUM REGISTRO ENCONTRADO.</div>`;
  root.querySelector("[data-base-count]")?.replaceChildren(document.createTextNode(`${records().length} REGISTROS`));
  renderReferences(root);
}

const METHOD_SCHEMAS = {
  "Perímetro de costura": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Ex.: Mochila urbana"},
    {key:"perimeter",label:"Perímetro de costura",unit:"CM",type:"number",step:"0.01"},
    {key:"speed",label:"Velocidade efetiva",unit:"CM/MIN.",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Tempo de máquina estimado": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Ex.: Banco automotivo"},
    {key:"machineTime",label:"Tempo de máquina estimado",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Aproximação por pontos": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"length",label:"Comprimento de costura",unit:"CM",type:"number",step:"0.01"},
    {key:"pointsPerCm",label:"Pontos por cm",unit:"PONTOS/CM",type:"number",step:"0.01"},
    {key:"pointsPerMin",label:"Pontos por minuto",unit:"PONTOS/MIN.",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Tempo normal": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"cycleAverage",label:"Média dos ciclos observados",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"paceFactor",label:"Fator de ritmo",unit:"FATOR",type:"number",step:"0.001",placeholder:"Ex.: 1,00"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Tempo padrão": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"normalTime",label:"Tempo normal",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"tolerance",label:"Tolerância",unit:"%",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Tempo por unidade em lote": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"variableTime",label:"Tempo variável por peça",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"setupTime",label:"Setup do lote",unit:"MIN.",type:"number",step:"0.01"},
    {key:"lotSize",label:"Quantidade do lote de referência",unit:"UN.",type:"number",step:"1"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Preço estimado de facção": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"standardTime",label:"Tempo padrão",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"tariff",label:"Tarifa efetiva",unit:"R$/MIN.",type:"number",step:"0.0001"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Validação de cronoanálise": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"cycles",label:"Quantidade de ciclos observados",unit:"CICLOS",type:"number",step:"1"},
    {key:"referenceTime",label:"Tempo de referência",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ],
  "Unidade e escopo": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"unit",label:"Unidade de escopo",type:"text",placeholder:"Ex.: unidade, par, metro linear"},
    {key:"referenceTime",label:"Tempo de referência",unit:"MIN./UNIDADE",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade",unit:"UNIDADES",type:"number",step:"1",value:"1"}
  ],
  "Limite desta versão": [
    {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
    {key:"referenceTime",label:"Tempo de referência",unit:"MIN./UN.",type:"number",step:"0.01"},
    {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
    {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
    {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
  ]
};

function methodSchema(item){ return METHOD_SCHEMAS[item.term] || [
  {key:"product",label:"Nome do produto",type:"text",placeholder:"Nome do produto"},
  {key:"referenceTime",label:"Tempo de referência",unit:"MIN./UN.",type:"number",step:"0.01"},
  {key:"processes",label:"Quantidade de processos",unit:"PROCESSOS",type:"number",step:"1"},
  {key:"machines",label:"Quantidade de máquinas",unit:"MÁQUINAS",type:"number",step:"1"},
  {key:"quantity",label:"Quantidade do lote",unit:"UN.",type:"number",step:"1",value:"1"}
]; }

function calculateMethodMinutes(term,v){
  const n=k=>Math.max(0,Number(v[k])||0);
  if(term==="Perímetro de costura" && n("perimeter")>0 && n("speed")>0) return n("perimeter")/n("speed");
  if(term==="Tempo de máquina estimado") return n("machineTime");
  if(term==="Aproximação por pontos" && n("length")>0 && n("pointsPerCm")>0 && n("pointsPerMin")>0) return (n("length")*n("pointsPerCm"))/n("pointsPerMin");
  if(term==="Tempo normal" && n("cycleAverage")>0) return n("cycleAverage")*(n("paceFactor")||1);
  if(term==="Tempo padrão" && n("normalTime")>0) return n("normalTime")*(1+n("tolerance")/100);
  if(term==="Tempo por unidade em lote" && n("variableTime")>0 && n("lotSize")>0) return n("variableTime")+(n("setupTime")/n("lotSize"));
  if(term==="Preço estimado de facção") return n("standardTime");
  return n("referenceTime");
}

function calculateMethodPrice(term,v,minutes,state){
  if(term==="Preço estimado de facção" && Number(v.tariff)>0 && minutes>0) return minutes*Number(v.tariff);
  return state.hourly>0 && minutes>0 ? minutes/60*state.hourly : 0;
}

function renderMethodModal(root){
  let modal=root.querySelector("[data-method-ref-modal]");
  if(modal) return modal;
  modal=document.createElement("div"); modal.className="method-ref-modal"; modal.dataset.methodRefModal=""; modal.hidden=true;
  modal.innerHTML=`<div class="method-ref-backdrop" data-method-ref-close></div><section class="method-ref-dialog" role="dialog" aria-modal="true" aria-labelledby="method-ref-title"><button type="button" class="method-ref-close" data-method-ref-close>FECHAR</button><div class="section-index mono">MÉTODO / CONFIGURAÇÃO DE COTAÇÃO</div><p class="kicker">Método de cronoanálise</p><h2 id="method-ref-title" data-method-ref-title>Método</h2><p class="method-ref-description" data-method-ref-description></p><form class="method-ref-form" data-method-ref-form></form><div class="method-ref-actions"><button type="button" class="button button-dark" data-method-ref-add>ADICIONAR AO ROMANEIO</button><button type="button" class="text-button" data-method-ref-close>CANCELAR</button></div></section>`;
  root.appendChild(modal); return modal;
}

function openMethodReference(root,state,key){
  const item=records().find(r=>r.key===key && r.methodReference); if(!item) return;
  const modal=renderMethodModal(root); modal._method=item;
  modal.querySelector("[data-method-ref-title]").textContent=item.term;
  modal.querySelector("[data-method-ref-description]").textContent=`${item.rule} Informe somente as variáveis necessárias para esta referência. Processos e máquinas identificam a estrutura produtiva do cálculo; não são convertidos automaticamente em tempo.`;
  const form=modal.querySelector("[data-method-ref-form]"), schema=methodSchema(item);
  form.innerHTML=schema.map(f=>`<label><span>${esc(f.label)}${f.unit?` <small>${esc(f.unit)}</small>`:""}</span><input name="${esc(f.key)}" type="${f.type}" ${f.min!==undefined?`min="${f.min}"`:f.type==="number"?'min="0"':''} ${f.step?`step="${f.step}"`:f.type==="number"?'step="0.01"':''} ${f.value!==undefined?`value="${esc(f.value)}"`:''} placeholder="${esc(f.placeholder||"")}"></label>`).join("")+`<div class="method-ref-derived"><span class="mono">TEMPO RESULTANTE</span><strong data-method-ref-minutes>INFORME AS VARIÁVEIS</strong><small data-method-ref-derived-note>O tempo é derivado apenas quando a regra possui parâmetros suficientes; caso contrário, permaneça como referência informada.</small></div>`;
  const update=()=>{const v={};schema.forEach(f=>v[f.key]=form.elements[f.key]?.value||"");const mins=calculateMethodMinutes(item.term,v);modal._values=v;modal._minutes=mins;modal.querySelector("[data-method-ref-minutes]").textContent=mins>0?`${number(mins)} MIN./UN.`:"INFORME AS VARIÁVEIS";};
  form.oninput=update; update(); modal.hidden=false; requestAnimationFrame(()=>modal.classList.add("is-open")); form.querySelector("input")?.focus();
}

function closeMethodReference(root){const modal=root.querySelector("[data-method-ref-modal]");if(!modal)return;modal.classList.remove("is-open");setTimeout(()=>{modal.hidden=true;},180);}

function addMethodReference(root,state){
  const modal=root.querySelector("[data-method-ref-modal]"), item=modal?._method, values=modal?._values||{}, minutes=Number(modal?._minutes)||0;
  if(!item)return;
  const schema=methodSchema(item); const product=values.product?.trim() || "Produto não informado"; const quantity=Math.max(1,Number(values.quantity)||1); const price=calculateMethodPrice(item.term,values,minutes,state);
  const summary=schema.filter(f=>!['product','quantity'].includes(f.key)).map(f=>values[f.key] ? `${f.label}: ${values[f.key]}${f.unit?` ${f.unit}`:""}` : "").filter(Boolean).join(" · ");
  const name=`${product} | ${item.term}${summary?` | ${summary}`:""}`;
  state.customRows.push({name,minutes,price,quantity,methodReference:true,referenceId:`method:${item.term}`,referenceName:item.term,variables:values});
  closeMethodReference(root); renderResults(root,state); root.querySelector(".quote-document")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function selectedItems(state){ return quoteableRecords().filter(item => state.selected.has(item.key)); }
function quantityFor(state,key){ return Math.max(1, Number(state.quantities.get(key)) || 1); }

function calculate(state){
  const rows = selectedItems(state).map(item => {
    const quantity = quantityFor(state,item.key);
    const minutes = minutesFor(item);
    let unitPrice = 0;
    let basis = "";
    let calculatedUnitPrice = 0;
    if(state.pricingBasis === "standard"){
      unitPrice = standardPriceFor(item);
      basis = unitPrice > 0 ? "VALOR PADRÃO" : "SEM VALOR PADRÃO";
    }else{
      calculatedUnitPrice = calculatedPrice(item,state);
      const custom = Number(state.customPrices.get(item.key));
      unitPrice = custom > 0 ? custom : calculatedUnitPrice;
      basis = custom > 0 ? "VALOR/HORA · AJUSTADO" : (unitPrice > 0 ? "VALOR/HORA · CALCULADO" : "SEM VALOR/HORA");
    }
    return { key:item.key,item,minutes,quantity,unitPrice,calculatedUnitPrice,total:unitPrice*quantity,basis,referenceType:item.referenceType || "direct" };
  });
  const custom = state.customRows.map((row,index)=>{
    const quantity = Math.max(1,Number(row.quantity)||1);
    const minutes = Math.max(0,Number(row.minutes)||0);
    const calculatedUnitPrice = state.hourly>0 ? minutes/60*state.hourly : 0;
    const unitPrice = Number(row.price)>0 ? Number(row.price) : calculatedUnitPrice;
    const referenceType = row.methodReference ? "method" : "direct";
    return {key:`custom:${index}`,item:{label:row.name,type:row.methodReference ? "method-reference" : "custom",referenceId:row.referenceId || "",variables:row.variables || {}},minutes,quantity,unitPrice,calculatedUnitPrice,total:unitPrice*quantity,basis:Number(row.price)>0?(row.methodReference?"MÉTODO · VALOR DERIVADO":"VALOR PRÓPRIO"):"VALOR/HORA",referenceType};
  });
  return [...rows,...custom];
}

function rowProcesses(row){ return row.item?.variables?.processes ? number(row.item.variables.processes) : ""; }
function rowMachines(row){ return row.item?.variables?.machines ? number(row.item.variables.machines) : ""; }

function renderQuoteRow(row,state){
  return `<tr data-quote-row="${esc(row.key)}">
    <td><strong>${esc(row.item.label)}</strong><small>${esc(row.basis)}</small></td>
    <td>${rowProcesses(row)}</td>
    <td>${rowMachines(row)}</td>
    <td>${number(row.minutes)} MIN.</td>
    <td>${state.pricingBasis === "hourly" && row.item.type !== "custom" && row.item.type !== "method-reference" ? `<div class="quote-price-editor"><input class="quote-unit-price" type="number" min="0" step="0.01" value="${Number(row.unitPrice||0).toFixed(2)}" data-item-price="${esc(row.key)}" aria-label="Valor unitário de ${esc(row.item.label)}"><small>${row.calculatedUnitPrice>0 && Math.abs(row.unitPrice-row.calculatedUnitPrice)>0.005 ? `CALC.: ${money(row.calculatedUnitPrice)}` : "EDITÁVEL"}</small></div>` : (row.unitPrice>0 ? money(row.unitPrice) : "SEM VALOR")}</td>
    <td><input class="quote-quantity" type="number" min="1" step="1" value="${row.quantity}" data-item-quantity="${esc(row.key)}" aria-label="Quantidade de ${esc(row.item.label)}"></td>
    <td><input class="quote-cost" type="number" min="0" step="0.01" value="${Number(state.itemCosts.get(row.key)||0).toFixed(2)}" data-item-cost="${esc(row.key)}" aria-label="Custos de ${esc(row.item.label)}"></td>
    <td>${row.total>0 ? money(row.total) : ""}</td>
    <td>${row.item.type === "custom" || row.item.type === "method-reference" ? `<button type="button" class="quote-row-remove" data-remove-custom="${esc(row.key)}">REMOVER</button>` : ""}</td>
  </tr>`;
}

function renderQuoteGroup(label,rows,state){
  if(!rows.length) return "";
  return `<tr class="quote-group-row"><th colspan="9" scope="colgroup">${esc(label)}</th></tr>${rows.map(row=>renderQuoteRow(row,state)).join("")}`;
}

function renderResults(root,state){
  const table = root.querySelector("[data-catalog-table]");
  if(!table) return;
  const rows = calculate(state);
  const total = rows.reduce((sum,row)=>sum+row.total,0);
  const totalCosts = rows.reduce((sum,row)=>sum+(Number(state.itemCosts.get(row.key))||0),0);
  const totalHours = rows.reduce((sum,row)=>sum+(row.minutes/60)*row.quantity,0);
  root.querySelector("[data-catalog-count]")?.replaceChildren(document.createTextNode(String(rows.length)));
  root.querySelector("[data-catalog-hours]")?.replaceChildren(document.createTextNode(`${number(totalHours)}H`));
  root.querySelector("[data-catalog-total]")?.replaceChildren(document.createTextNode(money(total)));
  root.querySelector("[data-catalog-costs]")?.replaceChildren(document.createTextNode(money(totalCosts)));

  const directRows=rows.filter(row=>row.referenceType !== "method");
  const methodRows=rows.filter(row=>row.referenceType === "method");
  table.innerHTML = rows.length
    ? `${renderQuoteGroup("REFERÊNCIAS DIRETAS",directRows)}${renderQuoteGroup("REFERÊNCIAS METODOLÓGICAS",methodRows)}`
    : `<tr><td colspan="8" class="empty-state">COTE REGISTROS NO BANCO DE DADOS TÉCNICO PARA MONTAR A TABELA.</td></tr>`;
}

function markGenerated(root,state){
  state.generatedAt = localDateTime(new Date());
  root.querySelector("[data-document-generated-at]")?.replaceChildren(document.createTextNode(state.generatedAt));
}

function fingerprint(data){
  const source = JSON.stringify(data.items.map(i=>[i.name,i.quantity,Math.round(i.unitPrice*100)]));
  let hash = 2166136261;
  for(let i=0;i<source.length;i++) hash = Math.imul(hash ^ source.charCodeAt(i), 16777619);
  return (hash >>> 0).toString(36).toUpperCase().slice(-4).padStart(4,"0");
}

function trackingId(data){
  const d = new Date(data.generatedISO || Date.now());
  const pad = n => String(n).padStart(2,"0");
  const timestamp = `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const itemCount = String(data.items.length).padStart(4,"0").slice(-4);
  const totalInteger = String(Math.floor(Math.max(0,data.total))).padStart(4,"0").slice(-4);
  return `suafeitura${timestamp}${itemCount}${totalInteger}${fingerprint(data)}`;
}

function payload(state){
  const rows = calculate(state);
  const now = new Date();
  const data = {
    schema:"FEITURA-GATE1-ROMANEIO-1.2",
    generatedISO:isoNow(),
    generatedAt:state.generatedAt || localDateTime(now),
    from:document.querySelector("[data-document-from]")?.value || "",
    to:document.querySelector("[data-document-to]")?.value || "",
    deadlineFrom:document.querySelector("[data-deadline-from]")?.value || "",
    deadlineTo:document.querySelector("[data-deadline-to]")?.value || "",
    pricingBasis:state.pricingBasis,
    hourly:Number(state.hourly)||0,
    include:{...state.include},
    items:rows.map(row=>({key:row.key,name:row.item.label,minutes:row.minutes,quantity:row.quantity,calculatedUnitPrice:row.calculatedUnitPrice||0,unitPrice:row.unitPrice,total:row.total,costs:Number(state.itemCosts.get(row.key))||0,basis:row.basis,referenceType:row.referenceType || "direct",referenceId:row.item.referenceId||null,variables:row.item.variables||null})),
    costs:rows.reduce((sum,row)=>sum+(Number(state.itemCosts.get(row.key))||0),0),
    total:rows.reduce((sum,row)=>sum+row.total,0)
  };
  data.trackingId=trackingId(data);
  return data;
}

function exportFile(name,content,type){
  const blob = new Blob([content],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
const csv = value => `"${String(value ?? "").replace(/"/g,'""')}"`;

function buildHtml(data,review=true){
  const option = data.include || {};
  const directItems=data.items.filter(i=>i.referenceType !== "method");
  const methodItems=data.items.filter(i=>i.referenceType === "method");
  const htmlRows=items=>items.length ? `<tr class="quote-group-row"><th colspan="7">${items===directItems ? "REFERÊNCIAS DIRETAS" : "REFERÊNCIAS METODOLÓGICAS"}</th></tr>${items.map(i=>`<tr><td><strong>${esc(i.name)}</strong><small>${esc(i.basis)}</small></td><td>${esc(i.variables?.processes||"")}</td><td>${esc(i.variables?.machines||"")}</td><td>${number(i.minutes)} MIN.</td><td>${i.unitPrice?money(i.unitPrice):"SEM VALOR"}</td><td>${number(i.quantity)}</td><td>${i.costs?money(i.costs):money(0)}</td><td>${i.total?money(i.total):""}</td></tr>`).join("")}` : "";
  const rows=htmlRows(directItems)+htmlRows(methodItems);
  const consent = review ? `<div class="validation"><label><input id="lgpdConsent" type="checkbox"><span>Declaro que compreendo que os dados utilizados nesta revisão são tratados como dados públicos ou informações fornecidas para a composição do documento. Concordo com o manuseio necessário à geração e impressão deste romaneio, observados os princípios aplicáveis da LGPD.</span></label><button id="printButton" type="button" disabled>VALIDAR E IMPRIMIR</button><button id="recordButton" type="button">BAIXAR REGISTRO</button></div>` : "";
  const contact = option.contact ? `<section class="field-block"><h3>DADOS DE CONTATO E ENDEREÇO</h3><div class="blank-line">______________________________________________</div></section>` : "";
  const production = option.production ? `<section class="field-block"><h3>SOLICITAÇÃO DE PRODUÇÃO</h3><div class="blank-area">\u00a0</div></section>` : "";
  const deadline = option.deadline ? `<section class="field-block"><h3>PRAZO VIGENTE</h3><p>${esc(data.deadlineFrom || "____/____/________")} A ${esc(data.deadlineTo || "____/____/________")}</p></section>` : "";
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>sua FEITURA | ${esc(data.trackingId)}</title><style>
@page{size:A4;margin:18mm 14mm 20mm}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:"DM Sans",Arial,sans-serif;color:#171713;background:#eee9df;font-size:11px;line-height:1.45}body:before{content:"";display:block} .paper{max-width:900px;margin:24px auto;background:#fbfaf6;padding:34px 38px 54px;box-shadow:0 10px 40px rgba(23,23,19,.08)}header{border-bottom:4px solid #394337;padding-bottom:18px;margin-bottom:26px;color:#252d25}header h1{margin:0;font:700 30px/1 "DM Sans",Arial,sans-serif;letter-spacing:-.04em}header h2{margin:8px 0 0;font:600 12px/1.35 "DM Mono",monospace;letter-spacing:.08em;text-transform:uppercase}header h3{margin:6px 0 0;font:500 10px "DM Mono",monospace;letter-spacing:.06em;text-transform:uppercase}main h2{margin:0 0 4px;font:400 25px/1.15 Georgia,serif;color:#171713}main>.eyebrow{font:600 9px "DM Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#394337} .meta{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #cfc9bc;margin:18px 0 22px}.meta div{padding:13px;border-right:1px solid #cfc9bc;min-height:68px}.meta div:last-child{border-right:0}.meta span,.field-block h3{display:block;font:600 8px "DM Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:#394337}.meta strong{display:block;margin-top:8px;font:500 10px "DM Mono",monospace;text-transform:uppercase;word-break:break-word}.field-block{margin:14px 0;padding:12px 14px;border:1px solid #d7d1c6}.field-block h3{margin:0 0 7px}.blank-line{font:500 10px "DM Mono",monospace}.blank-area{height:32px;border-bottom:1px solid #888}.table-wrap{margin-top:22px}.table-title{font:600 9px "DM Mono",monospace;letter-spacing:.08em;color:#394337;margin-bottom:8px}table{width:100%;border-collapse:collapse;border:1px solid #bfc0ba;table-layout:fixed}thead{display:table-header-group}th{background:#394337;color:#fbfaf6;text-align:left;font:600 8px "DM Mono",monospace;letter-spacing:.05em;padding:8px;text-transform:uppercase}td{padding:9px 8px;border-top:1px solid #d2d0c8;vertical-align:top;font:500 9px "DM Mono",monospace;word-break:break-word}td strong{display:block;font:700 10px Georgia,serif;color:#171713}td small{display:block;margin-top:3px;font:500 7px "DM Mono",monospace;color:#716f66}.summary{display:grid;grid-template-columns:1fr 1fr 1fr;border:1px solid #cfc9bc;border-top:0}.summary div{padding:13px;border-right:1px solid #cfc9bc}.summary div:last-child{border-right:0}.summary span{display:block;font:600 8px "DM Mono",monospace;color:#394337}.summary strong{display:block;margin-top:4px;font:400 18px Georgia,serif}.trace{margin-top:18px;padding:10px 12px;background:#eee9df;color:#252d25;font:500 8px "DM Mono",monospace;word-break:break-all}.validation{margin-top:28px;padding:18px;border:1px solid #394337;background:#eee9df;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.validation label{display:flex;gap:10px;align-items:flex-start;flex:1 1 58%;min-width:320px;font:500 9px/1.5 "DM Sans",Arial,sans-serif;color:#252d25}.validation input{margin-top:2px;accent-color:#394337}.validation button{border:0;background:#252d25;color:#fbfaf6;padding:11px 15px;font:600 9px "DM Mono",monospace;letter-spacing:.05em;cursor:pointer}.validation button:disabled{opacity:.35;cursor:not-allowed}.validation button#recordButton{background:transparent;color:#252d25;border:1px solid #252d25}.screen-note{margin:18px 0 0;color:#716f66;font:500 8px/1.5 "DM Mono",monospace}footer{margin-top:28px;padding-top:12px;border-top:2px solid #394337;color:#252d25;font:500 8px/1.5 "DM Mono",monospace;display:flex;justify-content:space-between;gap:20px}footer a{color:inherit}footer strong{font-weight:700} @media(max-width:700px){body{background:#fbfaf6}.paper{margin:0;padding:22px}.meta{grid-template-columns:1fr}.meta div{border-right:0;border-bottom:1px solid #cfc9bc}.meta div:last-child{border-bottom:0}footer{display:block}.validation button{width:100%}} @media print{body{background:#fff}.paper{max-width:none;margin:0;padding:0;box-shadow:none}header{margin-bottom:20px}.validation,.screen-note{display:none!important}footer{position:fixed;left:0;right:0;bottom:0;margin:0;padding:7px 0 0;border-top:1.5px solid #394337;background:#fff;font-size:7px}.trace{page-break-inside:avoid}.field-block{break-inside:avoid}tr{break-inside:avoid}a{color:#252d25;text-decoration:none}}
</style></head><body><div class="paper"><header><h1>FEITURA<sup>®</sup></h1><h2>produção · pessoas · possibilidades</h2><h3>Ecossistema RETEAR® | By Victor Mordekai</h3></header><main><div class="eyebrow">05 / revisão final · documento não editável</div><h2>Orçamento / romaneio</h2><div class="meta"><div><span>DE</span><strong>${esc(data.from || "") || "________________________________"}</strong></div><div><span>PARA</span><strong>${esc(data.to || "") || "________________________________"}</strong></div><div><span>DATA DA FEITURA</span><strong>${esc(data.generatedAt)}</strong></div></div>${contact}${production}${deadline}${option.priceTable ? `<div class="table-wrap"><div class="table-title">TABELA DE CUSTOS</div><table><thead><tr><th style="width:30%">ITEM / SERVIÇO</th><th style="width:9%">PROCESSOS</th><th style="width:9%">MÁQUINAS</th><th style="width:12%">TEMPO</th><th style="width:15%">VALOR UNIT.</th><th style="width:9%">QTD.</th><th style="width:11%">CUSTOS</th><th style="width:13%">TOTAL</th></tr></thead><tbody>${rows || '<tr><td colspan="7">NENHUM ITEM COTADO.</td></tr>'}</tbody></table><div class="summary"><div><span>ITENS</span><strong>${data.items.length}</strong></div><div><span>TEMPO TOTAL</span><strong>${number(data.items.reduce((s,i)=>s+(i.minutes/60)*i.quantity,0))}H</strong></div><div><span>CUSTOS</span><strong>${money(data.costs)}</strong></div><div><span>TOTAL</span><strong>${money(data.total)}</strong></div></div></div>` : ""}<div class="trace"><strong>RASTREABILIDADE:</strong> ${esc(data.trackingId)}<br>GERADO LOCALMENTE · ${esc(data.generatedAt)} · FEITURA-GATE1-ROMANEIO-1.2</div>${consent}</main><footer><span><strong>RETEAR® ©</strong> · <a href="https://victormordekai.github.io/FEITURA/">FEITURA®</a> · <a href="https://www.linkedin.com/in/victormordekai/">LinkedIn / Victor Mordekai</a></span><span>${esc(data.trackingId)}</span></footer></div><script>
const DATA=${JSON.stringify(data)};const consent=document.getElementById('lgpdConsent');const printButton=document.getElementById('printButton');const recordButton=document.getElementById('recordButton');if(consent&&printButton){consent.addEventListener('change',()=>{printButton.disabled=!consent.checked;});}function downloadRecord(){const payload={schema:'FEITURA-GATE1-TRACE-1.0',recordType:'FEITURA_GATE1_LOCAL_RECORD',trackingId:DATA.trackingId,generatedISO:DATA.generatedISO,generatedAt:DATA.generatedAt,pricingBasis:DATA.pricingBasis,hourly:DATA.pricingBasis==='hourly'?DATA.hourly:null,itemCount:DATA.items.length,items:DATA.items.map(i=>({key:i.key,name:i.name,minutes:i.minutes,quantity:i.quantity,calculatedUnitPrice:i.calculatedUnitPrice,unitPrice:i.unitPrice,costs:i.costs,total:i.total,basis:i.basis,referenceType:i.referenceType||'direct',customized:i.basis.includes('AJUSTADO')||i.basis==='VALOR PRÓPRIO'})),costs:DATA.costs,total:DATA.total,source:'FEITURA Gate 1.2 / revisão transitória',persistence:'local-download-only; future ingestion endpoint pending Gate 2'};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=DATA.trackingId+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}recordButton?.addEventListener('click',downloadRecord);printButton?.addEventListener('click',()=>{downloadRecord();window.print();});
</script></body></html>`;
}

function exportCatalog(root,state,format){
  markGenerated(root,state);
  const data = payload(state);
  if(format === "json") return exportFile(`${data.trackingId}.json`,JSON.stringify(data,null,2),"application/json;charset=utf-8");
  if(format === "html") return exportFile(`suafeitura-${data.trackingId}.html`,buildHtml(data,false),"text/html;charset=utf-8");
  const lines = [["FEITURA: ORÇAMENTO / ROMANEIO"],["RASTREABILIDADE",data.trackingId],["GERADO EM",data.generatedAt],["DE",data.from],["PARA",data.to],["REFERÊNCIA",data.pricingBasis === "hourly" ? "VALOR/HORA" : "VALOR PADRÃO"],["VALOR/HORA",data.hourly ? data.hourly.toFixed(2) : ""],[],["ITEM","PROCESSOS","MÁQUINAS","TEMPO MIN.","VALOR UNIT.","QUANTIDADE","CUSTOS","TOTAL"],...data.items.map(i=>[i.name,i.variables?.processes||"",i.variables?.machines||"",i.minutes.toFixed(2),i.unitPrice.toFixed(2),i.quantity,i.costs.toFixed(2),i.total.toFixed(2)]),[],["TOTAL","","","",data.total.toFixed(2)]];
  exportFile(`${data.trackingId}.csv`,"\uFEFF"+lines.map(row=>row.map(csv).join(";")).join("\n"),"text/csv;charset=utf-8");
}

function openReview(root,state){
  markGenerated(root,state);
  const data=payload(state);
  const html=buildHtml(data,true);
  const blob=new Blob([html],{type:"text/html;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  const win=window.open(url,"_blank","noopener,noreferrer");
  if(!win){exportFile(`${data.trackingId}.html`,html,"text/html;charset=utf-8");return;}
  setTimeout(()=>URL.revokeObjectURL(url),60000);
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
      if(t.matches("[name=hourly]")){state.hourly=Number(t.value)||0;state.customPrices.clear();renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-document-from], [data-document-to]")){return;}
      if(t.matches("[data-formula-x], [data-formula-a], [data-formula-b], [data-formula-f]")){solveFormula(root);return;}
      if(t.matches("[data-item-quantity]")){const key=t.dataset.itemQuantity; if(key.startsWith("custom:")){const i=Number(key.split(":")[1]);if(state.customRows[i])state.customRows[i].quantity=Math.max(1,Number(t.value)||1)}else state.quantities.set(key,Math.max(1,Number(t.value)||1)); renderResults(root,state);return;}
      if(t.matches("[data-item-price]")){const key=t.dataset.itemPrice;const value=Number(t.value)||0;if(value>0)state.customPrices.set(key,value);else state.customPrices.delete(key);renderResults(root,state);renderGlossary(root,state);return;}
      if(t.matches("[data-item-cost]")){const key=t.dataset.itemCost;const value=Math.max(0,Number(t.value)||0);if(value>0)state.itemCosts.set(key,value);else state.itemCosts.delete(key);renderResults(root,state);return;}
    });
    root.addEventListener("change",event=>{
      const t=event.target;
      if(t.matches("[data-glossary-filter]")){renderGlossary(root,state);return;}
      if(t.matches("input[name=pricingBasis]")){state.pricingBasis=t.value;renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-glossary-check]")){const item=t.closest("[data-glossary-item]");if(!item)return;if(t.checked){state.selected.add(item.dataset.key);if(!state.quantities.has(item.dataset.key))state.quantities.set(item.dataset.key,1)}else{state.selected.delete(item.dataset.key);state.quantities.delete(item.dataset.key);state.customPrices.delete(item.dataset.key)}renderGlossary(root,state);renderResults(root,state);return;}
      if(t.matches("[data-include-contact]"))state.include.contact=t.checked;
      if(t.matches("[data-include-price-table]"))state.include.priceTable=t.checked;
      if(t.matches("[data-include-production]"))state.include.production=t.checked;
      if(t.matches("[data-include-deadline]"))state.include.deadline=t.checked;
      if(t.matches("[data-formula-unknown]"))solveFormula(root);
    });
    root.addEventListener("click",event=>{
      const referenceDetail=event.target.closest("[data-reference-details]"); if(referenceDetail){const panel=root.querySelector("[data-reference-panel]");if(panel){const open=referenceDetail.getAttribute("aria-expanded")==="true";referenceDetail.setAttribute("aria-expanded",String(!open));panel.hidden=open;}return;}
      const methodRef=event.target.closest("[data-method-ref]"); if(methodRef){openMethodReference(root,state,methodRef.dataset.methodRef);return;}
      if(event.target.closest("[data-method-ref-close]")){closeMethodReference(root);return;}
      if(event.target.closest("[data-method-ref-add]")){addMethodReference(root,state);return;}
      const detail=event.target.closest("[data-glossary-detail]"); if(detail){const panel=detail.closest("[data-glossary-item]")?.querySelector(".glossary-detail-panel");if(panel){const open=detail.getAttribute("aria-expanded")==="true";detail.setAttribute("aria-expanded",String(!open));panel.hidden=open}return;}
      if(event.target.closest("[data-quote-visible]")){filteredRecords(root).filter(i=>i.quoteable).forEach(item=>{state.selected.add(item.key);if(!state.quantities.has(item.key))state.quantities.set(item.key,1)});renderGlossary(root,state);renderResults(root,state);root.querySelector(".quote-document")?.scrollIntoView({behavior:"smooth",block:"start"});return;}
      if(event.target.closest("[data-clear-selection]")){state.selected.clear();state.quantities.clear();state.customPrices.clear();state.itemCosts.clear();state.customRows=[];renderGlossary(root,state);renderResults(root,state);return;}
      const remove=event.target.closest("[data-remove-custom]"); if(remove){const index=Number(remove.dataset.removeCustom.split(":")[1]);if(Number.isInteger(index))state.customRows.splice(index,1);renderResults(root,state);return;}
      if(event.target.closest("[data-open-review]")){openReview(root,state);return;}
      if(event.target.closest("[data-export-catalog]")){exportCatalog(root,state,"csv");return;}
      if(event.target.closest("[data-export-json]")){exportCatalog(root,state,"json");return;}
      if(event.target.closest("[data-export-html]")){exportCatalog(root,state,"html");return;}
    });
  });
}
