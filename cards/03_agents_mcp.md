# Agents and MCP security
> Trust boundaries, tool permissions, and the attacks specific to tool-calling systems.

Q: MCP roles: host, client, server.
A: Host = the application the user runs (IDE, chat app). Client = the connector inside the host, one per server. Server = exposes tools, resources, and prompts over JSON-RPC.
S: Host is the app; client is its per-server connector; server exposes capabilities
X: Host is the server; client is the model; server is the user
X: Host is the model; client is the user; server is the app
X: Host and client are the same thing; the server is the model

Q: What do MCP servers expose?
A: Tools (actions the model can call), resources (data it can read), and prompts (templated instructions).
S: Tools, resources, and prompts
X: Models, datasets, and checkpoints
X: Agents, memories, and policies
X: Tokens, sessions, and scopes

Q: What are the two standard MCP transports?
A: stdio (local subprocess) and Streamable HTTP (remote). Local stdio servers run with the user's privileges.
S: stdio and Streamable HTTP
X: gRPC and WebSockets
X: SMTP and stdio
X: Streamable HTTP and SSH

Q: Tool poisoning
A: Malicious instructions hidden in a tool's name, description, or schema. The model reads them; the user usually never sees them.
S: Hidden malicious instructions in a tool's description or schema
X: Corrupting the data a tool was trained on
X: Overloading a tool with requests
X: Replacing a tool's binary on disk

Q: Rug pull (MCP)
A: A server changes its tool definitions after the user approved it. Mitigation: pin or hash definitions and require re-approval on any change.
S: A server changes its tool definitions after you approved it
X: A server is removed from the registry after approval
X: A model is swapped after it was evaluated
X: A token is revoked in the middle of a session

Q: Tool shadowing
A: One server's tool description manipulates how the model uses a different, trusted server's tool.
S: One server's tool description manipulates how another server's tool is used
X: Two servers register the same network port
X: A tool runs in a hidden background process
X: A tool copies another tool's output into a log

Q: Confused deputy (agents)
A: A service with its own privileges acts for a caller without verifying that the caller may request it. Fix with per-user delegated tokens, not one shared powerful credential.
S: A privileged service acts for a caller without checking the caller's rights
X: A service trusts its own logs too much
X: Two services share the same database account
X: A model mixes up two users' sessions

Q: Token passthrough: why is it an anti-pattern?
A: The MCP server forwards a client token to a downstream API. It breaks audience binding, hides who did what, and lets a token issued for one service be abused on another. Tokens should be issued for the server itself.
S: It breaks audience binding and hides who did what
X: It makes tokens expire too quickly
X: It adds network hops that slow requests
X: It prevents tokens from being refreshed

Q: The "lethal trifecta" for agents
A: Access to private data + exposure to untrusted content + ability to communicate externally. With all three, injected instructions can exfiltrate data. Remove at least one leg.
S: Private data, untrusted content, and external communication
X: Prompt, model, and output
X: Authentication, authorization, and audit
X: Training data, fine-tuning, and inference

Q: Treat tool results as what?
A: Untrusted input. A tool result can carry an injection exactly as a web page can. Never let it expand the agent's permissions.
S: Untrusted input
X: Trusted system output
X: Verified data once the schema checks out
X: Instructions from the developer

Q: Why is "ask the user to approve every tool call" not enough?
A: Approval fatigue. People click through. Reserve prompts for high-impact actions and enforce limits in code.
S: Approval fatigue: people click through
X: Approvals add too much latency for the model
X: Models ignore approval requests
X: Approval prompts expose the system prompt

Q: Agent identity best practices (non-human identity)
A: Each agent gets its own identity, short-lived credentials, least-privilege scopes, a named owner, and logs attributing every action to both the agent and the user it acted for.
S: Own identity, short-lived credentials, least privilege, an owner, per-action logs
X: One shared admin service account for all agents
X: The developer's personal token, for convenience
X: Long-lived API keys with broad scopes, rotated yearly

Q: OAuth2 client credentials vs on-behalf-of (token exchange)
A: Client credentials = the service acts as itself (machine-to-machine). On-behalf-of / token exchange = the service acts with a user's delegated authority. Agents acting for users should use the latter.
S: Client credentials: acts as itself. On-behalf-of: acts with a user's delegated authority
X: Client credentials: acts for a user. On-behalf-of: acts as itself
X: They are the same flow with different names
X: Client credentials is for browsers; on-behalf-of is for servers

Q: What should a pre-launch security test suite for an agent cover?
A: Injection resistance (direct and indirect), tool-permission boundary tests (can it reach what it must not), refusal of out-of-scope actions, data-leak tests, cross-user isolation, and a fixed regression set re-run on every prompt or model change.
S: Injection, permission boundaries, out-of-scope refusals, data leaks, regressions
X: Only unit tests of the prompt wording
X: Load tests and latency benchmarks
X: Accuracy on a public benchmark

Q: What do you review in an agent security review?
A: Architecture and data flows, system prompt, tool and permission manifest (MCP definitions), authn/authz for each tool, logging and monitoring, and what happens on failure.
S: Data flows, prompt, tool and permission manifest, authn/authz, logging, failure behavior
X: Only the model's benchmark scores
X: Only the vendor's marketing claims
X: Only the UI design and copy

