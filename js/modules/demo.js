export function initDemoActions(){
  document.querySelectorAll("[data-demo-action]").forEach(button=>{
    button.addEventListener("click",()=>{
      button.textContent="Demanda estruturada";
      button.disabled=true;
    });
  });
}
