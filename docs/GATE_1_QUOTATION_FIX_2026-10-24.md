# FEITURA® Gate 1 — correção da cotação e integração da base técnica

## Diagnóstico

A `cotar.html` possuía uma referência JavaScript a `[data-catalog-table]`, mas esse elemento não existia no HTML entregue. Ao executar `renderResults()`, a tentativa de acessar `innerHTML` de um elemento inexistente interrompia a execução do módulo de cotação. Isso afetava os controles que dependiam do estado da cotação.

A interface também não apresentava de forma suficientemente explícita a relação entre base técnica, seleção e documento final.

## Correção

A cotação agora possui três camadas visíveis:

1. parâmetros da cotação;
2. base técnica pública;
3. orçamento / romaneio gerado em tempo real.

A página também permite inserir uma `Nova linha` de serviço ou item próprio. Essa linha é mantida somente no estado temporário da cotação e é identificada como `Linha própria`.

## Arquitetura

`js/modules/glossary-data.js` é a base técnica pública.

`js/modules/glossary.js` é a camada de apresentação, seleção, cálculo e geração do documento.

`pages/cotar.html` contém a interface, sem duplicar os registros técnicos.

O orçamento é calculado localmente. Não existe, no Gate 1, escrita remota da base.

## Ações funcionais

- alternar produtor / contratante;
- selecionar e desmarcar registros;
- pesquisar e filtrar a base;
- adicionar linha própria;
- remover linha própria;
- recalcular valor, tempo e total;
- montar orçamento/romaneio;
- imprimir/salvar PDF pelo navegador;
- exportar CSV;
- resolver a função `FEITURA(x) = ax + b`;
- abrir o menu responsivo das páginas.

## Persistência

A alteração de valor-hora, seleção ou inclusão de linha não altera `glossary-data.js` e não é persistida após o recarregamento. A atualização governada da base pertence ao Gate 2.
