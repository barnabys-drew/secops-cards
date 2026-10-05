# Terraform
> Concepts plus the security-tooling resources you would actually deploy.

Q: The core workflow commands
A: `terraform init` (download providers and set the backend), `plan` (show the diff), `apply` (make the changes), `destroy` (remove everything managed).

Q: Why use `terraform plan -out=tfplan` then `terraform apply tfplan`?
A: Apply executes exactly the plan you reviewed, even if the infrastructure changes in between.

Q: What is Terraform state?
A: The mapping between your configuration and the real resources, including their attributes. It can contain secrets in plaintext.

Q: How should state be stored and protected?
A: Remote backend (for example S3) with encryption, versioning, restricted access, and state locking. Never commit state to git.

Q: Marking a variable `sensitive = true` does what, and not what?
A: Hides the value in CLI output. It is still stored in plaintext in state.

Q: What is drift and how do you detect it?
A: Real infrastructure differs from state or config (someone changed it by hand). `terraform plan` shows it; `plan -refresh-only` shows only drift.

Q: `count` vs `for_each`
A: `count` indexes resources by position, so removing a middle item shifts and recreates the rest. `for_each` keys by a stable string, so items are independent.

Q: How do you bring an existing resource under Terraform management?
A: An `import` block (or `terraform import`) plus a matching resource configuration.

Q: What is a module?
A: A reusable group of resources with input variables and outputs.

Q: Data source vs resource
A: A data source reads something that exists (read-only). A resource creates and manages it.

Q: Implicit vs explicit dependencies
A: Referencing another resource's attribute creates an implicit dependency. `depends_on` is for dependencies Terraform cannot see.

Q: Lifecycle arguments you should know
A: `prevent_destroy` (block deletion), `create_before_destroy` (replace safely), `ignore_changes` (ignore drift on chosen attributes).

Q: What does `.terraform.lock.hcl` do?
A: Pins exact provider versions and checksums. Commit it so everyone, and CI, uses the same providers.

Q: In a plan, what does `-/+` mean and why does it matter?
A: The resource will be destroyed and recreated. Check it carefully: it can mean downtime or data loss.

Q: The `moved` block
A: Records that a resource was renamed or relocated so Terraform updates state instead of destroying and recreating it.

Q: Terraform vs Pulumi
A: Terraform uses HCL, a declarative DSL. Pulumi uses general-purpose languages (Python, TypeScript). Both are declarative and state-based.

Q: Scanning Terraform for security problems
A: Static checks (Checkov, Trivy/tfsec) on the code, and policy-as-code (OPA/Conftest, Sentinel) on the plan, for example `terraform show -json tfplan`. Run them in CI before apply.

Q: Which resources make up a minimal AWS detection stack in Terraform?
A: `aws_cloudtrail` (multi-region, log file validation, KMS), an S3 log bucket with public access block, `aws_guardduty_detector`, an EventBridge rule (`aws_cloudwatch_event_rule`) targeting an alert Lambda or SNS, and a least-privilege `aws_iam_role` for the Lambda.

Q: How should CI authenticate to AWS for Terraform?
A: OIDC federation to a role with short-lived credentials, not long-lived access keys stored as secrets.

Q: Workspaces vs separate directories or accounts for environments
A: Workspaces share one backend and config, so mistakes cross environments easily. Many teams prefer separate state per environment, ideally per account.

Q: The bootstrap problem with an S3 backend
A: The bucket that holds state must exist before Terraform can use it. Create it with a small separate config or by hand, then migrate state in.
