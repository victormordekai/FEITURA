# FEITURA® Gate 1 — Arquitetura da cotação e base técnica

## Onde está o banco de dados no Gate 1

A base técnica pública usada pela `cotar.html` está em:

`js/modules/glossary-data.js`

Ela é importada pelo módulo:

`js/modules/glossary.js`

A página `pages/cotar.html` não mantém registros técnicos duplicados no HTML. O HTML fornece apenas a interface. O JavaScript lê a base, transforma os registros em itens selecionáveis e usa os campos técnicos para calcular tempo e valor.

Fluxo atual:

`glossary-data.js` → `glossary.js` → seleção na `cotar.html` → estado local da cotação → orçamento / romaneio → exportação local

## O que é banco e o que é cotação

São duas camadas diferentes.

### Base técnica

É o conjunto de registros públicos de artigos, operações, consertos/serviços, métodos e fontes. A base contém, conforme o tipo de registro, tempo mínimo, máximo, médio, sequência, máquinas, subprocessos, natureza do dado, confiança e fonte/basis.

No Gate 1 ela é somente leitura. Uma cotação não altera `glossary-data.js`.

### Cotação

É um estado temporário criado pelo usuário no navegador. Ele contém:

- itens selecionados da base técnica;
- quantidade do lote;
- valor-hora informado pelo produtor;
- teto por unidade informado pelo contratante;
- linhas próprias adicionadas manualmente;
- valores calculados e totais.

Uma linha própria é deliberadamente marcada como `Linha própria` e não entra silenciosamente na base técnica.

## Como o banco entra no orçamento

Para cada item selecionado:

`tempo médio (min) → tempo em horas → valor-hora → valor unitário → valor do lote`

Para produtor:

`valor unitário = (tempo médio / 60) × valor-hora`

`total = valor unitário × quantidade`

Para conserto/serviço que já possui preço de referência na base, o Gate 1 pode utilizar esse valor quando o valor-hora não foi informado.

Para contratante, o teto por unidade pode ser comparado com o tempo de referência para obter uma hora implícita:

`hora implícita = teto por unidade ÷ (tempo médio / 60)`

## Inserção de novas linhas

A área `Nova linha` da cotação permite inserir um serviço ou item que ainda não esteja na base pública.

Essa linha possui:

- descrição;
- tempo por unidade, quando conhecido;
- valor unitário, quando conhecido.

Se o valor unitário não for informado e houver valor-hora, o valor é calculado pelo mesmo princípio da base:

`valor unitário = (tempo / 60) × valor-hora`

A linha fica na cotação atual e pode ser removida. Ela não altera a base pública.

Essa separação é necessária para evitar que uma estimativa feita por um usuário seja confundida com conhecimento técnico validado.

## Documento gerado

O orçamento/romaneio aparece dentro da própria `cotar.html`, imediatamente após os parâmetros da cotação.

Ele é alimentado pelo estado atual e contém:

- item/serviço;
- origem (`Base técnica` ou `Linha própria`);
- tempo;
- valor unitário;
- total;
- remoção de linhas próprias.

A ação `Montar orçamento` ou `Montar romaneio` leva o usuário diretamente ao documento.

`Ver / imprimir orçamento` usa a impressão nativa do navegador para PDF.

`Exportar CSV` gera o documento em formato tabular.

## Função do valor

A seção `FEITURA(x) = ax + b` permanece como camada conceitual e matemática independente da base técnica.

Ela demonstra explicitamente a composição do orçamento e resolve `FEITURA`, `x`, `a` ou `b` conforme a variável selecionada.

A implementação permanece local no navegador no Gate 1.

## Limite de persistência

O Gate 1 não grava alterações do usuário em um banco remoto. Portanto:

- selecionar um registro não altera a base;
- adicionar uma linha não altera a base;
- alterar valor-hora não altera a base;
- recarregar a página encerra o estado temporário da cotação.

A persistência e a atualização governada da base são responsabilidade do Gate 2.

## Evolução prevista para Gate 2

A arquitetura pode separar posteriormente:

1. base técnica pública e versionada;
2. contribuições/novos registros submetidos por usuários;
3. cotações privadas;
4. histórico de orçamentos;
5. metodologia/versionamento dos cálculos;
6. banco privado de pesquisa de custos e preços de mercado;
7. autenticação, permissões, auditoria e LGPD.

Uma futura integração com Google Apps Script/Sheets ou banco relacional deve ocorrer atrás de uma camada de serviço, sem transformar o `glossary-data.js` público em banco privado.
