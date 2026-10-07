# Leading IR cases
> Running incidents as the technical lead: roles, scoping, decisions, communication, and turning cases into improvements.

Q: Incident commander vs technical lead
A: The incident commander runs the response: roles, priorities, cadence, decisions, and communication. The technical lead runs the investigation: hypotheses, evidence, scoping, and containment options. On small incidents one person can hold both, but say so explicitly.
S: Commander runs the response; technical lead runs the investigation
X: They are the same role with different titles
X: The commander does all the forensics
X: The technical lead handles PR and legal

Q: Core roles to assign on a significant incident
A: Incident commander, technical lead, scribe (timeline and decision log), communications lead (stakeholders, exec updates), and subject matter owners for affected systems. Legal and privacy join when data may be involved.
S: Commander, tech lead, scribe, comms lead, system owners; legal when data is involved
X: Everyone investigates independently
X: Only the on-call engineer
X: The CISO does every role

Q: The first 30 minutes of a case you are leading
A: Confirm it is real, declare severity, open the case channel and doc, assign roles, preserve evidence before it rotates, state the initial scope and hypothesis, decide on immediate containment, and set the update cadence.
S: Confirm, severity, roles, preserve evidence, scope, contain, set cadence
X: Write the root cause analysis
X: Reimage every affected machine first
X: Notify customers immediately before confirming

Q: What is scoping in an investigation?
A: Determining what is affected and how far: which identities, hosts, data, and time range. You pivot from known bad indicators to find everything related, and widen until new pivots stop finding anything new.
S: Finding every affected identity, host, data set, and time range
X: Writing the incident budget
X: Choosing which team gets blamed
X: Picking the severity level only

Q: Why not contain too early?
A: Tipping off an active attacker can make them switch tools, destroy evidence, or trigger a destructive fallback. When the risk allows, scope first so containment hits every foothold at once. When damage is ongoing (ransomware, active exfil), contain immediately.
S: Partial containment tips off attackers; scope first unless damage is ongoing
X: Containment should always wait until the report is written
X: Early containment is never a problem
X: Attackers cannot notice containment

Q: How do you pick the severity of an incident?
A: Use a written matrix based on impact (data sensitivity, systems affected, customer or regulatory exposure) and status (confirmed vs suspected, ongoing vs contained). Severity sets who is paged, update cadence, and who must be told.
S: A written matrix of impact and status that drives paging and comms
X: Whoever reports it picks
X: Based on how many alerts fired
X: Always start at the highest level

Q: What goes in an incident decision log?
A: Each decision with timestamp, who made it, the options considered, the information available at the time, and why. It protects responders later and makes the post-incident review honest.
S: Each decision with time, owner, options, information, and reasoning
X: Only the final outcome
X: Chat messages copied without context
X: The list of alerts that fired

Q: Executive update format during an incident
A: Short and fixed: what happened, current impact, what we are doing, what we need from you, next update time. Separate known facts from what is still being confirmed. No raw technical detail unless asked.
S: What happened, impact, actions, asks, next update; facts vs unconfirmed
X: A full technical timeline every hour
X: Only update once the incident is closed
X: Forward the raw investigation channel

Q: Leading 6 to 8 responders on one case
A: Split work into named workstreams (host forensics, cloud logs, identity, containment, comms) with one owner each, hold short syncs on a fixed cadence, keep one shared timeline, and protect the investigators from interruptions by routing questions through you or the commander.
S: Named workstreams with owners, fixed syncs, one shared timeline
X: Everyone looks at everything
X: One person does all the work while others watch
X: No syncs until the end

Q: Handoffs on a long-running incident
A: Write a handoff note: current state, open workstreams and owners, hypotheses being tested, pending decisions, and what not to touch. Do it in writing at a fixed time so the next shift does not redo or undo work.
S: Written state, owners, open hypotheses, pending decisions, do-not-touch list
X: Verbal handoff in passing
X: No handoff; the next shift reads the channel
X: Restart the investigation each shift

Q: Indicators vs behaviors when scoping
A: Indicators (hashes, IPs, domains) are fast pivots but attackers change them. Behaviors (the technique, the sequence of API calls, the persistence method) find related activity the indicators miss. Scope with both.
S: Indicators are fast pivots; behaviors find what changed indicators miss
X: Only hashes matter
X: Behaviors cannot be searched
X: Indicators never change

Q: When does legal need to be involved?
A: When regulated or personal data (PII, PHI, payment data) may be affected, when notification deadlines might apply, when law enforcement or a third party is involved, or when evidence may be needed in litigation. Bring them in early; deadlines often start at discovery.
S: When regulated data, notification deadlines, law enforcement, or litigation may apply
X: Only after the incident is closed
X: Never, security handles it alone
X: Only for physical security incidents

Q: Blameless post-incident review: what makes it useful?
A: Focus on how the system allowed the failure, not who erred. Build an accurate timeline, find contributing factors in detection, response, and prevention, and end with a short list of owned, dated action items. Track them to closure.
S: Systems not blame, accurate timeline, owned and dated action items
X: Identify who to discipline
X: A long report with no actions
X: Skip it if the incident was contained

Q: Detection gap analysis after a case
A: For each attacker step on the timeline ask: was it logged, did a detection exist, did it fire, was it triaged correctly, how long did it take? Each "no" becomes a log source, detection, or process action item.
S: For each attacker step: logged, detected, fired, triaged, how fast
X: Count the total alerts during the incident
X: Blame the SIEM vendor
X: Only review the first alert

Q: What turns IR cases into team coverage improvements?
A: Feed lessons back: new or tuned detections with tests, updated runbooks, tabletop exercises based on real cases, and a tracked list of logging gaps. The 10 percent of the lead role that is "organizing coverage" is mostly this loop.
S: New detections, updated runbooks, tabletops, tracked logging gaps
X: Archiving the case and moving on
X: Adding more analysts only
X: Buying a new tool after every case

Q: Tabletop exercise: what makes one worth the time?
A: A realistic scenario drawn from your own environment or a recent case, the real people who would respond, injects that force decisions (legal, comms, containment tradeoffs), and written findings with owners afterwards.
S: Realistic scenario, real responders, decision-forcing injects, owned findings
X: Reading a generic slide deck aloud
X: Only the security team, no other functions
X: A quiz on vocabulary

Q: Technical lead without direct reports: how do you lead?
A: Through clarity and credibility: set the investigative plan, make work visible, give clear asks with owners and deadlines, review others' findings, and back them in front of leadership. Influence comes from being right and being useful, not from title.
S: Clear plan, visible work, owned asks, reviewing and backing others
X: Wait for a manager to assign everything
X: Do all the work yourself
X: Escalate every disagreement to the director

Q: Supporting the Director of SecOps with strategy
A: Bring data from cases: recurring root causes, detection gaps, time spent per incident type, and where automation would pay off. Translate it into a short ranked list of investments with expected impact.
S: Case data turned into a ranked list of investments with impact
X: Request more headcount without data
X: Report only the number of incidents
X: Leave strategy to leadership entirely

Q: How do you keep evidence defensible during a fast-moving case?
A: Preserve before changing (snapshots, memory, log exports), record who collected what and when with hashes, store copies in a restricted account or bucket, and note every action that changed a system. Speed does not excuse skipping the record.
S: Preserve first, hash and record collection, restrict storage, log changes
X: Only preserve evidence for criminal cases
X: Rely on screenshots in chat
X: Collect evidence after remediation is done
