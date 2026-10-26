export function initDocumentHud(){
  document.querySelectorAll('[data-document-hud-anchor]').forEach(anchor=>{
    const hud=anchor.querySelector('[data-document-hud]');
    const section=anchor.closest('.quote-finalization');
    if(!hud || !section) return;

    const setMode = docked => {
      hud.classList.toggle('is-docked', docked);
      hud.classList.toggle('is-floating', !docked);
      hud.setAttribute('aria-hidden', String(!docked));
      if(docked){
        hud.querySelector('button')?.removeAttribute('tabindex');
      }else{
        hud.querySelector('button')?.setAttribute('tabindex','-1');
      }
    };

    const update = () => {
      const rect=section.getBoundingClientRect();
      const viewport=window.innerHeight || document.documentElement.clientHeight;
      const reachedFinalization=rect.top <= viewport;
      setMode(reachedFinalization);
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
