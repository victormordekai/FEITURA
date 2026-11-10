# FEITURA V1 · GATE 1.8.0 · REFATORAÇÃO DA COTAÇÃO

Base: GATE 1.7.3.8. Data: 2026-11-09.

## Objetivo

Devolver o controle autoral do código da cotação, alinhar a página à arquitetura descrita em `ARCHITECTURE_GATE1_QUOTATION.md` e `FEITURA_BACKEND_ROADMAP.md` e corrigir os defeitos encontrados na auditoria.

## 1. Arquitetura do código

O monólito `js/modules/glossary.js` (709 linhas) foi substituído por módulos com uma responsabilidade cada:

| Módulo | Responsabilidade |
|---|---|
| `quote/format.js` | formatação e máscaras (dinheiro, MIN:SEG, inteiros); funções puras |
| `quote/catalog.js` | adaptador do banco técnico; registros com chave estável `grupo:ID` |
| `quote/configurators.js` | métodos de cronoanálise e produtos especiais, ligados por ID (`MET-xxx`, `REF-xxx`) |
| `quote/store.js` | estado transitório: uma coleção de linhas com ID estável |
| `quote/pricing.js` | regras de cálculo puras (orçamento, hora implícita, totais, função do valor) |
| `quote/view-catalog.js` | seção 02: banco paginado, situação da seleção, referências |
| `quote/view-document.js` | seção 03: tabela, resumo e painel de configuração |
| `quote/view-configurator.js` | diálogo de configuração |
| `quote/view-formula.js` | seção 04: FEITURA(x) = ax + b |
| `quote/document-export.js` | payload rastreável, CSV, JSON, HTML e revisão |
| `quote/document-template.js` | documento autocontido (revisão e exportação) |
| `quote/index.js` | controlador: liga eventos às ações e decide o que renderizar |

Também foram removidos `glossary.js`, `glossary-data.js` (substituído pelo gerado) e `quote-config.js` (absorvido pelo estado).

### Fluxo

`planilha → build_glossary.py → glossary-data.js → catalog.js → store.js → pricing.js → view-*.js → document-*.js`

### Estado

As 11 `Map` paralelas indexadas por posição (`custom:0`, `custom:1`…) foram substituídas por `state.lines: Map<id, linha>`. Tabela e painel usam o mesmo contrato de campo (`data-line` + `data-field`), editados por um único handler.

## 2. Banco técnico: fonte única

- Fonte: `data/FEITURA_banco_cronometria_v1.xlsx` (movida de `docs/`).
- Novas abas: `Metadados` (versão), `Referencias_Especiais`, `Variaveis_Especiais`.
- Novas colunas de ID: `id_modelo` (MOD-xxx), `id_metodo` (MET-xxx), `id_fonte` (FON-xxx).
- `tools/build_glossary.py` gera `js/data/glossary-data.js` e valida IDs ausentes ou duplicados.
- `python3 tools/build_glossary.py --check` falha se o JS estiver desatualizado em relação à planilha.
- Verificação de ida e volta: zero divergências entre o banco anterior e o gerado (39 operações, 16 modelos, 47 consertos, 3 especiais, 12 fontes, 10 métodos).
- Versão da base: `1.1 (2026-11-09)`, registrada em todo documento gerado (`dataVersion`), como pede o Gate 2.

## 3. Duas jornadas

`01 / INÍCIO` passa a definir o perfil:

| | PRODUZO · ORÇAMENTO | CONTRATO · ROMANEIO |
|---|---|---|
| Entrada | valor-hora + referência de valor | preço-alvo por unidade |
| Coluna de valor | OPERAÇÃO UNIT. | PREÇO-ALVO UNIT. |
| Indicador | CALC.: valor calculado | HORA IMPLÍCITA: R$/H |
| Documento | Orçamento | Romaneio de produção |
| Valor-hora no CSV/JSON | sim | **nunca** |

- URL compartilhável: `cotar.html?perfil=produzo` ou `?perfil=contrato`.
- Os botões "Preciso produzir" de todas as páginas abrem em `?perfil=contrato`.
- Trocar de perfil preserva os ajustes de cada um.

## 4. Página

Nova ordem, de cima para baixo: 01 Início → 02 Banco → 03 Documento → 04 Função → 05 Revisão.

- Banco paginado (12 por vez, "MOSTRAR MAIS"); "COTAR FILTRADOS (n)" cota todas as páginas do filtro.
- Faixa de situação no banco: itens no documento, total e atalho "VER DOCUMENTO ↓". Substitui a rolagem automática da 1.7.0, que deixa de ser necessária com o documento logo abaixo.
- Painel de configuração fica dentro da seção 03, logo abaixo da tabela.
- Produtos especiais (Guarda-chuva, Banco automotivo, Mochila) voltam a aparecer, com configurador próprio.
- Função do valor: "IMPORTAR x E a DO DOCUMENTO" (x = peças incluídas; a = custo variável médio por peça).
- Altura da página: 16.587 → 7.576 px (desktop) e 36.970 → 12.704 px (390 px). Revisão final: de ~15.000 px para ~6.000 px.

## 5. Defeitos corrigidos

| # | Defeito | Correção |
|---|---|---|
| 1 | Seleção individual e em lote geravam linhas diferentes | `addRecord()` único para os dois caminhos |
| 2 | PROCESSOS e MQs. não gravavam no estado | campos inteiros com máscara, gravando no estado |
| 3 | Tarifa de facção ignorada quando havia valor-hora | `fixedUnitPrice` do método tem prioridade ("MÉTODO · TARIFA") |
| 4 | Remover linha deslocava tempo e preço das seguintes | IDs estáveis por linha |
| 5 | "-0,00" em todas as linhas | `ceilMoney()` não devolve -0 |
| 6 | Revisão abria aba e também baixava o HTML | `window.open` sem `noopener`; `opener` anulado depois |
| 7 | Processos/máquinas do configurador de método eram descartados | valores do formulário entram na linha |
| 8 | Texto digitado com `</script>` quebrava o documento de revisão | JSON embutido com `<` escapado |
| 9 | Editar o tempo não recalculava o valor por valor-hora | cálculo usa o tempo da linha |
| 10 | Observações no painel perdiam o foco a cada tecla | atualização parcial (`patchDocument`) sem re-render |

## 6. CSS

- `css/pages/cotar.css`: 102 regras sem uso removidas (gates anteriores); uma regra por linha; nova seção `GATE 1.8`.
- `index.html` comparado pixel a pixel antes e depois: idêntico.

## 7. Outros

- Removida cópia idêntica com nome corrompido de `docs/Apresentação Editorial da Marca Feitura.png`.
- Footer: `V1: GATE 1.8.0 2026.11`.
- Registro baixado na revisão passa a ser o próprio payload (`FEITURA-GATE1-DOCUMENTO-1.3`).

## 8. Testes executados (Chromium/Playwright, servidor local)

36 verificações automatizadas, todas aprovadas: os 10 defeitos acima, os dois perfis, a URL com perfil, a paginação, produtos especiais, a propagação do emissor, o consentimento e a impressão da revisão, o registro JSON, CSV/JSON/HTML nos dois perfis, a ausência de valor-hora no romaneio, a hora implícita, a importação da função do valor e o console sem erros.

`node --check` em todos os módulos. Fontes Google bloqueadas no teste; tipografia final pode variar levemente.

## 9. Fora do escopo (Gate 2)

Persistência, autenticação, rastreabilidade remota de documentos, gestão do hub e mapa da rede.
