%% Deep dives for cards/01_owasp_llm.md. Each "##" line must match a card's question exactly.

## LLM01:2025
### What it is
Prompt injection is when input changes what an LLM does in a way its developer did not intend. The root cause is that a model receives instructions and data in the same stream of text and cannot reliably tell which is which. A system prompt, a user message, a web page and a tool result all arrive as tokens.
- **Direct:** the user types the attack.
- **Indirect:** the attack hides in content the model reads, such as a web page, a document, an email or a tool result.
### Why this is the answer
The number one slot goes to this risk because it is the entry point for most of the others. A successful injection is what turns a harmless chatbot into one that leaks data (LLM02), calls tools it should not (LLM06) or emits dangerous output (LLM05).
### Remember it
LLM01 is the front door. Most other LLM risks need an injection, or a similar trick, to get started.

## LLM02:2025
### What it is
Sensitive Information Disclosure is when an LLM app reveals data it should not: personal data, credentials, business secrets, or training data the model memorized. It can leak through the model's output, through retrieval from connected data, or through logs and caches.
### Why this is the answer
The key word is disclosure of **data**. Compare it with System Prompt Leakage (LLM07), which is specifically about the prompt text, and with Vector and Embedding Weaknesses (LLM08), which is about the retrieval layer. Those are often the route; LLM02 is the category for the harm when private information gets out.
### Remember it
Ask: what private thing came out? If the answer is "the data itself", it is LLM02.

## LLM03:2025
### What it is
Supply Chain covers everything you take from outside and trust: pre-trained models, fine-tuning adapters, datasets, plugins, and the libraries and platforms around them. Any of these can be tampered with, mislabeled or simply vulnerable.
### Why this is the answer
The risk sits in what you **bring in**, not in what users type. A model file from a public hub can contain executable code. A dataset can carry planted behavior. A plugin can be malicious. The fix looks like ordinary supply chain security: pin and verify sources, scan artifacts, and prefer safe formats.
### Remember it
If the problem arrived through a download, a dependency or a vendor, think Supply Chain.

## LLM04:2025
### What it is
Data and Model Poisoning is the deliberate manipulation of data used in pre-training, fine-tuning or embedding so that the model learns something the attacker wants: a bias, a backdoor, or a trigger phrase that changes behavior.
### Why this is the answer
It happens at **training or data-preparation time**, which separates it from prompt injection (at inference time) and from Supply Chain (a tampered artifact you downloaded). Poisoning can be subtle: the model behaves normally until a trigger appears.
- Vet and track the provenance of training data.
- Test tuned models for unexpected behavior before release.
### Remember it
Poisoning changes what the model **learned**. Injection changes what it is **told**.

## LLM05:2025
### What it is
Improper Output Handling is when an application passes model output to another component without validating or encoding it. The model's text then runs as code or queries downstream: script in a browser, SQL in a database, a shell command, a URL fetched by the server.
### Why this is the answer
It is a classic injection problem with a new source. Model output is shaped by user input and by anything the model read, so it must be treated as **untrusted**, exactly like form input. The same defenses apply: encode for the destination, use parameterized queries, validate against a schema, and avoid running output as code.
### Remember it
The model is a user, from the point of view of the next system. Never trust it.

## LLM06:2025
### What it is
Excessive Agency is when an LLM-based system can take actions with more power than the task needs. It has three roots: too much functionality (tools it does not need), too many permissions (broad access), and too much autonomy (it acts without approval on high-impact steps).
### Why this is the answer
The model is not the problem; the **authority you gave it** is. Because models can be manipulated, any capability they hold is a capability an attacker can try to borrow. The remedy is the old rule of least privilege applied to agents: fewer tools, narrow scopes, and human approval for actions that are hard to undo.
### Remember it
Imagine the model fully compromised. What could it do with the tools you gave it?

