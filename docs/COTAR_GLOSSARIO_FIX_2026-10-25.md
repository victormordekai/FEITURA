# FEITURA® — Correção de integração do banco de dados técnico e cotação

## Escopo

Correção concentrada em `pages/cotar.html`, `css/pages/cotar.css` e `js/modules/glossary.js`.

## Fluxo consolidado

`glossary-data.js` → renderização da base → seleção → personalização por registro → cálculo → documento → exportação.

## Banco técnico

A base continua local e pública no Gate 1. A composição atual contém 102 registros ativos:

- 16 artigos/modelos
- 39 operações
- 47 consertos/serviços

O HTML não mantém produtos fixos em `<select>`. Os registros são renderizados pelo JavaScript a partir de `glossary-data.js`.

## Personalização

Ao selecionar um registro, o usuário pode alterar:

- tempo aplicado por unidade;
- valor unitário próprio.

Essas alterações pertencem à cotação corrente e não modificam o banco técnico público.

## Cálculo

Produtor:

`valor unitário = tempo aplicado / 60 × valor-hora`

Comprador:

`valor unitário = teto informado por unidade`

A hora implícita é derivada de:

`hora implícita = teto unitário / (tempo aplicado / 60)`

Serviços de conserto podem usar a referência de preço existente na base quando não houver outra referência informada.

## Documento e exportação

A cotação gera um documento dentro da página e permite:

- impressão / salvar como PDF pelo navegador;
- CSV;
- JSON;
- HTML autônomo do orçamento ou romaneio.

## Limite

Não há persistência remota nem alteração permanente da base técnica no Gate 1.
