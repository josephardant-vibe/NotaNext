#!/usr/bin/env python3
"""NotaNext : vérifie que le code respecte le design system (tokens.json).

Usage (depuis la racine du dépôt) :
    python3 design-system/check-design-system.py                  # rapport
    python3 design-system/check-design-system.py --write-baseline # fige la dette actuelle
    python3 design-system/check-design-system.py --strict         # échoue au moindre écart (sans baseline)

Principe « cliquet » : design-system/baseline.json garde le nombre d'écarts existants par règle.
La vérification ÉCHOUE si un nombre AUGMENTE (nouvelle dette) et réussit s'il baisse ou reste égal.
Les agents ne peuvent donc qu'améliorer le design, jamais l'aggraver. Python 3 standard, aucune dépendance.
"""
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
TOKENS = json.loads((HERE / "tokens.json").read_text(encoding="utf-8"))
BASELINE = HERE / "baseline.json"
SKIP_DIRS = {"node_modules", ".git", "design-system", "design", "dist", "build"}


def leaves(node, out):
    if isinstance(node, dict):
        if "$value" in node:
            out.append(node["$value"])
        else:
            for k, v in node.items():
                if not k.startswith("$"):
                    leaves(v, out)


def allowed_from(group):
    vals = []
    leaves(TOKENS[group], vals)
    return vals


ALLOWED_HEX = {v["hex"].lower() for v in allowed_from("color") if isinstance(v, dict) and "hex" in v}
ALLOWED_SIZES = {int(v["value"]) for v in allowed_from("font") if isinstance(v, dict) and v.get("unit") == "px"}
ALLOWED_RADII = {int(v["value"]) for v in allowed_from("radius") if isinstance(v, dict)} | {0}
ALLOWED_WEIGHTS = {v for v in allowed_from("font") if isinstance(v, (int,)) and v >= 100}
ALLOWED_BP = {int(v["value"]) for v in allowed_from("breakpoint") if isinstance(v, dict)}
ALLOWED_MS = {int(v["value"]) for v in allowed_from("motion") if isinstance(v, dict) and v.get("unit") == "ms"}

RULES = {
    "color-literal": "Couleur écrite en dur hors des jetons (utiliser var(--color-sys-...)).",
    "pure-white": "Blanc pur (#fff ou rgba(255,255,255,…)) : le papier est #FAF6EF.",
    "font-size-off-scale": "Taille de police hors de l'échelle (12, 14, 16, 20, 24, 30, 38, 48).",
    "radius-off-scale": "Rayon hors de l'échelle (8, 12, 20, 999, 50 %).",
    "font-weight-off-scale": "Graisse hors de 400, 500, 600.",
    "shadow": "Ombre portée : interdite (hiérarchie par filets).",
    "glass": "backdrop-filter (verre) : réservé au hero de l'accueil.",
    "breakpoint-off-grid": "Largeur de rupture hors de 520, 760, 1000.",
    "duration-off-scale": "Durée de transition ou d'animation hors de 120, 180, 250 ms.",
    "font-family-literal": "Police écrite en dur (utiliser var(--font-family-...)).",
    "ambient-animation": "Animation infinie d'ambiance (à retirer si la direction « papier statique » est validée).",
}


def strip_comments(text):
    return re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), text, flags=re.S)


def line_of(text, pos):
    return text.count("\n", 0, pos) + 1


def px_values(value):
    return [float(x) for x in re.findall(r"(-?\d+(?:\.\d+)?)px", value)]


