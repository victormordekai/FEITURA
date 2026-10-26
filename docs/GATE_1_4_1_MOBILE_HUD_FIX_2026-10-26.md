# FEITURA Gate 1.4.1 — Correção HUD mobile

No desktop, o HUD continua flutuando enquanto a seção `REVISÃO FINAL` está fora da viewport e retorna ao fluxo estático quando a seção chega à tela.

No mobile, quando a seção final alcança a viewport, o HUD é ocultado em vez de entrar em `position: static` e reaparecer no fim da página.

Comportamento:
- seção final abaixo da viewport: HUD flutuante;
- desktop + seção final alcançada: HUD estático;
- mobile + seção final alcançada: HUD oculto;
- HUD mobile oculto: `aria-hidden="true"` e `tabindex="-1"`.
