# FEITURA® — V1: GATE 1.6.2 · 2026.10

## Escopo
Reintroduz a abertura automática da seção Orçamento / romaneio ao inserir uma referência direta e mantém o comportamento para referências metodológicas.

## CUSTOS por item
Cada item do romaneio, seja referência direta ou metodológica, possui campo `CUSTOS` editável, inicializado em `R$ 0,00`. O valor é independente do `TOTAL` do item.

`TOTAL` continua representando `VALOR UNIT. × QUANTIDADE`.

`CUSTOS` representa custo incidente associado àquele item e não é somado automaticamente ao TOTAL, evitando dupla contabilização quando o custo já estiver contemplado no orçamento.

## Resumo
O romaneio passa a apresentar separadamente `TEMPO TOTAL`, `CUSTOS` e `TOTAL`.

## Dados
O custo por item é preservado no payload, JSON, CSV, HTML transitório e registro sanitizado.

## Versionamento
O `components/footer.html` foi atualizado para `V1: GATE 1.6.2 2026.10`.
