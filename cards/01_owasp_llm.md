# OWASP LLM Top 10
> The 2025 list: name, number, and how to spot each one in a scenario.

Q: LLM01:2025
A: Prompt Injection. Crafted input changes the model's behavior or bypasses its instructions.
Direct = the user types it. Indirect = it arrives inside content the model reads (web page, email, document, tool result).
S: Prompt Injection
X: Sensitive Information Disclosure
X: Improper Output Handling
X: System Prompt Leakage

Q: LLM02:2025
A: Sensitive Information Disclosure. The model or app leaks PII, credentials, proprietary data, or training data in its output.
S: Sensitive Information Disclosure
X: Data and Model Poisoning
X: Misinformation
X: Supply Chain

Q: LLM03:2025
A: Supply Chain. Compromised or tampered models, datasets, plugins, and libraries (for example a poisoned model on a public hub, or an unsafe pickle file).
S: Supply Chain
X: Excessive Agency
X: Unbounded Consumption
X: Vector and Embedding Weaknesses

Q: LLM04:2025
A: Data and Model Poisoning. Tampering with pre-training, fine-tuning, or embedding data to plant bias, backdoors, or bad behavior.
S: Data and Model Poisoning
X: Improper Output Handling
X: Sensitive Information Disclosure
X: Supply Chain

Q: LLM05:2025
A: Improper Output Handling. Model output passed to downstream systems without validation or encoding, leading to XSS, SQL injection, SSRF, or code execution.
S: Improper Output Handling
X: Prompt Injection
X: System Prompt Leakage
X: Excessive Agency

Q: LLM06:2025
A: Excessive Agency. The model can take damaging actions because it has too much functionality, too many permissions, or too much autonomy.
S: Excessive Agency
X: Unbounded Consumption
X: Improper Output Handling
X: Misinformation

Q: LLM07:2025
A: System Prompt Leakage. The system prompt is exposed, and it contained things that should not be secret-dependent (credentials, access rules, internal logic).
S: System Prompt Leakage
X: Sensitive Information Disclosure
X: Prompt Injection
X: Vector and Embedding Weaknesses

Q: LLM08:2025
A: Vector and Embedding Weaknesses. RAG-specific: weak access control on the vector store, cross-tenant leakage, poisoned documents, embedding inversion.
S: Vector and Embedding Weaknesses
X: Data and Model Poisoning
X: Supply Chain
X: System Prompt Leakage

Q: LLM09:2025
A: Misinformation. Confident but false output (hallucination) that people or systems rely on.
S: Misinformation
X: Sensitive Information Disclosure
X: Excessive Agency
X: Unbounded Consumption

Q: LLM10:2025
A: Unbounded Consumption. Uncontrolled inference use causing denial of service, runaway cost ("denial of wallet"), or model extraction through mass querying.
S: Unbounded Consumption
X: Excessive Agency
X: Misinformation
X: Supply Chain

Q: A chatbot's reply is inserted into a web page without escaping and runs attacker script. Which OWASP LLM category?
A: LLM05 Improper Output Handling. Treat model output as untrusted input to whatever consumes it.
S: LLM05 Improper Output Handling
X: LLM01 Prompt Injection
X: LLM06 Excessive Agency
X: LLM02 Sensitive Information Disclosure

Q: An email-summarizing agent also has a "delete mail" tool it never needs. Which category, and which of the three causes?
A: LLM06 Excessive Agency, caused by excessive functionality (a tool the task does not need). Remove the tool.
S: LLM06 Excessive Agency, from excessive functionality
X: LLM06 Excessive Agency, from excessive autonomy
X: LLM03 Supply Chain, from excessive functionality
X: LLM10 Unbounded Consumption, from excessive permissions

Q: An internal RAG assistant shows HR documents to any employee who asks. Which category, and what is the root fix?
A: LLM08 Vector and Embedding Weaknesses (also LLM02). Enforce the user's existing document permissions at retrieval time, not in the prompt.
S: LLM08: enforce the user's document permissions at retrieval time
X: LLM08: tell the model in the prompt not to reveal HR documents
X: LLM04: retrain the model on cleaner data
X: LLM07: move the HR documents into the system prompt

Q: An attacker floods an LLM endpoint with huge requests and the victim's API bill explodes. Which category?
A: LLM10 Unbounded Consumption. Fix with rate limits, per-user quotas, input and output size caps, and budget alerts.
S: LLM10 Unbounded Consumption
X: LLM06 Excessive Agency
X: LLM04 Data and Model Poisoning
X: LLM09 Misinformation

Q: What are the three causes of Excessive Agency?
A: Excessive functionality (tools it does not need), excessive permissions (broader access than needed), excessive autonomy (acts without human approval on high-impact actions).
S: Excessive functionality, permissions, and autonomy
X: Excessive latency, logging, and storage
X: Weak prompts, weak models, and weak users
X: Excessive training data, parameters, and compute

