export function initDocumentHud(){
  document.querySelectorAll('[data-document-hud-anchor]').forEach(anchor=>{
    const hud=anchor.querySelector('[data-document-hud]');
    const button=hud?.querySelector('[data-open-review]');
    if(!hud || !button) return;

    const setMode = (docked) => {
      hud.classList.toggle('is-docked',docked);
      hud.classList.toggle('is-floating',!docked);
      hud.classList.remove('is-mobile-hidden');
      hud.setAttribute('aria-hidden','false');
      button.removeAttribute('tabindex');
    };

    const update = () => {
      const rect=anchor.getBoundingClientRect();
      const viewport=window.innerHeight || document.documentElement.clientHeight;
      // The anchor, not the whole finalization section, defines the docking point.
      // The action floats until its natural document position reaches the viewport.
      setMode(rect.top <= viewport);
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
