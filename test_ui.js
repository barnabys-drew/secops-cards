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
      if (opts.preset) Object.keys(opts.preset).forEach((k) => w.localStorage.setItem(k, opts.preset[k]));
      if (opts.clipboard !== undefined) Object.defineProperty(w.navigator, "clipboard", { value: opts.clipboard, configurable: true });
      if (opts.clock) {   // a controllable clock: the app reads "now" through Date
        const RealDate = w.Date;
        w.Date = class extends RealDate {
          constructor(...a) { if (a.length) super(...a); else super(opts.clock.t); }
          static now() { return opts.clock.t; }
        };
      }
    } });
  const d = dom.window.document;
  return { w: dom.window, d, q: (s) => d.querySelector(s), text: () => d.getElementById("app").textContent, errors };
}
const deckData = (pg) => pg.w.eval("DECKS");
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
ok(ex.summary && Object.keys(ex.summary.decks).length === deckData(p).length, "export has a summary for all " + deckData(p).length + " decks");
const owaspTotal = deckData(p).find((d) => d.id === "owasp_llm").cards.length;
ok(ex.summary.decks.owasp_llm.total === owaspTotal && ex.summary.decks.owasp_llm.new === owaspTotal - 3 && ex.summary.exported === today, "summary counts and date are right: " + JSON.stringify(ex.summary.decks.owasp_llm));
ok(!("summary" in store(p)), "summary is not stored in the app's own state");
[...p.d.querySelectorAll("button")].find((b) => b.textContent === "Import").click();
ok(!("summary" in store(p)) && Object.keys(store(p).states).length === 3, "importing an export strips the summary and keeps progress");

