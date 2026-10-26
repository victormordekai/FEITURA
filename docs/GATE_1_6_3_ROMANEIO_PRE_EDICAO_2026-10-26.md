# FEITURA V1 — GATE 1.6.3 · ROMANEIO / PRÉ-EDIÇÃO

## Correção

O Gate 1.6.2 continha a seção `quote-document` no HTML e a função de rolagem para o botão de cotar registros exibidos, porém o handler específico de seleção de uma referência direta não executava a navegação até o romaneio. Por isso, a seção permanecia abaixo da área do banco e a pré-edição não ficava imediatamente disponível.

## Comportamento consolidado

Ao adicionar uma **REFERÊNCIA DIRETA** pelo checkbox do banco:

1. o item é inserido no estado;
2. a tabela do romaneio é renderizada;
3. a página navega automaticamente para `02 / DOCUMENTO`;
4. o romaneio recebe estado visual de pré-edição;
5. o primeiro campo editável disponível recebe foco sem alterar a posição da rolagem.

O mesmo mecanismo foi centralizado para:

- seleção direta individual;
- `COTAR REGISTROS EXIBIDOS`;
- adição de referência metodológica após configuração.

Foi adicionado `scroll-margin-top` para preservar o cabeçalho e uma classe visual `is-preediting` para tornar inequívoco que o documento está aberto para edição.

## CUSTOS

A regra do Gate 1.6.2 permanece intacta:

`TOTAL = VALOR UNITÁRIO × QUANTIDADE`

`CUSTOS` permanece separado e editável por item, tanto em referências diretas quanto metodológicas.

## Estado

**V1: GATE 1.6.3 · 2026.10**
