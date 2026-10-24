export function initNavigation(){
  const button=document.querySelector("[data-menu-button]");
  const menu=document.querySelector("[data-mobile-menu]");
  if(!button||!menu) return;

  const setOpen=(open)=>{
    menu.classList.toggle("open",open);
    button.setAttribute("aria-expanded",String(open));
    button.setAttribute("aria-label",open?"Fechar menu":"Abrir menu");
  };

  button.addEventListener("click",()=>setOpen(!menu.classList.contains("open")));
  menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>setOpen(false)));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape") setOpen(false);
  });
}
