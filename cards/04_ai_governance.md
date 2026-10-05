# AI governance and review
> Frameworks, vendor reviews, inventory, and IR playbooks for AI systems.

Q: NIST AI RMF 1.0: the four functions
A: Govern (cross-cutting culture, policy, accountability), Map (context and risks), Measure (assess and track), Manage (prioritize and respond).
S: Govern, Map, Measure, Manage
X: Identify, Protect, Detect, Respond
X: Plan, Do, Check, Act
X: Assess, Design, Deploy, Monitor

Q: NIST AI 600-1
A: The Generative AI Profile of the AI RMF (2024): risks specific to generative AI and suggested actions.
S: The Generative AI Profile of the AI RMF
X: The AI RMF's testing methodology
X: A NIST standard for AI red teaming
X: The AI incident reporting format

Q: ISO/IEC 42001 vs ISO/IEC 27001
A: 42001 = AI management system (AIMS), certifiable. 27001 = information security management system (ISMS). They are complementary, not interchangeable.
S: 42001 is an AI management system; 27001 is an information security management system
X: 42001 covers privacy; 27001 covers safety
X: They are the same standard with different numbers
X: 42001 is for vendors; 27001 is for regulators

Q: EU AI Act risk tiers
A: Unacceptable (banned), high-risk (strict obligations), limited risk (transparency duties), minimal risk.
S: Unacceptable, high-risk, limited risk, minimal risk
X: Critical, major, moderate, minor
X: Prohibited, regulated, monitored, exempt
X: Tier 1 to Tier 4, assigned by company size

Q: What goes in an AI acceptable use policy?
A: Approved tools, which data classes may be used where, prohibited uses, required human review, disclosure rules, and how to request a new tool.
S: Approved tools, data rules, prohibited uses, human review, disclosure
X: Only the list of banned models
X: Only the vendor contract terms
X: Only the company's AI mission statement

Q: Questions for an AI vendor or SaaS AI-feature review
A: Is our data used for training? Retention and residency? Which model provider and subprocessors? Tenant isolation? Does the AI respect existing permissions (ACLs)? Admin controls, audit logs, injection posture, and is the AI feature in scope of their SOC 2?
S: Training on our data, retention, subprocessors, isolation, ACLs, logging
X: Logo, pricing tier, and support hours
X: Model parameter count and benchmark scores
X: Number of customers and funding stage

Q: The biggest hidden risk of enabling an AI feature inside a SaaS tool (a workspace assistant, for example)
A: It can surface anything the user can technically access, exposing years of over-shared content. Fix permissions hygiene before or alongside rollout.
S: It surfaces anything the user can access, exposing over-shared content
X: It always sends data to a competitor
X: It disables SSO for AI users
X: It stores prompts in plaintext on user laptops

Q: How do you discover AI use you do not know about?
A: IdP and OAuth app grants, CASB or proxy logs, expense data, browser extensions, API-key usage and cloud billing, and code scans for AI SDK imports.
S: IdP/OAuth grants, CASB or proxy logs, expenses, extensions, billing, code scans
X: Ask employees to self-report in a survey
X: Scan only the corporate wiki
X: Review the firewall's blocked-site list

Q: Core elements of an AI incident response playbook
A: Scoping (which model, prompt, data, and tools), evidence (prompts, retrieved documents, tool-call logs), containment (disable the tool or feature flag, revoke tokens, rotate credentials), eradication (fix prompt or guardrail, purge poisoned data), and lessons turned into eval cases.
S: Scope, evidence, containment, eradication, and lessons turned into evals
X: Reimage all laptops and rotate the CEO's password
X: Wait for the vendor's incident report
X: Retrain the model and redeploy immediately

Q: Structure of a security position paper on an emerging technology
A: The problem and why now, a threat model, current controls and gaps, a recommendation with a decision needed, and how you will measure success.
S: Problem, threat model, controls and gaps, recommendation, success metrics
X: Abstract, methods, results, discussion, references
X: Features, pricing, roadmap, competitors, FAQ
X: Incident timeline, root cause, blame, fix

Q: What goes in a model risk assessment?
A: Purpose and owner, data sources and sensitivity, expected performance, failure modes and their impact, monitoring, human oversight, and a retirement plan.
S: Purpose, data, performance, failure modes, monitoring, oversight, retirement
X: Vendor name, contract value, renewal date
X: Prompt text, temperature, and token limit
X: UI mockups, brand colors, and launch date

