/* FEITURA® · HUD do formulário de lançamento (Subgate 1.1)
   Módulo autocontido: injeta o próprio estilo e o HUD flutuante.
   Uso: <script src=".../feitura-form-hud.js" defer></script>
   Opcional: data-form-url="..." na tag <script> para trocar o link do formulário.
   Desligar numa página: <body data-feitura-form-hud="off">.

   REGRA DE ESPAÇO DOS HUDs ("dois HUDs não ocupam o mesmo espaço"):
   - Todo HUD fixo pode declarar data-hud-priority="N" (maior vence).
     Sem declaração, HUDs de ação (ex.: REVISAR E VALIDAR DOCUMENTO) valem 10.
   - Este HUD de convite vale 1: quando encosta em outro HUD visível, ele sobe;
     se não houver altura, encolhe para o ícone; se ainda assim colidir, se esconde
     até o espaço voltar. Vale para qualquer página, tela e HUD futuro. */
(function () {
  'use strict';
  if (window.__feituraFormHud) return;
  window.__feituraFormHud = true;

  var script = document.currentScript;
  var FORM_URL = (script && script.dataset.formUrl) ||
    'https://docs.google.com/forms/d/e/1FAIpQLSfFEjFt9T5tZkxsGm3LCX31bCVYfwzalHFRocriQd9qRU2zKg/viewform';
  var EMBED_URL = FORM_URL + (FORM_URL.indexOf('?') > -1 ? '&' : '?') + 'embedded=true';
  var STORE_KEY = 'feituraFormHud:v1';

  function store(get, value) {
    try {
      if (get) return window.sessionStorage.getItem(STORE_KEY);
      window.sessionStorage.setItem(STORE_KEY, value);
    } catch (e) { return null; }
  }

  var css = [
    '.ffh{position:fixed;left:20px;bottom:20px;z-index:950;font-family:"DM Mono",ui-monospace,monospace;transition:bottom .25s ease,opacity .2s ease}',
    '.ffh.is-compact .ffh__txt{display:none}.ffh.is-compact .ffh__btn{padding:9px;border-radius:50%}.ffh.is-compact .ffh__x{display:none}',
    '.ffh.is-yielded{opacity:0;pointer-events:none}',
    '.ffh__btn{display:flex;align-items:center;gap:12px;max-width:min(330px,calc(100vw - 40px));padding:12px 16px 12px 12px;',
    'border:1px solid rgba(251,250,246,.22);border-radius:2px;background:#252d25;color:#fbfaf6;cursor:pointer;text-align:left;',
    'box-shadow:0 14px 34px rgba(23,23,19,.28);transform-origin:20% 80%;animation:ffh-shake 5.5s ease-in-out 2.5s infinite}',
    '.ffh__btn:hover,.ffh__btn:focus-visible{animation-play-state:paused;outline:2px solid #a65f43;outline-offset:3px}',
    '.ffh__ring{position:relative;flex:0 0 auto;width:38px;height:38px;display:grid;place-items:center;border:1px dashed rgba(251,250,246,.55);border-radius:50%}',
    '.ffh__ring::after{content:"";position:absolute;inset:-6px;border:1px solid #a65f43;border-radius:50%;opacity:0;animation:ffh-ping 2.75s ease-out infinite}',
    '.ffh__ring svg{width:18px;height:18px}',
    '.ffh__txt{display:flex;flex-direction:column;gap:3px;min-width:0}',
    '.ffh__eyebrow{font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:#c8bca7}',
    '.ffh__title{font:600 .82rem/1.25 "DM Sans","Inter",system-ui,sans-serif;letter-spacing:0;text-transform:none}',
    '.ffh__meta{font-size:.6rem;letter-spacing:.06em;color:rgba(251,250,246,.62)}',
    '.ffh__x{position:absolute;top:-10px;right:-10px;width:24px;height:24px;border:1px solid rgba(251,250,246,.3);border-radius:50%;',
    'background:#171713;color:#fbfaf6;font-size:14px;line-height:1;cursor:pointer;display:grid;place-items:center}',
    '.ffh__panel{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:20px;background:rgba(23,23,19,.62);',
    'backdrop-filter:blur(6px);opacity:0;transition:opacity .2s ease}',
    '.ffh__panel[hidden]{display:none}.ffh__panel.is-open{opacity:1}',
    '.ffh__card{width:min(720px,100%);height:min(86vh,900px);display:flex;flex-direction:column;background:#f5f1e8;border-radius:2px;',
    'box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden}',
    '.ffh__head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;background:#252d25;color:#fbfaf6}',
    '.ffh__head span{font-size:.62rem;letter-spacing:.12em;text-transform:uppercase}',
    '.ffh__head a{color:#c8bca7;font-size:.62rem;letter-spacing:.06em;text-decoration:underline;text-underline-offset:3px}',
    '.ffh__head button{border:0;background:none;color:#fbfaf6;font-size:22px;line-height:1;cursor:pointer;padding:0 4px}',
    '.ffh__frame{flex:1;width:100%;border:0;background:#f5f1e8}',
    '@keyframes ffh-shake{0%,82%,100%{transform:translate(0,0) rotate(0)}84%{transform:translate(-2px,0) rotate(-2.5deg)}',
    '86%{transform:translate(3px,0) rotate(2.5deg)}88%{transform:translate(-3px,0) rotate(-2deg)}90%{transform:translate(2px,0) rotate(1.5deg)}',
    '92%{transform:translate(-1px,0) rotate(-1deg)}94%{transform:translate(0,0) rotate(0)}}',
    '@keyframes ffh-ping{0%{transform:scale(.85);opacity:.9}70%,100%{transform:scale(1.45);opacity:0}}',
    '@media (max-width:560px){.ffh{left:12px;bottom:12px}.ffh__meta{display:none}.ffh__panel{padding:0}.ffh__card{height:100%;width:100%}}',
    '@media (prefers-reduced-motion:reduce){.ffh__btn,.ffh__ring::after{animation:none}}'
  ].join('');

  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M9 3.5h6v2.5H9z"/><path d="M8.5 11h7M8.5 14.5h7M8.5 18h4"/></svg>';

  function build() {
    if (document.body.dataset.feituraFormHud === 'off') return;
    if (store(true) === 'closed') return;

    var style = document.createElement('style');
    style.id = 'feitura-form-hud-style';
    style.textContent = css;
    document.head.appendChild(style);

    var wrap = document.createElement('div');
    wrap.className = 'ffh';
    wrap.setAttribute('data-hud-priority', '1');
    wrap.innerHTML =
      '<button class="ffh__btn" type="button" aria-haspopup="dialog" aria-controls="ffhPanel" data-campaign-hud>' +
        '<span class="ffh__ring">' + ICON + '</span>' +
        '<span class="ffh__txt">' +
          '<span class="ffh__eyebrow">FEITURA® · Antes de lançarmos</span>' +
          '<span class="ffh__title">Queremos ouvir você. Responda e receba o convite.</span>' +
          '<span class="ffh__meta">3 minutos · encontros 27, 28 e 29/11</span>' +
        '</span>' +
      '</button>' +
      '<button class="ffh__x" type="button" aria-label="Ocultar convite do formulário">×</button>';

    var panel = document.createElement('div');
    panel.className = 'ffh__panel';
    panel.id = 'ffhPanel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Formulário FEITURA');
    panel.innerHTML =
      '<div class="ffh__card">' +
        '<div class="ffh__head"><span>FEITURA® · Antes de lançarmos, queremos ouvir você</span>' +
        '<a href="' + FORM_URL + '" target="_blank" rel="noopener noreferrer">abrir em nova aba ↗</a>' +
        '<button type="button" aria-label="Fechar formulário">×</button></div>' +
      '</div>';

    document.body.appendChild(wrap);
    document.body.appendChild(panel);

    var openBtn = wrap.querySelector('.ffh__btn');
    var lastFocus = null;

    function open() {
      var card = panel.querySelector('.ffh__card');
      if (!card.querySelector('iframe')) {
        var frame = document.createElement('iframe');
        frame.className = 'ffh__frame';
        frame.src = EMBED_URL;
        frame.title = 'Formulário FEITURA';
        frame.loading = 'lazy';
        card.appendChild(frame);
      }
      lastFocus = document.activeElement;
      panel.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
      panel.querySelector('.ffh__head button').focus();
      document.addEventListener('keydown', onKey);
      if (window.dataLayer) window.dataLayer.push({ event: 'feitura_form_hud_open' });
    }
    function close() {
      panel.classList.remove('is-open');
      setTimeout(function () { panel.hidden = true; }, 200);
      document.removeEventListener('keydown', onKey);
      if (lastFocus) lastFocus.focus();
    }
    function onKey(e) { if (e.key === 'Escape') close(); }

    openBtn.addEventListener('click', open);
    panel.querySelector('.ffh__head button').addEventListener('click', close);
    panel.addEventListener('click', function (e) { if (e.target === panel) close(); });
    wrap.querySelector('.ffh__x').addEventListener('click', function () {
      store(false, 'closed');
      wrap.remove();
    });

    // ---------- regra de espaço ----------
    var GAP = 12, BASE = parseFloat(getComputedStyle(wrap).bottom) || 20;
    var OTHER = '[data-hud-priority], [data-document-hud], .hud-document-actions, [class*="hud"]';

    function priorityOf(el) {
      var p = el.getAttribute('data-hud-priority');
      return p == null ? 10 : Number(p) || 0;
    }
    function isFixedVisible(el) {
      var cs = getComputedStyle(el);
      return cs.position === 'fixed' && cs.display !== 'none' && cs.visibility !== 'hidden' && Number(cs.opacity) > 0.05;
    }
    // Área real ocupada: união dos filhos visíveis (um contêiner largo pode ter só um botão à direita).
    function boxOf(el) {
      var kids = Array.prototype.filter.call(el.children, function (k) { var r = k.getBoundingClientRect(); return r.width && r.height; });
      var rects = (kids.length ? kids : [el]).map(function (k) { return k.getBoundingClientRect(); });
      return rects.reduce(function (a, r) {
        return { left: Math.min(a.left, r.left), right: Math.max(a.right, r.right), top: Math.min(a.top, r.top), bottom: Math.max(a.bottom, r.bottom) };
      }, { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity });
    }
    function rivals() {
      var mine = priorityOf(wrap);
      return Array.prototype.filter.call(document.querySelectorAll(OTHER), function (el) {
        if (el === wrap || wrap.contains(el) || el.contains(wrap) || panel.contains(el)) return false;
        if (el.closest('[data-hud-priority]') && el.closest('[data-hud-priority]') !== el) return false;
        return priorityOf(el) >= mine && isFixedVisible(el);
      }).map(boxOf).filter(function (b) { return b.right > b.left && b.bottom > 0 && b.top < innerHeight; });
    }
    function hits(a, b) { return a.left < b.right + GAP && a.right > b.left - GAP && a.top < b.bottom + GAP && a.bottom > b.top - GAP; }

    function place() {
      wrap.classList.remove('is-yielded');
      var others = rivals();
      ['full', 'compact'].some(function (mode) {
        wrap.classList.toggle('is-compact', mode === 'compact');
        var bottom = BASE;
        for (var i = 0; i < 4; i++) {
          wrap.style.bottom = bottom + 'px';
          var me = wrap.querySelector('.ffh__btn').getBoundingClientRect();
          var hit = others.filter(function (o) { return hits(me, o); })[0];
          if (!hit) return true;                               // espaço livre: fica aqui
          bottom = innerHeight - hit.top + GAP;                // sobe acima do HUD que tem prioridade
          if (bottom + me.height > innerHeight * 0.55) break;  // sem altura: tenta o modo compacto
        }
        return false;
      }) || wrap.classList.add('is-yielded');                  // nada coube: cede até o espaço voltar
    }

    var queued = false;
    function schedule() {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; if (document.body.contains(wrap)) place(); });
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // Ignora as próprias mudanças do HUD (evita laço); reage às dos outros HUDs.
    new MutationObserver(function (records) {
      if (records.some(function (r) { return !wrap.contains(r.target) && !panel.contains(r.target); })) schedule();
    }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style', 'hidden'] });
    schedule();

    document.querySelectorAll('[data-feitura-form-open]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); open(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
