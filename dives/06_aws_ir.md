%% Deep dives for cards/06_aws_ir.md.

## The incident response phases (NIST SP 800-61)
### What it is
NIST's incident handling guide describes a life cycle with four phases.
- **Preparation:** tools, access, runbooks, logging and training in place before anything happens.
- **Detection and Analysis:** spotting an incident and working out what it is and how big.
- **Containment, Eradication and Recovery:** stop the spread, remove the cause, restore service.
- **Post-Incident Activity:** lessons learned and improvements.
### Why this is the answer
The phases are a loop, not a line: what you learn afterward improves preparation. The CSF's five functions (Identify, Protect, Detect, Respond, Recover) are a different framework. In AWS, the preparation phase decides how well the rest goes: if logging was never enabled, analysis has nothing to work with.
### Remember it
Prepare, detect and analyze, contain and recover, learn.

## What does CloudTrail record, and what is off by default?
### What it is
CloudTrail records API activity in your AWS account: who called what, from where, and when.
- **Management events** (control-plane actions such as creating a user) are recorded by default.
- **Data events** (such as S3 object reads or Lambda invocations) are **off by default** and cost extra to enable.
### Why this is the answer
The gap matters in investigations. Without data events you can see that a bucket was listed but not which objects were downloaded. Decide in advance which sensitive buckets and functions deserve data-event logging.
### Remember it
Control plane on, data plane off, until you turn it on.

## How far back does CloudTrail Event History go?
### What it is
Event History in the console and CLI shows the last **90 days** of management events in a region, with no setup.
### Why this is the answer
For anything older, or for data events, you need a trail delivering logs to S3. Many investigations begin weeks after the intrusion, so create an organization trail early so history exists when you need it.
### Remember it
90 days free; beyond that you need your own trail.

## CloudTrail log file integrity validation
### What it is
With validation enabled, CloudTrail also delivers hourly digest files that contain hashes of the log files and are digitally signed.
### Why this is the answer
It lets you prove that log files were **not modified or deleted** after delivery, which is vital for trusting logs in an investigation or legal matter. It is about integrity, not encryption or compression.
### Remember it
Signed hashes prove the logs were not tampered with.

## Why keep logs in a separate security or log-archive account?
### What it is
Send logs to a dedicated account that workload teams and most administrators cannot write to or delete from.
### Why this is the answer
An attacker who compromises a workload account often tries to erase their tracks. If the logs live in another account with tight permissions, that is much harder. Separate accounts also give security teams a place to run tools without being affected by a compromised workload.
### Remember it
Don't store the evidence where the suspect has the keys.

## AKIA vs ASIA key prefixes
### What it is
The first four letters of an AWS access key ID tell you its type.
- **AKIA:** a long-term access key belonging to an IAM user (or the root user).
- **ASIA:** a temporary credential issued by AWS STS, such as from an assumed role.
### Why this is the answer
It shapes the response. A leaked AKIA key can be deactivated. An ASIA credential cannot be deleted; it expires, so you contain it by changing the role or denying sessions issued before a time. The prefix also hints at the source: instance roles and Lambda functions use temporary credentials.
### Remember it
AKIA = long-lived key. ASIA = temporary session.

## First calls an attacker makes after stealing a key
### What it is
Attackers usually start by learning who they are and what they can do.
- `sts:GetCallerIdentity` shows which principal the key belongs to (it needs no permissions).
- Then enumeration: `iam:ListUsers`, `ListRoles`, `ListAttachedUserPolicies`, `s3:ListBuckets`, `ec2:DescribeInstances`.
### Why this is the answer
A burst of `Get*`, `List*` and `Describe*` calls from a principal or IP that has never done them is a strong early signal. Destructive or data-moving calls come later; this reconnaissance gives you a chance to catch them first.
### Remember it
Who am I, then what exists, then what can I touch.

