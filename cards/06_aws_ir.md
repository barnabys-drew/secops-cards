# AWS cloud incident response
> Logs, attacker behavior, containment, and evidence handling.

Q: The incident response phases (NIST SP 800-61)
A: Preparation; Detection and Analysis; Containment, Eradication and Recovery; Post-Incident Activity.
S: Preparation; Detection and Analysis; Containment, Eradication and Recovery; Post-Incident
X: Identify, Protect, Detect, Respond, Recover
X: Plan, Build, Run, Retire
X: Detect, Alert, Escalate, Close

Q: What does CloudTrail record, and what is off by default?
A: AWS API activity. Management events are on; data events (S3 object-level, Lambda invoke) are off by default and cost extra.
S: AWS API activity; management events are on, data events are off by default
X: Network packets; flow logs are on by default
X: Application logs; everything is on by default
X: Billing data; off by default

Q: How far back does CloudTrail Event History go?
A: 90 days of management events. For anything longer you need a trail delivering to S3.
S: 90 days of management events
X: 30 days of all events
X: 1 year of data events
X: 7 days of management events

Q: CloudTrail log file integrity validation
A: Signed digest files let you prove log files were not altered or deleted after delivery.
S: It proves log files were not altered or deleted after delivery
X: It encrypts logs at rest
X: It compresses log files
X: It filters out noise events

Q: Why keep logs in a separate security or log-archive account?
A: A compromised workload account cannot erase the evidence if it cannot write or delete in the log account.
S: A compromised workload account cannot erase evidence it cannot write or delete
X: It reduces CloudTrail cost
X: It speeds up log delivery
X: AWS requires it for CloudTrail

Q: AKIA vs ASIA key prefixes
A: AKIA = long-term IAM user access key. ASIA = temporary credentials from STS (role sessions).
S: AKIA is a long-term IAM key; ASIA is a temporary STS credential
X: AKIA is temporary; ASIA is long-term
X: AKIA is for roles; ASIA is for root
X: Both are long-term; the prefix is the region

Q: First calls an attacker makes after stealing a key
A: `sts:GetCallerIdentity`, then enumeration: `iam:ListUsers`, `ListRoles`, `ListAttachedUserPolicies`, `s3:ListBuckets`.
S: sts:GetCallerIdentity, then List* enumeration
X: RunInstances, then CreateVpc
X: DeleteTrail, then DeleteBucket
X: PutObject, then PutBucketPolicy

Q: API calls that signal persistence
A: `CreateAccessKey`, `CreateUser`, `CreateLoginProfile`, `AttachUserPolicy`, `UpdateAssumeRolePolicy` (trusting an outside account), and new Lambda or EC2 backdoors.
S: CreateAccessKey, CreateUser, CreateLoginProfile, AttachUserPolicy, UpdateAssumeRolePolicy
X: DescribeInstances, ListBuckets, GetCallerIdentity
X: StopLogging, DeleteTrail, PutEventSelectors
X: GetObject, ListObjects, HeadBucket

Q: API calls that signal defense evasion
A: `StopLogging`, `DeleteTrail`, `UpdateTrail`, `PutEventSelectors` (CloudTrail), and `DeleteDetector` (GuardDuty).
S: StopLogging, DeleteTrail, UpdateTrail, PutEventSelectors, DeleteDetector
X: CreateAccessKey, CreateUser, AttachUserPolicy
X: RunInstances, CreateVpc, AllocateAddress
X: GetObject, PutObject, DeleteObject

Q: Contain a leaked IAM user access key. Steps in order.
A: Scope it in CloudTrail by access key ID; deactivate (do not delete) the key; review everything it did and any persistence it created; rotate affected secrets; fix how the key leaked.
S: Scope in CloudTrail, deactivate the key, review actions and persistence, rotate, fix the leak
X: Delete the key, then restart the instance
X: Rotate the root password and wait
X: Disable GuardDuty to cut noise, then investigate

Q: Why deactivate rather than delete a compromised key?
A: It stops use immediately but preserves the record for the investigation.
S: Deactivating stops use immediately and preserves the record
X: Deleting is slower to take effect
X: Deactivated keys still work for 24 hours
X: AWS charges for deactivated keys

