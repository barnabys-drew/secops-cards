# MITRE ATLAS and ATT&CK
> Verify technique IDs against atlas.mitre.org and attack.mitre.org; matrices get revised.

Q: What is MITRE ATLAS?
A: A knowledge base of adversary tactics, techniques, and real case studies against AI-enabled systems, modeled on ATT&CK. ATLAS = Adversarial Threat Landscape for AI Systems.

Q: What are the two ATLAS tactics that have no direct ATT&CK equivalent?
A: ML Model Access (how the adversary reaches the model: API, physical, product use) and ML Attack Staging (preparing the attack: crafting adversarial data, training proxy models, backdoors).

Q: ATT&CK vocabulary: tactic vs technique vs sub-technique.
A: Tactic = the adversary's goal (the why). Technique = how they achieve it. Sub-technique = a more specific variant of the technique.

Q: List the 14 ATT&CK Enterprise tactics in order.
A: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact.

Q: AML.T0051
A: LLM Prompt Injection.

Q: AML.T0043
A: Craft Adversarial Data (inputs designed to make a model misbehave).

Q: AML.T0020
A: Poison Training Data.

Q: AML.T0010
A: ML Supply Chain Compromise.

Q: AML.T0024
A: Exfiltration via ML Inference API (extracting data or model information through queries).

Q: T1078.004
A: Valid Accounts: Cloud Accounts. Using stolen cloud credentials (the usual start of an AWS compromise).

Q: T1562.008
A: Impair Defenses: Disable or Modify Cloud Logs (for example CloudTrail StopLogging).

Q: T1530
A: Data from Cloud Storage (reading S3 or similar objects).

Q: T1098.001
A: Account Manipulation: Additional Cloud Credentials (for example creating a new access key for persistence).

Q: T1552.005
A: Unsecured Credentials: Cloud Instance Metadata API (stealing role credentials from the metadata service, the classic SSRF target).

Q: T1580
A: Cloud Infrastructure Discovery (enumerating instances, buckets, roles).

Q: T1537
A: Transfer Data to Cloud Account (exfiltrating to an attacker-controlled account, for example sharing a snapshot).

Q: T1496
A: Resource Hijacking (cryptomining on stolen compute).

Q: T1136.003
A: Create Account: Cloud Account.

Q: How do you apply ATT&CK in a detection program without it turning into a coloring exercise?
A: Pick techniques by relevant adversaries and your environment, check you have the data source, write and test detections per procedure, and measure quality (tested, alerting, tuned). One rule per technique is not coverage.
