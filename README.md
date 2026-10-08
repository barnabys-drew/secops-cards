# SecOps Cards

Spaced-repetition flashcards for security engineering: AI/LLM security, MCP and agents, cloud
incident response, Terraform, detection engineering, and Python for security work. One
self-contained page that installs to a phone's home screen and works offline (a train, a plane).

Two ways to study the same decks, switched at the top of the home screen:

- **Flashcards**: read the question, recall the answer, then grade yourself. Tests recall.
- **Quiz**: pick the right answer from four choices, then read the full explanation. Tests
  recognition, and suits scenario questions ("which category is this?").

**Deep dives.** When you don't know an answer, say so (the "I don't know: teach me" button, or key `0`) and
the app counts it as a miss and opens a deep dive: what the thing is, why that is the right answer, and
how to tell it apart from the look-alikes. The same happens when you mark a flashcard Again or pick a wrong
quiz answer. When you do know it, the dive is still one tap away (key `d` toggles it).

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
| data_lake_platform | Greenfield SIEM: medallion layers, pipelines, cost, UEBA, risk-based alerting, the AI layer |
| ai_ir_automation | AI agents in IR: graduated autonomy, evals, shadow mode, prompt injection in logs |
| ir_case_lead | Leading cases: roles, scoping, decision logs, exec updates, post-incident reviews |

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
card, so keep an answer's paragraphs together; text left outside any card is reported as a warning
when you build. Wrap code in `backticks`.

Deep dives live in `dives/`, in a file with the same name as the deck, one entry per card. The `##`
line must match the card's question exactly (the build fails on a typo):

```
## What does CloudTrail log file integrity validation prove?
### What it is
A paragraph. Blank lines separate paragraphs; lines starting with "- " are bullets.
### Why this is the answer
More text. Use `code` and **bold** if you need them.
```

- `%% like this` is a comment line and is ignored.
- An answer line that must begin with `Q:`, `A:`, `S:` or `X:` is written with a leading backslash
  (`\S: like this`); the backslash is dropped. A card's progress is keyed to its question
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
Import replaces everything on that device and checks the file first: a malformed backup is
rejected, and individual records that don't make sense are skipped and counted. If the saved data
on a device ever can't be read, the app starts fresh, says so, and keeps a copy of the unreadable
data in the browser instead of overwriting it.

Offline: the whole app is stored when it is first opened and served from that copy, so it opens
instantly on a weak connection. A new version arrives the next time you open it with signal.

## Tests

```bash
npm install && npm test   # scheduler, service worker, full UI in jsdom, deck parser/build (unittest)
```

The facts in the decks are written from knowledge, not copied from sources. Technique IDs and
framework versions change, so check anything you plan to quote against the primary source.
