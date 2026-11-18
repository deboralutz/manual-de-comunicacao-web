#!/usr/bin/env python3
"""Verificação estática do acervo usado no site do Manual."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT
errors = []
warnings = []


def require(path: Path) -> None:
    if not path.is_file():
        errors.append(f"Arquivo necessário ausente: {path.relative_to(ROOT)}")


for path in [
    SITE / "index.html",
    SITE / ".nojekyll",
    SITE / "assets" / "app.js",
    SITE / "assets" / "style.css",
    SITE / "course.json",
    SITE / "activities.json",
    SITE / "visuals.json",
]:
    require(path)

if errors:
    print("\n".join(errors))
    sys.exit(1)

course = json.loads((SITE / "course.json").read_text(encoding="utf-8"))
activities = json.loads((SITE / "activities.json").read_text(encoding="utf-8"))
visuals = json.loads((SITE / "visuals.json").read_text(encoding="utf-8"))

lessons = course["lessons"]
paths = [item["path"] for item in lessons]
if len(paths) != 52:
    errors.append(f"Esperadas 52 aulas; encontradas {len(paths)}.")
if len(set(paths)) != len(paths):
    errors.append("Existem caminhos duplicados no índice.")
codes = [item["code"] for item in lessons]
if len(set(codes)) != len(codes):
    errors.append("Existem números de aula duplicados.")
aliases = [alias for item in lessons for alias in item.get("aliases", [])]
if len(set(aliases)) != len(aliases) or set(aliases) & set(paths):
    errors.append("Os caminhos antigos devem ser únicos e diferentes dos atuais.")
for item in lessons:
    if not re.fullmatch(r"[1-5]\.\d{2}[ab]?-[a-z0-9-]+\.md", Path(item["path"]).name):
        errors.append(f"Nome fora do padrão: {item['path']}")
if len(course["parts"]) != 5:
    errors.append("O catálogo deveria conter cinco partes.")

for lesson in lessons:
    doc = SITE / lesson["path"]
    require(doc)
    if not doc.exists():
        continue
    content = doc.read_text(encoding="utf-8")
    if len(content.strip()) < 200:
        errors.append(f"Aula aparentemente incompleta: {lesson['path']}")
    if re.search(r"\bMein Licht\b|\bOi,\s*Mein Licht\b", content, flags=re.I):
        errors.append(f"Saudação da conversa encontrada na versão web: {lesson['path']}")
    if re.search(r"<(?:radio-group|box|AppBlock|Chart)\b", content):
        warnings.append(f"Marcação específica da conversa permanece em {lesson['path']}")
    if "images.openai.com/static-rsc" in content:
        warnings.append(f"Imagem externa sujeita a indisponibilidade: {lesson['path']}")

known = set(paths)
for i, activity in enumerate(activities):
    if activity.get("path") not in known:
        errors.append(f"Atividade {i} aponta para uma aula inexistente: {activity.get('path')}")
    if activity.get("type") == "checklist" and not activity.get("items"):
        errors.append(f"Checklist {i} sem itens.")
    if activity.get("type") == "worksheet" and not activity.get("fields"):
        errors.append(f"Ficha {i} sem campos.")
    if activity.get("type") not in ("checklist", "worksheet", None, "selection"):
        errors.append(f"Tipo desconhecido na atividade {i}: {activity.get('type')}")
for i, visual in enumerate(visuals):
    if visual.get("path") not in known:
        errors.append(f"Figura {i} aponta para uma aula inexistente.")
    if "<svg" not in visual.get("html", "") and "<div" not in visual.get("html", ""):
        warnings.append(f"Figura {i}: revisar marcação HTML.")

js = (SITE / "assets" / "app.js").read_text(encoding="utf-8")
html = (SITE / "index.html").read_text(encoding="utf-8")
for filename in ("course.json", "activities.json", "visuals.json"):
    if filename not in js:
        errors.append(f"O navegador não está configurado para carregar {filename}.")
for element_id in ("view", "sidebar", "nav", "lesson-search", "toc"):
    if f'id="{element_id}"' not in html:
        errors.append(f"Elemento da interface não encontrado: {element_id}")

print(f"Acervo: {len(lessons)} aulas; {len(activities)} atividades; {len(visuals)} visuais.")
for warning in warnings:
    print("AVISO:", warning)
for error in errors:
    print("ERRO:", error)
if errors:
    sys.exit(1)
print("OK: integridade estrutural verificada. Não substitui teste visual no navegador.")
