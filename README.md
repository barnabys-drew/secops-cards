# SecOps Cards

Spaced-repetition flashcards for security engineering: AI/LLM security, MCP and agents, cloud
incident response, Terraform, detection engineering, and Python for security work. One
self-contained page that installs to a phone's home screen and works offline (a train, a plane).

Two ways to study the same decks, switched at the top of the home screen:

- **Flashcards**: read the question, recall the answer, then grade yourself. Tests recall.
- **Quiz**: pick the right answer from four choices, then read the full explanation. Tests
  recognition, and suits scenario questions ("which category is this?").

Each mode keeps its own schedule, because recognizing an answer is easier than recalling it and
should not stretch your recall intervals. Review counts from both modes add up for your daily total.

## Decks (`cards/*.md`)

| Deck | Covers |
| --- | --- |
| owasp_llm | OWASP LLM Top 10 (2025) plus scenario recognition and controls |
| atlas_attack | MITRE ATLAS, ATT&CK tactics, and the cloud techniques that matter for AWS |
| agents_mcp | MCP trust model, tool poisoning, lethal trifecta, agent identity, eval design |
| ai_governance | NIST AI RMF, ISO 42001, vendor AI reviews, AI inventory, AI IR playbooks |
| terraform | Core concepts, state security, policy-as-code, a minimal AWS detection stack |
| aws_ir | CloudTrail, GuardDuty, IAM compromise containment, EC2 isolation, evidence handling |
| detection_siem | Detection lifecycle, Sigma/OCSF, data lakes, SOAR, measuring coverage |
| python_security | Beginner Python, boto3 pitfalls, injection traps |

## Add or edit cards

Cards are plain markdown, so you can edit them on any device:

```
Q: What does CloudTrail log file integrity validation prove?
A: That log files were not altered or deleted after delivery.
second line of the answer, if needed
```

Add `S:` (a short correct choice) and 2 to 4 `X:` lines (plausible wrong choices) to make a card
available in Quiz mode. The `A:` text is then shown as the explanation after answering:

```
Q: What does CloudTrail log file integrity validation prove?
A: That log files were not altered or deleted after delivery.
S: Log files were not altered or deleted after delivery
X: Logs were encrypted at rest
X: Logs were compressed
X: Noise events were filtered out
```

Cards without `S:`/`X:` still work as flashcards and are skipped in Quiz mode. A blank line ends a
card. Wrap code in `backticks`. A card's progress is keyed to its question
text, so rewording a question resets that one card. Then rebuild:

```bash
python3 build.py        # writes docs/index.html, sw.js, manifest, icons
```

## Scheduling

SM-2 variant. Flashcards: Again / Hard / Good / Easy. Quiz: a right answer counts as Good and a
wrong one as Again. First reviews at 1 and 3 days, then growing by an ease
factor (1.3 to 3.0). Missed cards come back a few cards later in the same session. At most 15 new
cards a day (adjustable). The day rolls over at 3am, so late-night study counts for the day you
haven't slept on. Keys: in Flashcards Space shows the answer and 1-4 grade; in Quiz 1-4 answer and
Space goes to the next question; `z` undoes and Esc leaves.

## Your progress

Stored in the browser's localStorage on each device. It does not sync. Settings has Export and
Import to move it between devices, and a backup is worth taking before clearing browser data.

## Tests

```bash
npm install && npm test   # scheduler (node:test), full UI in jsdom, deck parser (unittest)
```

The facts in the decks are written from knowledge, not copied from sources. Technique IDs and
framework versions change, so check anything you plan to quote against the primary source.