Q: You cannot invalidate an STS session token directly. What do you do?
A: Attach a deny policy to the role with a condition on `aws:TokenIssueTime` (the console's "Revoke active sessions"), which blocks sessions issued before now.
S: Attach a deny policy with an aws:TokenIssueTime condition
X: Delete the STS token through the console
X: Wait: temporary tokens cannot be restricted
X: Rotate the IAM user's password

Q: IMDSv2 vs IMDSv1
A: IMDSv2 requires a session token obtained with a PUT request, which blunts SSRF-based theft of instance role credentials. Require IMDSv2 everywhere.
S: IMDSv2 needs a session token (PUT), which blunts SSRF credential theft
X: IMDSv2 encrypts instance metadata at rest
X: IMDSv2 disables the metadata service
X: IMDSv2 only works inside VPC endpoints

Q: Containing a compromised EC2 instance
A: Isolate it with a quarantine security group (no ingress or egress), snapshot its EBS volumes, preserve memory if you can, and tag it. Do not terminate it, and think before stopping it.
S: Quarantine security group, snapshot EBS, preserve memory, tag; do not terminate
X: Terminate it and relaunch from the AMI
X: Reboot it to clear the attacker's processes
X: Delete the instance profile only

Q: What does GuardDuty analyze?
A: Foundational sources are CloudTrail management events, VPC Flow Logs, and DNS logs, with optional protection for S3 data events, EKS, RDS logins, Lambda, and malware scanning.
S: CloudTrail management events, VPC Flow Logs, DNS logs, plus optional protections
X: Only EC2 system logs
X: Only S3 object contents
X: Application source code

Q: Reading a GuardDuty finding type
A: Format starts `ThreatPurpose:ResourceType/ThreatFamily`, for example `UnauthorizedAccess:IAMUser/...`. Severity is numeric (low, medium, high).
S: ThreatPurpose:ResourceType/ThreatFamily
X: Severity:Region/Account
X: Service:Region/Resource
X: Source:Destination/Port

Q: Typical GuardDuty to response automation path
A: Finding -> EventBridge rule -> Lambda, SNS, or SOAR. Keep a human approval gate for destructive actions and guard against remediation loops.
S: Finding, EventBridge rule, Lambda/SNS/SOAR, with approval gates for destructive actions
X: Finding, S3 bucket, Athena, email
X: Finding, CloudFormation, auto-delete resources
X: Finding, IAM, auto-attach AdministratorAccess

Q: What is Security Hub for?
A: Aggregates and normalizes findings from GuardDuty, Inspector, Macie, and others (ASFF format) and tracks compliance checks.
S: It aggregates and normalizes findings from several services (ASFF)
X: It encrypts data at rest across accounts
X: It stores CloudTrail logs
X: It scans only EC2 instances for patches

Q: What do SCPs do?
A: Service control policies in AWS Organizations set the maximum permissions for accounts. They never grant access, and they do not restrict the management account.
S: They set maximum permissions for accounts and never grant access
X: They grant permissions to accounts
X: They apply to the management account
X: They replace IAM policies

Q: Sign of cryptomining in a stolen account
A: `RunInstances` for large or GPU instances, often in regions you never use, plus a cost spike and GuardDuty cryptocurrency findings.
S: RunInstances of large or GPU instances in unused regions, plus a cost spike
X: A burst of S3 PutObject calls
X: Many failed console logins
X: New IAM roles with no policies

Q: Root account usage: what should you expect and alert on?
A: Almost none. Alert on any root login or API call, require MFA, and keep no access keys on root.
S: Almost none: alert on any use, require MFA, keep no access keys
X: Daily use for admin tasks
X: Use it for CI deployments
X: Share it across the team as break-glass

Q: How do you find which keys are old, unused, or lack MFA?
A: The IAM credential report (`aws iam generate-credential-report`), and `get-access-key-last-used` for specific keys.
S: The IAM credential report
X: CloudTrail Event History
X: AWS Config alone
X: The billing console

Q: Investigating CloudTrail at scale
A: Query logs in S3 with Athena, using partition projection to keep scans small. For a quick look use `aws cloudtrail lookup-events` (management events only, 90 days).
S: Athena over CloudTrail in S3 with partition projection; lookup-events for quick checks
X: Download every log file and grep locally
X: Use CloudWatch metrics alone
X: Use Event History for two-year lookbacks

Q: Why do you need pagination when calling CloudTrail from boto3?
A: Responses return one page. Use the paginator or follow `NextToken`, or you silently miss events and your timeline is incomplete.
S: Responses return one page, so you silently miss events without paginating
X: boto3 retries pages automatically
X: Pagination only affects billing
X: Pagination encrypts the results

Q: How do you check whether an S3 bucket is exposed?
A: Check Block Public Access settings, the bucket policy and ACLs, and IAM Access Analyzer findings for external access. Macie can tell you what sensitive data is inside.
S: Block Public Access, bucket policy and ACLs, Access Analyzer; Macie for contents
X: Check only the bucket name
X: Check only the region
X: Check only versioning status

Q: Containment vs eradication vs recovery
A: Containment stops the spread. Eradication removes the attacker's access and artifacts. Recovery restores normal service and verifies it is clean.
S: Stop the spread; remove access and artifacts; restore and verify
X: Restore first; contain later; eradicate last
X: Eradicate first; recover; contain last
X: All three mean rebuilding the account

Q: Evidence handling basics
A: Preserve before you change (snapshots, log exports), hash what you collect, record who touched it and when, and work from copies.
S: Preserve before changing, hash, record custody, work from copies
X: Fix first and document later
X: Edit the originals to add notes
X: Share raw evidence widely for faster analysis

Q: An access key was pushed to a public repo. What is the first containment action?
A: Deactivate the key, then investigate what it did. Removing the commit does not help: assume it was already scraped.
S: Deactivate the key, then investigate its usage
X: Remove the commit from git history and wait
X: Rotate every key in the account
X: Make the repo private and move on

Q: How do you see everything an access key did?
A: Search CloudTrail by AccessKeyId across all regions (lookup-events for recent activity, Athena for more).
S: Search CloudTrail by AccessKeyId across all regions
X: Check the key's creation date
X: Read the IAM user's console history
X: Query billing by service

Q: Which AWS tool lists resources shared outside your account or organization?
A: IAM Access Analyzer.
S: IAM Access Analyzer
X: AWS Config conformance packs
X: Cost Explorer
X: Amazon Inspector

Q: How do you stop a compromised role from being assumed again?
A: Tighten or remove the role's trust policy, and attach a deny for sessions issued before now (`aws:TokenIssueTime`).
S: Edit the trust policy and deny sessions issued before now
X: Change the role's name tag
X: Disable the console login
X: Remove the role from CloudTrail

Q: How do you protect log evidence from tampering?
A: Object Lock (or MFA delete) on the log bucket, plus keeping it in a separate account with tightly limited write and delete rights.
S: Object Lock or MFA delete, plus a separate account
X: Compress the logs with gzip
X: Rename the bucket weekly
X: Turn on static website hosting

Q: What are VPC Flow Logs good for in IR?
A: Network metadata (who talked to whom, how much), useful for lateral movement and exfiltration. They do not contain packet contents.
S: Network metadata, useful for lateral movement and exfiltration
X: Full packet contents
X: API call history
X: IAM policy changes

Q: What does `userIdentity.type` in a CloudTrail event tell you?
A: Who or what made the call: IAMUser, AssumedRole, Root, AWSService, and so on.
S: Whether the caller was an IAM user, assumed role, root, or an AWS service
X: Which region the call ran in
X: How long the call took
X: Whether the call was billed

Q: How do you recognize an assumed-role session in CloudTrail?
A: `userIdentity.type` is `AssumedRole` and the principal includes a session name. Trace it back to who assumed it through the AssumeRole event.
S: userIdentity.type is AssumedRole and a session name is present
X: The eventTime has a timezone offset
X: The awsRegion is global
X: The sourceIPAddress is a private address

Q: What does a `sourceIPAddress` like `cloudformation.amazonaws.com` mean?
A: An AWS service made the call on someone's behalf. Find who triggered it (for example the CloudFormation stack's caller) rather than treating it as the actor.
S: An AWS service made the call on someone's behalf
X: The attacker used a VPN
X: The call came from the account's NAT gateway
X: The call is a replay

