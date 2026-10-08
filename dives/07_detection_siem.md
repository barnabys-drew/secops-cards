%% Deep dives for cards/07_detection_siem.md.

## Detection engineering lifecycle
### What it is
Detection engineering treats detections as products with a life cycle.
- **Hypothesis:** a specific attacker behavior you want to catch.
- **Data check:** confirm the logs that would show it actually exist.
- **Write** the logic, **test** it, **tune** it, **deploy** it.
- **Measure** how it performs, and **retire or revise** it when it stops being useful.
### Why this is the answer
Skipping steps is how teams end up with noisy or dead rules. Starting with the data check avoids writing detections for logs you do not collect, and the final steps keep the set healthy over time. "Buy, install, forget" is the opposite of a life cycle.
### Remember it
Hypothesize, check data, build, test, tune, ship, measure, retire.

## What is detection-as-code?
### What it is
Managing detection rules like software: stored in version control, reviewed by peers, tested automatically in CI, and deployed by a pipeline.
### Why this is the answer
Rules edited directly in a console have no history, review or tests, so a change can break detection without anyone noticing. With code you can see who changed what and why, roll back, and prove a rule still fires after a change.
### Remember it
Treat detections like code: review, test, deploy, roll back.

## Sigma, YARA, Suricata: what does each cover?
### What it is
- **Sigma:** a vendor-neutral format (YAML) for **log** detection rules, which can be converted into queries for different SIEMs.
- **YARA:** rules that match patterns in **files and memory**, used for malware.
- **Suricata (and Snort):** rules for **network traffic**.
### Why this is the answer
Each looks at a different kind of evidence. Mixing them up leads you to write the wrong kind of rule, such as trying to detect a CloudTrail event with YARA.
### Remember it
Sigma = logs. YARA = files. Suricata = network.

## Precision vs recall for detections
### What it is
- **Precision:** of the alerts that fired, how many were real threats.
- **Recall:** of the real threats that occurred, how many were caught.
### Why this is the answer
They pull against each other. Making a rule broader catches more (higher recall) but adds noise (lower precision), and tightening it does the opposite. The right balance depends on the cost of a miss versus the cost of noise for that particular threat.
### Remember it
Precision: are my alerts real? Recall: did I catch the real ones?

## The Pyramid of Pain, bottom to top
### What it is
David Bianco's model ranks indicators by how much trouble it causes an attacker when you detect or block them. From easiest to hardest for the attacker to change: hash values, IP addresses, domain names, network and host artifacts, tools, and TTPs (tactics, techniques and procedures).
### Why this is the answer
Blocking a file hash costs the attacker a recompile. Detecting their behavior forces them to change how they operate, which is expensive. It argues for investing in detections near the top of the pyramid.
### Remember it
Hashes are trivial to change; behavior is painful to change.

## What does Atomic Red Team give you?
### What it is
A library of small, scripted tests, each mapped to a MITRE ATT&CK technique, that you can run in a safe environment to see whether your detections fire.
### Why this is the answer
A detection that has never been tested is a guess. Atomic tests turn "we think we cover this technique" into evidence. It is a testing tool, not a threat feed, a playbook library or a query language.
### Remember it
Small attacks on demand to check your alarms.

## Why is "we have a rule for every technique" not coverage?
### What it is
Counting techniques with at least one rule overstates your ability to detect them.
### Why this is the answer
A technique can be executed in many ways (procedures), and a rule typically catches a few. A rule also needs working log sources, testing and tuning to be useful. Measure the share of detections that are tested, firing and tuned, not rule counts.
### Remember it
A rule is a claim. A tested rule is evidence.

## Why monitor log source health?
### What it is
Tracking that expected logs keep arriving, at the expected volume, from each source.
### Why this is the answer
Detections fail silently when their data stops. If a log forwarder breaks, the SIEM shows nothing wrong because nothing arrives. Alerting on silence or sharp volume drops catches that before an attacker takes advantage of it.
### Remember it
No logs does not mean no attacks.

