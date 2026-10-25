# FEITURA® | Cotar: Orçamento / Romaneio

## Alterações consolidadas

1. A página passa a iniciar diretamente por `FEITURA: ORÇAMENTO / ROMANEIO`.
2. `01 / INÍCIO` concentra o valor-hora médio e os booleanos `INSERIR NO ROMANEIO` para contato/endereço, tabela de preços, solicitação de produção e prazo vigente.
3. A quantidade deixa de ser parâmetro global. Cada registro cotado recebe quantidade própria na tabela do documento.
4. `02 / DOCUMENTO` apresenta a tabela de custos, campos `DE`, `PARA` e data/hora de geração da FEITURA.
5. `03 / COTAR TABELA DE CUSTOS PELO BANCO DE DADOS FEITURA` concentra a escolha entre `A PARTIR DO SEU VALOR/HORA` e `A PARTIR DO VALOR PADRÃO`, além do filtro da base.
6. `COTAR REGISTROS EXIBIDOS` insere em conjunto os registros cotáveis atualmente filtrados, evitando inclusão linha a linha.
7. Métodos de cronoanálise e fontes permanecem consultáveis, mas não são tratados como itens cotáveis.
8. Entradas textuais são normalizadas para caixa alta.
9. Impressão/PDF inclui `DE`, `PARA`, data/hora de geração e tabela com quantidade por item.
10. A área verde da função de valor recebeu regras de contenção e quebra de linha para impedir transbordamento de textos longos.

## Referência de valor

`A PARTIR DO SEU VALOR/HORA` calcula o valor unitário por tempo médio do registro × valor-hora / 60.

`A PARTIR DO VALOR PADRÃO` usa `price_avg` quando esse campo existe no banco. Registros sem valor padrão não recebem valor inventado e são apresentados como `SEM VALOR PADRÃO`.

## Limite do Gate 1

A base continua local, sem persistência remota, autenticação ou histórico de usuário. A seleção e as quantidades pertencem à cotação corrente e não alteram a base técnica pública.