## API calls that signal persistence
### What it is
Persistence calls give the attacker a way back in.
- `CreateAccessKey`: a second key on an existing user.
- `CreateUser` and `CreateLoginProfile`: a new identity or a console password.
- `AttachUserPolicy`: more permissions.
- `UpdateAssumeRolePolicy`: letting an outside account assume a role.
### Why this is the answer
Rotating the original stolen key would not remove these. Find all IAM changes made by the compromised principal and undo them. The recon and exfiltration calls in the other options appear in different phases.
### Remember it
Anything that creates or widens access afterward is persistence.

## API calls that signal defense evasion
### What it is
Attackers try to blind your monitoring.
- CloudTrail: `StopLogging`, `DeleteTrail`, `UpdateTrail`, `PutEventSelectors` (narrowing what is recorded).
- GuardDuty: `DeleteDetector`.
### Why this is the answer
Legitimate administrators rarely do these things, and attackers often do them early, so alerting on them is high value and low noise. Protect the trail with an organization trail and strong permissions so these calls fail.
### Remember it
When someone touches logging, treat it as hostile until proven otherwise.

## Contain a leaked IAM user access key. Steps in order.
### What it is
A sensible sequence:
- **Scope:** search CloudTrail by the access key ID to see everything it did.
- **Deactivate** the key (do not delete it yet).
- **Review** what it did and any persistence it created.
- **Rotate** any secrets the key could reach.
- **Fix** how it leaked.
### Why this is the answer
Containing first stops further damage, but you need the scope to know what else to clean up. Deleting the key first or taking unrelated actions (resetting root, disabling GuardDuty) either destroy evidence or do not address the problem.
### Remember it
Find out what it did, shut it, clean up after it, and close the hole.

## Why deactivate rather than delete a compromised key?
### What it is
Deactivating a key makes it unusable but leaves it in IAM.
### Why this is the answer
The key's ID remains available for investigation and you can confirm what it was. It also keeps the record that it existed, and you can reactivate it if you mistakenly deactivate a legitimate one. Deactivation takes effect within seconds (IAM changes are eventually consistent, so allow a short delay). Delete it later once the investigation is finished.
### Remember it
Stop it now; remove it when you are done investigating.

## You cannot invalidate an STS session token directly. What do you do?
### What it is
Temporary credentials stay valid until they expire. To stop an issued session, attach an inline **deny** policy to the role with a condition on `aws:TokenIssueTime` that denies sessions issued before the current time. The console's "Revoke active sessions" does exactly that.
### Why this is the answer
The attacker's existing sessions are blocked, while new sessions issued afterward (by legitimate users, once you fix the cause) still work. Deleting a token is not possible, and changing an IAM user's password does not affect role sessions.
### Remember it
You cannot cancel the ticket, but you can say no tickets before now.

## IMDSv2 vs IMDSv1
### What it is
The instance metadata service hands an EC2 instance's role credentials to code running on it.
- **IMDSv1** answers a simple GET request.
- **IMDSv2** requires a session token first, obtained with a PUT request, and is sent on later requests.
### Why this is the answer
Many server-side request forgery (SSRF) bugs can only make the server issue GET requests, which IMDSv2 blocks. Requiring IMDSv2 on all instances blunts a classic route to stolen role credentials.
### Remember it
IMDSv2 makes the attacker do something an SSRF usually cannot.

## Containing a compromised EC2 instance
### What it is
- Move it to a **quarantine security group** with no inbound or outbound rules.
- **Snapshot** its EBS volumes for evidence.
- **Preserve memory** if you can.
- **Tag** it so no one terminates or reuses it.
### Why this is the answer
Terminating destroys evidence, including memory, and the attacker's processes. Rebooting loses volatile data. Isolating by network cuts the attacker off while keeping everything for analysis. Deleting only the instance profile does not stop other access.
### Remember it
Isolate and preserve. Don't destroy.