## LLM07:2025
### What it is
System Prompt Leakage is when the hidden instructions that guide a model can be extracted, and those instructions contain things that should never have been there, such as credentials, internal rules, or details of how access is enforced.
### Why this is the answer
The risk is less that the prompt can be read and more that **the design depended on it staying secret**. Models can often be coaxed into repeating their instructions, so assume the prompt is public. Keep secrets in a secrets manager, and enforce permissions and rules in code outside the model.
### Remember it
Write the system prompt as if a user will read it, because one eventually will.

## LLM08:2025
### What it is
Vector and Embedding Weaknesses are the risks of retrieval-augmented generation (RAG): the vector database, embeddings and retrieval step. They include missing access control on stored content, data from different tenants mixed together, poisoned documents, and inversion attacks that reconstruct text from embeddings.
### Why this is the answer
RAG adds a new data store the model reads from. Similarity search returns what is **close in meaning**, not what the user is **allowed to see**, unless you enforce permissions at retrieval. Most real incidents here are an authorization failure in the retrieval layer.
### Remember it
Embeddings find similar, not permitted. You have to add permitted.

## LLM09:2025
### What it is
Misinformation is when a model produces false or misleading content that sounds credible, and people or systems rely on it. Hallucination is the best-known cause; others are biased training data and missing context.
### Why this is the answer
The harm comes from **over-reliance**: someone acts on a confident but wrong answer. Examples include invented legal citations, fake medical advice and made-up software packages. Mitigations include grounding answers in retrieved sources, verification steps, clear uncertainty signals, and human review for high-stakes use.
### Remember it
Confident is not the same as correct. Verify before acting.

## LLM10:2025
### What it is
Unbounded Consumption is when an LLM application lets users consume inference resources without limits. Consequences include denial of service, runaway cloud bills ("denial of wallet"), and model extraction by repeated querying.
### Why this is the answer
Inference is expensive, and a single request can be made very costly with long inputs, large outputs or repeated calls. Without limits, abuse hurts availability and budget even when no data is stolen. Defenses are ordinary: rate limits, per-user quotas, input and output size caps, timeouts and spend alerts.
### Remember it
If the damage is a bill or an outage rather than a leak, think LLM10.

## A chatbot's reply is inserted into a web page without escaping and runs attacker script. Which OWASP LLM category?
### What it is
This is **Improper Output Handling (LLM05)**. The chatbot's text was placed into a page as HTML. Because an attacker can influence what the model says, the model can be made to say `<script>` content, which then executes in other users' browsers: cross-site scripting.
### Why this is the answer
Injection (LLM01) may be how the attacker steered the model, but the vulnerability that lets script run is the application's failure to **encode output**. Fix it where the output is used: encode for HTML, or render as plain text.
### Remember it
When model text becomes code in another system, the flaw is in how that system handled it.

## An email-summarizing agent also has a "delete mail" tool it never needs. Which category, and which of the three causes?
### What it is
This is **Excessive Agency (LLM06)**, specifically **excessive functionality**. The agent has a capability that has nothing to do with its job.
### Why this is the answer
Summarizing mail needs read access, not deletion. An injected instruction in an email could otherwise tell the agent to delete messages. The other two causes are different: excessive permissions would be a read tool with access to every mailbox, and excessive autonomy would be deleting without asking. The first fix is simple: remove the tool.
### Remember it
If the agent does not need it for the job, it should not have it.

## An internal RAG assistant shows HR documents to any employee who asks. Which category, and what is the root fix?
### What it is
This is a **Vector and Embedding Weaknesses (LLM08)** problem, and it also leaks sensitive information (LLM02). The retrieval step returns documents without checking who is asking.
### Why this is the answer
Telling the model in the prompt not to reveal HR files is not a control, because the model can be talked around it. The real fix is to **enforce the user's existing document permissions when retrieving**, so the HR chunks never reach the prompt for people without access.
### Remember it
Filter before the model sees the text, not after.

