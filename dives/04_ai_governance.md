%% Deep dives for cards/04_ai_governance.md.

## NIST AI RMF 1.0: the four functions
### What it is
The NIST AI Risk Management Framework organizes AI risk work into four functions.
- **Govern:** the culture, policies, roles and accountability that make risk management possible. It applies across all the others.
- **Map:** understand the context: what the system is for, who it affects, what could go wrong.
- **Measure:** assess and track those risks with testing and metrics.
- **Manage:** prioritize risks and act on them: mitigate, accept, transfer or retire.
### Why this is the answer
The names are easy to confuse with the NIST Cybersecurity Framework (Identify, Protect, Detect, Respond, Recover). The AI RMF is about managing risk across an AI system's life cycle, not about security alone, and Govern sits underneath the rest.
### Remember it
Govern first and always; then Map, Measure, Manage.

## NIST AI 600-1
### What it is
NIST AI 600-1 is the **Generative AI Profile** of the AI Risk Management Framework, published in 2024. A profile applies a framework to a particular use or technology.
### Why this is the answer
It takes the general AI RMF and identifies risks specific to generative AI, such as confabulation (hallucination), data privacy, information security, and harmful content, along with suggested actions. It is not a testing method or a reporting format; it is the generative AI companion to the RMF.
### Remember it
600-1 = the generative AI edition of the RMF.

## ISO/IEC 42001 vs ISO/IEC 27001
### What it is
Both are management system standards that an organization can be certified against, covering different subjects.
- **ISO/IEC 42001:** an AI management system (AIMS), covering the responsible development and use of AI.
- **ISO/IEC 27001:** an information security management system (ISMS).
### Why this is the answer
They share a structure but not a scope. A 27001 certificate does not show that you manage AI-specific risks, and 42001 does not replace security controls. Many organizations pursue both, and the shared structure makes combining them easier.
### Remember it
27001 secures information. 42001 governs AI.

## EU AI Act risk tiers
### What it is
The EU AI Act sorts AI systems by risk and sets obligations accordingly.
- **Unacceptable risk:** prohibited.
- **High risk:** allowed with strict requirements, such as risk management, data governance, documentation and human oversight.
- **Limited risk:** mainly transparency duties, such as telling people they are talking to an AI.
- **Minimal risk:** largely unregulated.
### Why this is the answer
The tier depends on **what the system is used for**, not the size of the company. Knowing the tiers lets you quickly say what a given use case will require.
### Remember it
The more harm a use can do, the more rules apply.

## What goes in an AI acceptable use policy?
### What it is
An AI acceptable use policy tells people how they may use AI at work. It normally covers approved tools, which kinds of data may be used with which tools, prohibited uses, when human review is required, how to disclose AI use, and how to request a new tool.
### Why this is the answer
It must be specific enough to follow. A list of banned models, a mission statement or a vendor contract alone does not tell an employee what they may do today. Pair the policy with an easy approval path so people do not route around it.
### Remember it
Say what is allowed, with what data, and how to ask for more.

## Questions for an AI vendor or SaaS AI-feature review
### What it is
Ask questions that surface data and control risks.
- Is our data used to **train** models?
- How long is it **retained**, and where?
- Which **model provider and subprocessors** are involved?
- How is our data **isolated** from other customers?
- Does the AI respect our existing **permissions (ACLs)**?
- What **admin controls and audit logs** exist?
### Why this is the answer
These determine where your data goes and what the AI can reach. Marketing details such as logos, model sizes or funding do not tell you about risk.
### Remember it
Where does the data go, who sees it, and does the AI respect permissions?

## The biggest hidden risk of enabling an AI feature inside a SaaS tool (a workspace assistant, for example)
### What it is
AI assistants in workplace tools search and summarize everything the user can access. That exposes a problem that already existed: over-shared documents and loose permissions.
### Why this is the answer
Before AI, a sensitive file in an over-shared folder was hard to find. An assistant makes it easy to surface with one question. The risk comes from permission hygiene, not a new vulnerability. Clean up access and sensitivity labels before or alongside rollout.
### Remember it
AI makes bad permissions discoverable.

