#!/usr/bin/env python3
"""Build the flashcard app.

cards/*.md  +  srs.js  +  app.js  +  template.html  ->  docs/index.html (standalone, installable PWA)
                                              docs/sw.js     (content-stamped service worker)
                                              docs/manifest.webmanifest, docs/icons/*

Deck format (cards/NN_name.md):

    # Deck title
    > One-line description (optional)

    Q: question text
    A: answer text
    more answer lines, until a blank line
    S: short correct choice        (optional: makes the card available in Quiz mode)
    X: a plausible wrong choice    (2 to 4 of these, with S:)

Deep dives live in dives/NN_name.md (same names as the decks), one entry per card:

    ## the exact question text of the card
    ### What it is
    A paragraph. Blank lines separate paragraphs; lines starting "- " are bullets.
    ### Why this is the answer
    ...

They open when you don't know an answer. A dive whose question matches no card is a build error.

Lines starting with %% are comments. A line in an answer that must begin with Q:, A:, S: or X: is
written with a leading backslash (\\S: like this); the backslash is dropped. Text that sits outside
any card (for example a second paragraph after a blank line) is reported as a warning, not dropped
silently.

Everything is inlined, so the page makes no network requests and works offline.
"""
from __future__ import annotations

import hashlib
import json
import pathlib
import re
import sys
from typing import Optional

HERE = pathlib.Path(__file__).parent
CARDS = HERE / "cards"
DIVES = HERE / "dives"
DOCS = HERE / "docs"

APP_NAME = "SecOps Cards"
THEME = "#0f1419"


class DeckError(ValueError):
    pass


def card_id(deck_id: str, question: str) -> str:
    """Stable id from the question text. Editing a question resets that card's progress."""
    return hashlib.sha1(f"{deck_id}|{question}".encode()).hexdigest()[:10]


def parse_deck(deck_id: str, text: str, warnings: Optional[list] = None) -> dict:
    title, desc, cards = deck_id, "", []
    cur = None  # {"q": [...], "a": [...], "s": str|None, "x": [...], "in": "q"|"a"|"opt"}

    def flush(lineno: int) -> None:
        nonlocal cur
        if cur is None:
            return
        q, a = " ".join(cur["q"]).strip(), "\n".join(cur["a"]).strip()
        if not q or not a:
            raise DeckError(f"{deck_id}: card ending near line {lineno} needs both Q: and A:")
        card = {"id": card_id(deck_id, q), "q": q, "a": a}
        if cur["s"] is not None or cur["x"]:
            short, wrong = cur["s"], cur["x"]
            if not short or not 2 <= len(wrong) <= 4:
                raise DeckError(f"{deck_id}: '{q[:50]}' needs S: and 2-4 X: lines for Quiz mode")
            choices = [short, *wrong]
            if len({c.strip().lower() for c in choices}) != len(choices):
                raise DeckError(f"{deck_id}: '{q[:50]}' has a duplicate choice")
            card["s"], card["x"] = short, wrong
        cards.append(card)
        cur = None

    for n, line in enumerate(text.splitlines(), start=1):
        if line.startswith("%%"):
            continue  # comment
        if line[:1] == "\\" and line[1:3] in ("Q:", "A:", "S:", "X:") and cur is not None:
            # An escaped marker is plain text inside whatever part of the card is open.
            if cur["in"] == "opt":
                raise DeckError(f"{deck_id}: line {n}: text after S:/X: lines (start a new card with Q:)")
            cur[cur["in"]].append(line[1:].rstrip())
            continue
        if line.startswith("# ") and cur is None and not cards:
            title = line[2:].strip()
        elif line.startswith("> ") and cur is None and not cards:
            desc = line[2:].strip()
        elif line.startswith("Q:"):
            flush(n)
            cur = {"q": [line[2:].strip()], "a": [], "s": None, "x": [], "in": "q"}
        elif line.startswith("A:") and cur is not None and cur["in"] == "q":
            cur["in"] = "a"
            cur["a"].append(line[2:].strip())
        elif line.startswith("S:") and cur is not None and cur["in"] in ("a", "opt"):
            cur["in"] = "opt"
            cur["s"] = line[2:].strip()
        elif line.startswith("X:") and cur is not None and cur["in"] in ("a", "opt"):
            cur["in"] = "opt"
            cur["x"].append(line[2:].strip())
        elif cur is not None and cur["in"] == "opt" and line.strip():
            raise DeckError(f"{deck_id}: line {n}: text after S:/X: lines (start a new card with Q:)")
        elif not line.strip():
            flush(n)
        elif cur is not None:
            cur[cur["in"]].append(line.rstrip())
        elif warnings is not None:
            warnings.append(f"{deck_id}: line {n}: text outside a card was ignored: {line.strip()[:60]!r}")
    flush(len(text.splitlines()))

    seen = set()
    for c in cards:
        if c["id"] in seen:
            raise DeckError(f"{deck_id}: duplicate question: {c['q'][:60]}")
        seen.add(c["id"])
    return {"id": deck_id, "title": title, "desc": desc, "cards": cards}


