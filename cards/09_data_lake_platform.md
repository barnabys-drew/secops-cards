# Greenfield SIEM and data lake
> Building a detection platform from scratch: medallion layers, pipelines, cost, behavioral analytics, and the AI layer on top.

Q: Medallion architecture: what lives in bronze, silver, and gold?
A: Bronze = raw logs as received, immutable, kept for replay and evidence. Silver = parsed, normalized to a schema (OCSF/ECS), deduplicated, enriched. Gold = curated, query-ready tables built for a purpose: detections, hunting views, entity timelines, metrics.
S: Bronze: raw. Silver: normalized and enriched. Gold: purpose-built tables
X: Bronze: alerts. Silver: cases. Gold: reports
X: Bronze: hot storage. Silver: warm. Gold: cold archive
X: Bronze: test data. Silver: staging. Gold: production

Q: Why keep the bronze layer even after you normalize?
A: Parsers have bugs and schemas change. Raw data lets you re-parse history, backfill a new field, prove what the source actually sent, and replay into a new detection.
S: To re-parse, backfill, and prove what the source sent
X: Bronze is only needed until the first parse succeeds
X: Regulators require deleting raw logs after normalization
X: It is faster to query than silver

Q: Schema-on-write vs schema-on-read
A: Schema-on-write parses and types data at ingest (fast, consistent queries; brittle when sources change). Schema-on-read stores raw and applies structure at query time (flexible; slower and every analyst reinvents parsing). A lake usually does both: raw bronze, typed silver.
S: Write: parse at ingest. Read: parse at query time. Lakes use both
X: Write: parse at query time. Read: parse at ingest
X: They describe encryption at rest vs in transit
X: Schema-on-read means no schema is ever applied

Q: Traditional SIEM vs security data lake: the core tradeoff
A: A SIEM bundles ingest, storage, search, and alerting, usually priced by volume, so teams drop noisy logs. A lake separates cheap object storage from compute, so you can keep everything, but you must build or buy the detection, search, and case layers yourself.
S: SIEM bundles everything at volume pricing; lake decouples storage and compute
X: A lake cannot run detections
X: A SIEM is always cheaper at high volume
X: They are the same thing with different names

Q: Why decouple storage from compute in a security lake?
A: Storage (S3, GCS) is cheap and scales on its own; compute (Athena, Spark, Snowflake, Databricks) is paid when you query. You stop paying to keep cold data hot and can point several engines at one copy of the data.
S: Cheap storage scales alone; you pay compute only when querying
X: It makes data immutable automatically
X: It removes the need for a schema
X: It lets you skip encryption

Q: Hot, warm, and cold tiers for security data
A: Hot = recent data on fast storage for real-time detection and triage (days to weeks). Warm = queryable at lower speed for hunting and investigations (months). Cold = cheap archive for compliance and rare look-backs (a year or more).
S: Hot: real-time triage. Warm: hunting. Cold: archive and compliance
X: Hot: archive. Warm: real-time. Cold: hunting
X: Tiers refer to alert severity
X: Tiers refer to analyst seniority

Q: What is partitioning and why does it matter for log queries?
A: Splitting stored data into folders by keys like date, account, or source, so a query only scans the partitions it needs. On Athena-style engines you pay per byte scanned, so good partitions cut cost and time by orders of magnitude.
S: Splitting data by keys like date so queries scan less
X: Encrypting each tenant separately
X: Splitting alerts across analysts
X: Copying data into multiple regions

Q: The small files problem in a lake
A: Streaming ingest writes many tiny files. Query engines pay overhead per file, so performance collapses. Fix with compaction jobs that merge into larger files (roughly 128 MB to 1 GB) on a schedule.
S: Too many tiny files slow queries; compact them on a schedule
X: Small files cannot be encrypted
X: Small files are always lost in transit
X: Small files exceed the S3 object limit

Q: What do open table formats (Iceberg, Delta, Hudi) add on top of Parquet?
A: Table-level features: ACID writes, schema evolution, time travel (query as of a past snapshot), and efficient deletes and updates. Useful when many pipelines write the same table and when you need to reproduce what data looked like at a point in time.
S: ACID writes, schema evolution, and time travel over Parquet files
X: A faster compression codec only
X: A replacement for object storage
X: A detection rule format

Q: What is a dead-letter queue in a log pipeline?
A: Where events that fail parsing or validation go instead of being dropped. You alert on its growth, fix the parser, and replay. Without it, a parser change silently blinds detections.
S: Where failed events go so you can fix and replay instead of losing them
X: The queue for low-severity alerts
X: The archive tier for deleted logs
X: A list of disabled detections

