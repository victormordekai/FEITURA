export function initDocumentHud(){
  document.querySelectorAll('[data-document-hud-anchor]').forEach(anchor=>{
    const hud=anchor.querySelector('[data-document-hud]');
    const section=anchor.closest('.quote-finalization');
    const button=hud?.querySelector('[data-open-review]');
    if(!hud || !section || !button) return;

    const setMode = (mode) => {
      const floating=mode==='floating';
      const docked=mode==='docked';
      const hidden=mode==='hidden';
      hud.classList.toggle('is-floating',floating);
      hud.classList.toggle('is-docked',docked);
      hud.classList.toggle('is-mobile-hidden',hidden);
      hud.setAttribute('aria-hidden', String(hidden));
      if(hidden) button.setAttribute('tabindex','-1');
      else button.removeAttribute('tabindex');
    };

    const update = () => {
      const rect=section.getBoundingClientRect();
      const viewport=window.innerHeight || document.documentElement.clientHeight;
      const mobile=window.matchMedia('(max-width: 600px)').matches;
      if(rect.top > viewport){
        setMode('floating');
      }else if(mobile){
        setMode('hidden');
      }else{
        setMode('docked');
      }
    };

    let ticking=false;
    const onScroll=()=>{
      if(ticking) return;
      ticking=true;
      requestAnimationFrame(()=>{update();ticking=false;});
    };
    update();
    window.addEventListener('scroll',onScroll,{passive:true});
    window.addEventListener('resize',update,{passive:true});
  });
}
