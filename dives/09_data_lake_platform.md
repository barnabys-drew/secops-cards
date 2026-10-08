%% Deep dives for cards/09_data_lake_platform.md.

## Medallion architecture: what lives in bronze, silver, and gold?
### What it is
A medallion architecture organizes a data lake into three layers of increasing quality.
- **Bronze:** raw logs exactly as received. Never edited. Kept for replay and evidence.
- **Silver:** parsed, typed, normalized to a common schema (such as OCSF or ECS), de-duplicated and enriched.
- **Gold:** curated tables built for a specific use: detections, hunting views, entity timelines, metrics.
### Why this is the answer
Each layer answers a different need. Bronze protects you from mistakes, silver gives every team one consistent view, and gold makes common questions fast, cheap and accurate. Mixing layers (for example running detections on raw bronze) means every detection reinvents parsing.
### Remember it
Raw, then clean, then ready to use.

## Why keep the bronze layer even after you normalize?
### What it is
Bronze is the original, untouched copy of what each source sent.
### Why this is the answer
Parsers have bugs and schemas change. With raw data you can re-parse history after fixing a parser, backfill a field you did not extract before, prove what the source actually sent (important for evidence), and replay history into a new detection. If you only keep the normalized form, a mistake in parsing is permanent.
### Remember it
You can always re-cook raw data; you cannot un-cook cooked data.

## Schema-on-write vs schema-on-read
### What it is
- **Schema-on-write:** data is parsed and typed when it is ingested. Queries are fast and consistent, but a change in the source can break the pipeline.
- **Schema-on-read:** raw data is stored, and structure is applied when you query. It is flexible, but queries are slower and every analyst ends up reinventing parsing.
### Why this is the answer
Neither is strictly better. Security lakes usually use both: raw data in bronze (read-time flexibility) and typed, normalized data in silver (write-time consistency).
### Remember it
Parse early for speed; keep raw for flexibility. Do both.

## Traditional SIEM vs security data lake: the core tradeoff
### What it is
A traditional SIEM bundles ingestion, storage, search and alerting in one product, typically priced by data volume. A data lake separates cheap object storage from compute, and you assemble or buy the detection, search and case-management layers.
### Why this is the answer
Volume pricing pushes SIEM teams to drop noisy but valuable logs. A lake lets you keep everything cheaply, but you take on engineering work and the responsibility to run the pieces. The tradeoff is cost and flexibility against convenience.
### Remember it
SIEM: one bill, one box, volume pricing. Lake: keep everything, build the rest.

## Why decouple storage from compute in a security lake?
### What it is
Data sits in object storage (such as S3), and separate engines (Athena, Spark, Snowflake, Databricks) query it when needed.
### Why this is the answer
Storage is cheap and grows on its own, while compute is paid only when you run queries. You stop paying to keep cold data on expensive systems, and several tools can read the same single copy of the data.
### Remember it
Pay for storage all the time, for compute only when you ask.

## Hot, warm, and cold tiers for security data
### What it is
- **Hot:** recent data (days to weeks) on fast storage for real-time detection and triage.
- **Warm:** months of data, queryable at lower speed, for hunting and investigations.
- **Cold:** a cheap archive (a year or more) for compliance and rare look-backs.
### Why this is the answer
Not all data is needed equally often. Matching storage to how fast you need it keeps cost down without losing the ability to investigate old incidents.
### Remember it
Fast for now, medium for digging, cheap for later.

## What is partitioning and why does it matter for log queries?
### What it is
Splitting stored data into folders by keys such as date, account or source, so that a query reads only the partitions it needs.
### Why this is the answer
On engines that charge by bytes scanned (like Athena), a query that touches one day instead of a year can cost hundreds of times less and run far faster. Partitioning on the fields you filter by most is one of the largest cost levers in a lake.
### Remember it
Don't scan the whole lake to find one day.

## The small files problem in a lake
### What it is
Streaming ingestion tends to write many tiny files. Query engines have overhead for each file they open.
### Why this is the answer
With thousands of tiny files, the overhead dominates the actual work and performance collapses. A scheduled compaction job merges them into larger files (roughly 128 MB to 1 GB) so queries stay fast.
### Remember it
Fewer, bigger files.

## What do open table formats (Iceberg, Delta, Hudi) add on top of Parquet?
### What it is
Parquet is just a file format. Table formats add a management layer on top of the files.
- **ACID writes:** several pipelines can write safely.
- **Schema evolution:** columns can change without rewriting everything.
- **Time travel:** query the table as it was at a past snapshot.
- **Efficient deletes and updates.**
### Why this is the answer
In security these matter for reproducibility ("what did the data look like when this alert fired?") and for handling deletion requests. Plain Parquet files have none of those guarantees.
### Remember it
Parquet is the files; table formats make them behave like a database table.

## What is a dead-letter queue in a log pipeline?
### What it is
A place where events that fail parsing or validation are sent instead of being thrown away.
### Why this is the answer
If bad events are dropped, a parser change or new log format can silently blind your detections. A dead-letter queue keeps them, lets you alert when it grows, and lets you fix the parser and replay the data.
### Remember it
Failed events are evidence of a broken pipeline; don't lose them.