Q: Why is a system prompt not a security boundary?
A: The model can be talked out of it and can leak it. Anything that must be enforced (authorization, data access, spend limits) has to be enforced in code outside the model.
S: The model can be talked out of it or leak it, so enforce rules in code
X: System prompts are too long to be parsed reliably
X: Models stop following system prompts after the first message
X: System prompts cannot be changed without retraining the model

Q: Direct vs indirect prompt injection: which is the bigger problem for agents, and why?
A: Indirect. Agents read untrusted content constantly (web, mail, tickets, tool results), and the attacker never needs access to the chat box.
S: Indirect: agents read untrusted content and the attacker never needs chat access
X: Direct: users can type anything, so it dominates
X: Both are equal because the model cannot tell them apart
X: Neither matters once a guardrail classifier is deployed

Q: Can prompt injection be fully prevented today?
A: No. Reduce impact instead: least privilege for tools, separate untrusted content from instructions, filter and validate outputs, require human approval for high-risk actions, monitor and log tool calls.
S: No; limit the impact with least privilege, isolation, and approvals
X: Yes, with a strong enough system prompt
X: Yes, with an input filter that blocks known phrases
X: Yes, by fine-tuning the model on injection examples

Q: A support bot obeys a hidden instruction inside a customer's uploaded PDF and emails internal data. Which category?
A: LLM01 Prompt Injection (indirect). The instruction arrived in content the model read. Treat documents as data, restrict the email tool, and require approval for outbound messages.
S: LLM01 Prompt Injection (indirect)
X: LLM07 System Prompt Leakage
X: LLM04 Data and Model Poisoning
X: LLM03 Supply Chain

Q: A pickled model downloaded from a public hub runs code the moment it is loaded. Which category?
A: LLM03 Supply Chain. Untrusted model artifacts are code. Prefer safe formats (safetensors), pin and hash sources, and scan before loading.
S: LLM03 Supply Chain
X: LLM05 Improper Output Handling
X: LLM10 Unbounded Consumption
X: LLM09 Misinformation

Q: A developer puts API keys in the system prompt and users extract them. Which category?
A: LLM07 System Prompt Leakage. Secrets do not belong in prompts. Keep them in a secrets manager and enforce access outside the model.
S: LLM07 System Prompt Leakage
X: LLM04 Data and Model Poisoning
X: LLM08 Vector and Embedding Weaknesses
X: LLM10 Unbounded Consumption

Q: A fine-tuning set scraped from forums contains planted text that makes the model recommend a malicious package. Which category?
A: LLM04 Data and Model Poisoning. Vet data sources, track provenance, and test the tuned model for backdoored behavior.
S: LLM04 Data and Model Poisoning
X: LLM01 Prompt Injection
X: LLM09 Misinformation
X: LLM06 Excessive Agency

Q: A model confidently names a package that does not exist, and developers install an attacker-registered copy. What is the root cause category?
A: LLM09 Misinformation (hallucinated packages, sometimes called slopsquatting). Verify that a package exists and is trusted before installing.
S: LLM09 Misinformation
X: LLM10 Unbounded Consumption
X: LLM07 System Prompt Leakage
X: LLM02 Sensitive Information Disclosure

Q: The model outputs HTML that a web page renders. What is the best control?
A: Encode or sanitize the output for where it will be used (LLM05). Do not rely on telling the model to avoid scripts.
S: Encode or sanitize output for its destination
X: Tell the model in the system prompt to avoid scripts
X: Lower the model temperature
X: Limit the length of user prompts

Q: A tool-calling agent can run any shell command. What is the best first fix?
A: Replace it with narrow, allowlisted tools. This removes excessive functionality, which is the root of the problem.
S: Replace it with narrow, allowlisted tools
X: Add a stronger system prompt
X: Log every command and review weekly
X: Give it a larger context window

Q: What is "denial of wallet"?
A: Abusive usage that drives up a victim's inference bill (LLM10 Unbounded Consumption). Mitigate with per-user quotas, rate limits, size caps, and budget alerts.
S: Abusive usage that drives up a victim's inference bill
X: Stealing payment card data from the model
X: Locking a user's account after failed payments
X: Crashing the model server with malformed input

Q: Why do embeddings and vector stores need access control?
A: Similarity search can return documents across users or tenants unless retrieval enforces permissions (LLM08).
S: Similar documents can be retrieved across users or tenants without checks
X: Embeddings are too large to store safely
X: Embeddings change the model's weights
X: Embeddings expire after one query

Q: Name an effective way to reduce sensitive information disclosure from an LLM app.
A: Sanitize data before it reaches the model, filter output, and give the app least-privilege access to data (LLM02).
S: Sanitize inputs, filter output, and limit what data the app can reach
X: Use a longer context window and a higher temperature
X: Rely on the model to refuse
X: Store all prompts permanently for audit
