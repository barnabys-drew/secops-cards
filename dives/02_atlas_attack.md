%% Deep dives for cards/02_atlas_attack.md.

## What is MITRE ATLAS?
### What it is
ATLAS (Adversarial Threat Landscape for AI Systems) is a knowledge base from MITRE that catalogs how adversaries attack AI-enabled systems. It lists tactics (goals), techniques (methods), and real-world case studies, in the same style as MITRE ATT&CK.
### Why this is the answer
It is a **threat knowledge base**, not a risk-management framework or a standard. That separates it from the NIST AI RMF (a framework for managing AI risk), from the OWASP LLM Top 10 (a ranked list of application risks) and from ISO 42001 (a certifiable management system). Teams use ATLAS to describe attacker behavior, plan red-team exercises, and map detections.
### Remember it
ATT&CK is for attacks on enterprises. ATLAS is the same idea for attacks on AI.

## What are the two ATLAS tactics that have no direct ATT&CK equivalent?
### What it is
The two AI-specific tactics are **ML Model Access** and **ML Attack Staging**.
- **ML Model Access:** how the adversary reaches the model, such as through a public inference API, through the product itself, or by obtaining the model files.
- **ML Attack Staging:** preparing the attack, for example by crafting adversarial inputs, training a proxy model, or embedding a backdoor.
### Why this is the answer
Most ATLAS tactics mirror ATT&CK (Reconnaissance, Initial Access, Execution, and so on). These two exist because attacking a model needs steps with no enterprise-network equivalent: getting at the model itself and building attacks against it before using them.
### Remember it
Access to the model, and staging an attack against it. Both are about the model, not the network.

## ATT&CK vocabulary: tactic vs technique vs sub-technique.
### What it is
These three words describe levels of detail.
- **Tactic:** the adversary's goal at that moment, the "why", such as Persistence or Exfiltration.
- **Technique:** the method used to reach that goal, the "how", such as Valid Accounts.
- **Sub-technique:** a more specific variant of a technique, such as Valid Accounts: Cloud Accounts (T1078.004).
### Why this is the answer
Getting the direction right matters in practice. Detections are written against techniques and procedures, while tactics help you reason about where an attack is in its life cycle. A technique can serve several tactics: Valid Accounts appears under Initial Access, Persistence and more.
### Remember it
Tactic = why. Technique = how. Sub-technique = how, in detail.

## List the 14 ATT&CK Enterprise tactics in order.
### What it is
The Enterprise matrix orders tactics roughly along an attack's life cycle:
- Reconnaissance, Resource Development, Initial Access
- Execution, Persistence, Privilege Escalation, Defense Evasion
- Credential Access, Discovery, Lateral Movement
- Collection, Command and Control, Exfiltration, Impact
### Why this is the answer
The order tells a story: the attacker researches and prepares, gets in, runs code and stays, hides and gains power, finds and moves, takes what they want and finally causes harm. Knowing the order helps you place an alert in the attack's progress and anticipate the next step.
### Remember it
Prepare, get in, dig in, explore, take, and impact.

## AML.T0051
### What it is
**LLM Prompt Injection.** An adversary crafts input that makes a large language model act on the attacker's instructions instead of, or in addition to, the application's.
### Why this is the answer
In ATLAS, AML.T0051 is the technique for prompt injection, with variants for direct and indirect injection. The nearby techniques are different: Craft Adversarial Data (T0043) manipulates model predictions, Poison Training Data (T0020) tampers with training, and ML Supply Chain Compromise (T0010) targets what you download.
### Remember it
51 is the one everybody knows: injection.

## AML.T0043
### What it is
**Craft Adversarial Data.** The adversary creates inputs designed to make a model misbehave, for example an image with small changes that flips a classifier's prediction, or a prompt built to induce a harmful output.
### Why this is the answer
It happens at **inference time** by manipulating inputs, and it is part of ML Attack Staging. It differs from Poison Training Data (T0020), which corrupts training instead, and from LLM Prompt Injection (T0051), which is specific to steering language models.
### Remember it
Crafted inputs that fool the model.

## AML.T0020
### What it is
**Poison Training Data.** The adversary alters data used to train or fine-tune a model so that it learns something harmful, such as a backdoor that triggers on a particular phrase.
### Why this is the answer
The key is **training time**. The attacker corrupts what the model learns, so the effect is baked in and can be hard to see. Compare it with Craft Adversarial Data (T0043), which attacks a finished model with crafted inputs.
### Remember it
Poison the well, not the drink.

## AML.T0010
### What it is
**ML Supply Chain Compromise.** The adversary compromises something in the ML supply chain: a pre-trained model, a dataset, a library, or the platform that distributes them.
### Why this is the answer
The target is **what you obtain from others**. A tampered model file, a malicious package, or a poisoned public dataset all fit. Defenses resemble ordinary software supply chain security: trusted sources, pinning, hashing, scanning, and safe model formats.
### Remember it
If you downloaded it and trusted it, it is in the supply chain.

