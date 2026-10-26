# FEITURA Gate 1.4.4 — Referências especiais na cotação

## Objetivo

Expandir a cotação para produtos cuja estrutura não cabe diretamente nos registros principais de vestuário, sem inventar tempos ou preços técnicos para categorias ainda não validadas.

## Implementação

Foram adicionadas três referências especiais configuráveis ao banco local:

- REF-001 — Guarda-chuva
- REF-002 — Banco automotivo
- REF-003 — Mochila

Cada REF apresenta variáveis próprias. Ao selecionar `CONFIGURAR REF.`, a interface abre um configurador específico para aquela categoria.

A configuração pode informar:

- variáveis construtivas específicas da referência;
- tempo técnico de referência em minutos por unidade;
- valor unitário próprio, quando houver;
- quantidade.

Após `ADICIONAR À COTAÇÃO`, a REF configurada passa a integrar a tabela de custos e o romaneio como item cotável. As variáveis utilizadas ficam incorporadas ao registro da linha para rastreabilidade no payload.

## Limite metodológico

As três referências são estruturas de configuração, não benchmarks de preço ou tempo. O Gate 1.4.4 não atribui automaticamente produtividade universal a guarda-chuva, banco automotivo ou mochila. O tempo e o valor são informados pelo usuário até que exista uma base técnica validada para aquela referência.

Isso preserva a distinção já adotada pela FEITURA entre dado técnico, estimativa e referência de configuração.

## Arquitetura

`glossary-data.js` → `specialReferences` → `glossary.js` → configurador local → `customRows` → tabela de custos → romaneio transitório.

Nenhum dado é enviado remotamente ou armazenado em `localStorage`, `sessionStorage` ou cookies.
