%% Deep dives for cards/05_terraform.md.

## The core workflow commands
### What it is
The Terraform workflow has four main commands.
- `terraform init` prepares the working directory: it downloads providers and modules and configures the backend that stores state.
- `terraform plan` compares your configuration with the real world and shows what would change.
- `terraform apply` makes those changes.
- `terraform destroy` removes everything the configuration manages.
### Why this is the answer
The order is the safety net: init once, then plan to see the proposed changes, then apply only what you have reviewed. Reading the plan before applying is the habit that prevents most accidents.
### Remember it
Init, plan, apply. Destroy only on purpose.

## Why use `terraform plan -out=tfplan` then `terraform apply tfplan`?
### What it is
The `-out` flag saves the plan to a file. Applying that file runs exactly the actions in it.
### Why this is the answer
If you run a plain `apply`, Terraform calculates a new plan at that moment. Infrastructure or code could have changed since you reviewed the earlier one, so what runs might differ from what you approved. Applying the saved plan guarantees the reviewed change is the executed change, which is why CI pipelines use it.
### Remember it
Apply the plan you actually reviewed.

## What is Terraform state?
### What it is
State is a file (or remote record) that maps each resource in your configuration to a real object, such as an S3 bucket's ID, along with its attributes.
### Why this is the answer
Without state Terraform cannot tell what it already created, so it could not update or delete anything correctly. State also stores resource attributes, which can include secrets such as database passwords, so it must be protected like a credential.
### Remember it
State is Terraform's memory, and it may hold secrets.

## How should state be stored and protected?
### What it is
Use a remote backend such as an S3 bucket with encryption, versioning, restricted access and state locking. Do not commit state to git.
### Why this is the answer
Local state cannot be shared safely, can be lost, and sits on one laptop. Git history keeps secrets forever. A remote backend gives shared access, recovery through versioning, protection through encryption and permissions, and locking to stop two people applying at once.
### Remember it
Remote, encrypted, versioned, locked, and never in git.

## Marking a variable `sensitive = true` does what, and not what?
### What it is
`sensitive = true` hides the value in Terraform's console output, such as plan and apply displays.
### Why this is the answer
It does **not** encrypt the value or keep it out of the state file, where it is still stored in plain text. It is a display setting, not a security control for the value itself. Protect state access, and prefer pulling secrets from a secrets manager.
### Remember it
Hidden on screen, still written in state.

## What is drift and how do you detect it?
### What it is
Drift is when real infrastructure no longer matches what Terraform expects, usually because someone changed it by hand in the console or another tool did.
### Why this is the answer
`terraform plan` refreshes real state and shows the differences, and `terraform plan -refresh-only` shows only drift without proposing configuration changes. Detecting drift matters for security because manual changes may weaken a setting, and the next apply might silently revert or overwrite them.
### Remember it
Plan tells you where reality has wandered from the code.

## `count` vs `for_each`
### What it is
Both create multiple copies of a resource.
- `count` uses a number and identifies copies by **position** (0, 1, 2).
- `for_each` uses a map or set and identifies copies by **key**.
### Why this is the answer
If you remove the second item from a `count` list, everything after it shifts down a position, so Terraform may destroy and recreate resources that did not need to change. With `for_each`, each item has a stable key and is unaffected by its neighbors.
### Remember it
Position shifts. Keys stay.

## How do you bring an existing resource under Terraform management?
### What it is
Importing links a real resource to a resource block in your configuration, using an `import` block or the `terraform import` command.
### Why this is the answer
You write a matching resource configuration, then import so Terraform records the existing object in state instead of creating a duplicate. After import, run a plan and adjust the configuration until it shows no unwanted changes. Commands such as `taint` or `refresh` do something different.
### Remember it
Write the block, then import the thing.

## What is a module?
### What it is
A module is a reusable group of Terraform resources with input variables and outputs. Every configuration is a module, and you can call other modules from it.
### Why this is the answer
Modules let you package a pattern once, such as a logging bucket with the right security settings, and reuse it consistently. That consistency is itself a security benefit: fix it in the module and every user gets the fix.
### Remember it
A function for infrastructure.

## Data source vs resource
### What it is
A **resource** block creates and manages something. A **data** block only reads information about something that already exists, for example looking up an AMI or the current account ID.
### Why this is the answer
Data sources never change infrastructure. They let you use things managed elsewhere without taking ownership of them. Mixing them up leads to Terraform trying to create something you only meant to look up.
### Remember it
Resource = I own it. Data = I only look at it.