## AML.T0024
### What it is
**Exfiltration via ML Inference API.** The adversary uses a model's prediction interface to pull out information, such as training data details or enough about the model to copy it.
### Why this is the answer
It is exfiltration where the model's API is the channel. Examples include membership inference, which asks whether a record was in the training data, and model extraction by repeated querying. Rate limits, output controls and monitoring help.
### Remember it
Ask the model enough questions and it gives away more than intended.

## T1078.004
### What it is
**Valid Accounts: Cloud Accounts.** The adversary uses legitimate cloud credentials, such as a stolen access key, password or session token, to act in a cloud environment.
### Why this is the answer
This is the most common starting point for cloud intrusions because no exploit is needed. The attacker simply logs in. It differs from Create Account: Cloud Account (T1136.003), which makes a new account, and from Account Manipulation: Additional Cloud Credentials (T1098.001), which adds credentials to an existing one.
### Remember it
The attacker is not breaking in. They are logging in.

## T1562.008
### What it is
**Impair Defenses: Disable or Modify Cloud Logs.** The adversary turns off or alters cloud logging so their actions are harder to see, for example calling CloudTrail `StopLogging` or `DeleteTrail`.
### Why this is the answer
It is a Defense Evasion technique aimed at logging itself. Alerting on these API calls is one of the highest-value cloud detections, because legitimate users rarely do it and attackers often do it early.
### Remember it
When logging stops, assume someone wanted it to.

## T1530
### What it is
**Data from Cloud Storage.** The adversary reads data from cloud storage, such as objects in an S3 bucket they can access.
### Why this is the answer
It is a Collection technique focused on getting the data out of storage. Do not confuse it with Cloud Storage Object Discovery (T1619), which only lists what is there, or Transfer Data to Cloud Account (T1537), which moves data to an attacker-controlled account.
### Remember it
Discovery lists the objects. Data from Cloud Storage reads them.

## T1098.001
### What it is
**Account Manipulation: Additional Cloud Credentials.** The adversary adds credentials to an existing account, such as creating a new access key for an IAM user, to keep access even if the original credential is changed.
### Why this is the answer
The purpose is **persistence**. After compromising an account, creating another key means that rotating the first one does not lock the attacker out. In AWS the signal is an `iam:CreateAccessKey` call, especially one made by an unexpected principal.
### Remember it
A second key is a spare key under the doormat.

## T1552.005
### What it is
**Unsecured Credentials: Cloud Instance Metadata API.** The adversary queries the instance metadata service from a compromised workload to steal the temporary credentials of the instance's role.
### Why this is the answer
The metadata service hands out role credentials to anything that can reach it. A server-side request forgery (SSRF) bug can be abused to make the server fetch that URL and return the credentials. Requiring IMDSv2, which needs a session token obtained with a PUT request, blocks many of these attacks.
### Remember it
SSRF plus metadata equals stolen role credentials.

## T1580
### What it is
**Cloud Infrastructure Discovery.** The adversary lists resources in a cloud environment, such as instances, buckets, roles and networks, to learn what exists and what they can reach.
### Why this is the answer
It is a Discovery technique about **infrastructure**. A burst of `Describe*` and `List*` API calls from a new principal shortly after login is the typical signature. It is distinct from Cloud Service Discovery, which asks which cloud services are enabled.
### Remember it
Describe and List calls from someone new: they are looking around.

## T1537
### What it is
**Transfer Data to Cloud Account.** The adversary moves data to another cloud account they control, for example by sharing a snapshot or copying objects to their own bucket.
### Why this is the answer
This is Exfiltration using the cloud provider's own features, so the traffic may never leave the provider's network and can look like normal admin activity. Watch for snapshots or images shared with unknown account IDs and for cross-account copies.
### Remember it
The data never left the cloud. It just changed owners.

## T1496
### What it is
**Resource Hijacking.** The adversary uses a victim's compute for their own purposes, most often cryptocurrency mining.
### Why this is the answer
The impact is stolen compute and a bill. In cloud accounts, look for sudden launches of large or GPU instances, activity in regions you do not use, and cost spikes. It is an Impact technique, not data theft.
### Remember it
Your bill, their coins.

## T1136.003
### What it is
**Create Account: Cloud Account.** The adversary creates a new account in the cloud environment, such as a new IAM user, to maintain access.
### Why this is the answer
Persistence by **making a new identity**. It differs from adding a key to an existing account (T1098.001) and from using existing credentials (T1078.004). In AWS it appears as `iam:CreateUser`, often followed by `CreateLoginProfile` or `CreateAccessKey`.
### Remember it
New user created by an unexpected principal: treat it as an incident.

## How do you apply ATT&CK in a detection program without it turning into a coloring exercise?
### What it is
A common failure is to color a matrix green wherever a rule exists and report a coverage percentage. That measures the rules you have, not your ability to catch attackers.
### Why this is the answer
Useful work starts from **who attacks you and how**. Prioritize techniques used by relevant adversaries and by attacks on your environment, confirm you have the necessary data, write detections, test them against real emulations, and measure quality: tested, firing and tuned. One rule per technique does not cover the many ways a technique can be carried out.
### Remember it
Coverage is a measure of tested detections, not of colored boxes.

