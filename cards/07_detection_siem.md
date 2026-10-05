# Detection engineering and SIEM data
> The detection lifecycle, schemas, data lakes, SOAR, and measuring what you built.

Q: Detection engineering lifecycle
A: Hypothesis (threat or ATT&CK technique) -> confirm the data source exists -> write the rule -> test it (emulation) -> tune -> deploy -> measure -> retire or revise.

Q: What is detection-as-code?
A: Rules live in version control with peer review, automated tests in CI, and a deploy pipeline, just like software.

Q: Sigma, YARA, Suricata: what does each cover?
A: Sigma = vendor-neutral log detection rules (YAML), converted to SIEM queries. YARA = patterns in files and memory. Suricata/Snort = network traffic.

Q: Precision vs recall for detections
A: Precision = of the alerts fired, how many were real. Recall = of the real events, how many were caught. Raising one usually lowers the other; tune to the cost of missing versus the cost of noise.

Q: The Pyramid of Pain, bottom to top
A: Hash values, IP addresses, domain names, network/host artifacts, tools, TTPs. Detecting higher up costs the adversary more to evade.

Q: What does Atomic Red Team give you?
A: Small, scripted tests mapped to ATT&CK techniques, to check that a detection actually fires.

Q: Why is "we have a rule for every technique" not coverage?
A: A technique has many procedures, and a rule needs a healthy data source, a test, and tuning to count. Measure tested, firing, and tuned detections, not rule counts.

Q: Why monitor log source health?
A: A detection silently fails when its logs stop arriving. Alert on silence and on volume drops.

Q: OCSF and ECS
A: Open Cybersecurity Schema Framework and Elastic Common Schema: shared field names so one detection works across many log sources.

Q: Layers of a security data lake
A: Raw immutable landing zone, normalized layer (for example OCSF), and curated or enriched tables for detections and investigations.

Q: Why Parquet for security logs in S3?
A: Columnar and compressed, so queries scan only needed columns. Partition by date and source to cut Athena cost and time.

Q: Streaming detection vs querying the lake
A: Streaming gives low latency for urgent detections and costs more. Scheduled lake queries are cheap and suit hunting and slower detections. Most programs use both.

Q: What is SOAR?
A: Security orchestration, automation, and response: playbooks that enrich alerts, decide, act, and document, with human approval for destructive steps.

Q: What does it mean to manage an MDR provider?
A: You own escalation paths and SLAs, give tuning feedback, define who may take response actions, and review what they miss. They watch; you remain accountable.

Q: SOC tiers
A: Tier 1 triages alerts, tier 2 investigates and responds, tier 3 hunts, builds detections, and handles the hardest incidents.

Q: MTTD and MTTR
A: Mean time to detect and mean time to respond or resolve. Track them per incident type, and watch the tail, not just the mean.

Q: What does a good alert runbook contain?
A: What fired and why it matters, how to verify it, enrichment to pull, common false positives, containment steps, and when to escalate.

Q: Where to start an AI enablement roadmap for detection and response
A: Pick high-volume, low-risk, well-understood work first (alert summarization, enrichment, ticket drafting), measure against analyst verdicts, then expand autonomy only where the data supports it.
