export function initReveal(){
  const nodes=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){nodes.forEach(n=>n.classList.add("is-visible"));return}
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}
    });
  },{threshold:.12});
  nodes.forEach(n=>observer.observe(n));
}
