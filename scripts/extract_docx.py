#!/usr/bin/env python3
"""Extrae las fotos y claves de técnica de Rutina_Gym_L5.docx.

Uso:  python3 -I scripts/extract_docx.py Rutina_Gym_L5.docx

Recorre word/document.xml en el orden en que aparecen el texto y las imágenes, y asocia cada
imagen al ejercicio que se nombra junto a ella (misma fila de tabla o el título más cercano).
Si no logra asociarlas por cercanía, usa el orden de aparición, como indica el documento.

Genera:
  public/exercises/<id>.<ext>   imagen de cada ejercicio
  src/data/media.json           { id: { image, technique } } que la app aplica sobre el catálogo
  scripts/docx_report.txt       recorrido completo del documento para revisar la asociación
"""

from __future__ import annotations

import json
import re
import sys
import unicodedata
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS = {
    "w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "r": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "v": "urn:schemas-microsoft-com:vml",
    "rel": "http://schemas.openxmlformats.org/package/2006/relationships",
}
W = "{%s}" % NS["w"]
R_EMBED = "{%s}embed" % NS["r"]
R_ID = "{%s}id" % NS["r"]

ROOT = Path(__file__).resolve().parent.parent

# Ejercicios con imagen, en el orden de la rutina, con variantes de nombre para buscarlos en el texto.
EXERCISES: list[tuple[str, list[str]]] = [
    ("curl-up-mcgill", ["curl-up de mcgill", "curl up de mcgill", "curl-up", "curl up"]),
    ("plancha-lateral", ["plancha lateral", "side plank"]),
    ("bird-dog", ["bird dog", "bird-dog"]),
    ("press-pecho-maquina", ["press de pecho en maquina", "press pecho maquina"]),
    ("press-inclinado-mancuernas", ["press inclinado con mancuernas"]),
    ("pec-deck-invertido", ["pec deck invertido", "peck deck invertido", "reverse pec deck"]),
    ("pec-deck", ["pec deck", "peck deck"]),
    ("press-hombro-maquina", ["press de hombro en maquina", "press de hombro"]),
    ("elevaciones-laterales-sentado", ["elevaciones laterales"]),
    ("triceps-polea", ["triceps en polea"]),
    ("pallof-press", ["pallof press", "pallof"]),
    ("jalon-pecho", ["jalon al pecho", "jalon"]),
    ("remo-maquina-apoyo-pecho", ["remo en maquina con apoyo de pecho", "remo en maquina"]),
    ("remo-mancuerna-una-mano", ["remo con mancuerna a una mano", "remo con mancuerna"]),
    ("face-pull", ["face pull"]),
    ("curl-banco-inclinado", ["curl en banco inclinado"]),
    ("curl-martillo-sentado", ["curl martillo"]),
    ("dead-bug", ["dead bug", "dead-bug"]),
    ("prensa-una-pierna", ["prensa a una pierna", "prensa unilateral"]),
    ("prensa", ["prensa"]),
    ("belt-squat", ["belt squat"]),
    ("extension-cuadriceps", ["extension de cuadriceps", "extension de cuadriceps"]),
    ("curl-femoral-sentado", ["curl femoral sentado", "curl femoral"]),
    ("abductores-maquina", ["abductores"]),
    ("pantorrilla-sentado", ["pantorrilla sentado", "pantorrilla"]),
    ("suitcase-carry", ["suitcase carry"]),
    ("press-inclinado-maquina", ["press de pecho inclinado en maquina", "press inclinado en maquina"]),
    ("remo-polea-sentado", ["remo en polea sentado", "remo en polea"]),
    ("dominadas-asistidas", ["dominadas asistidas", "dominadas"]),
    ("biceps-polea", ["biceps en polea"]),
    ("plancha-frontal", ["plancha frontal"]),
    ("hip-thrust", ["hip thrust"]),
    ("patada-gluteo-polea", ["patada de gluteo"]),
    ("caminata-cinta", ["caminata en cinta", "cinta inclinada"]),
]

TECHNIQUE_PREFIX = re.compile(r"^\s*(clave|tecnica|técnica|tip|consejo|nota)[^:]*:\s*", re.IGNORECASE)


def normalize(text: str) -> str:
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^a-z0-9\s-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def find_exercises(text: str) -> list[str]:
    """Ids de ejercicios nombrados en el texto, sin solapar variantes (p. ej. 'pec deck invertido')."""
    norm = f" {normalize(text)} "
    found: list[tuple[int, str]] = []
    taken: list[tuple[int, int]] = []
    for exercise_id, aliases in EXERCISES:
        for alias in aliases:
            needle = f" {normalize(alias)}"
            start = norm.find(needle)
            if start < 0:
                continue
            end = start + len(needle)
            if any(start < t_end and end > t_start for t_start, t_end in taken):
                continue
            taken.append((start, end))
            found.append((start, exercise_id))
            break
    return [exercise_id for _, exercise_id in sorted(found)]


def paragraph_text(p: ET.Element) -> str:
    parts = []
    for node in p.iter():
        if node.tag == W + "t" and node.text:
            parts.append(node.text)
        elif node.tag == W + "tab":
            parts.append(" ")
        elif node.tag == W + "br":
            parts.append("\n")
    return "".join(parts).strip()


