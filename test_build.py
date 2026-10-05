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

    def test_script_json_cannot_close_the_script_tag(self):
        self.assertNotIn("</script>", build.json_for_script({"a": "</script><b>"}))

    def test_real_decks_load_with_unique_ids(self):
        decks = build.load_decks()
        ids = [c["id"] for d in decks for c in d["cards"]]
        self.assertGreaterEqual(len(decks), 8)
        self.assertEqual(len(ids), len(set(ids)))


if __name__ == "__main__":
    unittest.main()
