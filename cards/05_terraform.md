# Terraform
> Concepts plus the security-tooling resources you would actually deploy.

Q: The core workflow commands
A: `terraform init` (download providers and set the backend), `plan` (show the diff), `apply` (make the changes), `destroy` (remove everything managed).
S: init, plan, apply, destroy
X: build, test, deploy, remove
X: start, preview, push, stop
X: install, diff, run, uninstall

Q: Why use `terraform plan -out=tfplan` then `terraform apply tfplan`?
A: Apply executes exactly the plan you reviewed, even if the infrastructure changes in between.
S: Apply executes exactly the plan you reviewed
X: It makes the plan run faster
X: It encrypts the plan file
X: It skips state locking

Q: What is Terraform state?
A: The mapping between your configuration and the real resources, including their attributes. It can contain secrets in plaintext.
S: The mapping from your config to real resources, which can hold secrets
X: A cache of downloaded provider plugins
X: A log of every apply
X: The list of input variables

Q: How should state be stored and protected?
A: Remote backend (for example S3) with encryption, versioning, restricted access, and state locking. Never commit state to git.
S: Remote encrypted backend with versioning, restricted access, and locking; never in git
X: Committed to git so everyone has it
X: On a shared laptop
X: Only in CI logs

Q: Marking a variable `sensitive = true` does what, and not what?
A: Hides the value in CLI output. It is still stored in plaintext in state.
S: It hides the value in CLI output, but state still holds it in plaintext
X: It encrypts the value in state
X: It removes the value from state
X: It stops the variable being passed to modules

Q: What is drift and how do you detect it?
A: Real infrastructure differs from state or config (someone changed it by hand). `terraform plan` shows it; `plan -refresh-only` shows only drift.
S: Real infrastructure differs from state or config; plan shows it
X: Provider versions differ across machines; init shows it
X: The state file grows over time; fmt shows it
X: Modules fall behind registry versions; validate shows it

Q: `count` vs `for_each`
A: `count` indexes resources by position, so removing a middle item shifts and recreates the rest. `for_each` keys by a stable string, so items are independent.
S: count is index-based and shifts; for_each is keyed and stable
X: count is keyed and stable; for_each is index-based
X: They are identical
X: for_each only works with modules

Q: How do you bring an existing resource under Terraform management?
A: An `import` block (or `terraform import`) plus a matching resource configuration.
S: An import block (or terraform import) plus matching config
X: terraform refresh on the resource
X: terraform taint, then apply
X: Copy the resource into the state file by hand

Q: What is a module?
A: A reusable group of resources with input variables and outputs.
S: A reusable group of resources with inputs and outputs
X: A provider plugin binary
X: A saved plan file
X: A state backend

Q: Data source vs resource
A: A data source reads something that exists (read-only). A resource creates and manages it.
S: A data source reads what exists; a resource creates and manages it
X: A data source creates; a resource reads
X: Both create, but data sources are faster
X: Data sources are only for secrets

Q: Implicit vs explicit dependencies
A: Referencing another resource's attribute creates an implicit dependency. `depends_on` is for dependencies Terraform cannot see.
S: References create implicit dependencies; depends_on covers hidden ones
X: Dependencies only come from depends_on
X: Order follows file order
X: Order follows alphabetical resource names

Q: Lifecycle arguments you should know
A: `prevent_destroy` (block deletion), `create_before_destroy` (replace safely), `ignore_changes` (ignore drift on chosen attributes).
S: prevent_destroy, create_before_destroy, ignore_changes
X: init, plan, apply
X: force_new, taint, untaint
X: depends_on, count, for_each

Q: What does `.terraform.lock.hcl` do?
A: Pins exact provider versions and checksums. Commit it so everyone, and CI, uses the same providers.
S: It pins provider versions and checksums, so commit it
X: It locks the state against concurrent applies
X: It stores provider credentials
X: It lists module sources

Q: In a plan, what does `-/+` mean and why does it matter?
A: The resource will be destroyed and recreated. Check it carefully: it can mean downtime or data loss.
S: Destroy and recreate: check for downtime or data loss
X: Update in place with no impact
X: The resource will be imported
X: The resource will move to another state

Q: The `moved` block
A: Records that a resource was renamed or relocated so Terraform updates state instead of destroying and recreating it.
S: It records a rename so state updates without destroy and recreate
X: It moves state to another backend
X: It moves resources between regions
X: It forces recreation of the resource

Q: Terraform vs Pulumi
A: Terraform uses HCL, a declarative DSL. Pulumi uses general-purpose languages (Python, TypeScript). Both are declarative and state-based.
S: Terraform uses HCL; Pulumi uses general-purpose languages
X: Terraform is imperative; Pulumi is declarative
X: Terraform has no state; Pulumi stores state
X: Pulumi only works on AWS

