# FEITURA® V1 · GATE 1.7.3.5 · ENTRADAS ESCALARES

## Base
GATE 1.7.3.4 · Financial Input.

## Alteração
As entradas escalares de `PROCESSOS`, `MQs.`, `TEMPO` e `QUANTIDADE` passam a usar o mesmo princípio de edição persistente durante a digitação que já havia sido aplicado aos campos financeiros. A tabela não é re-renderizada a cada tecla.

### Regras
- TEMPO: 2 casas decimais, máximo `9.999,99` min.
- PROCESSOS: inteiro, máximo `9.999`.
- MQs.: inteiro, máximo `9.999`.
- QUANTIDADE: inteiro, máximo `9.999`; mínimo lógico da cotação permanece 1.
- O foco seleciona o conteúdo do campo para substituição direta.
- A atualização visual e estrutural ocorre no `blur`, não durante cada tecla.
- Os valores são armazenados na configuração transitória da cotação, sem alterar a referência original.

## Comportamento
Para `TEMPO`, a entrada é centesimal por dígitos, seguindo a lógica financeira: `4 → 0,04 → 0,45 → 4,50`.

Para `PROCESSOS`, `MQs.` e `QUANTIDADE`, a entrada permanece inteira: `4 → 4 → 45 → 450`.

## Cabeçalho
A coluna de máquinas passa a ser denominada `MQs.` na tabela e na versão transitória de impressão/CSV, reduzindo largura sem perda material de significado no contexto do romaneio.

## Rastreabilidade
Footer atualizado para `V1: GATE 1.7.3.5 2026.10`.