## What does GuardDuty analyze?
### What it is
GuardDuty is a managed threat detection service. Its foundational data sources are CloudTrail management events, VPC Flow Logs and DNS logs. Optional protection plans add S3 data events, EKS audit logs, RDS login activity, Lambda network activity and malware scanning.
### Why this is the answer
It analyzes AWS telemetry for patterns of malicious behavior, using threat intelligence and machine learning. It does not read your application source code or the contents of your S3 objects (other than malware scanning where enabled).
### Remember it
Logs about activity, not the contents of your data.

## Reading a GuardDuty finding type
### What it is
Finding types follow the pattern `ThreatPurpose:ResourceTypeAffected/ThreatFamilyName.DetectionMechanism`. The first part, the threat purpose, tells you the stage, such as Recon, UnauthorizedAccess, Persistence or CryptoCurrency.
### Why this is the answer
Reading the name tells you the attack stage, which resource was involved and what behavior was seen before you open the details. For instance, `UnauthorizedAccess:IAMUser/...` means suspicious use of IAM credentials.
### Remember it
Purpose, then resource, then behavior.

## Typical GuardDuty to response automation path
### What it is
GuardDuty publishes findings to EventBridge. A rule matches findings you care about and sends them to a target such as a Lambda function, an SNS topic or a SOAR platform, which enriches and notifies, and may take limited actions.
### Why this is the answer
Event-driven automation lets you respond in minutes. Keep approval gates around destructive actions, because an automated action based on a false positive, or one an attacker can trigger deliberately, can cause an outage.
### Remember it
Finding, EventBridge, automation, with a human check on anything destructive.

## What is Security Hub for?
### What it is
Security Hub collects and normalizes security findings from AWS services such as GuardDuty, Inspector and Macie and from partners. It uses a common format (ASFF) and also runs compliance checks.
### Why this is the answer
It gives one place to see and prioritize findings across accounts and services. It does not generate logs itself, encrypt data, or serve as a patch scanner.
### Remember it
One pane for many finding sources.

## What do SCPs do?
### What it is
Service control policies in AWS Organizations set the **maximum** permissions available to the accounts they apply to.
### Why this is the answer
An SCP never grants anything. It acts as a guardrail: even an administrator in the account cannot do what an SCP denies. It does not apply to the management account. For response, an SCP can quickly block actions across accounts, such as using regions you do not operate in.
### Remember it
SCPs cap permissions. They do not give them.

## Sign of cryptomining in a stolen account
### What it is
Common signs: `RunInstances` for large or GPU instance types, often in regions you never use; a sudden jump in cost; and GuardDuty findings in the CryptoCurrency family.
### Why this is the answer
Miners want compute in volume, and attackers often use regions you do not monitor. Billing alerts and region restrictions both help. Other patterns, like many failed logins or new roles with no policies, point to different activity.
### Remember it
Big instances in odd places plus a spike in spend.

## Root account usage: what should you expect and alert on?
### What it is
The root user has unrestricted access and should almost never be used.
### Why this is the answer
Expect close to none. Alert on any root sign-in or API call, require MFA, and keep no access keys for root. Daily use, CI deployments or sharing as a break-glass account all expose the most powerful identity in the account.
### Remember it
Root is for a handful of rare tasks, and every use should page someone.

## How do you find which keys are old, unused, or lack MFA?
### What it is
The IAM **credential report** lists every user with details such as password age, access key age, last use and whether MFA is enabled. You generate it with `aws iam generate-credential-report`.
### Why this is the answer
It is a quick, account-wide view for hygiene and investigations. CloudTrail shows activity, not the state of credentials, and billing data does not show key status.
### Remember it
The credential report is the account's credential inventory.

## Investigating CloudTrail at scale
### What it is
For large investigations, query logs in S3 with Amazon Athena. Partition projection keeps queries efficient across many days. `aws cloudtrail lookup-events` is handy for quick checks but limited to recent management events.
### Why this is the answer
Downloading and grepping files does not scale, Event History cannot reach back far, and CloudWatch metrics are not event-level. Athena lets you run SQL across months of logs with limited effort.
### Remember it
Quick look: lookup-events. Real investigation: Athena.

