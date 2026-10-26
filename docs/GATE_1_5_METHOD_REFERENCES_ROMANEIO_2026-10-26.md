# FEITURA Gate 1.5 — Métodos de cronoanálise como referências configuráveis

## Decisão arquitetural

As referências especiais por produto foram retiradas da interface de cotação. Produtos não geram novas REFs.

A unidade configurável passa a ser o método de cronoanálise já existente no banco FEITURA:

`produto → método → variáveis do método → tempo/valor → romaneio`

Isso permite aplicar a mesma arquitetura a mochila, banco automotivo, guarda-chuva ou qualquer outro produto sem criar uma REF para cada categoria.

## Métodos configuráveis

A versão implementa configuração para os 10 métodos existentes no banco:

1. Perímetro de costura
2. Tempo de máquina estimado
3. Aproximação por pontos
4. Tempo normal
5. Tempo padrão
6. Tempo por unidade em lote
7. Preço estimado de facção
8. Validação de cronoanálise
9. Unidade e escopo
10. Limite desta versão

Cada configuração inclui nome do produto e somente as variáveis previstas para o método, acrescidas de quantidade do lote quando aplicável e das variáveis estruturais comuns de quantidade de processos e quantidade de máquinas.

## Romaneio

O documento passou a registrar explicitamente:

- item / serviço;
- quantidade de processos;
- quantidade de máquinas;
- tempo;
- valor unitário;
- quantidade;
- total.

As variáveis completas do método também permanecem no payload local/JSON para rastreabilidade.

## Integridade metodológica

Não são fabricados tempos para produtos não medidos. Quando a regra do método possui parâmetros suficientes, o tempo é derivado conforme a própria regra cadastrada. Quando não possui, o campo permanece dependente de referência informada pelo usuário.

Exemplos implementados e testados:

- Perímetro: `tempo = perímetro / velocidade efetiva`;
- Máquina estimada: tempo informado por unidade;
- Pontos: `(comprimento × pontos/cm) / pontos/minuto`;
- Tempo normal: `média dos ciclos × fator de ritmo`;
- Tempo padrão: `tempo normal × (1 + tolerância)`;
- Lote: `tempo variável + setup / lote`.

## Testes internos

- `node --check js/modules/glossary.js`: aprovado.
- Importação isolada do módulo em sandbox Node: aprovada.
- Os 10 métodos possuem configuração com produto, processos, máquinas e quantidade.
- Cálculos internos de seis regras foram verificados numericamente.
- HTML: estrutura, filtro de métodos, ausência do filtro de referências especiais, 8 colunas do romaneio e HUD preservado: aprovados.
- CSS: modal de métodos presente e estilos de referências especiais removidos: aprovado.
- Teste visual automatizado em navegador não foi declarado como executado devido à limitação anterior do ambiente Chromium (`ERR_BLOCKED_BY_ADMINISTRATOR`).
