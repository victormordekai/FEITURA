# FEITURA® Gate 1 — correção de cotação e navegação responsiva

## Correções executadas

### 1. Cotação / `quote-panel-grid`

O problema principal não estava na estrutura HTML apresentada, mas na cascata CSS: os painéis que utilizavam o atributo HTML `hidden` também recebiam regras de `display:flex` ou `display:grid` pelos seletores de componentes. Como resultado, o painel de comprador e o resultado oculto podiam permanecer visualmente presentes, produzindo a impressão de quadros duplicados e quebrando a composição da seção.

Foi aplicado:

- `[hidden]{display:none !important}` no reset global;
- reforço específico em `.quote-builder[hidden]` e `.buyer-result[hidden]`;
- `min-width:0` nos filhos de `.quote-panel-grid` para impedir overflow de conteúdo;
- coluna lateral da seleção limitada de forma responsiva;
- botões da área de ações impedidos de provocar overflow;
- botões do resumo ocupando a largura disponível;
- empilhamento integral em telas menores;
- campos e resultados reorganizados para uma coluna em mobile.

A estrutura HTML existente foi preservada.

### 2. Navegação responsiva

As páginas internas tinham `nav-links` e `nav-actions`, mas não possuíam o `menu-button` e o `mobile-menu` usados pela página inicial. Como `responsive.css` oculta esses dois grupos abaixo de 980px, as páginas internas ficavam sem navegação utilizável.

Foi padronizado o cabeçalho responsivo em:

- `index.html`
- `pages/cotar.html`
- `pages/capacidade.html`
- `pages/rede.html`
- `pages/feitura.html`
- `pages/manifesto.html`

A navegação móvel agora possui:

- botão de abertura/fechamento;
- `aria-expanded` e `aria-label` atualizados;
- fechamento ao selecionar um link;
- fechamento com `Escape`;
- rotas relativas corrigidas conforme a profundidade de cada página.

### 3. Preservação

Não foram alterados:

- identidade visual;
- fonte identitária do wordmark;
- nomes dos assets;
- caminhos relativos dos assets;
- estrutura funcional do glossário;
- lógica da função `FEITURA(x) = ax + b`;
- modelo de cálculo local;
- arquitetura Gate 1 / Gate 2.

## Validação executada

Foram realizadas verificações estáticas dos HTMLs, presença do menu responsivo em todas as páginas, regras CSS e módulo de navegação. A tentativa de renderização automatizada com Chromium no ambiente de execução não concluiu dentro do limite disponível; portanto, não se declara validação visual automatizada completa.