## Implicit vs explicit dependencies
### What it is
Terraform builds a graph of what depends on what.
- **Implicit:** when one resource references another's attribute, Terraform knows to create the first one first.
- **Explicit:** `depends_on` tells it about a dependency it cannot see from references.
### Why this is the answer
Files are not executed in order. The graph decides order, so relying on file position or alphabetical order is a mistake. Use references where possible and `depends_on` only for hidden relationships, such as an IAM policy that must exist before a resource that uses it indirectly.
### Remember it
References make the order. depends_on fills gaps.

## Lifecycle arguments you should know
### What it is
The `lifecycle` block changes how Terraform treats a resource.
- `prevent_destroy` makes a plan fail if it would delete the resource.
- `create_before_destroy` builds the replacement first.
- `ignore_changes` ignores drift on selected attributes.
### Why this is the answer
They protect critical resources, such as log buckets and databases, from accidental deletion, and avoid downtime during replacement. Use `ignore_changes` sparingly: it can hide changes you actually want to notice.
### Remember it
Protect it, replace it safely, or ignore a field on purpose.

## What does `.terraform.lock.hcl` do?
### What it is
The dependency lock file records the exact provider versions and checksums selected by `terraform init`.
### Why this is the answer
Committing it makes everyone, including CI, use the same provider builds, and prevents a changed or tampered provider from being used silently. It is not a state lock or a credential store.
### Remember it
It pins the providers. Commit it.

## In a plan, what does `-/+` mean and why does it matter?
### What it is
The `-/+` symbol means Terraform will **destroy and recreate** the resource, often because a changed setting cannot be updated in place.
### Why this is the answer
Replacement can mean downtime or data loss: a database, a disk or an IP address may be new afterward. Always scan a plan for `-/+` and `destroy` actions before approving, and consider `prevent_destroy` on critical resources.
### Remember it
`-/+` means it will be rebuilt. Check what is in it.

## The `moved` block
### What it is
A `moved` block records that a resource's address in the configuration has changed, such as after renaming it or putting it into a module.
### Why this is the answer
Without it, Terraform sees the old address vanish and a new one appear, and plans to destroy the old resource and create a new one. With `moved`, state is updated in place and the real resource is untouched.
### Remember it
Renaming in code should not mean rebuilding in the cloud.

## Terraform vs Pulumi
### What it is
Both describe infrastructure declaratively and keep state. Terraform uses its own language, HCL. Pulumi lets you use general-purpose languages such as Python or TypeScript.
### Why this is the answer
They are different approaches to the same problem, not imperative versus declarative or stateless versus stateful. Teams that want loops, tests and libraries from a real language may prefer Pulumi, while many prefer HCL's constrained simplicity and wide ecosystem.
### Remember it
Same idea. Different language.

## Scanning Terraform for security problems
### What it is
Two kinds of checks.
- **Static analysis of the code:** tools such as Checkov and Trivy flag risky settings, like a public bucket.
- **Policy as code on the plan:** engines such as OPA/Conftest or Sentinel evaluate the planned changes against rules.
### Why this is the answer
Static checks catch known bad patterns early. Plan-based policies see the computed values and can enforce organization-specific rules. Run both in CI before apply, because manual review and runtime scanning find problems later and cost more.
### Remember it
Scan the code, then check the plan, before anything is built.

## Which resources make up a minimal AWS detection stack in Terraform?
### What it is
A starter set for detection and logging in AWS:
- A CloudTrail trail (multi-region, with log file validation).
- An S3 bucket for logs, with public access blocked.
- A GuardDuty detector.
- An EventBridge rule that sends findings to an alert target.
- A Lambda function or SNS topic to deliver the alert.
- A least-privilege IAM role for that function.
### Why this is the answer
Together they cover recording activity, storing it safely, detecting threats and notifying someone. Compute, databases and networking resources describe an application, not a detection capability.
### Remember it
Record it, store it, detect it, route it, tell someone.

## How should CI authenticate to AWS for Terraform?
### What it is
Use OIDC federation: the CI system presents a short-lived identity token and AWS exchanges it for temporary credentials for a specific role.
### Why this is the answer
Long-lived access keys stored as CI secrets can leak and rarely get rotated. With OIDC there is nothing durable to steal, and you can restrict the role to a particular repository and branch. Never use root credentials or personal credentials in pipelines.
### Remember it
Temporary credentials, scoped to the repo, beat stored keys.

