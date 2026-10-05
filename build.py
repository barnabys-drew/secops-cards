#!/usr/bin/env python3
"""Build the flashcard app.

cards/*.md  +  srs.js  +  template.html  ->  docs/index.html (standalone, installable PWA)
                                              docs/sw.js     (content-stamped service worker)
                                              docs/manifest.webmanifest, docs/icons/*

Deck format (cards/NN_name.md):

    # Deck title
    > One-line description (optional)

    Q: question text
    A: answer text
    more answer lines, until a blank line

Everything is inlined, so the page makes no network requests and works offline.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).parent
CARDS = HERE / "cards"
DOCS = HERE / "docs"

APP_NAME = "SecOps Cards"
THEME = "#0f1419"


class DeckError(ValueError):
    pass


def card_id(deck_id: str, question: str) -> str:
    """Stable id from the question text. Editing a question resets that card's progress."""
    return hashlib.sha1(f"{deck_id}|{question}".encode()).hexdigest()[:10]


def parse_deck(deck_id: str, text: str) -> dict:
    title, desc, cards = deck_id, "", []
    cur = None  # {"q": [...], "a": [...], "in": "q"|"a"}

    def flush(lineno: int) -> None:
        nonlocal cur
        if cur is None:
            return
        q, a = " ".join(cur["q"]).strip(), "\n".join(cur["a"]).strip()
        if not q or not a:
            raise DeckError(f"{deck_id}: card ending near line {lineno} needs both Q: and A:")
        cards.append({"id": card_id(deck_id, q), "q": q, "a": a})
        cur = None

    for n, line in enumerate(text.splitlines(), start=1):
        if line.startswith("# ") and cur is None and not cards:
            title = line[2:].strip()
        elif line.startswith("> ") and cur is None and not cards:
            desc = line[2:].strip()
        elif line.startswith("Q:"):
            flush(n)
            cur = {"q": [line[2:].strip()], "a": [], "in": "q"}
        elif line.startswith("A:") and cur is not None and cur["in"] == "q":
            cur["in"] = "a"
            cur["a"].append(line[2:].strip())
        elif not line.strip():
            flush(n)
        elif cur is not None:
            cur[cur["in"]].append(line.rstrip())
        # any other text outside a card is ignored (notes to self)
    flush(len(text.splitlines()))

    seen = set()
    for c in cards:
        if c["id"] in seen:
            raise DeckError(f"{deck_id}: duplicate question: {c['q'][:60]}")
        seen.add(c["id"])
    return {"id": deck_id, "title": title, "desc": desc, "cards": cards}


def load_decks(directory: pathlib.Path = CARDS) -> list[dict]:
    decks = []
    for path in sorted(directory.glob("*.md")):
        deck_id = re.sub(r"^\d+_", "", path.stem)
        deck = parse_deck(deck_id, path.read_text())
        if deck["cards"]:
            decks.append(deck)
    ids = [d["id"] for d in decks]
    if len(ids) != len(set(ids)):
        raise DeckError("two deck files share the same name after the numeric prefix")
    return decks


def json_for_script(obj) -> str:
    # "</" would end the inline <script>; escape it. Also U+2028/9 break old JS parsers.
    return (json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
            .replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))


def main() -> None:
    decks = load_decks()
    if not decks:
        sys.exit("ERROR: no decks found in cards/")

    template = (HERE / "template.html").read_text()
    for token in ("__DATA__", "__SRS__"):
        if token not in template:
            sys.exit(f"ERROR: template.html is missing {token}")
    body = (template.replace("__SRS__", (HERE / "srs.js").read_text())
            .replace("__DATA__", json_for_script(decks)))

    DOCS.mkdir(exist_ok=True)
    (DOCS / "icons").mkdir(exist_ok=True)
    if not (DOCS / "icons" / "icon-512.png").exists():
        import make_icons
        make_icons.write_all(DOCS / "icons")

    page = body
    (DOCS / "index.html").write_text(page)
    (DOCS / "manifest.webmanifest").write_text(json.dumps({
        "name": APP_NAME, "short_name": "Cards", "start_url": "./", "scope": "./",
        "display": "standalone", "orientation": "portrait",
        "background_color": THEME, "theme_color": THEME,
        "icons": [
            {"src": "./icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": "./icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
        ],
    }, indent=2))
    version = hashlib.sha256(page.encode()).hexdigest()[:12]
    (DOCS / "sw.js").write_text((HERE / "sw-template.js").read_text().replace("__CACHE_VERSION__", version))
    (DOCS / ".nojekyll").write_text("")

    total = sum(len(d["cards"]) for d in decks)
    print(f"decks: {len(decks)}   cards: {total}")
    for d in decks:
        print(f"  {d['id']:<16}{len(d['cards']):>4}")
    print(f"page : docs/index.html ({(DOCS / 'index.html').stat().st_size / 1024:.0f} KB)   cache: cards-{version}")


if __name__ == "__main__":
    main()
