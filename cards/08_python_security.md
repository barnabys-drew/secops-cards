# Python for security work
> Beginner-friendly: the language basics, and the security traps attached to them.

Q: Why use a virtual environment?
A: It isolates a project's dependencies (`python3 -m venv .venv`). It avoids version clashes and keeps global installs from becoming an unpinned supply chain.

Q: `with open(path) as f:` why?
A: It closes the file for you, even if an exception occurs.

Q: `d["key"]` vs `d.get("key")`
A: Indexing raises `KeyError` if the key is missing. `.get` returns `None` (or a default you provide).

Q: Write a list comprehension that keeps the even numbers.
A: `[n for n in numbers if n % 2 == 0]`

Q: What is `if __name__ == "__main__":` for?
A: Code under it runs when the file is executed directly, not when it is imported.

Q: boto3 client vs resource
A: A client mirrors the AWS API one-to-one and gets new features. A resource is an object-oriented wrapper that is no longer receiving new features. Prefer clients.

Q: Why must you paginate AWS API calls?
A: Each call returns one page. Use `client.get_paginator("name")` or follow `NextToken`, otherwise you silently get partial data.

Q: How do you catch a specific AWS error?
A: `except botocore.exceptions.ClientError as e:` then read `e.response["Error"]["Code"]`.

Q: Why is a bare `except:` a problem?
A: It catches everything, including bugs and Ctrl-C, and hides failures. Catch the specific exceptions you expect.

Q: `subprocess.run(["ls", path])` vs `subprocess.run(f"ls {path}", shell=True)`
A: The list form passes arguments directly. The `shell=True` string form lets a crafted `path` inject extra commands (command injection).

Q: Which functions are dangerous on untrusted input?
A: `eval`, `exec`, `pickle.load` (code execution on load), and `yaml.load` without a safe loader. Use `json.loads` and `yaml.safe_load`.

Q: How do you avoid SQL injection in Python?
A: Parameterized queries: `cur.execute("SELECT ... WHERE id = ?", (user_id,))`. Never build the query with f-strings.

Q: `random` vs `secrets`
A: `random` is predictable and not for security. Use `secrets` for tokens and keys.

Q: Where do API keys and webhook URLs belong?
A: Environment variables or a secrets manager, never in source or git. A Slack webhook URL is a secret.

Q: Why does `requests.get(url)` need `timeout=`?
A: There is no default timeout, so a stalled server can hang your script forever.

Q: `logging` vs `print`
A: Logging has levels, formats, and handlers, and can go to files or a collector. Never log secrets or tokens.

Q: `json.loads` vs `json.dumps`
A: `loads` turns a JSON string into Python objects. `dumps` turns Python objects into a JSON string.

Q: Why use timezone-aware datetimes?
A: Logs and incidents span timezones. Use `datetime.now(timezone.utc)`; naive datetimes cause wrong timelines.

Q: How do you stop path traversal when joining user input to a directory?
A: `Path(base, user_input).resolve()` and check the result is still inside `base` (for example with `is_relative_to`).

Q: Mutable default argument trap
A: `def f(items=[])` reuses one list across calls. Use `items=None` and create the list inside.

Q: What does `yield` do and why is it useful for logs?
A: It makes a generator that produces items one at a time, so you can process huge files without loading them into memory.

Q: Shape of an AWS Lambda handler in Python
A: `def handler(event, context):` returning a result. Give it a least-privilege execution role and a sensible timeout.

Q: Minimal pytest test
A: A function named `test_something()` that uses a plain `assert`, in a file named `test_*.py`. Run with `pytest`.

Q: Type hints: do they enforce anything at runtime?
A: No. They document intent and let tools like mypy catch errors before you run the code.

Q: How do you check your dependencies for known vulnerabilities?
A: `pip-audit` against your requirements, and pin versions (ideally with hashes).
