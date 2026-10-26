# FEITURA Gate 1.2 — Referências agrupadas e HUD de validação

## Escopo

Esta revisão mantém a arquitetura do Gate 1.1 e ajusta dois pontos de interface e organização do banco público:

1. As referências bibliográficas, técnicas, acadêmicas e visuais deixam de ocupar cards individuais na listagem principal.
2. A ação primária de revisão do romaneio passa a utilizar um HUD próprio, com comportamento flutuante enquanto a seção final ainda não está na viewport e comportamento estático quando o usuário alcança a seção de revisão.

## Referências do banco público

O banco principal continua exibindo artigos/modelos, operações, consertos/serviços e método de cronoanálise. As 12 referências de `glossaryData.sources` são renderizadas em um único card:

`REFERÊNCIAS DO BANCO DE DADOS`

O card explica que a FEITURA possui uma base pública e que a presença de uma referência não significa que cada valor, tempo ou parâmetro derive diretamente daquela fonte. Cada referência preserva nome, classificação, limitação e endereço da fonte.

O controle `DETALHES` abre o conjunto completo agrupado por tipo de referência.

## HUD de revisão

A ação `REVISAR E VALIDAR ROMANEIO` recebeu uma camada própria:

- CSS: `css/hud-document.css`
- JavaScript: `js/modules/hud-document.js`
- classe principal: `.hud-document-actions`
- botão principal: `.button-hud.button-dark`

Comportamento:

- antes de a seção `05 / REVISÃO FINAL` chegar à viewport, o botão permanece flutuante no canto inferior direito;
- há uma animação discreta de chamada de atenção, respeitando `prefers-reduced-motion`;
- quando a seção final chega à viewport, o HUD é convertido em elemento estático no próprio fluxo da página;
- ao continuar a rolagem para depois da seção, o HUD permanece oculto;
- ao retornar para a região anterior, o HUD volta a aparecer.

A ação continua usando o mesmo evento `data-open-review`, portanto não há duplicação do motor de geração do documento transitório.

## Exportações

CSV, JSON e HTML permanecem disponíveis na seção final, mas deixam de disputar visualmente a função primária de revisão. A ação de revisão permanece como único elemento de destaque do HUD.

## Validação

Executado:

- `node --check` em `glossary.js`, `hud-document.js` e `main.js`;
- parsing estrutural de `pages/cotar.html`;
- confirmação da remoção do filtro `sources` da listagem principal;
- confirmação da presença do card de referências, HUD e ações secundárias;
- leitura da estrutura de `glossary-data.js`, com 12 referências indexadas;
- revisão do ZIP final com `unzip -t`.

A validação funcional em navegador continua condicionada ao ambiente de execução. Não foi considerada como executada apenas por inspeção estática.
