# Python for security work
> Beginner-friendly: the language basics, and the security traps attached to them.

Q: Why use a virtual environment?
A: It isolates a project's dependencies (`python3 -m venv .venv`). It avoids version clashes and keeps global installs from becoming an unpinned supply chain.
S: It isolates dependencies and avoids unpinned global installs
X: It makes Python run faster
X: It encrypts your code
X: It installs Python system-wide

Q: `with open(path) as f:` why?
A: It closes the file for you, even if an exception occurs.
S: It closes the file for you, even on exceptions
X: It makes the file read-only
X: It encrypts the file
X: It loads the whole file into memory

Q: `d["key"]` vs `d.get("key")`
A: Indexing raises `KeyError` if the key is missing. `.get` returns `None` (or a default you provide).
S: Indexing raises KeyError; .get returns None or a default
X: Indexing returns None; .get raises KeyError
X: They are identical
X: .get modifies the dict

Q: Write a list comprehension that keeps the even numbers.
A: `[n for n in numbers if n % 2 == 0]`
S: `[n for n in numbers if n % 2 == 0]`
X: `[n if n % 2 == 0 for n in numbers]`
X: `[for n in numbers if n % 2 == 0: n]`
X: `{n for n in numbers where n % 2 == 0}`

Q: What is `if __name__ == "__main__":` for?
A: Code under it runs when the file is executed directly, not when it is imported.
S: Code under it runs when the file is executed directly, not imported
X: Code under it runs only when imported
X: Code under it runs on every function call
X: It marks the file as a package

Q: boto3 client vs resource
A: A client mirrors the AWS API one-to-one and gets new features. A resource is an object-oriented wrapper that is no longer receiving new features. Prefer clients.
S: A client mirrors the API and gets new features; a resource is object-oriented and frozen
X: A resource mirrors the API; a client is object-oriented
X: A client works only for S3
X: They are identical

Q: Why must you paginate AWS API calls?
A: Each call returns one page. Use `client.get_paginator("name")` or follow `NextToken`, otherwise you silently get partial data.
S: Each call returns one page, so use a paginator or NextToken
X: boto3 merges all pages automatically
X: Only S3 paginates
X: Pagination is a billing feature

Q: How do you catch a specific AWS error?
A: `except botocore.exceptions.ClientError as e:` then read `e.response["Error"]["Code"]`.
S: `except ClientError as e:` then `e.response["Error"]["Code"]`
X: `except AWSError as e:` then `e.code`
X: `except Exception:` then `str(e)[:10]`
X: `except boto3.Error:` then `e.errno`

Q: Why is a bare `except:` a problem?
A: It catches everything, including bugs and Ctrl-C, and hides failures. Catch the specific exceptions you expect.
S: It catches everything, hiding bugs and Ctrl-C
X: It is slower than specific excepts
X: It only works inside functions
X: It disables logging

Q: `subprocess.run(["ls", path])` vs `subprocess.run(f"ls {path}", shell=True)`
A: The list form passes arguments directly. The `shell=True` string form lets a crafted `path` inject extra commands (command injection).
S: The list form passes arguments directly; shell=True with a string allows injection
X: shell=True is safer because it escapes input
X: The list form runs through a shell
X: Both are identical

Q: Which functions are dangerous on untrusted input?
A: `eval`, `exec`, `pickle.load` (code execution on load), and `yaml.load` without a safe loader. Use `json.loads` and `yaml.safe_load`.
S: eval, exec, pickle.load, yaml.load
X: json.loads, yaml.safe_load
X: len, sum, print
X: open, close, read

Q: How do you avoid SQL injection in Python?
A: Parameterized queries: `cur.execute("SELECT ... WHERE id = ?", (user_id,))`. Never build the query with f-strings.
S: Parameterized queries
X: f-strings with quoting
X: String concatenation followed by strip()
X: Regex filtering of the input

Q: `random` vs `secrets`
A: `random` is predictable and not for security. Use `secrets` for tokens and keys.
S: random is predictable; use secrets for tokens and keys
X: secrets is predictable; use random
X: They are the same module
X: random is for security; secrets is for games

Q: Where do API keys and webhook URLs belong?
A: Environment variables or a secrets manager, never in source or git. A Slack webhook URL is a secret.
S: Environment variables or a secrets manager
X: Hardcoded in the source
X: In a public config file
X: In a comment next to the call

Q: Why does `requests.get(url)` need `timeout=`?
A: There is no default timeout, so a stalled server can hang your script forever.
S: There is no default timeout, so a stalled server can hang forever
X: The default timeout is 1 second
X: The default timeout is 30 seconds
X: Timeouts only matter for HTTPS

Q: `logging` vs `print`
A: Logging has levels, formats, and handlers, and can go to files or a collector. Never log secrets or tokens.
S: Logging has levels and handlers; never log secrets
X: Print is faster and safer
X: Logging is only for libraries
X: They are identical

Q: `json.loads` vs `json.dumps`
A: `loads` turns a JSON string into Python objects. `dumps` turns Python objects into a JSON string.
S: loads parses JSON text into objects; dumps serializes objects to text
X: loads writes to a file; dumps reads from a file
X: They are identical
X: loads is for lists; dumps is for dicts

Q: Why use timezone-aware datetimes?
A: Logs and incidents span timezones. Use `datetime.now(timezone.utc)`; naive datetimes cause wrong timelines.
S: Logs span timezones; use datetime.now(timezone.utc)
X: Naive datetimes are faster and fine
X: UTC is deprecated
X: Local time is always correct

