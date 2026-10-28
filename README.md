# FEITURA V1 · GATE 1.7.3.8

## Configuração do emissor do orçamento

Base funcional: GATE 1.7.3.7.

Esta versão adiciona uma configuração documental independente em `js/modules/quote-config.js` para identificar a empresa ou profissional que emite o orçamento.

- `01 / INÍCIO`: `Valor-hora médio` + `Empresa / profissional`.
- Campo vazio: `SUA FEITURA`.
- `05 / REVISÃO FINAL`: identificação `POR:`.
- Documento transitório `sua FEITURA`: identificação do emissor.
- CSV/JSON: identificação do emissor.
- Footer: `V1: GATE 1.7.3.8 2026.10`.

O módulo é responsável somente pela configuração da identidade documental e não altera a lógica do banco de referências, métodos, cálculo de custos ou romaneio.
