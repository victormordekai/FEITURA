# FEITURA V1 · GATE 1.7.3.4 · 2026.10

## Ajuste de entrada financeira e arredondamento

Este gate parte exclusivamente do GATE 1.7.3.3 final.

### Alterações

1. Campos financeiros editáveis passam a utilizar entrada monetária progressiva, sem `input type="number"`.
2. A entrada aceita somente dígitos e mantém duas casas decimais.
3. O comportamento segue o modelo de teclado de aplicações financeiras:
   - `4` → `0,04`
   - `5` → `0,45`
   - `0` → `4,50`
4. Ao receber foco, o conteúdo existente é selecionado para substituição direta.
5. O valor máximo operacional da máscara é `9.999,99`, correspondente a quatro dígitos inteiros e duas casas decimais.
6. O valor é atualizado no estado sem re-renderização a cada tecla. A renderização ocorre ao sair do campo, evitando o fechamento/perda de foco observado anteriormente.
7. Matéria-prima e Operação unitária utilizam a mesma regra de entrada no Painel de Configuração da Cotação e na tabela do romaneio.
8. Valores derivados de cálculo monetário usam arredondamento para cima em centavos: `ceil(valor × 100) / 100`, com proteção contra ruído de ponto flutuante. Exemplo: `R$ 5,416666...` → `R$ 5,42`.
9. A mesma regra é aplicada ao valor operacional calculado por valor/hora, ao preço derivado de método e ao valor padrão utilizado como referência monetária.
10. A impressão continua apresentando valores financeiros com duas casas decimais.
11. O footer foi atualizado para `V1: GATE 1.7.3.4 2026.10`.

## Integridade funcional

A referência original continua inalterada. Os valores digitados pertencem somente à ocorrência transitória do item dentro da cotação.

A entrada financeira não dispara `renderResults()` a cada tecla. Isso preserva a caixa ativa durante a composição do valor. O estado é atualizado imediatamente e a interface é consolidada no `focusout`.

## Validação

- `node --check js/modules/glossary.js`: aprovado.
- Máscara monetária: sequência `4 → 0,04 → 0,45 → 4,50`: validada logicamente.
- Limite da máscara: `9.999,99`.
- Arredondamento derivado: `5,416666... → 5,42`: validado.
- Campos de matéria-prima e operação: mesma máscara.
- Footer: versão 1.7.3.4 presente.
- Integridade do pacote ZIP: validada após empacotamento.
- Teste visual automatizado em Chromium: não declarado como executado devido à limitação de ambiente já registrada nos gates anteriores.