def check_css(path, text, found):
    clean = strip_comments(text)
    # Aucune exception pour :root : déclarer une nouvelle couleur dans une variable ne contourne pas la règle.
    inside = lambda p: False

    def add(rule, pos, snippet):
        found.setdefault(rule, []).append(f"{path.relative_to(ROOT)}:{line_of(clean, pos)}  {snippet.strip()[:90]}")

    for m in re.finditer(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)", clean):
        if inside(m.start()):
            continue
        tok = m.group(0).lower()
        if tok in ("#fff", "#ffffff") or re.match(r"rgba?\(\s*255\s*,\s*255\s*,\s*255", tok):
            add("pure-white", m.start(), tok)
        elif tok.startswith("#") and tok not in ALLOWED_HEX:
            add("color-literal", m.start(), tok)
        elif tok.startswith("rgb") and "33, 29, 24" not in tok:
            add("color-literal", m.start(), tok)
    for m in re.finditer(r"([a-z-]+)\s*:\s*([^;{}]+)", clean):
        if inside(m.start()):
            continue
        prop, val = m.group(1).lower(), m.group(2).strip()
        if prop == "font-size" and "var(" not in val and "clamp" not in val and "%" not in val and "em" not in val:
            for n in px_values(val):
                if int(n) != n or int(n) not in ALLOWED_SIZES:
                    add("font-size-off-scale", m.start(), f"{prop}: {val}")
        elif prop == "border-radius" and "var(" not in val:
            for n in px_values(val):
                if int(n) != n or int(n) not in ALLOWED_RADII:
                    add("radius-off-scale", m.start(), f"{prop}: {val}")
        elif prop == "font-weight" and "var(" not in val and val.isdigit() and int(val) not in ALLOWED_WEIGHTS:
            add("font-weight-off-scale", m.start(), f"{prop}: {val}")
        elif prop == "box-shadow" and val != "none" and "var(" not in val:
            if not re.match(r"^inset\s+0\s+0?\s*0\s+", val) and not val.startswith("inset 0 1px 0"):
                add("shadow", m.start(), f"{prop}: {val}")
        elif prop == "backdrop-filter" and val != "none":
            add("glass", m.start(), f"{prop}: {val}")
        elif prop == "font-family" and "var(" not in val and path.name != "fonts.css":  # @font-face : le nom de la famille doit y être écrit en toutes lettres
            add("font-family-literal", m.start(), f"{prop}: {val}")
        elif prop in ("transition", "animation"):
            for num, unit in re.findall(r"(\d*\.?\d+)(ms|s)\b", val):
                ms = float(num) * (1000 if unit == "s" else 1)
                if prop == "animation" and "infinite" in val and ms >= 10000:
                    add("ambient-animation", m.start(), f"{prop}: {val}")
                elif int(ms) not in ALLOWED_MS and not (prop == "animation" and ms >= 1000):
                    add("duration-off-scale", m.start(), f"{prop}: {val}")
                break
    for m in re.finditer(r"@media[^{]*\((?:max|min)-width:\s*(\d+)px\)", clean):
        if int(m.group(1)) not in ALLOWED_BP:
            add("breakpoint-off-grid", m.start(), m.group(0))


def check_other(path, text, found):
    """Couleurs en dur dans le JS et le HTML (SVG, styles en ligne)."""
    for m in re.finditer(r"#[0-9a-fA-F]{6}\b", text):
        if m.group(0).lower() not in ALLOWED_HEX and m.group(0).lower() != "#ffffff":
            found.setdefault("color-literal", []).append(
                f"{path.relative_to(ROOT)}:{line_of(text, m.start())}  {m.group(0)}")


def scan(root):
    found = {}
    for p in sorted(root.rglob("*")):
        if not p.is_file() or any(part in SKIP_DIRS for part in p.relative_to(root).parts):
            continue
        try:
            text = p.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if p.suffix == ".css":
            check_css(p, text, found)
        elif p.suffix in (".js", ".html"):
            check_other(p, text, found)
    return found


def main():
    found = scan(ROOT)
    counts = {r: len(found.get(r, [])) for r in RULES}
    if "--write-baseline" in sys.argv:
        BASELINE.write_text(json.dumps(counts, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print("baseline écrite :", counts)
        return
    base = json.loads(BASELINE.read_text(encoding="utf-8")) if BASELINE.exists() and "--strict" not in sys.argv else {}
    worse = []
    print("Design system : vérification\n")
    for rule, desc in RULES.items():
        n = counts[rule]
        b = base.get(rule, 0)
        flag = "OK " if n <= b else "NOUVEAU"
        print(f"[{flag:7s}] {rule:22s} {n:4d} (base {b:4d})  {desc}")
        if n > b:
            worse.append(rule)
            for line in found[rule][-5:]:
                print("            ", line)
    if worse:
        print("\nÉCHEC : nouvelle dette de design sur :", ", ".join(worse))
        print("Corrige avec les jetons (design-system/tokens.css) ou explique l'exception dans la PR.")
        sys.exit(1)
    print("\nRéussi : aucune nouvelle dette de design.")


if __name__ == "__main__":
    main()
