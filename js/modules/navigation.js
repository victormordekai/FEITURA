export function initNavigation(){
  const button=document.querySelector("[data-menu-button]");
  const menu=document.querySelector("[data-mobile-menu]");
  if(!button||!menu) return;
  button.addEventListener("click",()=>{
    const open=menu.classList.toggle("open");
    button.setAttribute("aria-expanded",String(open));
  });
  menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>menu.classList.remove("open")));
}