Q: What should a log source onboarding checklist cover?
A: Owner, purpose and the detections it feeds, expected volume and cost, parser and schema mapping, timestamp and timezone handling, health check (expected rate, alert on silence), retention tier, and sensitivity of the data (PII, PHI).
S: Owner, detections it feeds, volume, parser, health check, retention, sensitivity
X: Vendor name and license key only
X: Just the forwarding destination
X: Nothing until the first incident needs it

Q: Why does timestamp handling cause so many detection bugs?
A: Sources log in different timezones and formats, and event time differs from ingest time. Mixing them breaks correlation windows, ordering, and late-arrival logic. Normalize to UTC and keep both event time and ingest time.
S: Mixed timezones and event vs ingest time break correlation
X: Timestamps are never needed for detections
X: Logs always arrive in order
X: Only the SIEM clock matters

Q: What is UEBA?
A: User and Entity Behavior Analytics. Build baselines of normal activity per user, host, service account, or role, then score deviations (new country, rare API, unusual volume, first-seen resource) instead of matching a fixed signature.
S: Baselines per user or entity, then score deviations from normal
X: A signature format for malware
X: A type of firewall rule
X: An encryption standard for endpoints

Q: Peer group analysis in behavioral detection
A: Compare an entity to similar entities (same team, role, or workload) rather than only to its own past. A finance user touching source code is odd for finance even if that user has done it once before.
S: Compare an entity to similar entities, not only to its own history
X: Comparing your SOC to other companies' SOCs
X: Peer review of detection rules
X: Grouping alerts by severity

Q: First-seen and rare-event detections
A: Alert when something happens for the first time for an entity (first login from a country, first use of an API, first access to a bucket) or is rare across the fleet. Cheap to build with a lookup of seen pairs, and strong signal for cloud attacks.
S: Alert on first-time or fleet-rare behavior for an entity
X: Alert on every event seen for the first time in the SIEM
X: Alert only on known bad IPs
X: Alert when a rule fires for the first time

Q: Why do behavioral detections generate noise, and how do you tame it?
A: Normal behavior shifts (reorgs, new projects, travel, deploys). Tame it with learning periods, peer groups, suppression for known change windows, combining weak signals into a risk score per entity, and alerting on the score rather than each anomaly.
S: Behavior shifts constantly; combine weak signals into an entity risk score
X: Lower the threshold until everything alerts
X: Behavioral detections are never noisy
X: Disable them during business hours

Q: What is risk-based alerting (RBA)?
A: Detections add risk points to an entity instead of each firing an alert. An alert opens only when an entity's total risk in a window crosses a threshold, often with several distinct tactics. It cuts volume and surfaces multi-step attacks.
S: Detections add risk to an entity; alert when the total crosses a threshold
X: Alerting only on critical CVEs
X: Ranking analysts by risk appetite
X: Blocking all risky users automatically

Q: Where does an "AI layer on top of the lake" add real value?
A: Triage summaries and enrichment, natural language to query for hunting, entity timeline narration, clustering similar alerts, drafting detections and tests, and prioritizing by context. It works only as well as the gold tables it reads, so data quality comes first.
S: Triage, NL-to-query hunting, timelines, clustering; only as good as the gold data
X: It replaces the need to normalize data
X: It removes the need for detections
X: It is mainly for compressing storage

Q: Why build curated gold tables before pointing an LLM at the lake?
A: An LLM writing queries against raw, inconsistent schemas produces wrong joins and missed fields. Clean, documented, narrow tables (an entity timeline, auth events, cloud API calls) make generated queries accurate and cheaper to run.
S: Clean, documented tables make generated queries accurate
X: LLMs cannot read Parquet
X: Gold tables are required by the cloud provider
X: Raw data is always more accurate for LLMs

Q: How do you measure a greenfield detection platform in its first year?
A: Coverage of priority techniques with tested detections, log source health and latency, cost per GB and per query, precision of alerts, MTTD/MTTR, and analyst time per alert. Pick a baseline before the migration so you can show improvement.
S: Tested coverage, source health, cost, precision, MTTD/MTTR, analyst time
X: Number of rules deployed
X: Total GB ingested
X: Number of dashboards built

Q: Build vs buy for a detection platform: questions to ask
A: What is our engineering capacity to run pipelines on call? Which parts are commodity (storage, ingest connectors) vs differentiating (detections, enrichment)? What does it cost at 3x today's volume? How hard is it to leave? Usually buy commodity, build what is unique to your environment.
S: Team capacity, commodity vs differentiating, cost at scale, exit cost
X: Always build for full control
X: Always buy the market leader
X: Choose whatever has the most integrations
