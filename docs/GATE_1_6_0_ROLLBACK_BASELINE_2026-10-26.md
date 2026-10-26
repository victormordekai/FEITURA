# FEITURA V1 — GATE 1.6.0

## Retorno controlado ao baseline

Esta entrega restaura o conjunto de arquivos de cotação/romaneio disponível no histórico de trabalho de 25/10/2026, usado como referência estável anterior às intervenções de 1.6.1, 1.6.2, 1.6.3 e 1.7.0.

### Arquivos restaurados
- `pages/cotar.html`
- `js/modules/glossary.js`
- `css/pages/cotar.css`

Os três arquivos foram restaurados a partir dos artefatos históricos `FEITURA_cotar_ORCAMENTO_ROMANEIO_FINAL_2026-10-25.*`.

### Comportamento do baseline
- seleção individual atualiza a tabela;
- `COTAR REGISTROS EXIBIDOS` seleciona os registros cotáveis atualmente filtrados e conduz o documento ao romaneio;
- quantidade permanece editável por item;
- valor unitário segue a referência escolhida, sem a camada posterior de custo;
- não há lógica `openQuoteDocument`, `window.scrollTo` ou `is-preediting`;
- não há coluna `CUSTOS`;
- não há alterações posteriores de pré-edição introduzidas em 1.6.3/1.7.0.

### Integridade
O retorno não deve ser interpretado como nova implementação. A prioridade desta versão é recuperar um estado conhecido antes de novas alterações funcionais.

### Limitação de rastreabilidade
O arquivo ZIP original nomeado como Gate 1.6.0 não estava disponível no ambiente de trabalho no momento desta restauração. Por isso, esta entrega não declara identidade binária com um ZIP histórico ausente. A base utilizada é o conjunto de artefatos históricos de cotar, glossary e CSS preservados no histórico da conversa.
