# FEITURA® V1 · GATE 1.7.3.6 · TEMPO MIN:SEG

## Base
GATE 1.7.3.5 · Scalar Inputs.

## Alteração isolada
O campo **TEMPO** do Painel de Configuração da Cotação e da tabela do romaneio passa a trabalhar como **MIN:SEG**, com preenchimento progressivo por dígitos.

Sequência operacional:
- `4` → `0:04`
- `5` → `0:45`
- `0` → `4:50`

O limite de entrada é `9.999:99`. Os dois últimos dígitos representam segundos conforme a máscara solicitada; o valor interno continua sendo convertido para minutos numéricos para preservar os cálculos de preço existentes.

## Tempo total
O resumo do romaneio passa a apresentar o tempo acumulado em **HORA:MIN:SEG**:
- `0:04:50` para quatro minutos e cinquenta segundos;
- `1:02:03` para uma hora, dois minutos e três segundos.

A quantidade continua multiplicando o tempo unitário antes da soma.

## Apresentação
- Coluna TEMPO: `MIN:SEG`.
- Campo de configuração: `MIN:SEG / UN.`.
- Referência média no banco: `MIN:SEG MÉDIO`.
- Documento transitório e CSV passam a transportar o tempo formatado em `MIN:SEG`.
- Valores de referência existentes em minutos decimais são apenas apresentados na nova notação, sem alteração da base numérica.

## Preservação
Não foram alterados os campos financeiros, processos, máquinas, quantidade, matérias-primas, operação unitária, método, observações ou estrutura do romaneio além da apresentação e entrada do tempo.

## Rastreabilidade
Footer atualizado para `V1: GATE 1.7.3.6 2026.10`.