## How do you discover AI use you do not know about?
### What it is
Look at where AI adoption leaves traces.
- **Identity provider and OAuth grants:** which AI apps have been authorized.
- **CASB, proxy and DNS logs:** traffic to AI services.
- **Expenses and billing:** subscriptions and API charges.
- **Browser extensions** and **code scans** for AI SDK imports.
### Why this is the answer
Surveys and wiki searches only find what people volunteer. Telemetry finds actual use. Once you know what exists, bring valuable tools into an approved path instead of just blocking them.
### Remember it
Find it in the logs, not just in the survey.

## Core elements of an AI incident response playbook
### What it is
An AI playbook extends normal incident response with AI-specific steps.
- **Scope:** which model, prompt, data and tools were involved.
- **Evidence:** prompts, retrieved documents and tool-call logs.
- **Containment:** disable the tool or feature, revoke tokens, rotate credentials.
- **Eradication:** fix the prompt or guardrail, purge poisoned data.
- **Lessons:** turn the incident into new evaluation cases.
### Why this is the answer
AI incidents do not look like malware outbreaks. Without the right evidence and containment levers, such as logs of tool calls and a way to switch off a feature, a team cannot answer what the system did.
### Remember it
Know what it touched, keep the evidence, switch it off, then test for it.

## Structure of a security position paper on an emerging technology
### What it is
A position paper helps leaders decide. A useful structure is: the problem and why it matters now, a threat model, current controls and gaps, a clear recommendation (and the decision needed), and how success will be measured.
### Why this is the answer
An academic layout (abstract, methods, results) or a product comparison does not drive a decision. Leaders need a point of view, the reasoning, and what you want them to do.
### Remember it
Problem, threat, gaps, recommendation, measure.

## What goes in a model risk assessment?
### What it is
A model risk assessment documents a model's purpose and owner, the data used and its sensitivity, expected performance, failure modes and their impact, monitoring, human oversight, and a plan for retiring it.
### Why this is the answer
It asks what could go wrong and who answers for it. Vendor names, prompt text or UI mockups describe the product, not its risk. The assessment should be updated when the model, data or use changes.
### Remember it
Purpose, data, performance, failure, monitoring, oversight, retirement.

## OAuth 2.0 vs OIDC vs SAML
### What it is
Three related but different standards.
- **OAuth 2.0:** delegated **authorization**. It lets one app get limited access to another on a user's behalf, using access tokens.
- **OpenID Connect (OIDC):** an **authentication** layer built on OAuth 2.0, adding an ID token that says who logged in.
- **SAML:** XML-based **federated single sign-on**, where an identity provider sends signed assertions to a service.
### Why this is the answer
OAuth alone does not prove who a user is. OIDC adds that for modern apps and APIs, while SAML is common in older enterprise SSO. For agents, OAuth scopes and token exchange are central.
### Remember it
OAuth: what you may access. OIDC: who you are. SAML: enterprise SSO in XML.

## What is a CASB?
### What it is
A cloud access security broker sits between users and cloud services to give visibility and control over their use. Typical functions include discovering shadow IT, data loss prevention, and enforcing access policies.
### Why this is the answer
It is a control for **SaaS and cloud usage**, not a backup service, firewall or billing tool. For AI, a CASB can show which AI services employees use and apply rules about what data may go to them.
### Remember it
A CASB watches and governs how people use cloud apps.

## SOC 2 Trust Services Criteria
### What it is
SOC 2 reports on controls against five Trust Services Criteria: **security** (required), availability, processing integrity, confidentiality and privacy.
### Why this is the answer
Security is the common baseline, and an organization chooses which of the others to include in scope. When assessing a vendor, check which criteria the report actually covers and whether the AI feature is inside the audited system.
### Remember it
Security, availability, processing integrity, confidentiality, privacy.

## Non-human identities in IAM
### What it is
Non-human identities are credentials and principals that are not people: service accounts, API keys, OAuth apps, bots, and now AI agents.
### Why this is the answer
They often outnumber people, hold broad access, and are rarely reviewed. Good practice: inventory them, assign owners, give least privilege, use short-lived credentials or rotation, and log their actions. Agents should not be treated as ordinary users or hidden behind a shared account.
### Remember it
If it can authenticate, it needs an owner.