## Why do you need pagination when calling CloudTrail from boto3?
### What it is
CloudTrail and most AWS APIs return results in pages. A single call returns the first page and a token for the next.
### Why this is the answer
If you do not loop through pages, for example by using a paginator, you only see part of the data, silently. An incomplete timeline can lead you to the wrong conclusion about what happened.
### Remember it
One call is one page. Loop until the token runs out.

## How do you check whether an S3 bucket is exposed?
### What it is
Check several layers.
- **Block Public Access** settings (account and bucket).
- The **bucket policy** and **ACLs**.
- **IAM Access Analyzer** findings for external access.
- **Macie** to see what sensitive data is inside.
### Why this is the answer
Exposure can come from any of these, and the bucket name, region or versioning status say nothing about access. Knowing what is inside tells you the severity.
### Remember it
Check the switches, the policies, the analyzer, then the contents.

## Containment vs eradication vs recovery
### What it is
- **Containment:** stop the spread or damage, usually quickly and often temporarily.
- **Eradication:** remove the attacker's access and artifacts, such as keys, users, backdoors.
- **Recovery:** restore normal operations and verify they are clean.
### Why this is the answer
The order matters. Restoring before containing, or eradicating before you understand the scope, lets the attacker return or hides what you needed to learn. None of them means simply rebuilding the whole account.
### Remember it
Stop it, remove it, restore it.

## Evidence handling basics
### What it is
Preserve evidence before you change anything, record a hash of what you collect, keep a chain of custody (who handled it and when), and analyze copies rather than originals.
### Why this is the answer
Changing systems first destroys information, editing originals ruins their value, and sharing raw evidence widely creates exposure and doubts about its integrity. Good handling keeps your findings credible, especially if legal action follows.
### Remember it
Snapshot, hash, document, and work from copies.

## An access key was pushed to a public repo. What is the first containment action?
### What it is
Deactivate the key immediately, then investigate what it did.
### Why this is the answer
Automated scrapers find exposed keys within minutes, so assume it has already been used. Deleting the commit or making the repo private does not undo exposure. Rotating every key in the account is excessive before you know the scope.
### Remember it
Deactivate first. Clean up the repo later.

## How do you see everything an access key did?
### What it is
Search CloudTrail by the `AccessKeyId` in the event's user identity, in **every region**, using lookup-events for recent activity or Athena for more.
### Why this is the answer
The key's creation date or an IAM console history does not show actions, and billing shows spend, not API calls. CloudTrail is the record of API activity, and an attacker can act in any region.
### Remember it
CloudTrail by access key ID, all regions.

## Which AWS tool lists resources shared outside your account or organization?
### What it is
IAM Access Analyzer finds resources, such as S3 buckets, IAM roles, KMS keys and snapshots, that are shared with principals outside your zone of trust.
### Why this is the answer
It uses reasoning about policies to flag external access, which is useful for finding exposure and for checking your work after an incident. Config conformance packs, Cost Explorer and Inspector have different jobs.
### Remember it
Access Analyzer answers: who outside can reach this?

## How do you stop a compromised role from being assumed again?
### What it is
Edit or remove the role's trust policy, which controls who may assume it, and attach a deny for sessions issued before now using `aws:TokenIssueTime`.
### Why this is the answer
Changing the trust policy stops new sessions, and the deny kills existing ones. Renaming tags, disabling console login or editing CloudTrail do nothing about assumption.
### Remember it
Fix who may assume it, and cut off the sessions already out there.

## How do you protect log evidence from tampering?
### What it is
Use **S3 Object Lock** (or MFA delete) on the log bucket, and keep it in a separate account with very limited write and delete rights.
### Why this is the answer
Object Lock makes objects immutable for a retention period, even for administrators. Compression, renaming and static hosting have no protective value.
### Remember it
Immutable storage in a separate account.

