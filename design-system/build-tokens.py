#!/usr/bin/env python3
"""NotaNext : génère design-system/tokens.css à partir de design-system/tokens.json.

Usage (depuis la racine du dépôt) :
    python3 design-system/build-tokens.py          # écrit tokens.css
    python3 design-system/build-tokens.py --check  # échoue si tokens.css n'est pas à jour

Python 3 standard, aucune dépendance. tokens.json est la SOURCE : ne modifie jamais tokens.css à la main.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "tokens.json"
OUT = HERE / "tokens.css"


def num(x):
    return str(int(x)) if float(x).is_integer() else str(x)


def css_value(token, tokens):
    ext = token.get("$extensions", {}).get("notanext", {})
    if "css" in ext:
        return ext["css"]
    v = token["$value"]
    if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
        return "var(--" + v[1:-1].replace(".", "-") + ")"
    if isinstance(v, dict) and "hex" in v:
        a = v.get("alpha", 1)
        if a == 1:
            return v["hex"]
        r, g, b = (round(c * 255) for c in v["components"])
        return f"rgba({r}, {g}, {b}, {num(a)})"
    if isinstance(v, dict) and "unit" in v:
        return f"{num(v['value'])}{v['unit']}"
    if isinstance(v, list):
        if all(isinstance(i, (int, float)) for i in v):
            return "cubic-bezier(" + ", ".join(num(i) for i in v) + ")"
        return ", ".join(f'"{i}"' if " " in i else i for i in v)
    return num(v) if isinstance(v, (int, float)) else str(v)


def walk(node, path, out):
    if not isinstance(node, dict):
        return
    if "$value" in node:
        out.append((path, node))
        return
    for k, v in node.items():
        if k.startswith("$"):
            continue
        walk(v, path + [k], out)


def build():
    tokens = json.loads(SRC.read_text(encoding="utf-8"))
    flat = []
    for group in ("color", "font", "space", "radius", "border", "motion", "breakpoint", "component"):
        walk(tokens[group], [group], flat)
    lines = [
        "/* GÉNÉRÉ par design-system/build-tokens.py à partir de tokens.json. NE PAS MODIFIER À LA MAIN. */",
        "/* NotaNext design tokens — version : voir design-system/README.md */",
        ":root {",
    ]
    last = None
    for path, tok in flat:
        section = path[0] + (("-" + path[1]) if path[0] in ("color", "font") else "")
        if section != last:
            lines.append(f"  /* {section} */")
            last = section
        lines.append(f"  --{'-'.join(path)}: {css_value(tok, tokens)};")
    alias = tokens["legacy-alias"]["$extensions"]["notanext"]["map"]
    lines.append("")
    lines.append("  /* Alias des anciennes variables (migration progressive : à supprimer quand plus utilisés) */")
    for old, new in alias.items():
        lines.append(f"  {old}: var({new});")
    lines.append("}")
    return "\n".join(lines) + "\n"


def main():
    css = build()
    if "--check" in sys.argv:
        current = OUT.read_text(encoding="utf-8") if OUT.exists() else ""
        if current != css:
            print("tokens.css n'est pas à jour : lance python3 design-system/build-tokens.py")
            sys.exit(1)
        print("tokens.css est à jour.")
        return
    OUT.write_text(css, encoding="utf-8")
    print(f"écrit {OUT} ({len(css.splitlines())} lignes)")


if __name__ == "__main__":
    main()
