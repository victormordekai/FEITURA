# FEITURA Gate 1.1 | Revisão final, romaneio e rastreabilidade

## Objetivo

A versão Gate 1.1 separa a página operacional `cotar.html` do documento final de leitura e impressão.

Fluxo:

`COTAR` → `REVISAR E VALIDAR ROMANEIO` → `suafeitura` transitório → concordância de manuseio de dados → `VALIDAR E IMPRIMIR`.

A revisão é um HTML transitório gerado localmente por JavaScript. Ele recebe uma cópia do estado do orçamento, mas não contém campos editáveis para o usuário.

## Valor/hora e personalização

Quando `A PARTIR DO SEU VALOR/HORA` está selecionado, a FEITURA calcula o valor unitário pela referência de tempo e pelo valor/hora informado.

O valor unitário passa a ser editável diretamente na tabela do orçamento. O valor calculado permanece registrado no campo `calculatedUnitPrice`, enquanto o valor efetivamente utilizado no romaneio fica em `unitPrice`.

Isso preserva a distinção entre:

- referência técnica calculada;
- ajuste comercial realizado pelo usuário;
- valor efetivamente utilizado no documento.

A alteração não modifica `glossary-data.js`.

## Rastreabilidade

Cada documento recebe um identificador no formato:

`suafeitura + YYYYMMDDHHMMSS + quantidade de itens em 4 dígitos + total inteiro em 4 dígitos + fingerprint de 4 caracteres`

Exemplo conceitual:

`suafeitura2026102522100100210206A7F3`

O identificador aparece no documento final e nos arquivos de exportação.

O fingerprint não é uma assinatura criptográfica. Ele serve como componente adicional de diferenciação operacional.

## Registro Gate 1

O documento de revisão permite baixar um JSON de registro com o mesmo identificador do romaneio:

`suafeitura...json`

O registro contém somente informações operacionais necessárias à rastreabilidade do orçamento, como quantidade de itens, itens, tempos, valores calculados, valores personalizados, quantidade, total, referência de valor e data/hora. O registro de rastreabilidade não inclui nome de contato, endereço, campos `DE`/`PARA` ou prazo.

### Limitação técnica importante

GitHub Pages é uma infraestrutura de publicação estática. JavaScript executado no navegador **não consegue gravar automaticamente um arquivo dentro de `FEITURA/docs/` nem alterar o repositório GitHub**.

Portanto, Gate 1.1 não simula uma gravação remota inexistente.

O protocolo implementado deixa o registro pronto para futura ingestão por Apps Script, Python ou outro backend. No Gate 1, o JSON é gerado e baixado localmente pelo navegador. A gravação efetiva em `docs/`, banco ou endpoint depende de uma infraestrutura de escrita, prevista para Gate 2.

## Concordância e impressão

A impressão somente é habilitada depois que o usuário marca a caixa de concordância apresentada na revisão final.

A concordância não constitui, isoladamente, um termo jurídico completo de LGPD. Ela funciona como confirmação operacional de que o usuário compreendeu o escopo do tratamento necessário à geração do documento. A redação jurídica definitiva deve ser validada antes de qualquer implantação de tratamento de dados pessoais em infraestrutura persistente.

## Arquitetura de transição

```text
cotar.html
   │
   ├── estado local do orçamento
   ├── base técnica local
   ├── cálculo por valor/hora ou valor padrão
   ├── ajuste manual do valor unitário
   │
   ▼
HTML transitório "sua FEITURA"
   │
   ├── leitura não editável
   ├── rastreabilidade
   ├── concordância
   ├── geração de registro JSON
   │
   ▼
VALIDAR E IMPRIMIR
   │
   ├── PDF pelo mecanismo de impressão do navegador
   └── registro pronto para futura ingestão

Gate 2
   │
   └── endpoint / Apps Script / Python / banco relacional
```
