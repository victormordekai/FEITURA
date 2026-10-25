# FEITURA®

> **PRODUÇÃO · PESSOAS · POSSIBILIDADES**

**FEITURA®** é uma infraestrutura de conexão entre **demanda produtiva e capacidade produtiva**, concebida para tornar visíveis, estruturáveis e utilizáveis os elementos humanos e operacionais que existem por trás de um produto.

O projeto nasce dentro do ecossistema **RETEAR®**, mas possui identidade, linguagem, experiência e finalidade próprias.

FEITURA não é um marketplace artesanal, uma rede social de profissionais, uma simples plataforma de cotação ou um sistema convencional de gestão da produção.

Seu núcleo está na relação entre:

**DEMANDA ↔ FEITURA ↔ CAPACIDADE**

A plataforma busca transformar conhecimento produtivo, tempo, processos, capacidade e experiência de execução em informações estruturadas que possam aproximar quem precisa produzir de quem possui capacidade para produzir.

---

## 1. Conceito

A palavra **FEITURA** é deliberadamente utilizada como nome da plataforma porque carrega a ideia de ato, modo, processo e resultado de fazer.

O produto não pretende representar visualmente o artesanato tradicional nem romantizar o trabalho manual.

Seu campo conceitual está na interseção entre:

- produção;
- pessoas;
- capacidade;
- processos;
- dados;
- demanda;
- conhecimento produtivo;
- remuneração;
- tempo;
- rede;
- tecnologia.

A proposta é tornar perceptível uma dimensão frequentemente ocultada pelo produto acabado:

> **Existe trabalho dentro do produto.**

A FEITURA procura estruturar esse trabalho sem retirar sua dimensão humana.

O conhecimento de quem produz passa a ser registrado como informação operacional.

O dado não substitui a pessoa.

**O dado dá forma computável ao conhecimento da pessoa.**

---

# 2. Relação com RETEAR®

FEITURA® pertence ao ecossistema **RETEAR®**, mas não deve exigir que seu usuário compreenda ou conheça RETEAR para utilizar a plataforma.

A relação conceitual é:

```text
VMORDEKAI®
     │
     │ origem / pesquisa / experimentação
     ▼
RETEAR®
     │
     │ arquitetura / infraestrutura / método
     ▼
FEITURA®
     │
     ├── demanda
     ├── capacidade
     ├── cotação
     ├── estimativa
     ├── rede produtiva
     └── dados de produção
## Gate 1 final consolidado

A entrega final inclui o glossário público integrado à cotação, o motor de orçamento `FEITURA(x) = ax + b`, o manifesto editorial em `pages/manifesto.html` e o módulo preparado para contador agregado via Apps Script. Consulte `docs/GATE_1_FINAL_DELIVERY.md` para o escopo e as fronteiras da entrega.

## Correção responsiva — 24/10/2026

A revisão final de Gate 1 corrige a aplicação do atributo HTML `hidden` sobre componentes com `display:flex/grid` e padroniza o menu responsivo das páginas internas. O detalhe técnico está documentado em `docs/GATE_1_RESPONSIVE_FIX_2026-10-24.md`.

## Cotação e base técnica — Gate 1

A arquitetura atual da cotação está documentada em `docs/ARCHITECTURE_GATE1_QUOTATION.md`.

A base técnica pública está em `js/modules/glossary-data.js`. `pages/cotar.html` apresenta a interface; `js/modules/glossary.js` carrega os registros, calcula os valores e monta o documento de orçamento/romaneio no navegador. Linhas próprias adicionadas pelo usuário permanecem somente na cotação atual e não alteram a base pública.
