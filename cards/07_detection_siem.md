# Detection engineering and SIEM data
> The detection lifecycle, schemas, data lakes, SOAR, and measuring what you built.

Q: Detection engineering lifecycle
A: Hypothesis (threat or ATT&CK technique) -> confirm the data source exists -> write the rule -> test it (emulation) -> tune -> deploy -> measure -> retire or revise.
S: Hypothesis, data check, write, test, tune, deploy, measure, retire
X: Write, deploy, wait for alerts, tune
X: Buy, install, configure, forget
X: Alert, triage, close, report

Q: What is detection-as-code?
A: Rules live in version control with peer review, automated tests in CI, and a deploy pipeline, just like software.
S: Rules in version control with review, tests, and a deploy pipeline
X: Detections written directly in the SIEM UI
X: Detections stored in a spreadsheet
X: Only vendor-supplied detections

Q: Sigma, YARA, Suricata: what does each cover?
A: Sigma = vendor-neutral log detection rules (YAML), converted to SIEM queries. YARA = patterns in files and memory. Suricata/Snort = network traffic.
S: Sigma: log rules. YARA: files and memory. Suricata: network traffic
X: Sigma: files. YARA: logs. Suricata: memory
X: Sigma: network. YARA: logs. Suricata: files
X: All three are log query languages

Q: Precision vs recall for detections
A: Precision = of the alerts fired, how many were real. Recall = of the real events, how many were caught. Raising one usually lowers the other; tune to the cost of missing versus the cost of noise.
S: Precision: real among alerts fired. Recall: real events caught
X: Precision: events caught. Recall: real among alerts fired
X: Precision: speed. Recall: memory use
X: They are the same measure

Q: The Pyramid of Pain, bottom to top
A: Hash values, IP addresses, domain names, network/host artifacts, tools, TTPs. Detecting higher up costs the adversary more to evade.
S: Hashes, IPs, domains, artifacts, tools, TTPs
X: TTPs, tools, artifacts, domains, IPs, hashes
X: IPs, hashes, tools, domains, TTPs, artifacts
X: Hashes, tools, IPs, TTPs, artifacts, domains

Q: What does Atomic Red Team give you?
A: Small, scripted tests mapped to ATT&CK techniques, to check that a detection actually fires.
S: Small ATT&CK-mapped tests to check that a detection fires
X: A threat intelligence feed
X: A SOAR playbook library
X: A SIEM query language

Q: Why is "we have a rule for every technique" not coverage?
A: A technique has many procedures, and a rule needs a healthy data source, a test, and tuning to count. Measure tested, firing, and tuned detections, not rule counts.
S: Techniques have many procedures; coverage needs healthy data, tests, and tuning
X: A rule exists, so the technique is covered
X: Coverage equals the number of rules
X: Vendor rules always cover whole techniques

Q: Why monitor log source health?
A: A detection silently fails when its logs stop arriving. Alert on silence and on volume drops.
S: Detections silently fail when their logs stop arriving
X: Healthy sources reduce storage cost
X: It only satisfies a compliance checkbox
X: It speeds up queries

Q: OCSF and ECS
A: Open Cybersecurity Schema Framework and Elastic Common Schema: shared field names so one detection works across many log sources.
S: Shared field names so one detection works across many sources
X: Two ticketing formats
X: Two encryption standards
X: Two SIEM vendors

Q: Layers of a security data lake
A: Raw immutable landing zone, normalized layer (for example OCSF), and curated or enriched tables for detections and investigations.
S: Raw immutable, normalized (OCSF), curated and enriched
X: Hot, warm, and cold only
X: Primary, replica, backup
X: Ingest, queue, discard

Q: Why Parquet for security logs in S3?
A: Columnar and compressed, so queries scan only needed columns. Partition by date and source to cut Athena cost and time.
S: It is columnar and compressed; partition by date and source
X: It is row-based and fast for single-row updates
X: It is plain text and easy to grep
X: It is encrypted by default

Q: Streaming detection vs querying the lake
A: Streaming gives low latency for urgent detections and costs more. Scheduled lake queries are cheap and suit hunting and slower detections. Most programs use both.
S: Streaming is low-latency and costs more; scheduled queries are cheaper
X: Streaming is always cheaper
X: Lake queries are always faster
X: They cannot be combined

Q: What is SOAR?
A: Security orchestration, automation, and response: playbooks that enrich alerts, decide, act, and document, with human approval for destructive steps.
S: Playbooks that enrich, decide, act, and document, with approvals for destructive steps
X: A log storage tier
X: A vulnerability scanner
X: A phishing awareness program