## OCSF and ECS
### What it is
The Open Cybersecurity Schema Framework (OCSF) and the Elastic Common Schema (ECS) are standard sets of field names for security data.
### Why this is the answer
If every log source uses different names for the same thing (user, source IP), each detection needs custom logic per source. Normalizing to a shared schema lets one detection work across many sources and makes data easier to share and query.
### Remember it
Same field names across sources means write the rule once.

## Layers of a security data lake
### What it is
A common design has three layers.
- **Raw:** data as received, kept immutable.
- **Normalized:** converted to a common schema such as OCSF.
- **Curated or enriched:** cleaned, joined and shaped for detections and investigations.
### Why this is the answer
Keeping raw data lets you reprocess when parsers improve or mistakes are found. The normalized layer makes queries consistent, and the curated layer makes common questions fast and cheap.
### Remember it
Keep the original, standardize it, then shape it for use.

## Why Parquet for security logs in S3?
### What it is
Parquet is a **columnar**, compressed file format. Data is partitioned, for example by date and source.
### Why this is the answer
Queries on logs usually touch a few columns across many rows. Columnar storage lets engines like Athena read only the needed columns, and partitioning skips irrelevant files. Both cut cost and time compared with plain text or row-based formats.
### Remember it
Read less data and pay less to read it.

## Streaming detection vs querying the lake
### What it is
- **Streaming:** evaluate events as they arrive, for low-latency alerts.
- **Querying the lake:** run scheduled queries over stored data.
### Why this is the answer
Streaming is faster but costs more to run and operate. Scheduled queries are cheaper and suit hunting and detections where minutes of delay are fine. Most programs use both, reserving streaming for the urgent cases.
### Remember it
Fast and pricey, or cheap and a little late. Use both.

## What is SOAR?
### What it is
Security orchestration, automation and response: platforms that run playbooks which enrich an alert, make a decision, take an action, and document the outcome.
### Why this is the answer
It removes repetitive manual steps from triage and response. Destructive actions such as disabling an account should pass through human approval, and playbooks need testing like any other code.
### Remember it
Playbooks that do the routine work, with a person guarding the big actions.

## What does it mean to manage an MDR provider?
### What it is
A managed detection and response provider watches your environment and responds, but you stay accountable. Managing them means owning escalation paths and SLAs, giving tuning feedback, defining what actions they may take, and checking what they miss.
### Why this is the answer
Outsourcing monitoring does not outsource accountability. Handing over everything or only reading a monthly report leaves gaps no one is covering.
### Remember it
They watch. You stay responsible.

## SOC tiers
### What it is
- **Tier 1:** triages alerts and escalates.
- **Tier 2:** investigates and responds.
- **Tier 3:** hunts, builds detections, and handles the hardest incidents.
### Why this is the answer
The tiers separate volume from depth so experts spend time where it matters. Many modern teams blur the tiers, but the progression from triage to investigation to engineering still describes the work.
### Remember it
Triage, investigate, engineer.

## MTTD and MTTR
### What it is
Mean time to detect and mean time to respond (or resolve).
### Why this is the answer
They show how quickly threats are noticed and handled. A mean can hide long tails: one incident that went unnoticed for months matters more than a hundred quick ones. Track them per incident type and watch the worst cases.
### Remember it
Averages hide the incidents that hurt.

## What does a good alert runbook contain?
### What it is
What fired and why it matters, how to verify it, what enrichment to pull, common false positives, containment steps, and when to escalate.
### Why this is the answer
A runbook turns an alert into a repeatable decision. An alert name alone, a phone number or the rule's query leaves the analyst to improvise.
### Remember it
What is it, is it real, what next, who to call.

