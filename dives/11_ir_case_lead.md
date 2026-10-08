%% Deep dives for cards/11_ir_case_lead.md.

## Incident commander vs technical lead
### What it is
Two different jobs.
- The **incident commander** runs the response: assigns roles, sets priorities and the update rhythm, makes decisions and handles communication.
- The **technical lead** runs the investigation: forms hypotheses, directs evidence collection, determines scope and proposes containment options.
### Why this is the answer
Splitting them lets the commander keep an eye on the whole incident while the technical lead goes deep. On a small incident one person can do both, but saying so explicitly avoids the situation where nobody is watching the big picture or nobody is leading the investigation.
### Remember it
The commander runs the incident. The technical lead runs the investigation.

## Core roles to assign on a significant incident
### What it is
- Incident commander.
- Technical lead.
- Scribe, who keeps the timeline and decision log.
- Communications lead, for stakeholder and executive updates.
- Subject matter owners for the affected systems.
- Legal and privacy, when data may be involved.
### Why this is the answer
In a stressful incident, anything unassigned gets dropped. Naming owners up front prevents duplicated work and gaps, and a dedicated scribe means decisions and facts are recorded as they happen rather than reconstructed later.
### Remember it
Name an owner for every job, especially the scribe.

## The first 30 minutes of a case you are leading
### What it is
- Confirm the incident is real.
- Declare a severity.
- Open the case channel and document.
- Assign roles.
- **Preserve evidence** before it rotates away.
- State the initial scope and hypothesis.
- Decide on any immediate containment.
- Set the update cadence.
### Why this is the answer
The order protects what is hard to recover: evidence and clarity. Many logs and memory are volatile, and unclear ownership or cadence causes confusion later. Starting with structure makes the rest of the case run more smoothly.
### Remember it
Confirm, declare, organize, preserve, scope, decide, schedule.

## What is scoping in an investigation?
### What it is
Working out what is affected and how far: which identities, hosts, data and time range.
### Why this is the answer
You begin with known bad indicators and pivot to find everything related, widening until new pivots stop finding anything new. Containing before scoping risks missing footholds, and an incomplete scope means the attacker is still in.
### Remember it
Pivot until nothing new turns up.

## Why not contain too early?
### What it is
Acting on the first thing you find can alert the attacker.
### Why this is the answer
A tipped-off attacker may switch tools, destroy evidence or trigger a destructive fallback, and you will have only cut off one of several footholds. When risk allows, scope first so containment hits everything at once. When damage is ongoing, such as ransomware encrypting files or active data theft, contain immediately.
### Remember it
Scope first when you can; contain at once when damage is happening.

## How do you pick the severity of an incident?
### What it is
Use a written matrix. Impact (data sensitivity, systems affected, customer or regulatory exposure) combined with status (confirmed or suspected, ongoing or contained) gives a level.
### Why this is the answer
A written matrix makes severity consistent and removes arguments in the moment. The level then drives who is paged, how often updates go out and who must be informed. Severity can change as you learn more.
### Remember it
Impact and status, decided from a matrix, not a gut feeling.

## What goes in an incident decision log?
### What it is
For each decision: when it was made, who made it, the options considered, what information was available at the time, and why that option was chosen.
### Why this is the answer
It protects responders later, because it shows they acted reasonably with what they knew, and it makes the post-incident review honest by separating hindsight from the situation as it was.
### Remember it
Record what you knew when you decided.

## Executive update format during an incident
### What it is
A short, fixed format: what happened, current impact, what we are doing, what we need from you, and the time of the next update. Separate confirmed facts from what is still being checked.
### Why this is the answer
Executives need to decide and communicate, not follow forensic detail. A predictable format makes updates quick to read, and the "what we need from you" line surfaces decisions. Saying what is unconfirmed prevents false certainty from spreading.
### Remember it
What, impact, actions, asks, next update.

## Leading 6 to 8 responders on one case
### What it is
- Split the work into **named workstreams** (host forensics, cloud logs, identity, containment, communications) with one owner each.
- Hold short syncs on a fixed cadence.
- Keep one shared timeline.
- Protect investigators from interruptions by routing questions through you or the commander.
### Why this is the answer
Without structure, people duplicate work, miss gaps and get pulled into discussions. Clear ownership and one shared picture let a group move quickly.
### Remember it
Workstreams with owners, one timeline, protected focus.

