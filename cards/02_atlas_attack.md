# MITRE ATLAS and ATT&CK
> Verify technique IDs against atlas.mitre.org and attack.mitre.org; matrices get revised.

Q: What is MITRE ATLAS?
A: A knowledge base of adversary tactics, techniques, and real case studies against AI-enabled systems, modeled on ATT&CK. ATLAS = Adversarial Threat Landscape for AI Systems.
S: A MITRE knowledge base of adversary tactics and techniques against AI systems
X: A NIST framework for AI risk management
X: An OWASP list of the top ten LLM risks
X: An ISO standard for AI management systems

Q: What are the two ATLAS tactics that have no direct ATT&CK equivalent?
A: ML Model Access (how the adversary reaches the model: API, physical, product use) and ML Attack Staging (preparing the attack: crafting adversarial data, training proxy models, backdoors).
S: ML Model Access and ML Attack Staging
X: Model Training and Model Deployment
X: ML Reconnaissance and ML Exfiltration
X: Prompt Access and Prompt Staging

Q: ATT&CK vocabulary: tactic vs technique vs sub-technique.
A: Tactic = the adversary's goal (the why). Technique = how they achieve it. Sub-technique = a more specific variant of the technique.
S: A tactic is the goal (why); a technique is the method (how)
X: A tactic is the method; a technique is the goal
X: A tactic is a tool; a technique is a threat actor
X: A tactic is a detection; a technique is a mitigation

Q: List the 14 ATT&CK Enterprise tactics in order.
A: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact.

Q: AML.T0051
A: LLM Prompt Injection.
S: LLM Prompt Injection
X: Craft Adversarial Data
X: Poison Training Data
X: ML Supply Chain Compromise

Q: AML.T0043
A: Craft Adversarial Data (inputs designed to make a model misbehave).
S: Craft Adversarial Data
X: LLM Prompt Injection
X: Exfiltration via ML Inference API
X: Poison Training Data

Q: AML.T0020
A: Poison Training Data.
S: Poison Training Data
X: ML Supply Chain Compromise
X: Craft Adversarial Data
X: LLM Prompt Injection

Q: AML.T0010
A: ML Supply Chain Compromise.
S: ML Supply Chain Compromise
X: Poison Training Data
X: Exfiltration via ML Inference API
X: Craft Adversarial Data

Q: AML.T0024
A: Exfiltration via ML Inference API (extracting data or model information through queries).
S: Exfiltration via ML Inference API
X: LLM Prompt Injection
X: ML Supply Chain Compromise
X: Craft Adversarial Data

Q: T1078.004
A: Valid Accounts: Cloud Accounts. Using stolen cloud credentials (the usual start of an AWS compromise).
S: Valid Accounts: Cloud Accounts
X: Create Account: Cloud Account
X: Account Manipulation: Additional Cloud Credentials
X: Data from Cloud Storage

Q: T1562.008
A: Impair Defenses: Disable or Modify Cloud Logs (for example CloudTrail StopLogging).
S: Impair Defenses: Disable or Modify Cloud Logs
X: Indicator Removal: Clear Logs
X: Cloud Infrastructure Discovery
X: Resource Hijacking

Q: T1530
A: Data from Cloud Storage (reading S3 or similar objects).
S: Data from Cloud Storage
X: Transfer Data to Cloud Account
X: Cloud Infrastructure Discovery
X: Valid Accounts: Cloud Accounts

Q: T1098.001
A: Account Manipulation: Additional Cloud Credentials (for example creating a new access key for persistence).
S: Account Manipulation: Additional Cloud Credentials
X: Valid Accounts: Cloud Accounts
X: Create Account: Cloud Account
X: Unsecured Credentials: Cloud Instance Metadata API

Q: T1552.005
A: Unsecured Credentials: Cloud Instance Metadata API (stealing role credentials from the metadata service, the classic SSRF target).
S: Unsecured Credentials: Cloud Instance Metadata API
X: Account Manipulation: Additional Cloud Credentials
X: Cloud Infrastructure Discovery
X: Data from Cloud Storage

Q: T1580
A: Cloud Infrastructure Discovery (enumerating instances, buckets, roles).
S: Cloud Infrastructure Discovery
X: Cloud Service Discovery
X: Data from Cloud Storage
X: Resource Hijacking