Q: How do you stop path traversal when joining user input to a directory?
A: `Path(base, user_input).resolve()` and check the result is still inside `base` (for example with `is_relative_to`).
S: Resolve the path and check it is still inside the base directory
X: Strip the string ".." from the input
X: Check the file extension
X: Call os.system("realpath")

Q: Mutable default argument trap
A: `def f(items=[])` reuses one list across calls. Use `items=None` and create the list inside.
S: The default list is shared across calls; use None instead
X: It is copied on each call
X: Python forbids it
X: It is faster

Q: What does `yield` do and why is it useful for logs?
A: It makes a generator that produces items one at a time, so you can process huge files without loading them into memory.
S: It makes a generator that produces items one at a time without loading everything
X: It returns a list of all items
X: It stops the program
X: It makes a function asynchronous

Q: Shape of an AWS Lambda handler in Python
A: `def handler(event, context):` returning a result. Give it a least-privilege execution role and a sensible timeout.
S: `def handler(event, context):`
X: `def main(args, kwargs):`
X: `def lambda_handler():`
X: `def run(request):`

Q: Minimal pytest test
A: A function named `test_something()` that uses a plain `assert`, in a file named `test_*.py`. Run with `pytest`.
S: A `test_*` function with a plain `assert`
X: A class that must inherit TestCase
X: A `main()` with print statements
X: A `try/except` around the code

Q: Type hints: do they enforce anything at runtime?
A: No. They document intent and let tools like mypy catch errors before you run the code.
S: No, they do not enforce anything at runtime
X: Yes, wrong types raise TypeError
X: Yes, but only for functions
X: Only in strict mode

Q: How do you check your dependencies for known vulnerabilities?
A: `pip-audit` against your requirements, and pin versions (ideally with hashes).
S: `pip-audit`, plus pinned versions
X: `pip freeze` alone
X: `python -m venv`
X: `pip check` only

Q: What does `enumerate(items)` give you?
A: Pairs of (index, item), so you can loop with a counter without managing it yourself.
S: Pairs of index and item
X: Only the items, sorted
X: A copy of the list
X: The list reversed

Q: How do you read an environment variable safely?
A: `os.environ.get("NAME")` and handle the missing case explicitly. Indexing raises `KeyError` if it is unset.
S: `os.environ.get("NAME")` and handle the missing case
X: `os.environ["NAME"]` and hope it exists
X: `open(".env").read()` in every module
X: `input("NAME")` at startup

Q: What does `sorted(d.items(), key=lambda kv: kv[1], reverse=True)` do?
A: Sorts a dict's (key, value) pairs by value, largest first, which is handy for "top talkers".
S: Sorts a dict's pairs by value, largest first
X: Sorts by key, smallest first
X: Sorts the values in place
X: Removes duplicate values

Q: What is `collections.Counter` good for?
A: Counting things, such as events per user or requests per IP, with `.most_common(n)` for the top results.
S: Counting things, such as events per user or per IP
X: Encrypting counters
X: Running code on a timer
X: Limiting loop iterations

Q: What does `try/finally` guarantee?
A: The `finally` block runs whether or not an error occurred, which is where cleanup belongs.
S: The finally block runs whether or not an error occurred
X: Errors are always hidden
X: The try block runs twice
X: The program exits afterward

Q: How do you build a file path safely?
A: `pathlib.Path(base) / name`. Joining strings by hand invites separator and traversal bugs.
S: `pathlib.Path(base) / name`
X: `base + "/" + name`
X: `os.system("echo " + name)`
X: `str(base) + name`

Q: What is a dataclass for?
A: A compact class that stores fields, with `__init__`, `__repr__`, and comparison generated for you.
S: A compact class for storing fields, with generated `__init__` and `__repr__`
X: A class that encrypts its data
X: A class that cannot be subclassed
X: A database table definition

Q: How do you parse a CloudTrail timestamp like `2026-10-05T14:03:11Z`?
A: `datetime.fromisoformat(s.replace("Z", "+00:00"))` gives a timezone-aware UTC datetime on all recent Python versions.
S: `datetime.fromisoformat(s.replace("Z", "+00:00"))`
X: `int(s)`
X: `s.split("T")[0]` only
X: `time.sleep(s)`

Q: What do `argparse` and `typer` do?
A: They turn command-line arguments into function inputs, with validation and help text.
S: Turn command-line arguments into function inputs, with help text
X: Parse HTML pages
X: Schedule scripts
X: Install packages

Q: What are context managers (`with`) good for beyond files?
A: Guaranteed setup and cleanup, such as locks, database connections, and temporary directories.
S: Guaranteed setup and cleanup for locks, connections, and temp directories
X: Making code run in parallel
X: Encrypting variables
X: Catching all exceptions

Q: Why avoid `except Exception: pass`?
A: It silently swallows failures, so you never learn that data was missing or a call failed, which is dangerous in IR tooling.
S: It silently swallows failures, so you never learn data was missing
X: It crashes the program
X: It slows the loop
X: It deletes the stack trace file

Q: How do you read a field from nested JSON safely?
A: Use `.get()` chains or a small helper with defaults, so a missing key does not crash the script or hide an event.
S: Use `.get()` chains or a helper with defaults
X: Wrap everything in a bare `except`
X: Index each level directly
X: Convert the event to a string first