def parse_dives(deck_id: str, text: str) -> dict:
    """Parse a dives file into {question: [{"h": heading, "b": [block, ...]}, ...]}."""
    dives: dict = {}
    question = None
    section = None
    buf: list = []

    def flush_block() -> None:
        if buf and section is not None:
            section["b"].append(" ".join(buf))
        buf.clear()

    def close_section(n: int) -> None:
        nonlocal section
        flush_block()
        if section is not None and not section["b"]:
            raise DeckError(f"{deck_id}: deep dive for '{question[:50]}' has an empty section '{section['h']}' (line {n})")
        section = None

    for n, line in enumerate(text.splitlines(), start=1):
        if line.startswith("%%"):
            continue
        if line.startswith("## "):
            close_section(n)
            question = line[3:].strip()
            if question in dives:
                raise DeckError(f"{deck_id}: duplicate deep dive for '{question[:50]}'")
            dives[question] = []
        elif line.startswith("### "):
            if question is None:
                raise DeckError(f"{deck_id}: line {n}: section before any '## question' line")
            close_section(n)
            section = {"h": line[4:].strip(), "b": []}
            dives[question].append(section)
        elif not line.strip():
            flush_block()
        elif section is None:
            if question is not None:
                raise DeckError(f"{deck_id}: line {n}: text before the first '### heading' of '{question[:40]}'")
            # text before the first entry (a file title or notes) is ignored
        elif line.startswith("- "):
            flush_block()
            buf.append(line.rstrip())
        else:
            buf.append(line.strip())
    close_section(len(text.splitlines()))
    for q, secs in dives.items():
        if not secs:
            raise DeckError(f"{deck_id}: deep dive for '{q[:50]}' has no sections")
    return dives


def attach_dives(deck: dict, dives: dict, path: str = "") -> None:
    """Add a "d" field to each card that has a deep dive. Unmatched dives are errors (usually a typo)."""
    by_q = {c["q"]: c for c in deck["cards"]}
    unknown = [q for q in dives if q not in by_q]
    if unknown:
        raise DeckError(f"{path or deck['id']}: deep dive matches no card: {unknown[0][:70]!r}")
    for q, secs in dives.items():
        by_q[q]["d"] = secs


def load_decks(directory: pathlib.Path = CARDS, warnings: Optional[list] = None,
               dives_dir: Optional[pathlib.Path] = DIVES) -> list[dict]:
    decks = []
    for path in sorted(directory.glob("*.md")):
        deck_id = re.sub(r"^\d+_", "", path.stem)
        deck = parse_deck(deck_id, path.read_text(encoding="utf-8"), warnings)
        dive_path = (dives_dir / path.name) if dives_dir else None
        if dive_path is not None and dive_path.is_file():
            attach_dives(deck, parse_dives(deck_id, dive_path.read_text(encoding="utf-8")), f"dives/{path.name}")
        if deck["cards"]:
            decks.append(deck)
    ids = [d["id"] for d in decks]
    if len(ids) != len(set(ids)):
        raise DeckError("two deck files share the same name after the numeric prefix")
    return decks


