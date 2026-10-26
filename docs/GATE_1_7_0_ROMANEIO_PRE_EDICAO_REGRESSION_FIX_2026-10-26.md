# FEITURA V1 — GATE 1.7.0 · 2026.10

## Correção de regressão do romaneio

O Gate 1.7.0 trata como regressão funcional a ausência de navegação automática para a seção `02 / DOCUMENTO` após a seleção de referências no banco.

### Diagnóstico

A estrutura HTML de `.quote-document` permanecia presente em `pages/cotar.html`. O problema estava no fluxo de interação de `js/modules/glossary.js`: a seleção direta atualizava estado e renderizava a tabela, mas a abertura/navegação da seção não fazia parte do fluxo original da seleção direta.

No Gate 1.6.1, a seleção de `[data-glossary-check]` terminava em `renderGlossary()` + `renderResults()` sem `scrollIntoView()`. O botão `COTAR REGISTROS EXIBIDOS` e a adição de referências metodológicas possuíam navegação própria.

O Gate 1.6.2 acrescentou `CUSTOS`, mas manteve a regressão. O Gate 1.6.3 tentou corrigir o problema por `requestAnimationFrame()` e foco posterior, porém a correção não foi considerada suficiente para o comportamento observado.

## Solução Gate 1.7.0

Foi adotado um mecanismo explícito `openQuoteDocument(root)` com quatro garantias:

1. localiza diretamente `.quote-document`;
2. marca a seção como `is-preediting`;
3. calcula a posição absoluta da seção e utiliza `window.scrollTo()`;
4. após a renderização, direciona foco para o primeiro campo editável disponível.

Além do handler `change`, a seleção direta recebe um gatilho complementar no evento `click`, executado no próximo ciclo do navegador. Isso evita depender exclusivamente da ordem de renderização do checkbox e da substituição do DOM pelo `renderGlossary()`.

## Comportamento esperado

Ao selecionar qualquer referência direta:

`REFERÊNCIA → seleção → item entra no romaneio → seção 02 / DOCUMENTO é aberta no viewport → edição`

A mesma abertura permanece disponível para:

- `COTAR REGISTROS EXIBIDOS`;
- referência metodológica configurada;
- seleção múltipla de itens.

## Edição preservada

A seção permite editar antes da impressão:

- DE;
- PARA;
- quantidade por item;
- valor unitário quando editável;
- CUSTOS por item.

`TOTAL` permanece calculado como `VALOR UNITÁRIO × QUANTIDADE`.

`CUSTOS` permanece separado e não é somado automaticamente ao `TOTAL`.

## Comparação de continuidade

A implementação parte do Gate 1.6.3 e preserva as funcionalidades adicionadas desde o Gate 1.6.0/1.6.1, incluindo referências diretas e metodológicas, romaneio unificado, CUSTOS, exportações, documento transitório, HUD, footer compartilhado e rastreabilidade local.

## Validação

Foram executados:

- `node --check js/modules/glossary.js`;
- `node --check js/main.js`;
- parsing estrutural de `pages/cotar.html`;
- verificação de `.quote-document`;
- verificação de `data-glossary-check`;
- verificação de `openQuoteDocument`;
- verificação dos gatilhos `change`, `click`, `data-quote-visible` e método;
- verificação dos campos `data-item-quantity`, `data-item-price` e `data-item-cost`;
- integridade do ZIP.

Teste visual automatizado completo não foi declarado como concluído, pois o ambiente Chromium disponível anteriormente apresentou `ERR_BLOCKED_BY_ADMINISTRATOR`.