Q: What is Amazon Detective?
A: A service that builds a graph of related activity (from CloudTrail, flow logs, and findings) so you can investigate a finding quickly.
S: A graph of related activity for investigating findings
X: A vulnerability scanner for EC2
X: A password manager
X: A DDoS protection service

Q: What does Amazon Macie do?
A: Discovers and classifies sensitive data in S3, so you know what an exposed bucket actually held.
S: Discovers and classifies sensitive data in S3
X: Blocks malicious IPs at the edge
X: Scans EC2 for malware
X: Rotates secrets

Q: Which GuardDuty finding means instance role credentials are used from outside AWS?
A: `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS`.
S: UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS
X: Backdoor:EC2/C&CActivity.B
X: Recon:IAMUser/ResourcePermissions
X: Stealth:IAMUser/CloudTrailLoggingDisabled

Q: How do you quickly quarantine a compromised IAM user?
A: Attach an explicit deny-all policy, deactivate its keys, and revoke its sessions. Keep the user so the evidence and the audit trail stay intact.
S: Attach deny-all, deactivate keys, and revoke sessions
X: Delete the user to remove all access
X: Change only the console password
X: Move the user to a new group

Q: Why does an explicit Deny matter in IAM?
A: It overrides any Allow, which makes it the reliable way to contain a principal.
S: It overrides any Allow
X: It is ignored if a role allows the action
X: It only applies to the root user
X: It takes effect after 24 hours

Q: Which logs show S3 object-level access?
A: CloudTrail data events or S3 server access logs. Management events alone do not show who read or deleted an object.
S: CloudTrail data events or S3 server access logs
X: CloudTrail management events only
X: VPC Flow Logs
X: GuardDuty findings only