Q: Scanning Terraform for security problems
A: Static checks (Checkov, Trivy/tfsec) on the code, and policy-as-code (OPA/Conftest, Sentinel) on the plan, for example `terraform show -json tfplan`. Run them in CI before apply.
S: Static checks (Checkov, Trivy) plus policy on the plan (OPA/Conftest, Sentinel)
X: Only terraform validate
X: Only manual code review
X: Only runtime scanning after deploy

Q: Which resources make up a minimal AWS detection stack in Terraform?
A: `aws_cloudtrail` (multi-region, log file validation, KMS), an S3 log bucket with public access block, `aws_guardduty_detector`, an EventBridge rule (`aws_cloudwatch_event_rule`) targeting an alert Lambda or SNS, and a least-privilege `aws_iam_role` for the Lambda.
S: CloudTrail, S3 log bucket, GuardDuty, EventBridge rule, alert Lambda, least-privilege role
X: EC2, RDS, ALB, Route 53
X: VPC peering, NAT gateway, Direct Connect
X: Cognito, API Gateway, DynamoDB

Q: How should CI authenticate to AWS for Terraform?
A: OIDC federation to a role with short-lived credentials, not long-lived access keys stored as secrets.
S: OIDC federation to a role with short-lived credentials
X: Long-lived access keys stored as CI secrets
X: The root account's keys
X: An engineer's personal credentials

Q: Workspaces vs separate directories or accounts for environments
A: Workspaces share one backend and config, so mistakes cross environments easily. Many teams prefer separate state per environment, ideally per account.
S: Workspaces share one backend and config, so mistakes cross environments
X: Workspaces isolate accounts automatically
X: Workspaces require separate providers
X: Workspaces cannot hold state

Q: The bootstrap problem with an S3 backend
A: The bucket that holds state must exist before Terraform can use it. Create it with a small separate config or by hand, then migrate state in.
S: The state bucket must exist first: create it separately, then migrate state in
X: Terraform creates the backend bucket automatically
X: Backends need no storage
X: Use local state forever

Q: What do `terraform fmt` and `terraform validate` do?
A: `fmt` rewrites files to the canonical style. `validate` checks syntax and internal consistency without touching real infrastructure. Run both in CI.
S: fmt rewrites style; validate checks syntax and consistency
X: fmt checks cloud state; validate formats code
X: Both apply changes
X: fmt validates providers; validate formats files

Q: How do you keep secrets out of Terraform code?
A: Fetch them from a secrets manager at runtime, never commit `terraform.tfvars` with secrets, and remember that anything a resource reads can still land in state.
S: Use a secrets manager and keep secret values out of files and state where possible
X: Put them in terraform.tfvars and commit it
X: Base64-encode them in the config
X: Name the variable `secret`

Q: How do you force a resource to be recreated?
A: `terraform apply -replace=ADDRESS`. The older `terraform taint` does the same and is deprecated.
S: `terraform apply -replace=ADDRESS`
X: `terraform state rm ADDRESS`
X: `terraform refresh ADDRESS`
X: `terraform import ADDRESS`

Q: What does `terraform state rm` do?
A: Removes a resource from state without destroying the real thing. Terraform then forgets it, and a later plan may want to create a duplicate.
S: Removes it from state without destroying the real resource
X: Destroys the real resource
X: Deletes the whole state file
X: Reverts state to the last apply

Q: What is a provider alias for?
A: Using the same provider more than once with different settings, for example another region or another AWS account.
S: Using one provider with different configs, such as another region or account
X: Renaming a provider's resources
X: Caching provider downloads
X: Pinning a provider version

Q: Which security settings should a log bucket have?
A: Block Public Access, encryption (KMS), versioning, and a restrictive bucket policy. For evidence, add Object Lock and keep the bucket in a separate account.
S: Block public access, encryption, versioning, and a restrictive policy
X: Public read so analysts can download logs
X: ACLs granting all AWS users read access
X: No encryption, to keep queries fast

Q: How do you test a Terraform module?
A: `validate` and `plan` checks in CI, policy tests on the plan, and a real apply in a sandbox account (for example with Terratest).
S: Validate and plan in CI, policy tests, and a sandbox apply
X: Only read the code
X: Only apply it to production
X: Only unit tests of the provider

Q: What is a sensible CI flow for Terraform?
A: Format and validate, scan, plan on the pull request, review the plan, then apply from the main branch with a short-lived role.
S: Format and validate, scan, plan on pull request, review, apply from main
X: Apply from every developer laptop
X: Apply on every commit to any branch
X: Plan only in production

Q: Why keep separate state per account or environment?
A: A mistake, a leak, or a bad apply is limited to one blast radius.
S: A mistake or leak is limited to one blast radius
X: It only makes plans faster
X: Providers require it
X: State files cannot exceed 1 MB
