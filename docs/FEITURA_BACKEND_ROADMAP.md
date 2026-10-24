# FEITURA | Roadmap de dados e backend

## 1. Decisão de arquitetura para o Gate 1

O Gate 1 deve preparar o produto para persistência sem transformar a interface pública em uma aplicação dependente de backend.

A regra é:

**base técnica pública → cálculo local → solicitação estruturada → backend privado → inteligência operacional.**

A base técnica publicada no frontend é somente conhecimento técnico e referência. Dados de pessoas, propostas, preços praticados, capacidade individual, contatos e histórico não devem ser embutidos nessa camada pública.

## 2. Fluxos previstos

### Quem produz

1. Calcula ou informa seu valor-hora produtivo.
2. Seleciona um artigo, operação, serviço ou conjunto de itens.
3. Escolhe quantidade ou monta um catálogo.
4. FEITURA calcula uma referência local a partir do tempo técnico e do valor-hora informado.
5. Pode exportar o orçamento/catálogo localmente.
6. Em uma etapa posterior, poderá enviar a capacidade e o orçamento para a rede mediante identificação e consentimento apropriados.

O valor-hora é atributo do prestador e não deve ser exigido da empresa que solicita produção.

### Empresa ou marca

1. Informa artigo/modelo ou seleciona componentes da base.
2. Informa quantidade do lote.
3. Pode informar o preço máximo que pretende pagar por unidade.
4. FEITURA apresenta tempo técnico de referência e calcula a tarifa-hora implícita no teto informado.
5. Quando existir uma tarifa de referência de mercado suficientemente validada, a FEITURA poderá apresentar também uma faixa média sugerida.
6. A empresa pode aceitar, reduzir ou elevar sua referência.
7. O pedido estruturado poderá gerar um **romaneio de produção** para encaminhamento à rede.

A interface não deve pedir à empresa uma tarifa-hora como se fosse requisito de negociação. A unidade comercial compreensível para a empresa é artigo + quantidade + especificação + preço por unidade/lote.

## 3. Distinção dos artefatos

### Orçamento

Documento orientado a quem produz. Deve apresentar:

- item;
- quantidade;
- tempo de referência;
- valor-hora utilizado;
- valor unitário calculado;
- total;
- método e natureza da estimativa;
- observações e limitações.

### Romaneio

Documento orientado à produção solicitada por empresa/marca. Deve apresentar:

- solicitante;
- artigo/modelo;
- quantidade;
- componentes e operações selecionadas;
- especificações conhecidas;
- tempo de referência;
- preço-alvo ou teto, quando informado;
- condição de aceite/ajuste;
- observações;
- identificação da solicitação;
- status.

O romaneio não deve expor o valor-hora privado de uma prestadora.

## 4. Apps Script + planilha privada

A primeira infraestrutura operacional pode utilizar Google Apps Script como camada de ingestão e uma planilha privada exclusiva da FEITURA.

A arquitetura recomendada é:

**Frontend FEITURA → endpoint Apps Script → validação → planilha privada → processos internos.**

Nunca:

**Frontend FEITURA → Google Sheets público / ID da planilha exposto.**

O ID da planilha, tokens e credenciais não devem aparecer no HTML, JavaScript público ou repositório.

### Estrutura inicial sugerida

- `SOLICITACOES`: pedidos de produção e metadados.
- `ITENS_SOLICITACAO`: artigos, operações e componentes associados.
- `ORCAMENTOS`: referências geradas e respostas.
- `PRESTADORES`: cadastro privado de capacidade e parâmetros produtivos.
- `OBSERVACOES_MERCADO`: preços efetivamente observados, origem, data, região, lote e condição.
- `GLOSSARIO_VERSOES`: versão da base técnica usada em cada cálculo.
- `AUDITORIA`: eventos de entrada, alteração, processamento e erro.

## 5. Dados de inteligência de mercado

O objetivo da coleta privada não é publicar automaticamente qualquer preço recebido.

Cada observação de mercado deve preservar, no mínimo:

- identificador do item;
- tipo de item;
- quantidade/lote;
- preço unitário;
- moeda;
- data;
- região;
- condição produtiva;
- origem da observação;
- método de obtenção;
- observação técnica;
- versão da base FEITURA utilizada.

Somente depois de volume e qualidade suficientes poderá existir uma referência pública agregada de mercado.

## 6. Modelo de cálculo

Para quem produz:

`preço unitário = tempo de referência (min) ÷ 60 × valor-hora do prestador`

Para quem contrata:

`hora implícita = preço máximo por unidade ÷ (tempo de referência (min) ÷ 60)`

Quando existir tarifa de mercado validada:

`preço sugerido = tempo de referência × tarifa de referência + adicionais aplicáveis`

A última fórmula só deve ser ativada quando a tarifa de referência tiver origem, data, escopo e método suficientemente documentados.

## 7. Contato e consentimento

No Gate 1, exportação e compartilhamento permanecem locais. Não há coleta remota de e-mail ou WhatsApp.

No Gate 2, o formulário de envio poderá solicitar contato somente quando necessário para a finalidade escolhida. O contato deve ser separado de:

- contribuição técnica;
- cadastro de prestador;
- autenticação;
- comunicação comercial;
- histórico de orçamento.

O usuário deve saber por que o dado está sendo solicitado e o que acontecerá com ele.

## 8. Critério de evolução

O Apps Script é adequado como primeira camada de ingestão e validação enquanto o volume e a complexidade permanecerem compatíveis com a operação.

A migração para banco relacional passa a ser recomendável quando houver necessidade de:

- concorrência elevada;
- relacionamentos complexos entre pedidos, itens e prestadores;
- autenticação e autorização granular;
- histórico transacional consistente;
- auditoria mais robusta;
- consultas analíticas recorrentes;
- isolamento de dados por usuário/empresa;
- filas e processamento assíncrono;
- crescimento que torne a planilha uma limitação operacional.

## 9. Regra central

A FEITURA deve saber **quanto trabalho existe**, **qual é a referência técnica**, **qual é a demanda**, **qual capacidade pode atendê-la** e **qual preço foi praticado**, sem confundir conhecimento público com dados privados de pessoas e empresas.