## An attacker floods an LLM endpoint with huge requests and the victim's API bill explodes. Which category?
### What it is
This is **Unbounded Consumption (LLM10)**, sometimes called "denial of wallet". The attack does not steal data. It exploits the fact that every request costs real money.
### Why this is the answer
No data was disclosed, no unauthorized action was taken, and no content was wrong, so the other categories do not fit. The resource itself is being exhausted. Mitigate with per-user quotas, rate limits, caps on input and output size, and budget alerts that fire early.
### Remember it
Bill spike or outage with no breach: LLM10.

## What are the three causes of Excessive Agency?
### What it is
Excessive Agency has three roots, and they map to three questions you can ask about any agent.
- **Excessive functionality:** does it have tools it does not need?
- **Excessive permissions:** are the tools it does need allowed to do more than necessary?
- **Excessive autonomy:** can it take high-impact actions without a person approving?
### Why this is the answer
They are separate problems with separate fixes: remove tools, narrow scopes, add approval gates. A system can have one without the others, which is why reviews check all three.
### Remember it
Functionality, permissions, autonomy: what it can use, what it can reach, and what it can do alone.

## Why is a system prompt not a security boundary?
### What it is
A system prompt is text the model is asked to follow. A security boundary is something that holds even when the other side is hostile. A prompt is the first kind, not the second.
### Why this is the answer
The model can be persuaded, confused or tricked into ignoring or revealing its instructions, and there is no guarantee it will follow them. Anything that must always hold, such as authorization, data access, spending limits and which tools may run, has to be **enforced in code outside the model**. Use the prompt for guidance and keep enforcement elsewhere.
### Remember it
Prompts ask. Code enforces.

## Direct vs indirect prompt injection: which is the bigger problem for agents, and why?
### What it is
Direct injection is the user typing malicious instructions. Indirect injection is malicious instructions hidden in content the model processes: a web page, a PDF, an email, a ticket, a tool result.
### Why this is the answer
Agents read untrusted content all day, and the attacker does not need access to the chat window. They only need to put text where the agent will read it. That removes the assumption that the person talking to the agent is the person attacking it, which makes indirect injection the harder problem to defend.
### Remember it
For agents, anything they read can be an attack.

## Can prompt injection be fully prevented today?
### What it is
Today there is no reliable way to guarantee a model will never follow malicious instructions that appear in its input. Filters, classifiers and stronger prompts reduce the rate of success but can be bypassed.
### Why this is the answer
Since prevention cannot be guaranteed, design for **limited impact**. Give the model least privilege, keep untrusted content separate from instructions where possible, validate and filter outputs, require human approval for high-risk actions, and monitor tool calls. Assume an injection will sometimes work and make sure it cannot do much.
### Remember it
You cannot make the model un-trickable, so make the trick not matter.

## A support bot obeys a hidden instruction inside a customer's uploaded PDF and emails internal data. Which category?
### What it is
This is **indirect prompt injection (LLM01)**. The instruction came from a document the bot read, not from the person chatting.
### Why this is the answer
The attack surface is the content the bot ingests. Data exposure and an unwanted email are what happened, but the cause is that text in a file was treated as an instruction. Reduce harm by treating documents as data, removing or restricting the email tool, and requiring approval before anything leaves the company.
### Remember it
Hidden text in a file, page or email that steers the model: indirect injection.

## A pickled model downloaded from a public hub runs code the moment it is loaded. Which category?
### What it is
This is **Supply Chain (LLM03)**. Python's pickle format can contain code that runs while the file is deserialized, so loading an untrusted pickled model is running an untrusted program.
### Why this is the answer
The danger lies in the artifact you downloaded and trusted, not in anything a user typed. Defenses: prefer safe formats such as safetensors, pin and verify hashes, use trusted sources, and scan or sandbox before loading.
### Remember it
A model file is code until proven otherwise.