Q: T1537
A: Transfer Data to Cloud Account (exfiltrating to an attacker-controlled account, for example sharing a snapshot).
S: Transfer Data to Cloud Account
X: Data from Cloud Storage
X: Exfiltration Over Web Service
X: Valid Accounts: Cloud Accounts

Q: T1496
A: Resource Hijacking (cryptomining on stolen compute).
S: Resource Hijacking
X: Data Destruction
X: Cloud Infrastructure Discovery
X: Transfer Data to Cloud Account

Q: T1136.003
A: Create Account: Cloud Account.
S: Create Account: Cloud Account
X: Valid Accounts: Cloud Accounts
X: Account Manipulation: Additional Cloud Credentials
X: Cloud Infrastructure Discovery

Q: How do you apply ATT&CK in a detection program without it turning into a coloring exercise?
A: Pick techniques by relevant adversaries and your environment, check you have the data source, write and test detections per procedure, and measure quality (tested, alerting, tuned). One rule per technique is not coverage.
S: Prioritize by relevant adversaries, confirm data, test, and measure quality
X: Write one rule per technique and report the percentage covered
X: Buy a vendor rule pack that claims to cover every technique
X: Color the matrix by which tools say they cover it

Q: AML.T0054
A: LLM Jailbreak (getting a model to ignore its safety rules).
S: LLM Jailbreak
X: LLM Prompt Injection
X: Evade ML Model
X: Craft Adversarial Data

Q: AML.T0040
A: ML Model Inference API Access (reaching the model through its prediction API).
S: ML Model Inference API Access
X: Full ML Model Access
X: Exfiltration via ML Inference API
X: LLM Prompt Injection

Q: AML.T0044
A: Full ML Model Access (the adversary has the model itself, for example its weights).
S: Full ML Model Access
X: ML Model Inference API Access
X: ML Supply Chain Compromise
X: Poison Training Data

Q: AML.T0015
A: Evade ML Model (inputs that make a model miss or misclassify something).
S: Evade ML Model
X: Poison Training Data
X: LLM Jailbreak
X: Exfiltration via ML Inference API

Q: Jailbreak vs prompt injection: what is the difference?
A: A jailbreak bypasses a model's own safety rules. Prompt injection hijacks the application's instructions by smuggling in attacker text. They overlap, but the target differs: the model's policy versus the app's intent.
S: A jailbreak bypasses model safety rules; injection hijacks the app's instructions
X: They are the same attack with two names
X: A jailbreak needs API access; injection needs physical access
X: A jailbreak poisons training data; injection poisons logs

Q: T1190
A: Exploit Public-Facing Application (initial access through an internet-facing service).
S: Exploit Public-Facing Application
X: Valid Accounts
X: Phishing
X: Trusted Relationship

Q: T1535
A: Unused/Unsupported Cloud Regions (running resources where nobody is watching, for example for cryptomining).
S: Unused/Unsupported Cloud Regions
X: Cloud Infrastructure Discovery
X: Resource Hijacking
X: Transfer Data to Cloud Account

Q: T1578
A: Modify Cloud Compute Infrastructure (creating, deleting, or changing instances, snapshots, or volumes to evade defenses or stage an attack).
S: Modify Cloud Compute Infrastructure
X: Cloud Infrastructure Discovery
X: Create Account: Cloud Account
X: Data from Cloud Storage

Q: T1619
A: Cloud Storage Object Discovery (listing the objects in buckets).
S: Cloud Storage Object Discovery
X: Data from Cloud Storage
X: Cloud Infrastructure Discovery
X: Transfer Data to Cloud Account

Q: T1651
A: Cloud Administration Command (using cloud management tools such as SSM or run-command to execute code on instances).
S: Cloud Administration Command
X: Command and Scripting Interpreter
X: Cloud Infrastructure Discovery
X: Modify Cloud Compute Infrastructure

Q: T1550.001
A: Use Alternate Authentication Material: Application Access Token (stolen OAuth or API tokens used in place of a password).
S: Use Alternate Authentication Material: Application Access Token
X: Valid Accounts: Cloud Accounts
X: Steal Web Session Cookie
X: Brute Force: Password Spraying