Q: What does it mean to manage an MDR provider?
A: You own escalation paths and SLAs, give tuning feedback, define who may take response actions, and review what they miss. They watch; you remain accountable.
S: You own SLAs, tuning feedback, response authority, and reviewing what they miss
X: You hand over accountability entirely
X: You only receive a monthly report
X: You stop writing detections

Q: SOC tiers
A: Tier 1 triages alerts, tier 2 investigates and responds, tier 3 hunts, builds detections, and handles the hardest incidents.
S: T1 triages; T2 investigates and responds; T3 hunts, builds detections, handles the hardest
X: T1 hunts; T2 triages; T3 reports
X: T1 builds detections; T2 closes tickets; T3 escalates
X: T1 is the CISO; T2 is a manager; T3 is an analyst

Q: MTTD and MTTR
A: Mean time to detect and mean time to respond or resolve. Track them per incident type, and watch the tail, not just the mean.
S: Mean time to detect, and to respond or resolve; watch the tail
X: Mean time to deploy, and to restore; watch the average
X: Mean time to document, and to review
X: Mean threat density and risk

Q: What does a good alert runbook contain?
A: What fired and why it matters, how to verify it, enrichment to pull, common false positives, containment steps, and when to escalate.
S: What fired, how to verify, enrichment, false positives, containment, escalation
X: Only the alert name
X: Only the analyst's phone number
X: Only the rule's regex

Q: Where to start an AI enablement roadmap for detection and response
A: Pick high-volume, low-risk, well-understood work first (alert summarization, enrichment, ticket drafting), measure against analyst verdicts, then expand autonomy only where the data supports it.
S: High-volume, low-risk work first; measure against analysts; expand autonomy with data
X: Give it full autonomous response on day one
X: Replace tier 1 immediately
X: Start with the highest-severity incidents

Q: What is a baseline in detection work?
A: Normal behavior to compare against, such as the usual callers, hours, and volumes for an API. Anomaly detections need one.
S: Normal behavior to compare against
X: A list of banned IP addresses
X: A required SIEM license tier
X: A saved SOAR playbook

Q: What makes a good detection hypothesis?
A: A specific adversary behavior, the data that would show it, and a clear idea of what normal looks like.
S: A specific behavior, the data that shows it, and what normal looks like
X: A rule name and a severity
X: A copy of a vendor rule
X: A list of tools to block

Q: How do you cut false positives without losing the detection?
A: Tune with context (allowlist known-good by identity, role, or asset) instead of deleting the rule or raising thresholds blindly.
S: Tune with context, such as allowlisting known-good identities
X: Raise the threshold until nothing fires
X: Disable the rule at night
X: Send alerts to a muted channel

Q: What is alert enrichment?
A: Adding context to an alert, such as asset owner, identity, geolocation, and threat intelligence, so triage is faster and better.
S: Adding context such as asset owner, identity, geo, and threat intel
X: Making the alert louder
X: Translating it to JSON
X: Archiving it to cold storage

Q: Which CloudTrail events make high-signal alerts?
A: `StopLogging`, `DeleteTrail`, root account use, and console logins without MFA. They are rare and meaningful.
S: StopLogging, DeleteTrail, root use, console login without MFA
X: Every DescribeInstances call
X: Every successful GetObject
X: Any call from a new browser

Q: What is a canary token and why use it?
A: A decoy credential or file that alerts when touched. Real users never touch it, so false positives are almost zero.
S: A decoy credential that alerts when touched, with almost no false positives
X: A token that speeds up logins
X: A rate-limit token
X: A backup encryption key

Q: Which measures show alert fatigue?
A: Alerts per analyst, time to triage, and the share closed as false positive.
S: Alerts per analyst, time to triage, and share closed as false positive
X: Only total alerts per day
X: Number of rules deployed
X: Dashboard views

Q: What is "detection debt"?
A: Rules left untested, untuned, or without owners that quietly decay and either flood analysts or stop working.
S: Rules left untested, untuned, or ownerless that decay quietly
X: Money owed to the SIEM vendor
X: Unused log storage
X: Unpaid analyst overtime

Q: Hunting vs detecting
A: A hunt is a human-led search for what rules miss. A detection is automated and repeatable. Good hunts become detections.
S: A hunt is human-led exploration; a detection is automated and repeatable
X: A hunt is automated; a detection is human-led
X: They are the same thing
X: A hunt only happens after an incident

Q: Why keep detections and their tests together?
A: A change can be validated before deploy, and regressions are caught automatically.
S: Changes can be validated and regressions caught before deploy
X: It saves disk space
X: It hides rules from analysts
X: It satisfies the SIEM license
