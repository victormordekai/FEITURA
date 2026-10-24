# FEITURA® | Gate 1 — Entrega final consolidada

Data: 24/10/2026

## Escopo consolidado

Esta versão reúne as intervenções do Gate 1 em uma árvore única:

- identidade tipográfica FEITURA® preservada exclusivamente para o wordmark;
- tipografia estrutural do site preservada;
- assets de favicon, monograma e compartilhamento social;
- correções de responsividade e composição do Hero;
- glossário público técnico integrado à cotação;
- seleção individual de artigos, operações e serviços;
- exportação local de catálogo, orçamento e romaneio;
- distinção entre quem produz e quem contrata produção;
- função explícita `FEITURA(x) = ax + b` com resolução de `FEITURA`, `x`, `a` ou `b`;
- manifesto editorial e administrativo em `pages/manifesto.html`;
- caminho de retorno para FEITURA no navbar do manifesto;
- contador agregado preparado para Apps Script + planilha privada;
- especificação do backend preservando a separação entre dados públicos e dados internos.

## Fronteiras

O cálculo público continua local. Nenhuma informação de orçamento é enviada automaticamente para uma base remota nesta versão.

O contador de visitas é apenas um módulo preparado. A URL do Web App deve ser configurada em `js/modules/counter.js` depois da implantação do Apps Script. Até essa configuração, o contador permanece oculto.

O contador mede visitas/chamadas ao endpoint, não visitantes únicos.

## Base técnica

O glossário público utiliza os registros incorporados no Gate 1. A natureza dos dados permanece explicitada: estimativa não é cronometragem, e referência de fonte não é tarifa universal de mercado.

## Função do valor

A interface passa a tratar o orçamento como função explícita:

`FEITURA(x) = ax + b`

- `x`: quantidade;
- `a`: componente variável por unidade/lote;
- `b`: componente fixo associado ao custo de oportunidade;
- `FEITURA`: valor resultante do orçamento.

O motor também permite resolver uma variável a partir das demais quando os dados fornecidos são suficientes.

## Validação executada

- sintaxe dos módulos JavaScript verificada com Node.js;
- parsing dos HTMLs executado;
- caminhos e assets existentes conferidos na árvore do projeto;
- arquivos de fonte e imagens mantidos nos formatos recebidos;
- backend Apps Script incluído como componente separado e não exposto ao frontend como base de dados.

A validação visual automatizada depende de navegador headless e não deve ser considerada concluída apenas por validação sintática.
