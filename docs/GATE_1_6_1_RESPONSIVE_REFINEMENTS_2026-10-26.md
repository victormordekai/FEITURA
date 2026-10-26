# FEITURA® — V1: GATE 1.6.1 · 2026.10
## Refinamentos de responsividade e hierarquia visual

### Estado
O projeto parte do estado consolidado do Gate 1.6.0 e recebe duas correções pontuais de apresentação, sem alteração da arquitetura funcional do banco de referências.

### 1. Manifesto — equação FEITURA(x) = ax + b
Problema: em larguras desktop intermediárias/amplas, a tipografia da equação utilizava crescimento proporcional à viewport até 5vw/5rem e podia ultrapassar a largura útil do bloco, permitindo quebra automática da expressão.

Correção:
- redução controlada do crescimento tipográfico para `clamp(2rem,4vw,4.5rem)`;
- `white-space: nowrap` aplicado exclusivamente à expressão matemática;
- preservação do comportamento mobile já adequado.

Objetivo: manter `FEITURA(x) = ax + b` como uma unidade matemática visualmente íntegra, sem impedir a responsividade do bloco explicativo.

### 2. Cotar — referências metodológicas
Problema: os cards de métodos exibiam simultaneamente o marcador `MÉTODO` e a classificação `REFERÊNCIA METODOLÓGICA`, produzindo redundância semântica e visual.

Correção:
- remoção do marcador independente `MÉTODO` dos cards metodológicos;
- manutenção de `REFERÊNCIA METODOLÓGICA` como classificação superior;
- manutenção de `Método` como categoria do registro;
- remoção do recuo lateral que existia exclusivamente para acomodar o marcador removido.

Resultado esperado:

REFERÊNCIA METODOLÓGICA
Método
[nome do método]

### 3. Versionamento
Como este entregável consolida correções verificáveis sobre a versão anterior, o estado foi atualizado para:

`V1: GATE 1.6.1 2026.10`

O mesmo estado foi atualizado em `components/footer.html`, conforme regra de governança do projeto.

### 4. Escopo preservado
Não foram alterados:
- modelo de referências diretas/metodológicas;
- quantidade de referências;
- métodos de cronoanálise;
- lógica de cálculo;
- estrutura do romaneio;
- fluxo de revisão e impressão;
- arquitetura do footer compartilhado;
- identidade visual;
- política de processamento local.

### 5. Validação
Executado:
- `node --check` em `js/modules/glossary.js`;
- `node --check` em `js/main.js`;
- parsing estrutural de `pages/manifesto.html`;
- parsing estrutural de `pages/cotar.html`;
- verificações dos seletores e alterações esperadas;
- verificação do estado de versionamento no footer.

Teste visual automatizado completo em navegador não foi declarado como executado neste ambiente.
