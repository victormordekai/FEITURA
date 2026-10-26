# FEITURA Gate 1.6 — Referências diretas + referências metodológicas

## Objetivo

Esta revisão corrige a interpretação da Gate 1.5. O catálogo existente de itens, operações e serviços permanece íntegro e selecionável. Os métodos de cronoanálise coexistem no mesmo Banco FEITURA como referências metodológicas.

## Modelo aprovado

```text
BANCO DE REFERÊNCIAS
│
├── REFERÊNCIAS DIRETAS
│   ├── artigos e modelos
│   ├── operações
│   └── consertos e serviços
│
└── REFERÊNCIAS METODOLÓGICAS
    ├── Perímetro de costura
    ├── Tempo de máquina estimado
    ├── Aproximação por pontos
    ├── Tempo normal
    ├── Tempo padrão
    ├── Tempo por unidade em lote
    ├── Preço estimado de facção
    ├── Validação de cronoanálise
    ├── Unidade e escopo
    └── Limite desta versão
```

As referências diretas entram no romaneio imediatamente após seleção. As referências metodológicas abrem uma configuração específica, na qual o produto é uma variável de entrada e o método permanece como a referência técnica.

## Romaneio

O romaneio continua sendo único. Quando houver os dois tipos, os registros são apresentados em blocos condicionais:

```text
REFERÊNCIAS DIRETAS
...

REFERÊNCIAS METODOLÓGICAS
...
```

Se houver somente referências diretas, o bloco metodológico não é renderizado. Se houver somente referências metodológicas, o bloco direto não é renderizado. Não são exibidos títulos vazios nem placeholders para grupos ausentes.

## Dados

Os registros passam a carregar `referenceType`:

- `direct`: artigos/modelos, operações e consertos/serviços;
- `method`: métodos de cronoanálise configuráveis.

O payload do romaneio também preserva esse atributo para exportação e futura persistência.

## Métodos

Os dez métodos existentes foram preservados. Seus esquemas continuam exigindo apenas as variáveis pertinentes a cada método, além de quantidade de processos e quantidade de máquinas. Produtos como mochila, banco automotivo ou outros exemplos são entradas do formulário, não novos registros de referência.

## Referências especiais removidas da interface

Os antigos registros `REF-001 Guarda-chuva`, `REF-002 Banco automotivo` e `REF-003 Mochila` continuam no arquivo histórico de dados para preservar a integridade do material anterior, mas não são consumidos pela interface. Eles não representam a arquitetura aprovada e não devem aparecer como itens do Banco FEITURA. Um produto específico deve ser informado dentro da configuração do método quando necessário.

## Validação realizada

- `node --check` executado em `js/modules/glossary.js`;
- conferência estrutural do HTML;
- conferência do CSS do agrupamento condicional do romaneio;
- conferência da presença das 10 referências metodológicas;
- conferência das referências diretas provenientes de `models`, `operations` e `repairs`;
- conferência de que `specialReferences` não é consumido pelo módulo;
- conferência da integridade do ZIP;
- teste visual automatizado de navegador não foi executado, em razão da limitação ambiental já registrada nas versões anteriores (`ERR_BLOCKED_BY_ADMINISTRATOR`).