Q: Policy-as-code for agent tools: what does it look like?
A: A machine-readable allowlist of tools, scopes, and data classes per agent, checked in CI (for example with OPA/Rego or Python) so a manifest change that widens access fails the build.
S: A checked-in allowlist of tools, scopes, and data classes enforced in CI
X: A prompt telling the agent which tools it may use
X: A wiki page listing approved tools
X: A dashboard of tool usage reviewed monthly

Q: RAG in one sentence, and its main security question
A: Retrieve relevant documents by embedding similarity and put them in the prompt. Main question: does retrieval enforce the asking user's permissions?
S: Retrieve similar documents into the prompt; does retrieval enforce the user's permissions?
X: Retrain the model nightly; does it forget old data?
X: Cache answers by question; are they stale?
X: Compress prompts; is the model still accurate?

Q: Why can guardrails (classifiers, filters) not be your only control?
A: They are probabilistic and bypassable. Pair them with deterministic controls: authorization checks, allowlists, rate limits, sandboxing.
S: They are probabilistic and bypassable, so pair them with deterministic controls
X: They are too slow for production use
X: They cannot run on user input
X: They only work on output, never on input

Q: Indirect injection through logs: why does it matter for AI-assisted SOC triage?
A: Attackers control fields in the logs and alerts that an LLM triage step reads (user agents, usernames, filenames). Those fields can carry instructions. Isolate them as data and limit what the triage agent can do.
S: Attackers control log fields an LLM reads, and fields can carry instructions
X: Logs are too large for models to read
X: Logs contain timestamps the model cannot parse
X: Log pipelines strip all special characters

Q: How do you evaluate an AI triage agent?
A: Run it against a golden set of past alerts with analyst verdicts. Measure agreement and, above all, the false-negative rate on true positives. Re-run after every change.
S: Golden set of past alerts; measure agreement and false negatives on true positives
X: Ask analysts whether the summaries read well
X: Count how many alerts it closes per hour
X: Compare its speed to the old SOAR playbook

Q: Why is a local stdio MCP server a risk?
A: It runs as a process with your privileges. A malicious or buggy server can read files and run commands. Review the code, sandbox it, and scope filesystem and network access.
S: It runs as a process with the user's privileges
X: It sends all data to the vendor
X: It cannot be updated
X: It bypasses TLS for the model API

Q: How should an agent's tool permissions be scoped?
A: Per task and per user, with the narrowest scopes that work, and short-lived where possible.
S: Per task and per user, with the narrowest scopes that work
X: Once, broadly, at install time
X: By the agent requesting more access at runtime
X: Equal to the developer's own permissions

Q: What is memory poisoning in an agent?
A: Planting malicious content in an agent's persistent memory so it influences later sessions. Treat memory writes from untrusted content as untrusted, and let users review and clear memory.
S: Planting malicious content in persistent memory that affects later sessions
X: Filling memory until the process crashes
X: Overwriting the model's weights
X: Deleting the conversation history

Q: What is an agent kill switch?
A: A way to disable an agent or one of its tools quickly without a deploy, for example a feature flag or revoking its credentials. Test it before you need it.
S: A way to disable an agent or tool quickly without a deploy
X: A button that deletes the model
X: A timeout on each prompt
X: A rate limit on the API

Q: What should agent audit logs include?
A: Who asked, which agent acted, which tool was called, the arguments and the result, and any approval. Without this you cannot do incident response on an agent.
S: Who asked, which agent, which tool, arguments, result, and approval
X: Only the final answer shown to the user
X: Only token counts
X: Only errors

Q: Why sandbox an agent that executes code?
A: Generated code is untrusted and may be attacker-influenced. Use containers or microVMs, no network by default, no credentials, and resource limits.
S: Generated code is untrusted and may be attacker-influenced
X: Sandboxes make models faster
X: Models cannot run code without one
X: It reduces token costs

Q: What new trust problem appears in multi-agent systems?
A: One compromised agent's output becomes another agent's trusted input, so an injection can spread. Treat messages between agents as untrusted and keep each agent's permissions minimal.
S: One compromised agent's output becomes another agent's trusted input
X: Agents cannot share a model
X: Every agent needs its own GPU
X: Messages between agents are always encrypted

Q: What does good human-in-the-loop look like?
A: Approval only for high-impact actions, with a clear description of exactly what will happen, so reviewers can actually judge it.
S: Approve only high-impact actions, with a clear view of what will happen
X: Approve every action with a generic yes/no prompt
X: Approve once per session for all tools
X: Let the model approve its own actions

Q: Which exfiltration channels from an agent should you watch?
A: Rendered links and images (data in a URL), tool calls to external URLs, and outbound email or chat. Allowlist destinations and do not auto-render untrusted markdown.
S: Rendered links and images, calls to external URLs, and outbound email
X: GPU memory
X: Model checkpoints
X: Tokenizer files

Q: Eval vs guardrail: what is the difference?
A: An eval measures behavior before release. A guardrail enforces limits while the system runs. You need both.
S: An eval measures behavior before release; a guardrail enforces limits at runtime
X: An eval runs at runtime; a guardrail runs before release
X: They are the same thing
X: An eval is a policy; a guardrail is a metric
