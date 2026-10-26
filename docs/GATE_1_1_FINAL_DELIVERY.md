# FEITURA® | Gate 1.1 — Revisão final / sua FEITURA / rastreabilidade

## Entregue

- `pages/cotar.html` reorganizado com fechamento operacional ao final da página.
- `js/modules/glossary.js` com:
  - revisão final transitória `sua FEITURA`;
  - documento não editável para conferência;
  - concordância antes da impressão;
  - impressão liberada somente após concordância;
  - geração de identificador de rastreabilidade;
  - registro JSON operacional sem campos de contato/endereço;
  - valor unitário calculado por valor/hora com possibilidade de ajuste manual;
  - distinção entre valor calculado e valor efetivamente utilizado;
  - exportações vinculadas ao identificador do documento.
- `css/pages/cotar.css` com seção de revisão final e editor de valor unitário.
- `css/navbar.css` com `.button-dark` em `--olive-dark`.
- `docs/registros/` preparado como destino conceitual de registros futuros.
- `docs/GATE_1_1_REVIEW_REGISTRO.md` documentando a arquitetura de transição.

## Limitação de persistência

A publicação atual em GitHub Pages é estática. O JavaScript do navegador não possui capacidade de escrever diretamente no repositório nem em `FEITURA/docs/`.

Por isso, Gate 1.1 gera o registro e o disponibiliza para download com o mesmo identificador do romaneio. A ingestão automática em `docs/`, Apps Script, Python ou banco de dados fica preparada conceitualmente, mas depende de um endpoint de escrita que será introduzido no Gate 2.

Não foi criada uma falsa persistência local nem uma rotina de `localStorage` para representar uma gravação remota inexistente.

## Validação realizada

- HTML da página principal analisado com parser HTML.
- JavaScript validado com `node --check`.
- HTML transitório gerado por teste e convertido para PDF com WeasyPrint.
- PDF de teste apresentou uma página A4 coerente com cabeçalho, metadados, tabela, resumo, rastreabilidade e rodapé.
- Tentativa de validação automatizada com Chromium/Playwright foi bloqueada pelo ambiente de execução (`ERR_BLOCKED_BY_ADMINISTRATOR`); portanto não é declarada como teste funcional de navegador concluído.
