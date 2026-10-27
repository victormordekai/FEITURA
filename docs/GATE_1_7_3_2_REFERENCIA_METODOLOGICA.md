# FEITURA V1 · GATE 1.7.3.2 · REFERÊNCIA METODOLÓGICA

## Escopo

Correção única em `pages/cotar.html` e nos estilos/estrutura de renderização associados aos cards do banco de dados técnico.

## Correção

Foi removido o marcador redundante `MÉTODO` que aparecia antes do cabeçalho `REFERÊNCIA METODOLÓGICA` nos cards de referências metodológicas.

A apresentação passa a preservar somente a identificação metodológica própria do card, sem a duplicação visual.

## Alterações técnicas

- `js/modules/glossary.js`: removido o elemento `.glossary-reference-mark` que imprimia `MÉTODO`.
- `css/pages/cotar.css`: removidas exclusivamente as regras de posicionamento e recuo dependentes desse marcador.
- Nenhuma lógica de cotação, configuração de método, romaneio, manifesto, banco de referências ou navegação foi alterada.

## Validação estrutural

- O marcador `.glossary-reference-mark` não permanece no JavaScript.
- As regras CSS `.glossary-reference-mark` e `.glossary-item.is-reference` removidas.
- A estrutura de `renderRecord()` permanece preservada para referências diretas e metodológicas.
- O rodapé mantém a identificação `V1: GATE 1.7.3.1 2026.10`, pois esta entrega altera somente a correção solicitada e não modifica metadados visuais da interface.
- A base de desenvolvimento é exclusivamente o GATE 1.7.3.1 validado.
