# FEITURA | Gate 1.4
## HUD de revisão e cadastro na Rede

### Correções e ajustes

1. **HUD de revisão em `cotar.html`**
   - corrigida a inversão de estado que ocultava o HUD quando a seção `05 / REVISÃO FINAL` estava abaixo da viewport;
   - o HUD permanece acessível enquanto flutuante;
   - quando o topo da seção final alcança a viewport, o mesmo elemento retorna ao fluxo estático da página;
   - não há duplicação do botão nem dois motores de acionamento;
   - `data-open-review` continua acionando o mesmo fluxo de `sua FEITURA`;
   - `aria-hidden` não é mais utilizado como mecanismo de ocultação visual do controle;
   - `tabindex=-1` foi removido da lógica flutuante para preservar acessibilidade;
   - animação continua respeitando `prefers-reduced-motion`.

2. **`rede.html`**
   - adicionada seção final equivalente à seção de cadastro de `capacidade.html`;
   - CTA `CADASTRAR-SE NO HUB FEITURA`;
   - CTA `PARTICIPAR DE MENTORIA RETEAR`;
   - ambos usam `button button-dark`;
   - mensagens do WhatsApp preservadas conforme o fluxo já definido em `capacidade.html`;
   - `capacity.css` incluído para compartilhar a mesma regra visual e responsiva.

### Validação

- `node --check` executado em `hud-document.js` e `main.js`.
- `cotar.html`, `capacidade.html` e `rede.html` parseados com sucesso.
- HUD, atributo `data-open-review`, stylesheet dedicado e seção de cadastro da Rede verificados estruturalmente.
- Não foi alegado teste automatizado de navegador quando o ambiente não o permite.
