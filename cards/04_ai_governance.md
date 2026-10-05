# AI governance and review
> Frameworks, vendor reviews, inventory, and IR playbooks for AI systems.

Q: NIST AI RMF 1.0: the four functions
A: Govern (cross-cutting culture, policy, accountability), Map (context and risks), Measure (assess and track), Manage (prioritize and respond).

Q: NIST AI 600-1
A: The Generative AI Profile of the AI RMF (2024): risks specific to generative AI and suggested actions.

Q: ISO/IEC 42001 vs ISO/IEC 27001
A: 42001 = AI management system (AIMS), certifiable. 27001 = information security management system (ISMS). They are complementary, not interchangeable.

Q: EU AI Act risk tiers
A: Unacceptable (banned), high-risk (strict obligations), limited risk (transparency duties), minimal risk.

Q: What goes in an AI acceptable use policy?
A: Approved tools, which data classes may be used where, prohibited uses, required human review, disclosure rules, and how to request a new tool.

Q: Questions for an AI vendor or SaaS AI-feature review
A: Is our data used for training? Retention and residency? Which model provider and subprocessors? Tenant isolation? Does the AI respect existing permissions (ACLs)? Admin controls, audit logs, injection posture, and is the AI feature in scope of their SOC 2?

Q: The biggest hidden risk of enabling an AI feature inside a SaaS tool (a workspace assistant, for example)
A: It can surface anything the user can technically access, exposing years of over-shared content. Fix permissions hygiene before or alongside rollout.

Q: How do you discover AI use you do not know about?
A: IdP and OAuth app grants, CASB or proxy logs, expense data, browser extensions, API-key usage and cloud billing, and code scans for AI SDK imports.

Q: Core elements of an AI incident response playbook
A: Scoping (which model, prompt, data, and tools), evidence (prompts, retrieved documents, tool-call logs), containment (disable the tool or feature flag, revoke tokens, rotate credentials), eradication (fix prompt or guardrail, purge poisoned data), and lessons turned into eval cases.

Q: Structure of a security position paper on an emerging technology
A: The problem and why now, a threat model, current controls and gaps, a recommendation with a decision needed, and how you will measure success.

Q: What goes in a model risk assessment?
A: Purpose and owner, data sources and sensitivity, expected performance, failure modes and their impact, monitoring, human oversight, and a retirement plan.

Q: OAuth 2.0 vs OIDC vs SAML
A: OAuth 2.0 = delegated authorization (access tokens). OIDC = authentication layer on top of OAuth 2.0 (ID token). SAML = XML-based federated SSO using signed assertions.

Q: What is a CASB?
A: Cloud access security broker: gives visibility into and control over SaaS and cloud usage (shadow IT discovery, DLP, access policy).

Q: SOC 2 Trust Services Criteria
A: Security (required), availability, processing integrity, confidentiality, privacy.

Q: Non-human identities in IAM
A: Service accounts, API keys, OAuth apps, and agents. Inventory them, assign owners, scope them minimally, rotate or expire credentials, and log their actions.

Q: STRIDE
A: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. For AI systems, apply it at each trust boundary: user to app, app to model, model to tools, retrieval to model.

Q: What is fine-tuning's main security risk?
A: Training data leakage (memorization of sensitive records) and poisoned or low-quality data changing model behavior. Treat the fine-tuning dataset like production data.