def json_for_script(obj) -> str:
    """JSON that is safe inside an inline <script>. Every "<" becomes \\u003c (valid JSON and JS), which
    rules out "</script>" and also "<!--", which can switch the HTML parser into a state where the real
    closing tag is ignored. U+2028/9 are escaped too because older JS parsers choke on them."""
    return (json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
            .replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))


def fill_template(template: str, values: dict) -> str:
    """Replace every __TOKEN__ in one pass, so substituted text is never itself searched for tokens."""
    pattern = re.compile("|".join(re.escape(k) for k in values))
    return pattern.sub(lambda m: values[m.group(0)], template)


ICON_SIZES = (180, 192, 512)
SHELL_FILES = ("index.html", "manifest.webmanifest", *(f"icons/icon-{n}.png" for n in ICON_SIZES))


def main() -> None:
    warnings: list = []
    decks = load_decks(warnings=warnings)
    if not decks:
        sys.exit("ERROR: no decks found in cards/")

    template = (HERE / "template.html").read_text(encoding="utf-8")
    values = {
        "__SRS__": (HERE / "srs.js").read_text(encoding="utf-8"),
        "__APP__": (HERE / "app.js").read_text(encoding="utf-8"),
        "__DATA__": json_for_script(decks),
    }
    for token in values:
        if token not in template:
            sys.exit(f"ERROR: template.html is missing {token}")
    page = fill_template(template, values)

    DOCS.mkdir(exist_ok=True)
    (DOCS / "icons").mkdir(exist_ok=True)
    if any(not (DOCS / "icons" / f"icon-{n}.png").exists() for n in ICON_SIZES):
        import make_icons
        make_icons.write_all(DOCS / "icons")

    (DOCS / "index.html").write_text(page, encoding="utf-8")
    # The same art is listed twice on purpose: "any" and "maskable" in one entry makes Android
    # crop art that was not drawn for masking. This icon keeps its content inside the safe zone.
    icons = [{"src": f"./icons/icon-{n}.png", "sizes": f"{n}x{n}", "type": "image/png", "purpose": purpose}
             for n in (192, 512) for purpose in ("any", "maskable")]
    (DOCS / "manifest.webmanifest").write_text(json.dumps({
        "name": APP_NAME, "short_name": "Cards", "start_url": "./", "scope": "./",
        "display": "standalone", "orientation": "portrait",
        "background_color": THEME, "theme_color": THEME, "icons": icons,
    }, indent=2), encoding="utf-8")
    version = hashlib.sha256(page.encode("utf-8")).hexdigest()[:12]
    sw = (HERE / "sw-template.js").read_text(encoding="utf-8").replace("__CACHE_VERSION__", version)
    (DOCS / "sw.js").write_text(sw, encoding="utf-8")
    (DOCS / ".nojekyll").write_text("")

    # The service worker pre-caches these at install. If one is missing the worker never installs
    # and the app silently loses offline support, so fail the build instead.
    missing = [f for f in SHELL_FILES if not (DOCS / f).is_file()]
    if missing:
        sys.exit("ERROR: app shell files missing from docs/: " + ", ".join(missing))

    total = sum(len(d["cards"]) for d in decks)
    quiz = sum(1 for d in decks for c in d["cards"] if "x" in c)
    dives = sum(1 for d in decks for c in d["cards"] if "d" in c)
    print(f"decks: {len(decks)}   cards: {total}   quiz-ready: {quiz}   deep dives: {dives}")
    for d in decks:
        q = sum(1 for c in d["cards"] if "x" in c)
        dv = sum(1 for c in d["cards"] if "d" in c)
        print(f"  {d['id']:<20}{len(d['cards']):>4}  quiz {q:>3}  dives {dv:>3}")
    print(f"page : docs/index.html ({(DOCS / 'index.html').stat().st_size / 1024:.0f} KB)   cache: secops-cards-{version}")
    for w in warnings:
        print("WARNING:", w, file=sys.stderr)


if __name__ == "__main__":
    main()