// ================= Quiz mode =================
const btn = (pg, label) => [...pg.d.querySelectorAll("button")].find((b) => b.textContent === label);
// Work out the right choice like a user would: find the card for the question on screen, compare option text.
const plain = (t) => t.replace(/`/g, "");
const currentCard = (pg) => pg.w.eval("DECKS").flatMap((d) => d.cards).find((c) => plain(c.q) === pg.q(".q").textContent);
const correctIdx = (pg) => { const c = currentCard(pg); return [...pg.d.querySelectorAll(".opt .t")].findIndex((t) => t.textContent === plain(c.s)); };

p = page(base);
btn(p, "Quiz").click();
const allCards = deckData(p).flatMap((d) => d.cards), withChoices = allCards.filter((c) => c.x).length;
ok(withChoices < allCards.length && p.text().includes(withChoices + " questions across " + deckData(p).length + " decks"), "quiz mode counts only cards that have choices (" + withChoices + " of " + allCards.length + ")");
ok(p.text().includes("Study 15 questions"), "quiz has its own daily new cap");
ok(store(p).settings.mode === "quiz", "mode choice is remembered");
p.q("#all").click();
ok(p.d.querySelectorAll(".opt").length === 4, "four answer choices shown");
ok(!p.q(".verdict"), "no verdict before answering");

// right answer: Good, marks it, shows the explanation, Next advances
let ci = correctIdx(p);
p.d.querySelectorAll(".opt")[ci].click();
ok(p.q(".verdict.ok") && p.q(".opt.right") && p.q("#next"), "correct pick shows verdict, green choice, and Next");
ok(p.q(".opt.right .k").textContent === "✓", "correct choice is marked with a check, not just a colour");
ok(Object.keys(store(p).quiz).length === 1 && Object.keys(store(p).states).length === 0, "progress goes to quiz, not flashcard state");
ok(store(p).newToday.nq === 1 && store(p).newToday.n === 0, "quiz new-card counter is separate");
p.q("#next").click();
ok(p.text().includes("2 / 15"), "Next moves to question 2");

// wrong answer: Again, requeued, counter does not advance
const wrongIdx = [0, 1, 2, 3].find((i) => i !== correctIdx(p));
p.d.querySelectorAll(".opt")[wrongIdx].click();
ok(p.q(".verdict.no") && p.q(".opt.wrong") && p.q(".opt.right"), "wrong pick shows both the wrong and the right choice");
ok(p.q(".opt.wrong .k").textContent === "✗", "wrong choice marked with a cross");
ok([...p.d.querySelectorAll(".opt")].every((b) => b.disabled), "choices lock after answering");
const missedId = currentCard(p).id;
ok(store(p).quiz[missedId].lapses === 1, "wrong answer records a lapse");
p.q("#undo").click();
ok(!(missedId in store(p).quiz) && p.text().includes("2 / 15"), "undo removes the answer and shows the question again");

// keyboard: 1-4 answers, Space goes next, and a focused Next button must not skip a question
p = page(base); btn(p, "Quiz").click(); p.q("#all").click();
const key = (pg, k) => pg.d.dispatchEvent(new pg.w.KeyboardEvent("keydown", { key: k, bubbles: true }));
key(p, String(correctIdx(p) + 1));
ok(p.q(".verdict.ok"), "key 1-4 answers");
key(p, "2");
ok(p.d.querySelectorAll(".opt.wrong").length === 0, "second answer key ignored after answering");
key(p, " ");
ok(p.text().includes("2 / 15"), "Space advances once");
key(p, String(correctIdx(p) + 1));
p.q("#next").focus();
p.q("#next").dispatchEvent(new p.w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
ok(p.text().includes("2 / 15") && p.q(".verdict"), "Enter on a focused Next does not also advance (no skipped question)");

// whole quiz session -> summary says correct, accuracy counts first-try only
p = page(base); btn(p, "Quiz").click(); p.q("#all").click();
n = 0;
while (!p.text().includes("Session done") && n++ < 200) {
  const idx = (n === 1) ? [0, 1, 2, 3].find((i) => i !== correctIdx(p)) : correctIdx(p);   // miss the very first one
  p.d.querySelectorAll(".opt")[idx].click();
  p.q("#next").click();
}
ok(/15 questions · 93% correct/.test(p.text()), "14 of 15 right first time => 93% correct: " + (p.text().match(/\d+% \w+/) || [])[0]);

// the two modes keep separate schedules and both feed the daily counts
const st = store(p);
ok(Object.keys(st.quiz).length === 15 && Object.keys(st.states).length === 0, "15 quiz records, 0 flashcard records");
btn(p, "Back to decks").click();
btn(p, "Flashcards").click();
ok(p.text().includes("Study 15 cards"), "flashcard mode still has its full allowance after a quiz session");
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click();
const today2 = store(p).newToday.date;
ok(store(p).days[today2].n === 17, "reviews from both modes add up (15 questions + 1 re-ask of the missed one + 1 flashcard): " + store(p).days[today2].n);
btn(p, "← Back").click();
btn(p, "Open settings").click(); btn(p, "Export").click();
const ex2 = JSON.parse(p.q("textarea").value);
ok(Object.keys(ex2.quiz).length === 15 && ex2.summary.decks.owasp_llm.total === deckData(p).find((d) => d.id === "owasp_llm").cards.length, "export carries quiz progress; summary stays about flashcards");

// answer choices are data, not markup
const evilQ = base.replace('"s":"Prompt Injection"', '"s":"<img src=x onerror=window.__pwn2=1> `<i>x</i>`"');
ok(evilQ !== base, "payload injected into a quiz choice");
p = page(evilQ); btn(p, "Quiz").click();
for (const deckBtn of [...p.d.querySelectorAll(".deck")].slice(0, 1)) deckBtn.click();
ok(!p.w.__pwn2 && !p.q(".opt img") && !p.q(".opt i"), "markup in a choice is inert");

// old saved progress (no quiz field, old newToday shape) still loads
const p3 = new JSDOM(base, { runScripts: "dangerously", url: "http://localhost/", pretendToBeVisual: true, beforeParse(w) {
  w.scrollTo = () => {};
  w.localStorage.setItem("secops-cards:v1", JSON.stringify({ states: { zz: { ease: 2.5, interval: 5, reps: 2, due: "2020-01-01", lapses: 0 } }, days: {}, settings: { newPerDay: 15 }, newToday: { date: "2020-01-01", n: 3 } }));
} });
ok(p3.window.document.getElementById("app").textContent.includes("SecOps Cards") && !p3.window.document.getElementById("app").textContent.includes("undefined"), "progress saved before Quiz existed loads fine");

(async () => {
// ================= Review fixes =================
const settleAsync = () => new Promise((r) => setTimeout(r, 10));
const importBackup = (pg, text) => { btn(pg, "Open settings").click(); pg.q("textarea").value = text; btn(pg, "Import").click(); };
const msgOf = (pg) => pg.q(".msg").textContent;

// -- malformed backups are rejected and change nothing
p = page(base);
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click(); btn(p, "← Back").click();
const progressBefore = p.w.localStorage.getItem("secops-cards:v1");
for (const [label, bad] of [["states:null", '{"states":null}'], ["states:[]", '{"states":[]}'], ["states:7", '{"states":7}'], ["array", "[]"], ["null", "null"]]) {
  importBackup(p, bad);
  ok(msgOf(p).includes("does not look like a backup") && p.w.localStorage.getItem("secops-cards:v1") === progressBefore && p.errors.length === 0,
     "rejects " + label + " and leaves saved progress untouched");
  btn(p, "← Back").click();
}

// -- sparse or hostile-but-object backups are repaired, not trusted
p = page(base);
importBackup(p, '{"states":{},"settings":{}}');
btn(p, "← Back").click();
ok(!p.text().includes("NaN") && p.text().includes("Study 15 cards"), "a backup without settings falls back to defaults (no NaN)");
p = page(base);
const mixed = { states: { good: { ease: 2.5, interval: 3, reps: 2, due: "2026-10-08", lapses: 0 },
                          nullInterval: { ease: 2.5, interval: null, reps: 1, due: "2026-10-08" },
                          strInterval: { ease: 2.5, interval: "3", reps: 1, due: "2026-10-08" },
                          badDue: { ease: 2.5, interval: 1, reps: 1, due: "tomorrow" }, notObj: 5 },
                settings: { newPerDay: 7, mode: "weird" }, days: { "2026-10-07": { n: 3, ok: 2, by: { terraform: 3, junk: "x" } }, nope: { n: 1 } } };
importBackup(p, JSON.stringify(mixed));
const cleaned = store(p);
ok(Object.keys(cleaned.states).join() === "good" && /skipped 4 invalid/.test(msgOf(p)), "invalid card records are skipped and counted: " + msgOf(p));
ok(cleaned.settings.mode === "flash" && cleaned.settings.newPerDay === 7, "unknown mode falls back to flashcards; valid setting kept");
ok(JSON.stringify(cleaned.days) === '{"2026-10-07":{"n":3,"ok":2,"by":{"terraform":3}}}', "malformed day entries are dropped, numeric parts kept: " + JSON.stringify(cleaned.days));
ok(p.q("input[type=number]").value === "7", "the settings field shows the imported value straight away");

// -- import replaces everything on the device (no leftover quiz progress mixed in)
p = page(base); btn(p, "Quiz").click(); p.q("#all").click();
p.d.querySelectorAll(".opt")[correctIdx(p)].click();
btn(p, "← Back").click();
ok(Object.keys(store(p).quiz).length === 1, "setup: one quiz record exists");
importBackup(p, JSON.stringify({ states: { a: { ease: 2.5, interval: 1, reps: 1, due: "2026-10-08", lapses: 0 } } }));
ok(Object.keys(store(p).quiz).length === 0 && Object.keys(store(p).states).length === 1, "importing a backup without quiz data clears the old quiz progress");

// -- clipboard: the message reflects what actually happened
async function exportMsg(clipboard) {
  const pg = page(base, { clipboard });
  btn(pg, "Open settings").click(); btn(pg, "Export").click();
  await settleAsync();
  return msgOf(pg);
}
ok((await exportMsg({ writeText: () => Promise.resolve() })).includes("copied to clipboard"), "export says copied when the browser accepted the copy");
ok((await exportMsg({ writeText: () => Promise.reject(new Error("denied")) })).includes("Could not copy"), "export does not claim success when the copy is rejected");
ok((await exportMsg({ writeText: () => { throw new Error("sync"); } })).includes("Could not copy"), "export copes with writeText throwing");
ok((await exportMsg(undefined)).includes("Could not copy"), "export copes with no clipboard API");

// -- unreadable saved data: copy kept, user told, nothing silently destroyed
p = page(base, { preset: { "secops-cards:v1": "{broken json" } });
ok(p.text().includes("could not be read") && p.w.localStorage.getItem("secops-cards:v1:corrupt") === "{broken json", "corrupt saved data is preserved and the user is told");
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click();
ok(p.w.localStorage.getItem("secops-cards:v1:corrupt") === "{broken json", "the preserved copy survives later saves");
p = page(base, { preset: { "secops-cards:v1": "[1,2,3]" } });
ok(p.text().includes("SecOps Cards") && !p.text().includes("NaN") && p.errors.length === 0, "a stored value of the wrong shape loads as empty progress without errors");

// -- undo after the 3am rollover restores the day the review belonged to
const clock = { t: new Date(2026, 9, 5, 2, 59).getTime() };      // 02:59 on Oct 5 still counts as Oct 4
p = page(base, { clock });
p.q("#all").click(); p.q("#show").click(); p.q(".g3").click();
ok(store(p).days["2026-10-04"] && store(p).days["2026-10-04"].n === 1, "setup: review recorded under Oct 4");
clock.t = new Date(2026, 9, 5, 3, 1).getTime();                  // rollover happens, now Oct 5
p.q("#undo").click();
ok(store(p).days["2026-10-04"].n === 0 && !("2026-10-05" in store(p).days), "undo after rollover fixes Oct 4 and does not invent an Oct 5 entry: " + JSON.stringify(store(p).days));

console.log(failed ? `\n${failed} FAILED` : "\nall passed");
process.exitCode = failed ? 1 : 0;
})();
