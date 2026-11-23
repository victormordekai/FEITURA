# FEITURA V1 · GATE 1.9.1 · PDF VETORIAL UNIFICADO

**Base:** GATE 1.8.0 (ZIP fornecido pelo usuário)  
**Data de reconstrução:** 2026-11-23  
**Natureza:** reconstrução técnica baseada na baseline e nos trechos/logs da sessão Claude de 2026-11-22. Não é cópia integral do clone local descartado.

## Decisão arquitetural

Um documento, uma geração, múltiplos destinos.

Após o consentimento na página `pages/documento.html`, o módulo `pdf-builder.js` gera um PDF A4 vetorial no próprio navegador. O mesmo objeto `File` é mantido em memória e reutilizado para impressão e compartilhamento. O registro JSON continua independente.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `js/modules/quote/pdf-builder.js` | Novo gerador PDF vetorial com jsPDF + jsPDF-AutoTable |
| `js/modules/quote/review-page.js` | Cache único da geração; impressão e compartilhamento consomem o mesmo PDF |
| `js/modules/quote/document-template.js` | Botão `VALIDAR E COMPARTILHAR`; remoção do ® do logotipo no cabeçalho |
| `js/modules/quote/document-export.js` | `APP_VERSION` atualizado para `GATE 1.9.1` |
| `README.md` | Identificação da versão reconstruída |

## Critérios implementados

- PDF A4 vetorial, independente da largura da tela.
- Tabela com cabeçalho repetido em páginas subsequentes.
- Cabeçalho FEITURA e rodapé com rastreabilidade, validação e paginação.
- Tentativa de aplicação da fonte oficial FEITURA no logotipo, com fallback tipográfico.
- Data/hora da validação registrada no PDF.
- Mesmo objeto `File` e mesma URL temporária para impressão e compartilhamento.
- Registro `.json` independente.
- Geração local no navegador; nenhum envio a servidor.

## Limites da recuperação

Os logs fornecidos registram testes por injeção no site publicado (1 item = 1 página; 22 itens = 2 páginas), mas não incluem o código integral do clone descartado nem evidências reproduzíveis desses testes. O `pdf-builder.js` desta entrega é uma reconstrução a partir do trecho parcial, da estrutura de dados da GATE 1.8.0 e dos critérios registrados.

## Validação técnica realizada nesta reconstrução

- Comparação da baseline e dos módulos relacionados.
- Verificação sintática dos módulos JavaScript.
- Verificação de integridade do ZIP.
- **Pendente:** teste funcional em navegador real para os dois perfis, documentos longos, compartilhamento nativo e impressão em desktop/celular.

## Procedimento de publicação

1. Fazer deploy em ambiente de teste, sem substituir a baseline arquivada.
2. Gerar documentos nos perfis `produzo` e `contrato`.
3. Testar 1 item, 22 itens e conteúdo longo em observações/variáveis.
4. Conferir cabeçalho, paginação, rodapé, fonte e caracteres monetários.
5. Confirmar que imprimir e compartilhar utilizam o mesmo PDF gerado.
6. Só então promover a GATE 1.9.1 para publicação.
