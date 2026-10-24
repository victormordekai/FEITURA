# FEITURA® | Gate 2 — Especificação arquitetural independente

## Princípio

Gate 2 introduz persistência, identidade e histórico sem misturar dados públicos de conhecimento produtivo com dados privados de usuários ou prestadores.

A interface do Gate 1 deve permanecer substituível sem reescrever o domínio.

## Camadas

1. Interface
2. Regras de negócio
3. Cálculos
4. Repositório de dados
5. Serviços externos

## Domínios

### Conhecimento técnico público

- produtos e famílias;
- modelos e variantes;
- operações;
- sequências;
- máquinas/equipamentos;
- pontos e tipos de costura;
- componentes;
- materiais;
- parâmetros técnicos;
- tempos de referência;
- método de estimativa;
- fonte técnica;
- glossário;
- versão metodológica.

### Dados privados

- usuário;
- perfil;
- permissões;
- preferências;
- consentimentos;
- cálculos;
- histórico;
- itens calculados;
- contribuições técnicas voluntárias.

### Prestadores

- perfil produtivo;
- localização;
- capacidades;
- serviços;
- disponibilidade;
- histórico de relacionamento.

### Governança

- eventos de auditoria;
- versões de metodologia;
- administração;
- retenção;
- correção;
- exportação;
- exclusão;
- incidentes.

## Identidade

Situações lógicas separadas:
- anônimo;
- autenticado;
- prestador.

Usuário anônimo do estimador não deve ser implicitamente convertido em perfil de prestador.

## Histórico

Todo cálculo persistido deve registrar:
- metodologia utilizada;
- versão dos dados técnicos;
- parâmetros de entrada;
- resultado;
- timestamp;
- identidade, quando aplicável.

Uma atualização futura da base técnica não deve alterar silenciosamente resultados históricos.

## Persistência

Critérios de avaliação para a próxima decisão:
- custo;
- concorrência;
- isolamento;
- autenticação;
- autorização;
- backup;
- auditoria;
- portabilidade;
- manutenção;
- limites de crescimento.

Google Apps Script + Sheets pode servir a protótipos controlados, mas não deve ser assumido como banco privado multiusuário sem isolamento e autorização verificáveis.

Uma solução relacional gerenciada tende a ser o ponto de referência para a primeira arquitetura persistente, desde que custo e complexidade sejam compatíveis com a escala real.

## Segurança e LGPD

A autorização deve ser validada no servidor.

Segredos não podem existir no frontend ou repositório público.

A próxima camada deve prever:
- HTTPS;
- controle de acesso;
- validação de entrada;
- isolamento de dados;
- rate limiting;
- backup;
- recuperação de desastre;
- monitoramento;
- resposta a incidentes;
- transparência de tratamento;
- acesso, correção, exportação e exclusão quando aplicáveis;
- separação entre autenticação, contribuição técnica, cadastro de prestador e comunicação comercial.

Gate 2 não deve ser implementado junto com Gate 1.
