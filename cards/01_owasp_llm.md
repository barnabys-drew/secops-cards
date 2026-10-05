# OWASP LLM Top 10
> The 2025 list: name, number, and how to spot each one in a scenario.

Q: LLM01:2025
A: Prompt Injection. Crafted input changes the model's behavior or bypasses its instructions.
Direct = the user types it. Indirect = it arrives inside content the model reads (web page, email, document, tool result).

Q: LLM02:2025
A: Sensitive Information Disclosure. The model or app leaks PII, credentials, proprietary data, or training data in its output.

Q: LLM03:2025
A: Supply Chain. Compromised or tampered models, datasets, plugins, and libraries (for example a poisoned model on a public hub, or an unsafe pickle file).

Q: LLM04:2025
A: Data and Model Poisoning. Tampering with pre-training, fine-tuning, or embedding data to plant bias, backdoors, or bad behavior.

Q: LLM05:2025
A: Improper Output Handling. Model output passed to downstream systems without validation or encoding, leading to XSS, SQL injection, SSRF, or code execution.

Q: LLM06:2025
A: Excessive Agency. The model can take damaging actions because it has too much functionality, too many permissions, or too much autonomy.

Q: LLM07:2025
A: System Prompt Leakage. The system prompt is exposed, and it contained things that should not be secret-dependent (credentials, access rules, internal logic).

Q: LLM08:2025
A: Vector and Embedding Weaknesses. RAG-specific: weak access control on the vector store, cross-tenant leakage, poisoned documents, embedding inversion.

Q: LLM09:2025
A: Misinformation. Confident but false output (hallucination) that people or systems rely on.

Q: LLM10:2025
A: Unbounded Consumption. Uncontrolled inference use causing denial of service, runaway cost ("denial of wallet"), or model extraction through mass querying.

Q: A chatbot's reply is inserted into a web page without escaping and runs attacker script. Which OWASP LLM category?
A: LLM05 Improper Output Handling. Treat model output as untrusted input to whatever consumes it.

Q: An email-summarizing agent also has a "delete mail" tool it never needs. Which category, and which of the three causes?
A: LLM06 Excessive Agency, caused by excessive functionality (a tool the task does not need). Remove the tool.

Q: An internal RAG assistant shows HR documents to any employee who asks. Which category, and what is the root fix?
A: LLM08 Vector and Embedding Weaknesses (also LLM02). Enforce the user's existing document permissions at retrieval time, not in the prompt.

Q: An attacker floods an LLM endpoint with huge requests and the victim's API bill explodes. Which category?
A: LLM10 Unbounded Consumption. Fix with rate limits, per-user quotas, input and output size caps, and budget alerts.

Q: What are the three causes of Excessive Agency?
A: Excessive functionality (tools it does not need), excessive permissions (broader access than needed), excessive autonomy (acts without human approval on high-impact actions).

Q: Why is a system prompt not a security boundary?
A: The model can be talked out of it and can leak it. Anything that must be enforced (authorization, data access, spend limits) has to be enforced in code outside the model.

Q: Direct vs indirect prompt injection: which is the bigger problem for agents, and why?
A: Indirect. Agents read untrusted content constantly (web, mail, tickets, tool results), and the attacker never needs access to the chat box.

Q: Can prompt injection be fully prevented today?
A: No. Reduce impact instead: least privilege for tools, separate untrusted content from instructions, filter and validate outputs, require human approval for high-risk actions, monitor and log tool calls.
