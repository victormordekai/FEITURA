export function initFaq(){
  document.querySelectorAll(".faq-item button").forEach(button=>{
    button.addEventListener("click",()=>{
      const item=button.closest(".faq-item");
      const open=item.classList.toggle("open");
      button.setAttribute("aria-expanded",String(open));
    });
  });
}
