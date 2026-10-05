# AWS cloud incident response
> Logs, attacker behavior, containment, and evidence handling.

Q: The incident response phases (NIST SP 800-61)
A: Preparation; Detection and Analysis; Containment, Eradication and Recovery; Post-Incident Activity.

Q: What does CloudTrail record, and what is off by default?
A: AWS API activity. Management events are on; data events (S3 object-level, Lambda invoke) are off by default and cost extra.

Q: How far back does CloudTrail Event History go?
A: 90 days of management events. For anything longer you need a trail delivering to S3.

Q: CloudTrail log file integrity validation
A: Signed digest files let you prove log files were not altered or deleted after delivery.

Q: Why keep logs in a separate security or log-archive account?
A: A compromised workload account cannot erase the evidence if it cannot write or delete in the log account.

Q: AKIA vs ASIA key prefixes
A: AKIA = long-term IAM user access key. ASIA = temporary credentials from STS (role sessions).

Q: First calls an attacker makes after stealing a key
A: `sts:GetCallerIdentity`, then enumeration: `iam:ListUsers`, `ListRoles`, `ListAttachedUserPolicies`, `s3:ListBuckets`.

Q: API calls that signal persistence
A: `CreateAccessKey`, `CreateUser`, `CreateLoginProfile`, `AttachUserPolicy`, `UpdateAssumeRolePolicy` (trusting an outside account), and new Lambda or EC2 backdoors.

Q: API calls that signal defense evasion
A: `StopLogging`, `DeleteTrail`, `UpdateTrail`, `PutEventSelectors` (CloudTrail), and `DeleteDetector` (GuardDuty).

Q: Contain a leaked IAM user access key. Steps in order.
A: Scope it in CloudTrail by access key ID; deactivate (do not delete) the key; review everything it did and any persistence it created; rotate affected secrets; fix how the key leaked.

Q: Why deactivate rather than delete a compromised key?
A: It stops use immediately but preserves the record for the investigation.

Q: You cannot invalidate an STS session token directly. What do you do?
A: Attach a deny policy to the role with a condition on `aws:TokenIssueTime` (the console's "Revoke active sessions"), which blocks sessions issued before now.

Q: IMDSv2 vs IMDSv1
A: IMDSv2 requires a session token obtained with a PUT request, which blunts SSRF-based theft of instance role credentials. Require IMDSv2 everywhere.

Q: Containing a compromised EC2 instance
A: Isolate it with a quarantine security group (no ingress or egress), snapshot its EBS volumes, preserve memory if you can, and tag it. Do not terminate it, and think before stopping it.

Q: What does GuardDuty analyze?
A: Foundational sources are CloudTrail management events, VPC Flow Logs, and DNS logs, with optional protection for S3 data events, EKS, RDS logins, Lambda, and malware scanning.

Q: Reading a GuardDuty finding type
A: Format starts `ThreatPurpose:ResourceType/ThreatFamily`, for example `UnauthorizedAccess:IAMUser/...`. Severity is numeric (low, medium, high).

Q: Typical GuardDuty to response automation path
A: Finding -> EventBridge rule -> Lambda, SNS, or SOAR. Keep a human approval gate for destructive actions and guard against remediation loops.

Q: What is Security Hub for?
A: Aggregates and normalizes findings from GuardDuty, Inspector, Macie, and others (ASFF format) and tracks compliance checks.

Q: What do SCPs do?
A: Service control policies in AWS Organizations set the maximum permissions for accounts. They never grant access, and they do not restrict the management account.

Q: Sign of cryptomining in a stolen account
A: `RunInstances` for large or GPU instances, often in regions you never use, plus a cost spike and GuardDuty cryptocurrency findings.

Q: Root account usage: what should you expect and alert on?
A: Almost none. Alert on any root login or API call, require MFA, and keep no access keys on root.

Q: How do you find which keys are old, unused, or lack MFA?
A: The IAM credential report (`aws iam generate-credential-report`), and `get-access-key-last-used` for specific keys.

Q: Investigating CloudTrail at scale
A: Query logs in S3 with Athena, using partition projection to keep scans small. For a quick look use `aws cloudtrail lookup-events` (management events only, 90 days).

Q: Why do you need pagination when calling CloudTrail from boto3?
A: Responses return one page. Use the paginator or follow `NextToken`, or you silently miss events and your timeline is incomplete.

Q: How do you check whether an S3 bucket is exposed?
A: Check Block Public Access settings, the bucket policy and ACLs, and IAM Access Analyzer findings for external access. Macie can tell you what sensitive data is inside.

Q: Containment vs eradication vs recovery
A: Containment stops the spread. Eradication removes the attacker's access and artifacts. Recovery restores normal service and verifies it is clean.

Q: Evidence handling basics
A: Preserve before you change (snapshots, log exports), hash what you collect, record who touched it and when, and work from copies.