## AML.T0054
### What it is
**LLM Jailbreak.** The adversary gets a language model to ignore its built-in safety rules and produce content or behavior it was trained to refuse.
### Why this is the answer
The target is the **model's own safety policy**. That differs from prompt injection (T0051), which hijacks the application's instructions. The two often occur together, but the distinction helps you choose defenses: model-level safety training for jailbreaks, application-level isolation for injection.
### Remember it
Jailbreak breaks the model's rules. Injection breaks the app's.

## AML.T0040
### What it is
**ML Model Inference API Access.** The adversary gets access to a model through its prediction or inference interface. It is a technique under the ML Model Access tactic.
### Why this is the answer
It means the attacker can **query** the model but does not have its internals. That is enough for many attacks, such as crafting adversarial inputs or extracting information. It differs from Full ML Model Access (T0044), where the attacker has the weights.
### Remember it
Querying the model is access too.

## AML.T0044
### What it is
**Full ML Model Access.** The adversary obtains the model itself, including its architecture and weights.
### Why this is the answer
With the whole model, an attacker can study it offline, craft attacks that transfer very well, and extract anything memorized. It is the strongest form of access, compared with Inference API Access (T0040), which only allows queries. Protect model files like source code and credentials.
### Remember it
Holding the weights means you can attack at leisure.

## AML.T0015
### What it is
**Evade ML Model.** The adversary supplies inputs that cause a model to miss or misclassify something, such as malware altered to slip past a detection model.
### Why this is the answer
The goal is to **avoid being caught** by a model-based control, which makes it a Defense Evasion technique. It relates to Craft Adversarial Data (T0043), the staging step that produces the inputs.
### Remember it
Evasion is the goal. Adversarial data is the tool.

## Jailbreak vs prompt injection: what is the difference?
### What it is
Both manipulate a language model through text, but they aim at different things.
- **Jailbreak:** defeats the model's own safety training so it produces disallowed content.
- **Prompt injection:** smuggles attacker instructions into an application so the model serves the attacker, such as leaking data or calling tools.
### Why this is the answer
The difference decides the fix. Jailbreaks are mainly addressed by model safety work and output filtering. Prompt injection is an application design problem: limit what the model can do, separate untrusted content, and enforce permissions in code.
### Remember it
Jailbreak: the model's policy. Injection: the app's intent.

## T1190
### What it is
**Exploit Public-Facing Application.** The adversary takes advantage of a flaw in an internet-facing service to gain initial access, such as a vulnerable web application or exposed management interface.
### Why this is the answer
It is an Initial Access technique where the entry point is a **vulnerability in something you expose**. Contrast it with Valid Accounts (T1078), where the attacker logs in with real credentials, and with phishing, which targets people. Patching, attack surface reduction and web application firewalls are the usual defenses.
### Remember it
Exploit the door you left open to the internet.

## T1535
### What it is
**Unused/Unsupported Cloud Regions.** The adversary runs resources in cloud regions the victim does not use or monitor, to avoid being noticed.
### Why this is the answer
It is Defense Evasion that relies on weak visibility. Cryptomining in an unused region is a classic example. Defenses: restrict regions with service control policies, enable logging and detection in all regions, and alert on resource creation in regions you never use.
### Remember it
If you never look at a region, an attacker will happily live there.

## T1578
### What it is
**Modify Cloud Compute Infrastructure.** The adversary creates, deletes or changes compute resources, such as instances, snapshots or volumes, to evade defenses or prepare an attack.
### Why this is the answer
It is about **changing the infrastructure** itself. Examples: creating a snapshot to copy data from, deleting an instance to remove evidence, or modifying a volume. Watch for unusual `CreateSnapshot`, `ModifyInstanceAttribute` and `DeleteVolume` calls.
### Remember it
When the attacker edits your compute, think T1578.

## T1619
### What it is
**Cloud Storage Object Discovery.** The adversary lists the objects in cloud storage, such as bucket contents, to find data worth taking.
### Why this is the answer
It is a Discovery technique: **enumerating, not reading**. In AWS it appears as `ListObjects` calls, often across many buckets. It usually comes just before Data from Cloud Storage (T1530).
### Remember it
Listing precedes taking.

## T1651
### What it is
**Cloud Administration Command.** The adversary abuses a cloud provider's management features to run commands on virtual machines, such as AWS Systems Manager Run Command or similar tools.
### Why this is the answer
It lets an attacker with cloud permissions execute code on instances **without needing network access** to them. Because it uses legitimate administration channels, it looks like normal management. Restrict who can run such commands and alert on their use.
### Remember it
The cloud control plane can run code on your servers.

## T1550.001
### What it is
**Use Alternate Authentication Material: Application Access Token.** The adversary uses a stolen application token, such as an OAuth or API token, in place of a password.
### Why this is the answer
Tokens often bypass multi-factor authentication because the user already completed it when the token was issued. A stolen token works until it expires or is revoked. Defenses: short token lifetimes, token binding where available, and quick revocation procedures.
### Remember it
A token is a password that already passed MFA.
