import unittest

import build


class ParseDeck(unittest.TestCase):
    def test_title_desc_and_multiline_answer(self):
        deck = build.parse_deck("x", "# Title\n> About\n\nQ: one?\nA: first\nsecond line\n\nQ: two?\nA: only\n")
        self.assertEqual((deck["title"], deck["desc"]), ("Title", "About"))
        self.assertEqual([c["q"] for c in deck["cards"]], ["one?", "two?"])
        self.assertEqual(deck["cards"][0]["a"], "first\nsecond line")

    def test_card_without_answer_is_an_error(self):
        with self.assertRaises(build.DeckError):
            build.parse_deck("x", "Q: lonely question\n\nQ: ok\nA: yes\n")

    def test_duplicate_questions_rejected(self):
        with self.assertRaises(build.DeckError):
            build.parse_deck("x", "Q: same\nA: 1\n\nQ: same\nA: 2\n")

    def test_ids_stable_and_scoped_to_deck(self):
        self.assertEqual(build.card_id("a", "q"), build.card_id("a", "q"))
        self.assertNotEqual(build.card_id("a", "q"), build.card_id("b", "q"))

    def test_notes_outside_cards_are_ignored(self):
        self.assertEqual(len(build.parse_deck("x", "# T\n\nsome note to self\n\nQ: q\nA: a\n")["cards"]), 1)

    def test_quiz_options_parse_and_cards_without_them_stay_flashcard_only(self):
        deck = build.parse_deck("x", "Q: one?\nA: long answer\nS: short\nX: w1\nX: w2\nX: w3\n\nQ: two?\nA: only\n")
        self.assertEqual((deck["cards"][0]["s"], deck["cards"][0]["x"]), ("short", ["w1", "w2", "w3"]))
        self.assertNotIn("x", deck["cards"][1])

    def test_incomplete_or_duplicate_quiz_options_rejected(self):
        for bad in ("Q: q\nA: a\nS: s\nX: only one\n",
                    "Q: q\nA: a\nX: w1\nX: w2\n",
                    "Q: q\nA: a\nS: same\nX: Same\nX: other\n",
                    "Q: q\nA: a\nS: s\nX: w1\nX: w2\nstray text\n"):
            with self.assertRaises(build.DeckError, msg=bad):
                build.parse_deck("x", bad)

    def test_script_json_cannot_close_the_script_tag(self):
        self.assertNotIn("</script>", build.json_for_script({"a": "</script><b>"}))

    def test_script_json_has_no_angle_brackets_and_round_trips(self):
        import json
        obj = [{"q": "<!--<script>alert(1)</script>", "a": "a < b > c"}]
        out = build.json_for_script(obj)
        self.assertNotIn("<", out)           # rules out </script> and <!--, which can hide the closing tag
        self.assertEqual(json.loads(out), obj)

    def test_template_fill_is_single_pass(self):
        # a substituted value that looks like another token must not be substituted again
        out = build.fill_template("[__A__][__B__]", {"__A__": "__B__", "__B__": "x"})
        self.assertEqual(out, "[__B__][x]")

    def test_text_outside_a_card_is_reported_not_lost_silently(self):
        warnings = []
        build.parse_deck("x", "# T\n\nQ: q\nA: first paragraph\n\nsecond paragraph after a blank line\n", warnings)
        self.assertEqual(len(warnings), 1)
        self.assertIn("second paragraph", warnings[0])

    def test_comments_are_silent_and_percent_text_is_kept(self):
        warnings = []
        deck = build.parse_deck("x", "%% note to self\nQ: q\nA: 40% of cases\n%% another\n", warnings)
        self.assertEqual(warnings, [])
        self.assertEqual(deck["cards"][0]["a"], "40% of cases")

    def test_escaped_markers_are_plain_text(self):
        deck = build.parse_deck("x", "Q: q\nA: intro\n\\S: this line starts with S:\n\\Q: and this with Q:\n")
        self.assertEqual(deck["cards"][0]["a"], "intro\nS: this line starts with S:\nQ: and this with Q:")
        self.assertNotIn("s", deck["cards"][0])

    def test_real_decks_have_no_warnings(self):
        warnings = []
        build.load_decks(warnings=warnings)
        self.assertEqual(warnings, [])

    def test_built_shell_is_complete_and_icons_are_not_double_purpose(self):
        import json
        for f in build.SHELL_FILES:
            self.assertTrue((build.DOCS / f).is_file(), f)
        icons = json.loads((build.DOCS / "manifest.webmanifest").read_text(encoding="utf-8"))["icons"]
        self.assertTrue(icons)
        for icon in icons:
            self.assertNotIn(" ", icon["purpose"])   # "any maskable" in one entry crops art on Android
        self.assertEqual({i["purpose"] for i in icons}, {"any", "maskable"})

    def test_deep_dive_parsing_blocks_bullets_and_sections(self):
        text = ("# file title ignored\n\n## Why?\n### What it is\nFirst line\nsame paragraph.\n\nSecond paragraph.\n"
                "- bullet one\n- bullet two\n### Why this is the answer\nBecause.\n")
        dives = build.parse_dives("x", text)
        secs = dives["Why?"]
        self.assertEqual([s["h"] for s in secs], ["What it is", "Why this is the answer"])
        self.assertEqual(secs[0]["b"], ["First line same paragraph.", "Second paragraph.", "- bullet one", "- bullet two"])

    def test_deep_dive_errors(self):
        for bad in ("## Q\n### Empty\n### Next\ntext\n",         # empty section
                    "## Q\nloose text before any heading\n",
                    "### Section with no question\ntext\n",
                    "## Q\n### A\nx\n## Q\n### A\ny\n",           # duplicate
                    "## Q\n"):                                     # no sections
            with self.assertRaises(build.DeckError, msg=bad):
                build.parse_dives("x", bad)

    def test_deep_dive_must_match_a_card(self):
        deck = build.parse_deck("x", "Q: real question\nA: a\n")
        build.attach_dives(deck, build.parse_dives("x", "## real question\n### H\ntext\n"))
        self.assertEqual(deck["cards"][0]["d"], [{"h": "H", "b": ["text"]}])
        with self.assertRaises(build.DeckError):
            build.attach_dives(deck, build.parse_dives("x", "## real questoin\n### H\ntext\n"))

    def test_real_decks_load_with_unique_ids(self):
        decks = build.load_decks()
        ids = [c["id"] for d in decks for c in d["cards"]]
        self.assertGreaterEqual(len(decks), 8)
        self.assertEqual(len(ids), len(set(ids)))


if __name__ == "__main__":
    unittest.main()
