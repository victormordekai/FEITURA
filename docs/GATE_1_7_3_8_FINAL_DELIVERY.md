# FEITURA V1 · GATE 1.7.3.8 · ENTREGA FINAL

Base operacional única: GATE 1.7.3.7.

## Alteração isolada

Implementação da configuração de identificação do emissor do orçamento por módulo próprio:

`js/modules/quote-config.js`

## Interface

`01 / INÍCIO` recebeu o campo `EMPRESA / PROFISSIONAL` ao lado de `VALOR-HORA MÉDIO`.

Sem preenchimento, o documento assume `SUA FEITURA`.

`05 / REVISÃO FINAL` apresenta:

`POR: [nome informado]`

O valor acompanha a revisão transitória e os formatos de exportação.

## Escopo preservado

Não foram alterados, por objetivo desta gate:

- banco de referências;
- métodos de cronoanálise;
- cálculo de tempo;
- cálculo de matéria-prima;
- cálculo operacional;
- quantidade zero;
- inclusão/exclusão do romaneio;
- máscara financeira;
- máscara MIN:SEG;
- estrutura do HUD;
- manifesto;
- navegação institucional.

## Testes executados

- `node --check js/main.js`: PASS
- `node --check js/modules/glossary.js`: PASS
- `node --check js/modules/quote-config.js`: PASS
- parsing estrutural de todas as páginas HTML: PASS
- campo de emissor único: PASS
- fallback `SUA FEITURA`: PASS
- propagação de `Fátima Costura` por simulação DOM mínima: PASS
- retorno ao fallback após limpar o campo: PASS
- presença do emissor no payload: PASS
- presença no documento transitório: PASS
- presença no CSV: PASS
- presença no registro JSON: PASS
- ausência de localStorage/sessionStorage/cookies/fetch no módulo novo: PASS
- footer versionado: PASS
- integridade do pacote ZIP: PASS

## Teste visual

Não foi declarado teste visual automatizado em navegador. O ambiente disponível anteriormente apresentou `ERR_BLOCKED_BY_ADMINISTRATOR` com Chromium/Playwright.
