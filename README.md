# FEITURA® · V1 · GATE 1.7.3.7 · 2026.10

## Escopo

A partir exclusivamente do GATE 1.7.3.6, este gate introduz controle de inclusão por item no romaneio e permite quantidade igual a zero.

### Quantidade
- `0` é um valor válido e intencional.
- O item permanece na lista do romaneio.
- O TOTAL do item torna-se `R$ 0,00`.
- O tempo e os subtotais associados à quantidade também ficam zerados.
- O limite permanece `9999` para quantidade.

### Inclusão na revisão e impressão
Cada linha do romaneio possui um booleano `[x] INCLUIR`.

- `[x]` mantém o item na revisão, no HTML transitório, no registro e na impressão.
- `[ ]` mantém o item visível no romaneio de trabalho, mas o exclui dos cálculos do documento, da revisão transitória, do CSV/JSON/HTML exportados e da impressão.
- O item pode ser incluído novamente marcando `[x]`.

A distinção é intencional: `quantidade = 0` significa item ativo com lote zerado; `[ ]` significa item temporariamente excluído do documento final.

## Rastreabilidade
Footer: `V1: GATE 1.7.3.7 2026.10`.

## Validação
- `node --check js/modules/glossary.js`
- HTMLs principais parseados
- estado `included` preservado por item
- quantidade zero preservada
- totais calculados somente sobre itens incluídos
- documento transitório recebe somente itens incluídos
- checkbox ocultado na impressão junto à coluna de ações
- integridade do ZIP verificada
- teste visual automatizado não reivindicado: ambiente Chromium/Playwright anteriormente apresentou `ERR_BLOCKED_BY_ADMINISTRATOR`.