## What are VPC Flow Logs good for in IR?
### What it is
Flow logs record network metadata: source and destination addresses and ports, protocol, bytes and whether traffic was accepted or rejected.
### Why this is the answer
They show who talked to whom and how much, which helps trace lateral movement and data exfiltration. They do not contain packet contents, API calls or IAM changes.
### Remember it
Who talked to whom, not what was said.

## What does `userIdentity.type` in a CloudTrail event tell you?
### What it is
It states what kind of principal made the call: `IAMUser`, `AssumedRole`, `Root`, `AWSService`, `FederatedUser`, and so on.
### Why this is the answer
It is the first thing to read when triaging an event. `Root` is a red flag, `AssumedRole` means you have to trace who assumed the role, and `AWSService` means AWS acted on someone's behalf. It does not say where the call ran, how long it took or whether it was billed.
### Remember it
The type tells you who or what acted.

## How do you recognize an assumed-role session in CloudTrail?
### What it is
The user identity type is `AssumedRole`, and the principal ends in a session name (`.../role-name/session-name`).
### Why this is the answer
Seeing that tells you the actor is a temporary session. To find the human or system behind it, look for the earlier `AssumeRole` event that created the session. Timezones, regions and private IPs have nothing to do with it.
### Remember it
AssumedRole plus a session name: find the AssumeRole call.

## What does a `sourceIPAddress` like `cloudformation.amazonaws.com` mean?
### What it is
When the source is an AWS service name rather than an IP address, the call was made by that service on behalf of a principal.
### Why this is the answer
The service is not the actor. Find who triggered it, for example the user who created the CloudFormation stack, from the corresponding event. Treating the service as the culprit sends you down the wrong path.
### Remember it
A service name as source means look for who asked the service.

## What is Amazon Detective?
### What it is
Detective builds a graph of related activity from sources such as CloudTrail, VPC Flow Logs and GuardDuty findings, so you can pivot between users, roles, IPs and resources.
### Why this is the answer
It speeds up investigating a finding by showing relationships and history in context. It is not a scanner, password manager or DDoS protection service.
### Remember it
Detective connects the dots around a finding.

## What does Amazon Macie do?
### What it is
Macie discovers and classifies sensitive data in S3, such as personal data and credentials.
### Why this is the answer
In an incident it answers: what was actually in the exposed bucket? That determines whether you have a reportable breach. It does not block IPs, scan servers for malware or rotate secrets.
### Remember it
Macie tells you what is in the bucket.

## Which GuardDuty finding means instance role credentials are used from outside AWS?
### What it is
`UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS`.
### Why this is the answer
Temporary credentials issued to an EC2 instance should only be used from that instance inside AWS. Use from an external IP means they were stolen, often through SSRF to the metadata service. The other findings listed are real but describe command-and-control, permission reconnaissance and logging being disabled.
### Remember it
Instance credentials used from outside AWS: exfiltrated.

## How do you quickly quarantine a compromised IAM user?
### What it is
Attach an explicit deny-all policy, deactivate the user's access keys, and revoke any active sessions.
### Why this is the answer
Keep the user rather than deleting it, so evidence and the audit trail remain. Changing only the console password leaves keys working, and moving the user to another group does nothing about existing permissions.
### Remember it
Deny everything, kill the keys, keep the account for evidence.

## Why does an explicit Deny matter in IAM?
### What it is
In IAM policy evaluation, an explicit Deny in any applicable policy overrides every Allow.
### Why this is the answer
That makes it the dependable tool for containment: no matter what permissions a principal has through other policies, a Deny stops the action. It is not ignored by roles and it applies to all principals. IAM is eventually consistent, so allow a few seconds for a new Deny to take effect.
### Remember it
Deny always wins.

## Which logs show S3 object-level access?
### What it is
CloudTrail **data events** for S3, or S3 server access logs.
### Why this is the answer
Management events alone show actions like creating a bucket or changing a policy, not who read or deleted an object. If neither data events nor access logs were on at the time, you may not be able to tell what was accessed, which is why enabling them on sensitive buckets matters before an incident.
### Remember it
To see objects, you needed data events turned on in advance.