## Where to start an AI enablement roadmap for detection and response
### What it is
Start with high-volume, low-risk, well-understood tasks such as summarizing alerts, enriching them and drafting tickets. Measure results against analyst verdicts, then expand autonomy only where the data supports it.
### Why this is the answer
Giving AI full autonomy on day one, replacing tier 1 immediately or starting with the most severe incidents puts risk first and evidence last. Earning trust with measurement lets you grow safely.
### Remember it
Start small and measured; grow autonomy as evidence grows.

## What is a baseline in detection work?
### What it is
A description of normal behavior, such as which principals usually call an API, at what hours and in what volume.
### Why this is the answer
Anomaly-based detections only make sense relative to normal. Without a baseline you cannot tell a new but legitimate pattern from an attack. A list of banned IPs or a saved playbook is something different.
### Remember it
You can only spot abnormal if you know normal.

## What makes a good detection hypothesis?
### What it is
A specific adversary behavior, the data that would reveal it, and an idea of what normal looks like.
### Why this is the answer
It focuses the work on something testable. A rule name plus a severity, a copy of a vendor rule or a list of tools to block does not say what you are trying to catch or how you would know.
### Remember it
Behavior, evidence, and what normal looks like.

## How do you cut false positives without losing the detection?
### What it is
Tune with context: allowlist known-good by identity, role or asset, or add conditions that distinguish benign from malicious cases.
### Why this is the answer
Raising the threshold until nothing fires, disabling the rule at night or muting the channel reduces noise by removing the detection. Contextual tuning keeps coverage and removes only the known harmless cases.
### Remember it
Tune out the known-good, not the detection.

## What is alert enrichment?
### What it is
Adding context to an alert, such as the asset's owner, the user's role, geolocation, and threat intelligence on the indicators involved.
### Why this is the answer
It lets the analyst judge an alert without hunting for background in five tools, speeding triage and improving accuracy. Making the alert louder or changing its format does not add information.
### Remember it
Context turns an alert into a decision.

## Which CloudTrail events make high-signal alerts?
### What it is
Rare, meaningful events: `StopLogging`, `DeleteTrail`, root account use, and console sign-ins without MFA.
### Why this is the answer
They indicate defense evasion or high-risk access and rarely occur legitimately. Alerting on every `DescribeInstances` or every successful `GetObject` would flood analysts with normal activity.
### Remember it
Alert on the rare and dangerous, not the common and routine.

## What is a canary token and why use it?
### What it is
A decoy credential, file or link that alerts when someone touches it.
### Why this is the answer
Real users and processes have no reason to use it, so any touch is suspicious. That makes false positives almost nonexistent, and a fake access key sitting where an attacker would look is a cheap, effective tripwire.
### Remember it
If nobody should touch it, any touch is signal.

## Which measures show alert fatigue?
### What it is
Alerts per analyst, time to triage, and the share of alerts closed as false positives.
### Why this is the answer
These show whether people are overwhelmed and whether alerts are worth reading. Total alerts per day or number of rules deployed say nothing about workload or quality.
### Remember it
Measure the humans' workload and the alerts' usefulness.

## What is "detection debt"?
### What it is
A backlog of detections that are untested, untuned or without owners, which slowly decay.
### Why this is the answer
Like technical debt, it accumulates quietly: rules start flooding analysts or stop working as environments change. Regular review, ownership and tests keep it in check.
### Remember it
Unowned rules rot.

## Hunting vs detecting
### What it is
A **hunt** is a human-led search for threats that rules missed. A **detection** is an automated, repeatable rule.
### Why this is the answer
They work together: a successful hunt should become a detection so the same threat is caught automatically next time. Hunting only after an incident, or treating the two as the same thing, loses that loop.
### Remember it
Hunt to discover; detect to repeat.

## Why keep detections and their tests together?
### What it is
Store each rule alongside the test data or emulation that proves it fires.
### Why this is the answer
You can validate a change before deploying it and catch regressions automatically when something upstream changes, such as a log format. Disk space and licensing have nothing to do with it.
### Remember it
A rule with its test can be changed safely.