## A developer puts API keys in the system prompt and users extract them. Which category?
### What it is
This is **System Prompt Leakage (LLM07)**. The sensitive part is that secrets were stored in the prompt in the first place.
### Why this is the answer
Models can be coaxed into repeating their instructions, so anything in a system prompt may be exposed. Secrets belong in a secrets manager, accessed by code the model cannot influence. Authorization rules should be enforced by the application, so that leaking the prompt reveals nothing that matters.
### Remember it
If leaking the prompt would hurt, the prompt holds too much.

## A fine-tuning set scraped from forums contains planted text that makes the model recommend a malicious package. Which category?
### What it is
This is **Data and Model Poisoning (LLM04)**. An attacker influenced the data the model learned from, so a behavior was baked into the tuned model.
### Why this is the answer
The manipulation happened before the model was deployed, in the training data, not at query time. Defenses include vetting data sources, tracking provenance, filtering suspicious samples, and evaluating the tuned model for unwanted recommendations before it ships.
### Remember it
Scraped data is untrusted data. Training is where the attacker gets patient.

## A model confidently names a package that does not exist, and developers install an attacker-registered copy. What is the root cause category?
### What it is
The root cause is **Misinformation (LLM09)**: the model hallucinated a package name. Attackers watch for commonly hallucinated names and register them with malicious code, an attack sometimes called slopsquatting.
### Why this is the answer
Supply chain issues follow, but without the false suggestion nothing would have been installed. The fix is verification: check that a package exists, is established and is what you expect before installing, and do not trust model-suggested dependencies blindly.
### Remember it
A hallucination is a free suggestion for an attacker to exploit.

## The model outputs HTML that a web page renders. What is the best control?
### What it is
Encode or sanitize the output for the place it will be used. For HTML, that means escaping it or using a sanitizer so script and event handlers cannot run.
### Why this is the answer
This is the standard defense against Improper Output Handling (LLM05). Asking the model in its prompt to avoid scripts is not a control, lowering temperature changes nothing about safety, and limiting prompt length does not stop a short payload. The control must live in the code that renders the output.
### Remember it
Encode for the destination, always.

## A tool-calling agent can run any shell command. What is the best first fix?
### What it is
A general shell tool is the widest possible capability. This is excessive functionality, the first cause of Excessive Agency (LLM06).
### Why this is the answer
Replace it with narrow, **allowlisted** tools that do exactly the needed jobs. A stronger system prompt can be ignored, and logging only tells you after the damage. Shrinking what the agent can do shrinks what an attacker can make it do.
### Remember it
Give the agent verbs, not a terminal.

## What is "denial of wallet"?
### What it is
Denial of wallet is abusive use of a pay-per-use service to run up the victim's bill. For LLM apps, the attacker sends many expensive requests, often with long inputs or outputs, so the owner pays for the inference.
### Why this is the answer
It belongs to **Unbounded Consumption (LLM10)** because the harm is financial and availability-related, with no data theft needed. Defenses are rate limits, per-user quotas, size caps, timeouts and spend alerts.
### Remember it
Cost is an attack surface.

## Why do embeddings and vector stores need access control?
### What it is
A vector store returns the documents closest in meaning to a query. By default, it has no idea who is asking.
### Why this is the answer
Without checks at retrieval time, a query can pull in documents from other users, teams or tenants, which then appear in the model's answer. Embeddings can also leak information about the text they encode. Apply the same permissions to retrieval that the source system applies to the original documents.
### Remember it
Similar is not authorized.

## Name an effective way to reduce sensitive information disclosure from an LLM app.
### What it is
Reduce what the app can reach and what it can say. Sanitize or remove sensitive data before it reaches the model, filter or redact outputs, and give the application least-privilege access to data.
### Why this is the answer
Relying on the model to refuse is weak because refusals can be bypassed. Raising temperature or lengthening context has no safety value. Storing every prompt forever increases what can leak. The effective controls limit exposure at the data layer, where the model cannot talk its way past them.
### Remember it
What the model never sees, it cannot leak.
