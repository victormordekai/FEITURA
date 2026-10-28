# FEITURA V1 · GATE 1.7.3.8 · CONFIGURAÇÃO DO EMISSOR DO ORÇAMENTO

## Base

Gate 1.7.3.7, exclusivamente.

## Objetivo

Separar a configuração de identificação do emissor do orçamento da lógica principal do banco de referências e do romaneio, criando o módulo `js/modules/quote-config.js`.

## Implementação

- Campo `Empresa / profissional` ao lado de `Valor-hora médio` em `01 / INÍCIO`.
- Placeholder: `INSIRA O NOME DA SUA EMPRESA`.
- Nome vazio resolve automaticamente para `SUA FEITURA`.
- O nome informado aparece em `05 / REVISÃO FINAL` no bloco `POR:`.
- O mesmo valor é transportado para o documento transitório `sua FEITURA`.
- O registro JSON e o CSV carregam a identificação do emissor.
- O nome do emissor não é tratado como dado persistente; permanece no estado transitório da cotação e nos arquivos explicitamente exportados pelo usuário.
- `js/modules/quote-config.js` concentra a responsabilidade de identificação e fallback.
- `glossary.js` apenas consome o estado documental necessário ao payload.
- Footer atualizado para `V1: GATE 1.7.3.8 2026.10`.

## Arquitetura

`01 / INÍCIO → quote-config.js → estado transitório → 05 / REVISÃO FINAL → sua FEITURA`

## Validação

- `node --check` em `js/main.js`, `js/modules/glossary.js` e `js/modules/quote-config.js`.
- HTML de `cotar.html` validado estruturalmente.
- Presença única do campo de emissor.
- Presença do fallback `SUA FEITURA`.
- Presença do bloco `POR:` na revisão.
- Presença do `providerName` no payload.
- Presença da identificação no documento transitório, CSV e registro.
- Footer versionado.
- Integridade do ZIP.

## Teste de comportamento pensado

1. Abrir `cotar.html` sem preencher o nome: revisão e documento devem mostrar `SUA FEITURA`.
2. Digitar `Fátima Costura`: o bloco `POR:` deve atualizar para `Fátima Costura` sem re-renderizar o romaneio.
3. Abrir a revisão: o nome deve aparecer no cabeçalho documental.
4. Exportar CSV/JSON/HTML: a identificação deve acompanhar o documento.
5. Limpar o campo: o fallback deve retornar para `SUA FEITURA`.
6. Em viewport menor, os dois campos de `01 / INÍCIO` devem passar para uma coluna e o bloco `POR:` deve permanecer legível.

## Limitação de teste visual

Não foi declarado teste visual automatizado em navegador. O ambiente anterior apresentou `ERR_BLOCKED_BY_ADMINISTRATOR` para Chromium/Playwright. A validação desta entrega permanece estrutural, sintática e por inspeção do fluxo de estado.
