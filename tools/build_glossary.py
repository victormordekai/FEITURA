"""FEITURA® · gerador do banco técnico público.

Fonte única:  data/FEITURA_banco_cronometria_v1.xlsx
Saída:        js/data/glossary-data.js   (não editar à mão)

Uso:
    python3 tools/build_glossary.py
    python3 tools/build_glossary.py --check   # falha se o JS estiver desatualizado

Requer: openpyxl  (pip install openpyxl)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "FEITURA_banco_cronometria_v1.xlsx"
OUTPUT = ROOT / "js" / "data" / "glossary-data.js"

# Planilha (português) → registro público (inglês). A ordem define a ordem das chaves no JS.
SHEETS = {
    "operations": ("Glossario_Operacoes", "operation", {
        "id_operacao": "id", "nome_operacao": "name", "familia": "category",
        "material_tipico": "material", "sequencia_explodida": "sequence",
        "maquinas_ferramentas": "machines", "qtd_subprocessos_estimados": "subprocesses",
        "tempo_min_min": "min", "tempo_min_max": "max", "metodo_tempo": "method",
        "confianca": "confidence", "observacoes": "notes", "tempo_medio_min": "avg",
        "base_estimativa": "basis",
    }),
    "models": ("Modelos_Vestuario", "model", {
        "id_modelo": "id", "produto_modelo": "name", "familia_material": "material_family",
        "qtd_operacoes_estimadas": "operations", "tempo_costura_min_min": "min",
        "tempo_costura_min_max": "max", "observacoes": "notes",
        "tempo_medio_estimado_min": "avg", "natureza_dado": "data_nature",
        "escopo": "scope", "fonte_referencia": "sources",
    }),
    "repairs": ("Catalogo_Consertos", "repair", {
        "id": "id", "nome": "name", "preco_minimo": "price_min", "preco_maximo": "price_max",
        "preco_medio_sugerido": "price_avg", "moeda": "currency", "origem_preco": "price_origin",
        "regra_preenchimento": "fill_rule", "ativo": "active",
        "processos_estimados_min": "processes", "tempo_estimado_min_min": "min",
        "tempo_estimado_max_min": "max", "tempo_medio_estimado_min": "avg",
        "base_cronometria": "basis", "tipo_tempo": "time_type",
        "confianca_inicial": "confidence", "observacao_tecnica": "notes",
    }),
    "sources": ("Fontes_Tutoriais", None, {
        "id_fonte": "id", "fonte": "name", "url": "url", "tipo": "type",
        "uso_e_limitacao": "limitation",
    }),
    "methods": ("Metodo_Cronometria", None, {
        "id_metodo": "id", "conceito": "term", "regra_operacional": "rule",
    }),
}


def rows(workbook, sheet: str) -> list[dict]:
    values = list(workbook[sheet].iter_rows(values_only=True))
    header = [str(h).strip() if h is not None else None for h in values[0]]
    return [dict(zip(header, row)) for row in values[1:] if any(v is not None for v in row)]


def mapped(row: dict, mapping: dict, record_type: str | None, sheet: str) -> dict:
    missing = [col for col in mapping if col not in row]
    if missing:
        raise SystemExit(f"[{sheet}] colunas ausentes: {', '.join(missing)}")
    record = {key: row[col] for col, key in mapping.items()}
    if record_type:
        record["type"] = record_type
    return record


def special_references(workbook) -> list[dict]:
    variables: dict[str, list] = {}
    for row in rows(workbook, "Variaveis_Especiais"):
        field = {"key": row["chave"], "label": row["rotulo"], "type": row["tipo"]}
        if row.get("opcoes"):
            field["options"] = [o.strip() for o in str(row["opcoes"]).split("|")]
        if row.get("unidade"):
            field["unit"] = row["unidade"]
        if row.get("exemplo"):
            field["placeholder"] = row["exemplo"]
        variables.setdefault(row["id_referencia"], []).append(field)
    return [
        {"id": r["id_referencia"], "name": r["nome"], "category": r["categoria"],
         "notes": r["observacoes"], "variables": variables.get(r["id_referencia"], [])}
        for r in rows(workbook, "Referencias_Especiais")
    ]


def validate(data: dict) -> None:
    seen: set[str] = set()
    for group in ("operations", "models", "repairs", "sources", "methods", "specialReferences"):
        for record in data[group]:
            rid = record.get("id")
            if not rid:
                raise SystemExit(f"[{group}] registro sem id: {record.get('name') or record.get('term')}")
            if rid in seen:
                raise SystemExit(f"id duplicado: {rid}")
            seen.add(rid)


def build() -> str:
    workbook = openpyxl.load_workbook(SOURCE, data_only=True)
    meta = {r["chave"]: r["valor"] for r in rows(workbook, "Metadados")}
    data = {"version": str(meta["versao"]), "updated": str(meta["atualizado"])}
    for group, (sheet, record_type, mapping) in SHEETS.items():
        data[group] = [mapped(r, mapping, record_type, sheet) for r in rows(workbook, sheet)]
    data["specialReferences"] = special_references(workbook)
    validate(data)

    def block(name: str) -> str:
        items = ",\n".join("    " + json.dumps(i, ensure_ascii=False) for i in data[name])
        return f'  "{name}": [\n{items}\n  ]'

    groups = ["operations", "models", "repairs", "specialReferences", "sources", "methods"]
    body = ",\n".join([f'  "version": "{data["version"]}"', f'  "updated": "{data["updated"]}"'] + [block(g) for g in groups])
    return (
        "// GERADO AUTOMATICAMENTE por tools/build_glossary.py — não editar à mão.\n"
        f"// Fonte: data/{SOURCE.name}\n"
        f"export const glossaryData = {{\n{body}\n}};\n"
    )


def main() -> None:
    content = build()
    if "--check" in sys.argv:
        current = OUTPUT.read_text(encoding="utf-8") if OUTPUT.exists() else ""
        if current != content:
            raise SystemExit("glossary-data.js desatualizado: rode tools/build_glossary.py")
        print("glossary-data.js em dia com a planilha.")
        return
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(content, encoding="utf-8")
    print(f"gerado: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
