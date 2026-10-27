# FEITURA® | GATE 1.7.3.3

## Escopo

Refinamento final da section **Orçamento / romaneio** e criação do **Painel de Configuração da Cotação**, partindo exclusivamente do GATE 1.7.3.2.

A referência original do banco permanece preservada. A configuração realizada pelo usuário pertence somente ao registro transitório da cotação.

## Painel de Configuração da Cotação

Ao selecionar um item do glossário, abre-se o painel correspondente para configuração antes da revisão/impressão.

| Campo | Comportamento |
|---|---|
| Produto / item | padrão do glossário; não editável |
| Quantidade | padrão `1`; editável |
| Método de cronoanálise | pré-selecionado a partir da referência; não editável nesta versão |
| Processos | padrão `1`; editável |
| Máquinas | padrão `1`; editável |
| Tempo | padrão do glossário/método; editável |
| Matéria-prima | padrão `R$ 0,00`; editável |
| Operação unitária | padrão calculado pela referência de valor; editável |
| Observações | padrão do registro quando disponível; editável |
| Variáveis específicas do método | padrão das variáveis do método quando aplicável; editável |

A configuração não altera o registro original do banco.

## Tabela de custos

A tabela utiliza nove colunas na interface:

1. ITEM / SERVIÇO
2. PROCESSOS
3. MÁQUINAS
4. TEMPO
5. MAT. PRIMA UNIT.
6. OPERAÇÃO UNIT.
7. QUANTIDADE
8. TOTAL
9. ação de configuração/remoção

Para reduzir risco de transbordamento horizontal e preservar a área útil da folha A4, os cabeçalhos foram encurtados para:

- `MAT. PRIMA` / `UNIT.`
- `OPERAÇÃO` / `UNIT.`

A versão transitória de impressão utiliza a mesma nomenclatura curta e tabela de largura fixa compatível com A4. A coluna de ação é removida na impressão.

## Cálculo

Cada linha calcula automaticamente:

`TOTAL = (MATÉRIA-PRIMA UNIT. + OPERAÇÃO UNIT.) × QUANTIDADE`

Os valores continuam editáveis pelo painel e, nesta versão, também permanecem editáveis diretamente na tabela para preservar a funcionalidade operacional existente.

O resumo apresenta:

- ITENS
- TEMPO TOTAL
- MATÉRIA-PRIMA
- VALOR OPERACIONAL
- TOTAL

## Observações e variáveis

Observações e variáveis específicas do método são preservadas no payload transitório e no registro local.

Na versão `sua FEITURA`, essas informações podem acompanhar o item como informação complementar sem criar novas colunas na tabela principal.

## Rastreabilidade

O footer compartilhado foi atualizado para:

`V1: GATE 1.7.3.3 2026.10`

## Validação

- `node --check` executado em `js/modules/glossary.js`.
- `pages/cotar.html` validado estruturalmente.
- `components/footer.html` validado estruturalmente.
- Painel de configuração presente e inicialmente oculto.
- Seleção de item abre a configuração correspondente.
- Produto e método permanecem não editáveis.
- Quantidade inicia em `1`.
- Processos e máquinas iniciam em `1`.
- Tempo deriva da referência selecionada.
- Matéria-prima inicia em `R$ 0,00`.
- Operação unitária deriva da referência de valor e pode ser sobrescrita.
- Observações e variáveis específicas possuem persistência transitória no estado da cotação.
- `colspan` vazio atualizado para nove colunas.
- Cabeçalhos reduzidos para diminuir risco de transbordamento na impressão A4.
- CSS de impressão força a tabela a ocupar a largura disponível da página e remove a coluna de ação.
- Exportação CSV, JSON e documento transitório mantêm matéria-prima e operação separadas.
- Footer sem ocorrência dos identificadores anteriores 1.7.3.1 ou 1.7.3.2.
- Integridade do pacote verificada após compactação.

Não foi declarado teste visual automatizado em navegador porque a limitação anterior do ambiente Chromium permanece registrada.
