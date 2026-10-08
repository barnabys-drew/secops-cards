// Runs the built docs/sw.js against a fake cache and network (no browser needed).
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

let failed = 0;
const TIMED_OUT = { timedOut: true };
function ok(c, m) { if (!c) { failed++; console.log("FAIL:", m); } else console.log("ok  :", m); }

function makeWorker({ network }) {
  const listeners = {};
  const stores = new Map();                       // cache name -> Map(url -> Response-like)
  const urlOf = (r) => new URL(typeof r === "string" ? r : r.url, "https://example.test/secops-cards/").href;
  const cacheApi = {
    open: async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const m = stores.get(name);
      return { addAll: async (urls) => { for (const u of urls) m.set(urlOf(u), { ok: true, body: "cached:" + u }); },
               put: async (req, res) => { m.set(urlOf(req), res); } };
    },
    match: async (req) => { for (const m of stores.values()) if (m.has(urlOf(req))) return m.get(urlOf(req)); return undefined; },
    keys: async () => [...stores.keys()],
    delete: async (name) => stores.delete(name),
  };
  const fetched = [];
  const ctx = {
    self: { addEventListener: (t, fn) => { listeners[t] = fn; }, location: new URL("https://example.test/secops-cards/sw.js"),
            skipWaiting: () => {}, clients: { claim: async () => {} } },
    caches: cacheApi, URL,
    fetch: (req) => { fetched.push(req); return network(req); },
  };
  ctx.self.caches = cacheApi;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, "docs", "sw.js"), "utf8"), ctx);
  const run = async (type, extra) => {
    let promise;
    const event = Object.assign({ waitUntil: (p) => { promise = p; }, respondWith: (p) => { promise = p; } }, extra);
    listeners[type](event);
    if (promise === undefined) return undefined;
    // A worker that waits on a dead network would hang the whole run; report that as a timeout instead.
    return await Promise.race([promise, new Promise((r) => setTimeout(() => r(TIMED_OUT), 300))]);
  };
  return { run, stores, fetched, listeners };
}
// A Response-like object, including clone(), so code that stores network responses really does so.
const response = (props) => { const r = Object.assign({ clone: () => r }, props); return r; };
const nav = (url) => ({ request: { method: "GET", mode: "navigate", url: "https://example.test/secops-cards/" + url } });
const asset = (url) => ({ request: { method: "GET", mode: "no-cors", url: "https://example.test/secops-cards/" + url } });

(async () => {
  // install stores the whole shell
  let w = makeWorker({ network: () => new Promise(() => {}) });
  await w.run("install");
  const cacheName = [...w.stores.keys()][0];
  ok(/^secops-cards-[0-9a-f]{12}$/.test(cacheName), "cache is named with the build hash: " + cacheName);
  ok(["./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-180.png"]
       .every((u) => w.stores.get(cacheName).has(new URL(u, "https://example.test/secops-cards/").href)), "install caches index, manifest and all icons");

  // weak signal: the network never answers, yet the app opens at once from the cache
  const hit = await w.run("fetch", nav(""));
  ok(hit && hit.body === "cached:./index.html", "navigation is served from cache without waiting for a hung network");
  ok(w.fetched.length === 0, "no network request was made for the cached navigation");
  const q = await w.run("fetch", nav("?utm=x"));
  ok(q && q.body === "cached:./index.html", "a navigation with a query string still gets the cached shell");

  // offline: network rejects
  w = makeWorker({ network: () => Promise.reject(new Error("offline")) });
  await w.run("install");
  const off = await w.run("fetch", nav(""));
  ok(off && off.body === "cached:./index.html", "offline navigation works");
  const icon = await w.run("fetch", asset("icons/icon-192.png"));
  ok(icon && icon.body === "cached:./icons/icon-192.png", "offline icon request works");

  // a bad network response must never replace the cached app (captive portal, 404, 5xx)
  w = makeWorker({ network: () => Promise.resolve(response({ ok: false, status: 503, body: "captive portal" })) });
  await w.run("install");
  const before = JSON.stringify([...w.stores.get([...w.stores.keys()][0])]);
  await w.run("fetch", nav(""));
  await w.run("fetch", asset("manifest.webmanifest"));
  await new Promise((r) => setTimeout(r, 20));    // let any background cache writes land before comparing
  ok(JSON.stringify([...w.stores.get([...w.stores.keys()][0])]) === before, "cache is unchanged after requests while the network returns errors");

  // cache cold: first visit falls back to the network, and the response is not stored
  w = makeWorker({ network: () => Promise.resolve(response({ ok: true, body: "from network" })) });
  const cold = await w.run("fetch", nav(""));
  ok(cold && cold.body === "from network" && w.stores.size === 0, "before install, navigation uses the network and stores nothing");

  // other methods and cross-origin requests are left alone
  w = makeWorker({ network: () => Promise.resolve(response({ ok: true })) });
  await w.run("install");
  ok((await w.run("fetch", { request: { method: "POST", mode: "cors", url: "https://example.test/secops-cards/" } })) === undefined, "POST is not intercepted");
  ok((await w.run("fetch", { request: { method: "GET", mode: "cors", url: "https://elsewhere.test/x.js" } })) === undefined, "cross-origin requests are not intercepted");

  // activate removes caches from earlier builds
  w = makeWorker({ network: () => Promise.reject(new Error("offline")) });
  await w.run("install");
  w.stores.set("secops-cards-oldbuild0000", new Map());
  await w.run("activate");
  ok(![...w.stores.keys()].includes("secops-cards-oldbuild0000") && w.stores.size === 1, "activate deletes caches from older builds and keeps the current one");

  console.log(failed ? `\n${failed} FAILED` : "\nall passed");
  process.exitCode = failed ? 1 : 0;
})();