Q: OAuth 2.0 vs OIDC vs SAML
A: OAuth 2.0 = delegated authorization (access tokens). OIDC = authentication layer on top of OAuth 2.0 (ID token). SAML = XML-based federated SSO using signed assertions.
S: OAuth 2.0 authorizes; OIDC adds authentication; SAML is XML-based federated SSO
X: OAuth 2.0 authenticates; OIDC authorizes; SAML encrypts tokens
X: All three authenticate, but only SAML authorizes
X: OIDC is XML-based; SAML is JSON-based

Q: What is a CASB?
A: Cloud access security broker: gives visibility into and control over SaaS and cloud usage (shadow IT discovery, DLP, access policy).
S: Visibility and control over SaaS and cloud usage
X: A cloud backup service
X: A network firewall appliance
X: A cloud billing dashboard

Q: SOC 2 Trust Services Criteria
A: Security (required), availability, processing integrity, confidentiality, privacy.
S: Security, availability, processing integrity, confidentiality, privacy
X: Security, scalability, portability, compliance, performance
X: Authentication, authorization, accounting, auditing, availability
X: Confidentiality, integrity, availability, non-repudiation, privacy

Q: Non-human identities in IAM
A: Service accounts, API keys, OAuth apps, and agents. Inventory them, assign owners, scope them minimally, rotate or expire credentials, and log their actions.
S: Service accounts, API keys, OAuth apps, and agents: inventory, scope, rotate, log
X: Only service accounts; agents count as users
X: Only API keys; everything else is a user
X: Only bots in chat tools

Q: STRIDE
A: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For AI systems, apply it at each trust boundary: user to app, app to model, model to tools, retrieval to model.
S: Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege
X: Spoofing, Theft, Replay, Injection, Deception, Exploitation
X: Scanning, Tampering, Reconnaissance, Intrusion, Denial, Escalation
X: Safety, Trust, Reliability, Integrity, Disclosure, Ethics

Q: What is fine-tuning's main security risk?
A: Training data leakage (memorization of sensitive records) and poisoned or low-quality data changing model behavior. Treat the fine-tuning dataset like production data.
S: Training data leakage, and poisoned data changing behavior
X: Slower inference
X: Higher token prices
X: Loss of the model's tokenizer

Q: Who should own an AI system's risk?
A: A named business owner, with security as advisor and reviewer. Without an owner no one decides, fixes, or shuts it down.
S: A named business owner, with security as advisor and reviewer
X: The model vendor
X: The security team alone
X: Whoever deployed it first

Q: What is "shadow AI"?
A: AI tools and features used outside IT and security oversight. Find them with IdP grants, proxy logs, and expense data, then bring the valuable ones into an approved path.
S: Unapproved AI tools and features used outside IT or security oversight
X: AI running on idle servers
X: AI that works without data
X: Models that hide their reasoning

Q: Which data should never go into an unapproved AI tool?
A: Regulated and confidential data: PHI, payment data, credentials, source secrets, and customer confidential material.
S: Regulated and confidential data such as PHI, payment data, and credentials
X: Public marketing copy
X: Open-source code
X: Published research papers

Q: Why keep an AI inventory with an owner and a data class for each use case?
A: Reviews, incidents, and shutdowns need someone to contact and something specific to act on.
S: So reviews, incidents, and shutdowns have an owner and a target
X: To rank employees by AI usage
X: To satisfy one vendor's license audit
X: To reduce model hallucinations

Q: What is a risk-tiered AI review?
A: Deeper review for higher-impact or more sensitive use cases, and a fast path for low-risk ones, so security does not become the bottleneck.
S: Deeper review for higher-risk use cases, a fast path for low risk
X: Every use case gets the same full review
X: Only customer-facing systems are reviewed
X: Review depth depends on the vendor's size

Q: What evidence do auditors want for AI controls?
A: Policies, an inventory, risk assessments, test results, and logs showing the controls actually operate.
S: Policies, inventory, assessments, test results, and logs showing controls operate
X: The vendor's marketing deck
X: One signed statement from the CISO
X: The model weights

Q: What is red teaming an AI system?
A: Adversarial testing of the whole system (model, prompts, tools, data, and permissions) for misuse and failure, not just the model in isolation.
S: Adversarial testing of the whole system for misuse and failures
X: Benchmarking accuracy on a public dataset
X: Reviewing the vendor contract
X: Load testing the API

Q: Why involve Legal and Privacy in AI reviews?
A: Data rights, regulated data, retention, and customer commitments are legal questions that engineering cannot settle alone.
S: Data rights, regulated data, retention, and customer commitments are legal questions
X: They approve model architectures
X: They write the prompts
X: They manage the GPUs