## Workspaces vs separate directories or accounts for environments
### What it is
Workspaces give one configuration multiple state files within the same backend. Separate directories or accounts give each environment its own configuration, state and permissions.
### Why this is the answer
Because workspaces share a backend and configuration, it is easy to apply the right code to the wrong environment, and access control is shared as well. Separate state per environment, ideally in separate accounts, limits the blast radius of mistakes.
### Remember it
Same backend, easy to mix up. Separate accounts, hard to mix up.

## The bootstrap problem with an S3 backend
### What it is
Terraform needs the state bucket before it can store state, but the bucket is infrastructure you would like Terraform to create.
### Why this is the answer
The usual solution is to create the bucket (and lock mechanism) with a small separate configuration or by hand, then configure the main configuration to use it and migrate state. Terraform cannot create its own backend mid-run.
### Remember it
Make the storage first, then move in.

## What do `terraform fmt` and `terraform validate` do?
### What it is
`terraform fmt` rewrites files into the standard style. `terraform validate` checks that the configuration is syntactically valid and internally consistent.
### Why this is the answer
Neither touches real infrastructure or compares against state. Together they are fast checks to run in CI so that style problems and simple mistakes are caught before a plan.
### Remember it
fmt tidies. validate checks sense.

## How do you keep secrets out of Terraform code?
### What it is
Fetch secrets from a secrets manager at runtime, do not commit files such as `terraform.tfvars` that contain them, and be aware that anything a resource reads or sets may end up in state.
### Why this is the answer
Encoding a secret (for example with base64) does not protect it, and naming a variable `secret` does nothing. Because state can still contain values, combine good sourcing with strict access to state.
### Remember it
Never in code, and watch state.

## How do you force a resource to be recreated?
### What it is
`terraform apply -replace=ADDRESS` tells Terraform to destroy and recreate that resource.
### Why this is the answer
The older `terraform taint` marked a resource for replacement and is deprecated in favor of `-replace`, which shows up clearly in the plan. `state rm` and `import` do different things: forget a resource and adopt one.
### Remember it
-replace rebuilds. It shows in the plan.

## What does `terraform state rm` do?
### What it is
It removes a resource from Terraform's state **without** destroying the real resource.
### Why this is the answer
Terraform stops managing the object but it keeps existing. The risk is that a later plan sees the configuration with no state and wants to create a duplicate. It is useful when you want to hand a resource to another configuration, not to delete it.
### Remember it
Forget, don't destroy.

## What is a provider alias for?
### What it is
An alias lets you configure the same provider more than once with different settings, such as two AWS regions or two accounts, and choose which one a resource uses.
### Why this is the answer
Some designs need multiple regions or cross-account setups, for example a CloudTrail trail in one account and a bucket in another. Aliases express that without separate configurations. They do not rename resources or pin versions.
### Remember it
Same provider, different settings.

## Which security settings should a log bucket have?
### What it is
For a bucket that holds security logs: block public access, encryption (ideally with a KMS key), versioning, and a restrictive bucket policy. For evidence, add Object Lock and keep the bucket in a separate account.
### Why this is the answer
Logs are what you rely on in an investigation, so they must resist exposure and tampering. Public read, broad ACLs or no encryption all invite the problems logs are supposed to help you investigate.
### Remember it
Private, encrypted, versioned, locked down.

## How do you test a Terraform module?
### What it is
Layers of testing: `validate` and `plan` checks in CI, policy tests on the plan, and a real apply in a sandbox account, for example with a tool such as Terratest.
### Why this is the answer
Reading the code or applying straight to production does not prove the module works. A sandbox apply shows real behavior, and policy tests catch insecure configurations before they reach anything important.
### Remember it
Check it statically, then try it for real somewhere safe.

## What is a sensible CI flow for Terraform?
### What it is
Format and validate, scan for security issues, plan on the pull request, have a person review the plan, then apply from the main branch using a short-lived role.
### Why this is the answer
Every change gets the same checks, the reviewer sees exactly what will change, and nothing is applied from an individual's laptop. Applying on every commit to any branch, or planning only in production, skips the review that makes the flow safe.
### Remember it
Plan on the pull request, apply from main.

## Why keep separate state per account or environment?
### What it is
Each account or environment has its own state file and backend, usually with its own permissions.
### Why this is the answer
It limits the **blast radius**: a bad apply, a leaked state file, or a stolen credential affects one environment, not all of them. Speed and provider requirements are not the reasons.
### Remember it
Smaller state, smaller disaster.