def paragraph_images(p: ET.Element) -> list[str]:
    ids = [blip.get(R_EMBED) for blip in p.iter("{%s}blip" % NS["a"])]
    ids += [img.get(R_ID) for img in p.iter("{%s}imagedata" % NS["v"])]
    return [i for i in ids if i]


def walk(body: ET.Element):
    """Bloques en orden de documento: (tipo, valor, fila_de_tabla)."""
    row_counter = 0

    def visit(element: ET.Element, row: int | None):
        nonlocal row_counter
        for child in element:
            if child.tag == W + "p":
                text = paragraph_text(child)
                if text:
                    yield ("text", text, row)
                for rid in paragraph_images(child):
                    yield ("image", rid, row)
            elif child.tag == W + "tr":
                row_counter += 1
                yield from visit(child, row_counter)
            else:
                yield from visit(child, row)

    yield from visit(body, None)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    docx_path = Path(sys.argv[1])
    if not docx_path.exists():
        print(f"No encuentro {docx_path}. Copia Rutina_Gym_L5.docx a la raíz del proyecto.")
        return 1

    with zipfile.ZipFile(docx_path) as archive:
        document = ET.fromstring(archive.read("word/document.xml"))
        rels = ET.fromstring(archive.read("word/_rels/document.xml.rels"))
        targets = {
            rel.get("Id"): rel.get("Target")
            for rel in rels.findall("rel:Relationship", NS)
            if rel.get("Type", "").endswith("/image")
        }
        body = document.find("w:body", NS)
        blocks = list(walk(body))

        report: list[str] = []
        mentions: list[tuple[int, str]] = []  # (índice de bloque, id)
        for index, (kind, value, row) in enumerate(blocks):
            if kind == "text":
                ids = find_exercises(value)
                for exercise_id in ids:
                    mentions.append((index, exercise_id))
                report.append(f"[{index:03}] fila={row} TEXTO {value!r} -> {ids}")
            else:
                report.append(f"[{index:03}] fila={row} IMAGEN {targets.get(value)}")

        images = [(i, targets[v]) for i, (k, v, _) in enumerate(blocks) if k == "image" and v in targets]

        # 1) Asociación por cercanía: misma fila de tabla o el nombre más cercano antes de la imagen.
        assignment: dict[str, tuple[int, str]] = {}
        for image_index, target in images:
            row = blocks[image_index][2]
            candidates = []
            if row is not None:
                candidates = [eid for i, eid in mentions if blocks[i][2] == row]
            if not candidates:
                before = [(i, eid) for i, eid in mentions if i < image_index and image_index - i <= 4]
                after = [(i, eid) for i, eid in mentions if i > image_index and i - image_index <= 2]
                if before:
                    candidates = [before[-1][1]]
                elif after:
                    candidates = [after[0][1]]
            for exercise_id in candidates:
                if exercise_id not in assignment:
                    assignment[exercise_id] = (image_index, target)
                    break

        # 2) Si la cercanía no asoció casi nada, usar el orden de aparición de los ejercicios.
        if len(assignment) < len(images) // 2:
            print("Asociación por cercanía insuficiente; uso el orden de aparición.")
            assignment = {}
            ordered_ids: list[str] = []
            for _, exercise_id in mentions:
                if exercise_id not in ordered_ids:
                    ordered_ids.append(exercise_id)
            for (image_index, target), exercise_id in zip(images, ordered_ids):
                assignment[exercise_id] = (image_index, target)

        # Claves de técnica: texto con prefijo "Clave:"/"Técnica:" o el texto siguiente al nombre.
        techniques: dict[str, str] = {}
        for mention_index, exercise_id in mentions:
            if exercise_id in techniques:
                continue
            for kind, value, _ in blocks[mention_index + 1 : mention_index + 4]:
                if kind != "text":
                    continue
                if find_exercises(value) and not TECHNIQUE_PREFIX.match(value):
                    break
                if TECHNIQUE_PREFIX.match(value):
                    techniques[exercise_id] = TECHNIQUE_PREFIX.sub("", value).strip()
                    break

        out_dir = ROOT / "public" / "exercises"
        out_dir.mkdir(parents=True, exist_ok=True)
        media: dict[str, dict[str, str]] = {}
        for exercise_id, (_, target) in assignment.items():
            source = "word/" + target.lstrip("/").removeprefix("word/")
            extension = Path(target).suffix.lower()
            if extension not in {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}:
                print(f"  {exercise_id}: formato {extension} no compatible con navegadores, se omite")
                continue
            (out_dir / f"{exercise_id}{extension}").write_bytes(archive.read(source))
            media[exercise_id] = {"image": f"exercises/{exercise_id}{extension}"}
        for exercise_id, technique in techniques.items():
            media.setdefault(exercise_id, {})["technique"] = technique

    (ROOT / "src" / "data" / "media.json").write_text(
        json.dumps(media, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )
    (ROOT / "scripts" / "docx_report.txt").write_text("\n".join(report) + "\n", encoding="utf-8")

    missing = [eid for eid, _ in EXERCISES if eid not in media or "image" not in media[eid]]
    print(f"Imágenes en el documento: {len(images)}")
    print(f"Ejercicios con imagen: {len(media)}")
    print(f"Ejercicios con clave de técnica del documento: {len(techniques)}")
    if missing:
        print("Sin imagen (usarán placeholder): " + ", ".join(missing))
    print("Revisa scripts/docx_report.txt para comprobar la asociación.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
