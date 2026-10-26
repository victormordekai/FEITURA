export function initDocumentHud(){
  document.querySelectorAll('[data-document-hud-anchor]').forEach(anchor=>{
    const hud=anchor.querySelector('[data-document-hud]');
    const section=anchor.closest('.quote-finalization');
    const button=hud?.querySelector('[data-open-review]');
    if(!hud || !section || !button) return;

    const setMode = docked => {
      hud.classList.toggle('is-docked', docked);
      hud.classList.toggle('is-floating', !docked);
      hud.setAttribute('aria-hidden', 'false');
      button.removeAttribute('tabindex');
    };

    const update = () => {
      const rect=section.getBoundingClientRect();
      const viewport=window.innerHeight || document.documentElement.clientHeight;
      // Floating while the finalization section is still below the viewport.
      // Once its top reaches the viewport, the same action returns to its
      // natural static position inside the section.
      setMode(rect.top > viewport);
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
