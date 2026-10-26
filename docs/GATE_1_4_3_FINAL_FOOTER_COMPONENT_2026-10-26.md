# FEITURA® | Gate 1.4.3 — Footer compartilhado

## Objetivo

Consolidar o footer institucional como componente compartilhado entre todas as páginas da FEITURA®, evitando duplicação de markup e divergências de conteúdo entre páginas.

## Implementação

- Componente único em `components/footer.html`.
- Montagem dinâmica pelo módulo `js/modules/footer.js`.
- Cada página contém apenas `<div data-footer></div>` no ponto de inserção.
- `js/main.js` inicializa o footer junto aos demais módulos.
- Links internos são resolvidos conforme a página esteja na raiz ou em `/pages/`.
- `css/footer.css` permanece como folha de estilo única do componente.

## Identidade do footer

O wordmark tipográfico FEITURA® foi ampliado e recebeu tratamento próprio:

```html
<h2 class="footer-logo-heading">
  <a class="footer-logo" data-footer-path="index.html" aria-label="FEITURA início">
    <span class="brand-word-footer">FEITURA<sup>®</sup></span>
  </a>
</h2>
```

A cor do wordmark e do registro `®` é exclusivamente `var(--olive)`, correspondente a `#394337`.

O elemento usa `h2`, e não `h1`, para preservar a hierarquia semântica: o footer ocorre depois do conteúdo principal e não deve introduzir um segundo título primário de documento.

## Padronização

O footer do `index.html` foi adotado como referência institucional para:

- `index.html`
- `pages/cotar.html`
- `pages/capacidade.html`
- `pages/rede.html`
- `pages/feitura.html`
- `pages/manifesto.html`

Isso elimina versões paralelas do footer e permite alteração futura em um único arquivo.

## Limitação operacional

O componente é carregado via `fetch()`, portanto depende de execução em contexto HTTP/HTTPS. O comportamento esperado no GitHub Pages é compatível com essa arquitetura. Abrir diretamente os HTML via `file://` não constitui teste válido para o carregamento do fragmento.
