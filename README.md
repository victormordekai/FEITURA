# FEITURA V1 · GATE 1.8.0

Conexão produtiva entre demanda, capacidade e trabalho. Site estático (GitHub Pages), sem backend no Gate 1.

## Estrutura

```
index.html, pages/          páginas
css/                        estilos globais e por página
js/main.js                  inicialização
js/modules/quote/           motor da cotação (orçamento / romaneio)
js/data/glossary-data.js    banco técnico público — GERADO, não editar
data/                       planilha-fonte do banco técnico
tools/build_glossary.py     gerador planilha → JS
docs/                       registros de gates e arquitetura
backend/apps-script/        contador agregado de visitas
```

## Banco técnico

A planilha `data/FEITURA_banco_cronometria_v1.xlsx` é a fonte única. Depois de editá-la:

```bash
pip install openpyxl          # uma vez
python3 tools/build_glossary.py
python3 tools/build_glossary.py --check   # confirma que o JS está em dia
```

Todo registro precisa de ID único (operações por família, como `BOL-001`; `MOD-xxx`, `CONS-xxx`, `REF-xxx`, `FON-xxx`, `MET-xxx`). A versão em `Metadados` acompanha cada documento gerado.

## Cotação

`pages/cotar.html?perfil=produzo` gera um orçamento a partir do valor-hora.
`pages/cotar.html?perfil=contrato` gera um romaneio a partir do preço-alvo e nunca expõe valor-hora.

Detalhes da arquitetura e das correções: `docs/GATE_1_8_0_REFATORACAO_COTACAO_2026-11-09.md`.

## Rodar localmente

Módulos ES exigem servidor HTTP:

```bash
python3 -m http.server 8000
# http://localhost:8000
```
