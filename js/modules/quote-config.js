function providerValue(root){
  const input=root.querySelector("[data-quote-provider]");
  return String(input?.value || "").trim();
}

function applyProvider(root){
  const name=providerValue(root);
  const resolved=name || "SUA FEITURA";
  root._quoteProvider={name, resolved};
  root.querySelectorAll("[data-quote-provider-display]").forEach(el=>{
    el.textContent=resolved;
  });
}

export function initQuoteConfig(){
  document.querySelectorAll("[data-feitura-quote]").forEach(root=>{
    const input=root.querySelector("[data-quote-provider]");
    if(!input) return;
    applyProvider(root);
    input.addEventListener("input",()=>applyProvider(root));
    input.addEventListener("blur",()=>applyProvider(root));
  });
}
