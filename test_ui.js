const { JSDOM } = require("jsdom");
const fs = require("fs");
const base = fs.readFileSync(require("path").join(__dirname, "docs", "index.html"), "utf8");
let failed = 0;
function ok(c, m) { if (!c) { failed++; console.log("FAIL:", m); } else console.log("ok  :", m); }
function page(html, opts) {
  opts = opts || {};
  const errors = [];
  const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/", pretendToBeVisual: true,
    beforeParse(w) {
      w.addEventListener("error", (e) => errors.push(e.message)); w.scrollTo = () => {}; w.confirm = () => true;
      if (opts.noStorage) Object.defineProperty(w, "localStorage", { get() { throw new Error("blocked"); } });
    } });
  const d = dom.window.document;
  return { w: dom.window, d, q: (s) => d.querySelector(s), text: () => d.getElementById("app").textContent, errors };
}
const store = (p) => JSON.parse(p.w.localStorage.getItem("secops-cards:v1"));

// --- undo restores state exactly
let p = page(base);
p.q("#all").click();
p.q("#show").click(); p.q(".g3").click();            // grade card 1 Good
const afterOne = JSON.stringify(store(p));
p.q("#show").click(); p.q(".g4").click();            // grade card 2 Easy
p.q("#undo").click();
ok(JSON.stringify(store(p)) === afterOne, "undo restores stored progress byte-for-byte");
ok(p.text().includes("2 / 15"), "undo shows the undone card again");
p.q("#show").click(); p.q(".g3").click();
ok(p.text().includes("3 / 15"), "can re-grade after undo");

// --- accuracy: Again then Good must not count as recalled
p = page(base);
p.q("#all").click();
p.q("#show").click(); p.q(".g1").click();            // miss card 1
let n = 0;
while (!p.text().includes("Session done") && n++ < 100) { if (p.q("#show")) p.q("#show").click(); p.q(".g3").click(); }
ok(/15 cards · 93% recalled/.test(p.text()), "14/15 first-pass => 93%: " + (p.text().match(/\d+% recalled/) || [])[0]);
ok(store(p).states[Object.keys(store(p).states)[0]].lapses === 1 || Object.values(store(p).states).some((s) => s.lapses === 1), "lapse recorded on the missed card");

// --- keyboard
p = page(base);
p.q("#all").click();
p.d.dispatchEvent(new p.w.KeyboardEvent("keydown", { key: " " }));
ok(!p.q("#ans").hidden, "space reveals");
p.d.dispatchEvent(new p.w.KeyboardEvent("keydown", { key: "3" }));
ok(p.text().includes("2 / 15"), "key 3 grades Good");
p.d.dispatchEvent(new p.w.KeyboardEvent("keydown", { key: "3" }));
ok(p.text().includes("2 / 15"), "grade key ignored before reveal");

// --- card text is data: markup in a card must stay inert
const evil = base.replace('"q":"LLM01:2025"', '"q":"<img src=x onerror=window.__pwn=1> `<b>x</b>`"');
ok(evil !== base, "payload injected into page data");
p = page(evil);
p.q("#all").click();
ok(!p.w.__pwn && !p.q(".q img") && !p.q(".q b"), "injected markup rendered inert");
ok(p.q(".q code") && p.q(".q code").textContent === "<b>x</b>", "backticks become literal <code>");

// --- storage blocked: app still works in memory
p = page(base, { noStorage: true });
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click();
ok(p.errors.length === 0 && p.text().includes("2 / 15"), "works with localStorage throwing: " + (p.errors[0] || "no errors"));

// --- settings: export / import / new-per-day
p = page(base);
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click();
p.q(".topbar .btn").click();                         // back home
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Open settings").click();
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Export").click();
const exported = p.q("textarea").value;
ok(JSON.parse(exported).states && Object.keys(JSON.parse(exported).states).length === 1, "export contains 1 reviewed card");
const p2 = page(base);
p2.q(".btn.ghost[id], button.btn.ghost:last-of-type");
[...p2.d.querySelectorAll("button")].find((b) => b.textContent === "Open settings").click();
p2.q("textarea").value = exported;
[...p2.d.querySelectorAll("button")].find((b) => b.textContent === "Import").click();
ok(p2.text().includes("Imported 1 card records"), "import accepts backup: " + (p2.text().match(/Imported[^.]*\./) || p2.text().match(/That[^.]*\./) || [])[0]);
p2.q("textarea").value = "{nope";
[...p2.d.querySelectorAll("button")].find((b) => b.textContent === "Import").click();
ok(p2.text().includes("not valid JSON"), "garbage import rejected");
const num = p2.q("input[type=number]"); num.value = "5"; num.dispatchEvent(new p2.w.Event("change"));
ok(store(p2).settings.newPerDay === 5, "new-cards/day setting saved");
[...p2.d.querySelectorAll("button")].find((b) => b.textContent === "← Back").click();
console.log("home text:", p2.text().match(/Study \d+ cards|All caught up/)[0]); ok(p2.text().includes("Study 4 cards"), "cap 5 minus 1 new card already studied today = 4");

// --- export carries what skill-check needs: per-deck summary and per-day, per-deck review counts
p = page(base);
p.q("#all").click();
for (let i = 0; i < 3; i++) { p.q("#show").click(); p.q(".g3").click(); }
const today = store(p).newToday.date;
ok(store(p).days[today].n === 3 && Object.values(store(p).days[today].by).reduce((a, b) => a + b, 0) === 3,
   "each review is counted under its deck: " + JSON.stringify(store(p).days[today].by));
p.q("#show").click(); p.q(".g3").click(); p.q("#undo").click();
ok(Object.values(store(p).days[today].by).reduce((a, b) => a + b, 0) === 3, "undo also rolls back the per-deck count");
p.q(".topbar .btn").click();
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Open settings").click();
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Export").click();
const ex = JSON.parse(p.q("textarea").value);
ok(ex.summary && Object.keys(ex.summary.decks).length === 8, "export has a summary for all 8 decks");
ok(ex.summary.decks.owasp_llm.total === 18 && ex.summary.decks.owasp_llm.new === 15 && ex.summary.exported === today, "summary counts and date are right: " + JSON.stringify(ex.summary.decks.owasp_llm));
ok(!("summary" in store(p)), "summary is not stored in the app's own state");
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Import").click();
ok(!("summary" in store(p)) && Object.keys(store(p).states).length === 3, "importing an export strips the summary and keeps progress");

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exitCode = failed ? 1 : 0;