## Handoffs on a long-running incident
### What it is
A written note given at a fixed time covering current state, open workstreams and their owners, hypotheses being tested, pending decisions, and what not to touch.
### Why this is the answer
Verbal handoffs lose detail, and tired responders may redo or undo each other's work. A written note lets the next shift continue without guessing.
### Remember it
If it is not written down, the next shift will not know it.

## Indicators vs behaviors when scoping
### What it is
- **Indicators** are specific artifacts: hashes, IP addresses, domains.
- **Behaviors** are what the attacker does: the technique, the sequence of API calls, the persistence method.
### Why this is the answer
Indicators are fast pivots but cheap for an attacker to change. Behaviors persist across changes of infrastructure and tools, and find related activity the indicators miss. Use both, with behaviors catching what indicators cannot.
### Remember it
Indicators are quick; behaviors are durable.

## When does legal need to be involved?
### What it is
When regulated or personal data (PII, PHI, payment data) may be affected, when notification deadlines might apply, when law enforcement or a third party is involved, or when evidence may be needed in litigation.
### Why this is the answer
Many legal clocks start at **discovery**, not at the end of the investigation. Bringing Legal in early protects the organization, and they can guide how evidence and communications are handled.
### Remember it
Call Legal early; some deadlines are already running.

## Blameless post-incident review: what makes it useful?
### What it is
A review focused on how the system allowed the failure, not who erred. It builds an accurate timeline, identifies contributing factors in detection, response and prevention, and ends with a short list of owned, dated action items that are tracked to closure.
### Why this is the answer
Blame makes people hide information, so you learn less. Action items without owners and dates tend to be forgotten, which means the same incident repeats.
### Remember it
Fix the system, not the person, and close the actions.

## Detection gap analysis after a case
### What it is
For each attacker step on the timeline, ask: was it logged, did a detection exist, did it fire, was it triaged correctly, and how long did it take?
### Why this is the answer
Each "no" points to a specific gap: a missing log source, a missing or untuned detection, or a process failure. Turning each into an action item converts a painful case into concrete improvements.
### Remember it
Walk the timeline and ask what we would have seen.

## What turns IR cases into team coverage improvements?
### What it is
Feeding lessons back: new or tuned detections with tests, updated runbooks, tabletop exercises based on real cases, and a tracked list of logging gaps.
### Why this is the answer
Without this loop, a case ends and the lessons stay in people's heads. The loop is how a team becomes steadily better at catching and handling the next one, and it is a large part of what a technical lead is responsible for.
### Remember it
Every case should leave the team better prepared.

## Tabletop exercise: what makes one worth the time?
### What it is
A realistic scenario drawn from your environment or a recent case, the real people who would respond, injects (new information introduced during the exercise) that force decisions, and written findings with owners afterward.
### Why this is the answer
A generic scenario with no decisions teaches little. Realism, the right participants and forcing tradeoffs (legal, communications, containment) expose real gaps, and written follow-ups with owners make sure they get fixed.
### Remember it
Real scenario, real people, hard choices, written follow-up.

## Technical lead without direct reports: how do you lead?
### What it is
Lead through clarity and credibility: set the investigative plan, make the work visible, give clear asks with owners and deadlines, review others' findings, and support them in front of leadership.
### Why this is the answer
Without formal authority, influence comes from being right and being useful. People follow a lead who makes the path clear and treats their work well, not one who relies on a title.
### Remember it
Authority comes from clarity and trust, not from the org chart.

## Supporting the Director of SecOps with strategy
### What it is
Bring data from cases: recurring root causes, detection gaps, time spent per incident type, and where automation would pay off. Translate it into a short, ranked list of investments with expected impact.
### Why this is the answer
Leaders decide based on evidence and priorities. Real case data turns your experience into an argument, and a ranked list makes the decision easy to act on.
### Remember it
Turn case data into a ranked list of investments.

## How do you keep evidence defensible during a fast-moving case?
### What it is
Preserve before changing (snapshots, memory, log exports), record who collected what and when along with hashes, store copies in a restricted account or bucket, and note every action that changed a system.
### Why this is the answer
Evidence only helps if its integrity can be shown. Speed does not excuse skipping the record, because a missing chain of custody can make findings unusable later, in a legal matter or an audit.
### Remember it
Even in a hurry: preserve, hash, record.
