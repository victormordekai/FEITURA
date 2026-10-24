# Contador agregado de visitas FEITURA®

O frontend já contém o módulo `js/modules/counter.js`, mas o endpoint permanece vazio até a implantação do Web App do Google Apps Script.

## Implantação

1. Crie uma planilha privada exclusiva da FEITURA®.
2. Abra Extensões > Apps Script.
3. Cole `Code.gs`.
4. Execute `setup()` uma vez e autorize o projeto.
5. Implante como Web App, executando como o proprietário e permitindo acesso público ao endpoint.
6. Copie a URL do Web App para `COUNTER_ENDPOINT` em `js/modules/counter.js`.
7. Publique novamente o site.

O endpoint devolve apenas o número agregado de visitas. A implementação não solicita nome, e-mail, WhatsApp, IP ou outro identificador pessoal.

O contador mede chamadas ao endpoint, portanto representa **visitas**, não visitantes únicos.