## What should a log source onboarding checklist cover?
### What it is
Before adding a log source, record: its owner; its purpose and the detections it feeds; expected volume and cost; the parser and schema mapping; timestamp and timezone handling; a health check (expected rate and alert on silence); the retention tier; and the sensitivity of the data (such as PII or PHI).
### Why this is the answer
Each item prevents a common failure: orphan sources nobody maintains, surprise bills, mis-parsed fields, silent outages, or sensitive data landing somewhere without proper controls.
### Remember it
Owner, purpose, cost, parsing, time, health, retention, sensitivity.

## Why does timestamp handling cause so many detection bugs?
### What it is
Sources log in different timezones and formats, and an event's own time (event time) differs from when it reached your platform (ingest time).
### Why this is the answer
Correlation windows, ordering and late-arrival logic all depend on time. Mixing local times or using ingest time where event time was needed makes events appear out of order or outside a window, so detections miss real activity. Normalize to UTC and store both event time and ingest time.
### Remember it
UTC everywhere, and keep both clocks.

## What is UEBA?
### What it is
User and Entity Behavior Analytics. It builds a baseline of normal activity for each user, host, service account or role, and scores deviations such as a new country, a rare API call, unusual volume, or a first-seen resource.
### Why this is the answer
Signatures only catch what you already know to look for. Behavioral baselines can flag unfamiliar activity, such as stolen credentials used in a way the real owner never would.
### Remember it
Learn normal for each entity, flag the odd.

## Peer group analysis in behavioral detection
### What it is
Comparing an entity to similar entities (same team, role or workload) instead of only to its own past behavior.
### Why this is the answer
An entity's own history can be too short, or may include an earlier compromise. A finance user reading source code is unusual compared with other finance users even if they did it once before. Peer groups give context that an individual baseline lacks.
### Remember it
Odd for you, or odd for people like you?

## First-seen and rare-event detections
### What it is
Alert when something happens for the first time for an entity (a first login from a country, the first use of an API, the first access to a bucket) or is rare across the whole fleet.
### Why this is the answer
They are cheap to build (a lookup of seen combinations) and are strong signals in cloud attacks, where an intruder uses APIs and resources the legitimate owner never touched. They need a learning period and tuning for legitimate change.
### Remember it
"Never seen this before" is a powerful alert.

## Why do behavioral detections generate noise, and how do you tame it?
### What it is
Behavior changes for ordinary reasons: reorganizations, new projects, travel, deployments.
### Why this is the answer
Treating every deviation as an alert overwhelms analysts. Tame it with learning periods, peer groups, suppression for known change windows, and above all by combining many weak signals into a single risk score per entity and alerting on the score.
### Remember it
One odd thing is noise; several odd things together are a story.

## What is risk-based alerting (RBA)?
### What it is
Instead of each detection opening an alert, detections add risk points to an entity (a user, host or role). An alert opens only when an entity's total risk within a time window passes a threshold, often requiring several different tactics.
### Why this is the answer
It cuts alert volume, and it finds multi-step attacks that no single detection would flag by itself. Individual low-confidence detections become useful as evidence.
### Remember it
Points add up; alert when the total is high.

## Where does an "AI layer on top of the lake" add real value?
### What it is
Useful roles include: summarizing and enriching alerts for triage; turning natural language into queries for hunting; narrating an entity's timeline; clustering similar alerts; drafting detections and tests; and prioritizing with context.
### Why this is the answer
These are tasks of reading, summarizing and drafting, which language models do well when given good data. The layer is only as good as the curated tables it reads, so data quality comes first.
### Remember it
AI helps with reading and drafting. It cannot fix bad data.

## Why build curated gold tables before pointing an LLM at the lake?
### What it is
Gold tables are clean, narrow, documented datasets, such as an entity timeline, authentication events or cloud API calls.
### Why this is the answer
An LLM writing queries against raw, inconsistent schemas makes wrong joins and misses fields, and its queries scan too much data. With clear tables and documentation, generated queries are accurate and cheap.
### Remember it
Give the model good tables, not a swamp.

## How do you measure a greenfield detection platform in its first year?
### What it is
Track: coverage of priority techniques with **tested** detections; log source health and latency; cost per GB and per query; alert precision; MTTD and MTTR; and analyst time per alert.
### Why this is the answer
Together they show whether the platform detects, is reliable, is affordable and saves effort. Record baselines before migrating, so you can show real improvement instead of just activity.
### Remember it
Measure before and after, on quality as well as cost.

## Build vs buy for a detection platform: questions to ask
### What it is
Questions to ask: what engineering capacity do we have to run pipelines on call? Which parts are commodity (storage, ingest connectors) and which differentiate us (detections, enrichment)? What does it cost at three times today's volume? How hard is it to leave?
### Why this is the answer
Building everything wastes effort on commodity pieces, and buying everything locks you into someone else's detection logic. The common answer is to buy commodity components and build what is specific to your environment.
### Remember it
Buy the plumbing, build the knowledge.
