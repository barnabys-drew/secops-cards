# Agents and MCP security
> Trust boundaries, tool permissions, and the attacks specific to tool-calling systems.

Q: MCP roles: host, client, server.
A: Host = the application the user runs (IDE, chat app). Client = the connector inside the host, one per server. Server = exposes tools, resources, and prompts over JSON-RPC.

Q: What do MCP servers expose?
A: Tools (actions the model can call), resources (data it can read), and prompts (templated instructions).

Q: What are the two standard MCP transports?
A: stdio (local subprocess) and Streamable HTTP (remote). Local stdio servers run with the user's privileges.

Q: Tool poisoning
A: Malicious instructions hidden in a tool's name, description, or schema. The model reads them; the user usually never sees them.

Q: Rug pull (MCP)
A: A server changes its tool definitions after the user approved it. Mitigation: pin or hash definitions and require re-approval on any change.

Q: Tool shadowing
A: One server's tool description manipulates how the model uses a different, trusted server's tool.

Q: Confused deputy (agents)
A: A service with its own privileges acts for a caller without verifying that the caller may request it. Fix with per-user delegated tokens, not one shared powerful credential.

Q: Token passthrough: why is it an anti-pattern?
A: The MCP server forwards a client token to a downstream API. It breaks audience binding, hides who did what, and lets a token issued for one service be abused on another. Tokens should be issued for the server itself.

Q: The "lethal trifecta" for agents
A: Access to private data + exposure to untrusted content + ability to communicate externally. With all three, injected instructions can exfiltrate data. Remove at least one leg.

Q: Treat tool results as what?
A: Untrusted input. A tool result can carry an injection exactly as a web page can. Never let it expand the agent's permissions.

Q: Why is "ask the user to approve every tool call" not enough?
A: Approval fatigue. People click through. Reserve prompts for high-impact actions and enforce limits in code.

Q: Agent identity best practices (non-human identity)
A: Each agent gets its own identity, short-lived credentials, least-privilege scopes, a named owner, and logs attributing every action to both the agent and the user it acted for.

Q: OAuth2 client credentials vs on-behalf-of (token exchange)
A: Client credentials = the service acts as itself (machine-to-machine). On-behalf-of / token exchange = the service acts with a user's delegated authority. Agents acting for users should use the latter.

Q: What should a pre-launch security test suite for an agent cover?
A: Injection resistance (direct and indirect), tool-permission boundary tests (can it reach what it must not), refusal of out-of-scope actions, data-leak tests, cross-user isolation, and a fixed regression set re-run on every prompt or model change.

Q: What do you review in an agent security review?
A: Architecture and data flows, system prompt, tool and permission manifest (MCP definitions), authn/authz for each tool, logging and monitoring, and what happens on failure.

Q: Policy-as-code for agent tools: what does it look like?
A: A machine-readable allowlist of tools, scopes, and data classes per agent, checked in CI (for example with OPA/Rego or Python) so a manifest change that widens access fails the build.

Q: RAG in one sentence, and its main security question
A: Retrieve relevant documents by embedding similarity and put them in the prompt. Main question: does retrieval enforce the asking user's permissions?

Q: Why can guardrails (classifiers, filters) not be your only control?
A: They are probabilistic and bypassable. Pair them with deterministic controls: authorization checks, allowlists, rate limits, sandboxing.

Q: Indirect injection through logs: why does it matter for AI-assisted SOC triage?
A: Attackers control fields in the logs and alerts that an LLM triage step reads (user agents, usernames, filenames). Those fields can carry instructions. Isolate them as data and limit what the triage agent can do.

Q: How do you evaluate an AI triage agent?
A: Run it against a golden set of past alerts with analyst verdicts. Measure agreement and, above all, the false-negative rate on true positives. Re-run after every change.