## STRIDE
### What it is
STRIDE is a threat-modeling mnemonic: **S**poofing, **T**ampering, **R**epudiation, **I**nformation disclosure, **D**enial of service, **E**levation of privilege.
### Why this is the answer
It gives a checklist of threat types to apply at each point where data crosses a trust boundary. For AI systems, those boundaries include user to app, app to model, model to tools, and retrieval to model. Walking STRIDE across each one finds issues a general review misses.
### Remember it
Ask the six STRIDE questions at every boundary.

## What is fine-tuning's main security risk?
### What it is
Fine-tuning trains a model further on your own data.
### Why this is the answer
It carries two main risks. First, the model can memorize and later reveal sensitive records in the training set (data leakage). Second, poisoned or low-quality data can change the model's behavior. Treat the fine-tuning dataset like production data: control access, remove sensitive fields, and test the tuned model.
### Remember it
What you tune on can come back out.

## Who should own an AI system's risk?
### What it is
Each AI system needs a named business owner who decides how it is used and accepts residual risk. Security advises, reviews and tests.
### Why this is the answer
Ownership assigns the decision to the party who gets the value. If the vendor or the security team alone owns the risk, nobody with the authority to change the use case is accountable. Without an owner, no one decides, fixes or shuts it down.
### Remember it
Security advises; the business owns the risk.

## What is "shadow AI"?
### What it is
Shadow AI is AI tools and features used without approval or oversight from IT and security, such as personal accounts for chatbots or AI extensions installed by employees.
### Why this is the answer
It creates unmanaged data flows. The goal is not just to block it but to find it, understand why people use it, and offer an approved alternative so the need is met safely.
### Remember it
If people have to hide it to use it, give them a safe way to use it.

## Which data should never go into an unapproved AI tool?
### What it is
Regulated and confidential data: health information (PHI), payment card data, credentials and secrets, source code secrets, and customer confidential material.
### Why this is the answer
Once data goes to an unapproved service, you may lose control over retention, training use and who can access it, and you may breach legal or contractual duties. Public marketing text, open-source code and published papers are generally low risk.
### Remember it
If it would hurt to leak, keep it out of unapproved tools.

## Why keep an AI inventory with an owner and a data class for each use case?
### What it is
An inventory is a register of AI systems and use cases, each with an owner and the class of data it touches.
### Why this is the answer
Every other process depends on it. A review needs to know what exists, an incident needs someone to call, and a shutdown needs a target. It is not a ranking of employees or a vendor license audit.
### Remember it
You cannot review, defend or shut down what you have not listed.

## What is a risk-tiered AI review?
### What it is
A review process whose depth depends on risk. Higher-impact or more sensitive use cases get deeper review, and low-risk ones get a fast path.
### Why this is the answer
Treating every request the same either slows everyone down or rubber-stamps the risky ones. Tiering concentrates effort where harm could be greatest, and a fast path keeps security from becoming a bottleneck that drives people to shadow AI.
### Remember it
Spend review effort where the risk is.

## What evidence do auditors want for AI controls?
### What it is
Evidence that the controls exist and operate: policies, an inventory, risk assessments, test results, and logs or records showing the controls working over time.
### Why this is the answer
Auditors test operation, not intent. A vendor's marketing deck, a single signed statement or model weights do not show your controls working. Keep records as you go, so evidence exists when asked.
### Remember it
Show that it exists, and show that it runs.

## What is red teaming an AI system?
### What it is
Adversarial testing of the whole system: the model, prompts, tools, data and permissions, looking for misuse and failure. Testers try injection, jailbreaks, data extraction, tool abuse and harmful outputs.
### Why this is the answer
It tests **behavior under attack**, not just accuracy. Public benchmarks, contract reviews and load tests answer other questions. Findings should become permanent test cases so fixes stay fixed.
### Remember it
Attack your own system before someone else does, and keep the tests.

## Why involve Legal and Privacy in AI reviews?
### What it is
Many AI questions are legal or privacy questions: who owns the data, what regulated data is involved, how long it is kept, whether people are notified, and what you have promised customers.
### Why this is the answer
Engineering can say what is technically possible but cannot decide what is lawful or contractually allowed. Bringing Legal and Privacy in early prevents rework and avoids deploying something that breaks a commitment.
### Remember it
Technical feasibility is not permission.
