(function () {
  "use strict";
  const KEY = "secops-cards:v1";
  const app = document.getElementById("app");
  const CARD_DECK = {};
  DECKS.forEach(function (d) { d.cards.forEach(function (c) { CARD_DECK[c.id] = d.id; }); });

  // ---- storage: localStorage when available, in-memory otherwise (private windows, blocked storage)
  // states = Flashcards progress, quiz = Quiz progress. They are kept apart on purpose: picking the
  // right answer from four choices is easier than recalling it, so it must not inflate recall intervals.
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }
  function isNum(x) { return typeof x === "number" && isFinite(x); } // strict: no null, strings, or NaN
  function num(x, fallback) { return isNum(x) ? x : fallback; }

  function emptyDb() {
    return { states: {}, quiz: {}, days: {}, settings: { newPerDay: 15, mode: "flash" }, newToday: { date: "", n: 0, nq: 0 } };
  }
  function cleanStates(src) {
    const out = {}; let skipped = 0;
    Object.keys(isObj(src) ? src : {}).forEach(function (id) {
      const s = src[id];
      const dueOk = isObj(s) && (s.due === null || (typeof s.due === "string" && DATE_RE.test(s.due)));
      if (dueOk && isNum(s.interval) && isNum(s.ease) && isNum(s.reps)) {
        out[id] = { ease: s.ease, interval: s.interval, reps: s.reps, due: s.due, lapses: num(s.lapses, 0) };
      } else skipped += 1;
    });
    return { out: out, skipped: skipped };
  }
  function cleanDays(src) {
    const out = {};
    Object.keys(isObj(src) ? src : {}).forEach(function (d) {
      const v = src[d];
      if (!DATE_RE.test(d) || !isObj(v) || !isNum(v.n)) return;
      const by = {};
      if (isObj(v.by)) Object.keys(v.by).forEach(function (k) { if (isNum(v.by[k])) by[k] = v.by[k]; });
      out[d] = { n: Math.max(0, Math.floor(v.n)), ok: Math.max(0, Math.floor(num(v.ok, 0))), by: by };
    });
    return out;
  }
  // Turn anything (stored value or imported file) into a well-formed db. Never throws.
  function normalize(raw) {
    const db = emptyDb(); let skipped = 0;
    if (!isObj(raw)) return { db: db, skipped: 0 };
    const a = cleanStates(raw.states), b = cleanStates(raw.quiz);
    db.states = a.out; db.quiz = b.out; skipped = a.skipped + b.skipped;
    db.days = cleanDays(raw.days);
    if (isObj(raw.settings)) {
      db.settings.newPerDay = Math.max(0, Math.min(100, Math.round(num(raw.settings.newPerDay, 15))));
      db.settings.mode = raw.settings.mode === "quiz" ? "quiz" : "flash";
    }
    if (isObj(raw.newToday)) {
      db.newToday = { date: typeof raw.newToday.date === "string" && DATE_RE.test(raw.newToday.date) ? raw.newToday.date : "",
                      n: Math.max(0, num(raw.newToday.n, 0)), nq: Math.max(0, num(raw.newToday.nq, 0)) };
    }
    return { db: db, skipped: skipped };
  }

  let memory = null;
  let loadNotice = "";
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch (e) { return normalize(memory).db; } // storage blocked: memory only
    if (raw === null) return normalize(memory).db;
    try { return normalize(JSON.parse(raw)).db; } catch (e) {
      // Unreadable saved data. Keep a copy before anything can overwrite it, and say so.
      try { if (localStorage.getItem(KEY + ":corrupt") === null) localStorage.setItem(KEY + ":corrupt", raw); } catch (e2) { /* nothing more to do */ }
      loadNotice = "Saved progress on this device could not be read, so this session starts fresh. A copy of the unreadable data was kept in this browser.";
      return emptyDb();
    }
  }
  function save() {
    memory = db;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* keep going in memory */ }
  }
  let db = load();

  // ---- helpers
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === "class") n.className = attrs[k];
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), attrs[k]);
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  // Card text is data, not markup: build DOM nodes. Only `code` and **bold** spans are interpreted.
  function rich(target, text) {
    text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).forEach(function (part) {
      if (part.length > 2 && part[0] === "`" && part[part.length - 1] === "`") target.appendChild(el("code", { text: part.slice(1, -1) }));
      else if (part.length > 4 && part.slice(0, 2) === "**" && part.slice(-2) === "**") target.appendChild(el("strong", { text: part.slice(2, -2) }));
      else if (part) target.appendChild(document.createTextNode(part));
    });
    return target;
  }
  // The deep dive: what it is and why it is the answer. Collapsed unless `open`; null if the card has none.
  function diveEl(c, open) {
    if (!c.d) return null;
    const body = el("div", { class: "dive-body" });
    c.d.forEach(function (sec) {
      body.appendChild(el("h3", { text: sec.h }));
      let list = null;
      sec.b.forEach(function (blk) {
        if (blk.indexOf("- ") === 0) {
          if (!list) { list = el("ul"); body.appendChild(list); }
          list.appendChild(rich(el("li"), blk.slice(2)));
        } else { list = null; body.appendChild(rich(el("p"), blk)); }
      });
    });
    const d = el("details", { class: "dive" }, [el("summary", { text: "Deep dive: what it is and why" }), body]);
    if (open) d.open = true;
    return d;
  }
  // Resolves true only if the browser really accepted the copy. writeText returns a promise that can reject
  // (permission denied, insecure context, unfocused document), so a truthy return value proves nothing.
  function copyText(text) {
    return new Promise(function (resolve) {
      try {
        if (!(navigator.clipboard && navigator.clipboard.writeText)) { resolve(false); return; }
        navigator.clipboard.writeText(text).then(function () { resolve(true); }, function () { resolve(false); });
      } catch (e) { resolve(false); }
    });
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function today() { return todayStr(); }
  function mode() { return db.settings.mode === "quiz" ? "quiz" : "flash"; }
  function statesOf(m) { return m === "quiz" ? db.quiz : db.states; }
  // Quiz mode only offers cards that have answer choices.
  function eligible(deck, m) { return m === "quiz" ? deck.cards.filter(function (c) { return c.x; }) : deck.cards; }
  function newLeft(m) {
    const t = today();
    if (db.newToday.date !== t) db.newToday = { date: t, n: 0, nq: 0 };
    return Math.max(0, db.settings.newPerDay - (m === "quiz" ? db.newToday.nq : db.newToday.n));
  }
  function counts(deck, m) {
    const t = today(); const states = statesOf(m); const cards = eligible(deck, m);
    let due = 0, fresh = 0, mature = 0;
    cards.forEach(function (c) {
      const s = states[c.id];
      if (isNew(s)) fresh += 1; else { if (isDue(s, t)) due += 1; if (isMature(s)) mature += 1; }
    });
    return { due: due, fresh: fresh, mature: mature, total: cards.length };
  }
  function render(node) { app.replaceChildren(node); window.scrollTo(0, 0); }

  // ---- home
  function setMode(m) { db.settings.mode = m; save(); home(); }

  function modeSwitch() {
    const m = mode();
    function btn(id, label) {
      return el("button", { class: m === id ? "on" : "", "aria-pressed": String(m === id), text: label, onclick: function () { setMode(id); } });
    }
    return el("div", { class: "seg", role: "group", "aria-label": "Study mode" }, [btn("flash", "Flashcards"), btn("quiz", "Quiz")]);
  }

  function home() {
    session = null;
    const m = mode();
    const t = today();
    let due = 0, total = 0, mature = 0, freshAvail = 0;
    DECKS.forEach(function (d) { const c = counts(d, m); due += c.due; total += c.total; mature += c.mature; freshAvail += c.fresh; });
    const reviewed = (db.days[t] && db.days[t].n) || 0;
    const todo = due + Math.min(newLeft(m), freshAvail);
    const noun = m === "quiz" ? "questions" : "cards";

    const root = el("div", {}, [
      el("h1", { text: "SecOps Cards" }),
      el("p", { class: "sub", text: total + " " + noun + " across " + DECKS.length + " decks" }),
      loadNotice ? el("p", { class: "msg", role: "alert", text: loadNotice }) : null,
      modeSwitch(),
      el("p", { class: "note", text: m === "quiz" ? "Pick the right answer from four choices." : "Recall the answer, then grade yourself." }),
      el("div", { class: "stats" }, [
        el("div", { class: "stat" }, [el("b", { text: String(todo) }), el("span", { text: "to study today" })]),
        el("div", { class: "stat" }, [el("b", { text: String(streak(db.days, t)) }), el("span", { text: "day streak" })]),
        el("div", { class: "stat" }, [el("b", { text: Math.round(100 * mature / Math.max(1, total)) + "%" }), el("span", { text: "mature (21d+)" })]),
      ]),
      el("button", { class: "btn primary", id: "all", text: todo ? "Study " + todo + " " + noun : "All caught up", onclick: function () { startSession(DECKS); } }),
      el("p", { class: "hint", text: reviewed + " reviewed today (both modes)" }),
      el("h2", { text: "Decks" }),
    ]);
    if (!todo) root.querySelector("#all").disabled = true;
    DECKS.forEach(function (d) {
      const c = counts(d, m);
      root.appendChild(el("button", { class: "deck", onclick: function () { startSession([d]); } }, [
        el("div", { class: "row" }, [
          el("span", { class: "t", text: d.title }),
          el("span", { class: "pill" }, [el("b", { text: c.due + " due" }), " · " + c.fresh + " new"]),
        ]),
        el("div", { class: "d", text: d.desc || (c.total + " " + noun) }),
        el("div", { class: "bar" }, [el("i", { style: "width:" + Math.round(100 * c.mature / Math.max(1, c.total)) + "%" })]),
      ]));
    });
    root.appendChild(el("h2", { text: "Settings & backup" }));
    root.appendChild(el("button", { class: "btn ghost", onclick: settings, text: "Open settings" }));
    render(root);
  }

  // ---- study session
  let session = null;
  function startSession(decks) {
    const m = mode();
    const deckOf = {};
    decks.forEach(function (d) { d.cards.forEach(function (c) { deckOf[c.id] = d.title; }); });
    // Spread the daily new-card allowance across the decks being studied, in deck order.
    let budget = newLeft(m); const queue = [];
    decks.forEach(function (d) {
      buildQueue(eligible(d, m), statesOf(m), today(), budget).forEach(function (c) {
        if (isNew(statesOf(m)[c.id])) budget -= 1;
        queue.push(c);
      });
    });
    if (!queue.length) { home(); return; }
    session = { mode: m, queue: queue, deckOf: deckOf, total: queue.length, shown: false, graded: 0, ok: 0,
                missed: new Set(), undo: null, multi: decks.length > 1, choices: [], picked: -1, num: 1, result: false };
    showCard();
  }

  function topbar() {
    return el("div", { class: "topbar" }, [
      el("button", { class: "btn ghost", text: "← Back", onclick: home }),
      el("span", { class: "count", text: Math.min(session.num, session.total) + " / " + session.total }),
      el("button", { class: "btn ghost", id: "undo", text: "Undo", onclick: undo, hidden: "" }),
    ]);
  }

  function showCard() {
    if (!session.queue.length) { finish(); return; }
    session.shown = false;
    session.result = false;
    session.num = session.graded + 1;
    if (session.mode === "quiz") { startQuiz(session.queue[0]); return; }
    const c = session.queue[0];
    const root = el("div", {}, [
      topbar(),
      el("div", { class: "card" }, [
        session.multi ? el("span", { class: "chip", text: session.deckOf[c.id] }) : null,
        rich(el("div", { class: "q" }), c.q),
        el("div", { class: "a", id: "ans", hidden: "" }),
      ]),
      el("div", { id: "ctl" }, [
        el("button", { class: "btn primary", id: "show", text: "Show answer", onclick: reveal, style: "margin-top:14px" }),
        el("button", { class: "btn ghost", id: "dunno", text: "I don't know: teach me", onclick: dontKnow, style: "margin-top:10px;width:100%" }),
        el("p", { class: "hint", text: "Space shows the answer · 1–4 grades it · 0 means you don't know" }),
      ]),
    ]);
    render(root);
    if (session.undo) root.querySelector("#undo").hidden = false;
  }

  // ---- flashcard mode: reveal, then self-grade
  function reveal() {
    if (!session || session.mode !== "flash" || session.shown) return;
    session.shown = true;
    const c = session.queue[0];
    const ans = document.getElementById("ans");
    rich(ans, c.a); ans.hidden = false;
    const dive = diveEl(c, false);
    if (dive) ans.parentNode.appendChild(dive);
    const prev = previewLabels(db.states[c.id], today());
    const names = { 1: "Again", 2: "Hard", 3: "Good", 4: "Easy" };
    const grades = el("div", { class: "grades" }, [1, 2, 3, 4].map(function (g) {
      return el("button", { class: "g" + g, onclick: function () { grade(g); } }, [names[g], el("small", { text: prev[g] })]);
    }));
    document.getElementById("ctl").replaceChildren(grades, el("p", { class: "hint", text: "How well did you know it? Again opens the deep dive." }));
  }

  function grade(g) {
    if (!session || session.mode !== "flash" || !session.shown) return;
    const c = session.queue[0];
    applyGrade(g);
    if (g === GRADE.AGAIN && c.d) renderFlashResult(c); else showCard();
  }

  // Did not know it: count it as Again and teach it, rather than just moving on.
  function dontKnow() {
    if (!session || session.mode !== "flash" || session.shown) return;
    session.shown = true;
    const c = session.queue[0];
    applyGrade(GRADE.AGAIN);
    renderFlashResult(c);
  }

  function renderFlashResult(c) {
    session.result = true;
    const card = el("div", { class: "card" }, [
      session.multi ? el("span", { class: "chip", text: session.deckOf[c.id] }) : null,
      rich(el("div", { class: "q" }), c.q),
      rich(el("div", { class: "a" }), c.a),
      diveEl(c, true),
    ]);
    const root = el("div", {}, [
      topbar(), card,
      el("button", { class: "btn primary", id: "next", text: session.queue.length ? "Got it, next" : "Finish", onclick: showCard, style: "margin-top:14px" }),
      el("p", { class: "hint", text: "This card will come back later in the session · z undoes" }),
    ]);
    render(root);
    if (session.undo) root.querySelector("#undo").hidden = false;
  }

  // Record one review: schedule the card, update daily counts and the session. Does not draw anything.
  function applyGrade(g) {
    const m = session.mode, states = statesOf(m);
    const c = session.queue.shift();
    const t = today();
    const before = states[c.id] ? Object.assign({}, states[c.id]) : null;
    const wasNew = isNew(before);
    const day = db.days[t] || { n: 0, ok: 0 };
    day.by = day.by || {};
    const snapshot = { card: c, mode: m, before: before, wasNew: wasNew, dayKey: t, day: JSON.parse(JSON.stringify(day)), g: g };
    states[c.id] = schedule(before, g, t);
    day.n += 1; if (g >= GRADE.HARD) day.ok += 1;
    day.by[CARD_DECK[c.id]] = (day.by[CARD_DECK[c.id]] || 0) + 1;
    db.days[t] = day;
    if (wasNew) { newLeft(m); if (m === "quiz") db.newToday.nq += 1; else db.newToday.n += 1; }
    snapshot.requeued = g === GRADE.AGAIN;
    snapshot.addedMissed = false; snapshot.countedOk = false;
    if (g === GRADE.AGAIN) {
      // Show it again later this session, a few cards back so it isn't just echoed.
      session.queue.splice(Math.min(3, session.queue.length), 0, c);
      if (!session.missed.has(c.id)) { session.missed.add(c.id); snapshot.addedMissed = true; }
    } else {
      session.graded += 1;
      // "Recalled/correct" means passed without ever being marked Again this session.
      if (g >= GRADE.HARD && !session.missed.has(c.id)) { session.ok += 1; snapshot.countedOk = true; }
    }
    session.undo = snapshot;
    save();
  }

  // ---- quiz mode: pick an answer; right = Good, wrong = Again
  function startQuiz(c) {
    session.choices = shuffle([{ t: c.s, ok: true }].concat(c.x.map(function (t) { return { t: t, ok: false }; })));
    session.picked = -1;   // -1 unanswered, -2 "I don't know", otherwise the index picked
    renderQuiz(c);
  }

  function renderQuiz(c) {
    const answered = session.picked !== -1;
    const unsure = session.picked === -2;
    const opts = session.choices.map(function (ch, i) {
      let cls = "opt", mark = String(i + 1);
      if (answered) {
        if (ch.ok) { cls += " right"; mark = "✓"; }
        else if (i === session.picked) { cls += " wrong"; mark = "✗"; }
        else cls += " dim";
      }
      const b = el("button", { class: cls, onclick: function () { choose(i); } }, [
        el("span", { class: "k", text: mark }), rich(el("span", { class: "t" }), ch.t),
      ]);
      if (answered) b.disabled = true;
      return b;
    });
    const card = el("div", { class: "card" }, [
      session.multi ? el("span", { class: "chip", text: session.deckOf[c.id] }) : null,
      rich(el("div", { class: "q" }), c.q),
      el("div", { class: "opts" }, opts),
    ]);
    const parts = [topbar(), card];
    if (!answered) {
      parts.push(el("button", { class: "btn ghost", id: "dunno", text: "I don't know: teach me", onclick: chooseDontKnow, style: "margin-top:10px;width:100%" }));
    }
    if (answered) {
      const right = !unsure && session.choices[session.picked].ok;
      const expl = el("div", { class: "a" }, [
        el("div", { class: "verdict " + (right ? "ok" : "no"), text: unsure ? "No problem. Here is the answer." : right ? "Correct" : "Not quite" }),
        rich(el("div"), c.a),
        diveEl(c, !right),   // open when you missed it or did not know; one tap away when you got it
      ]);
      card.appendChild(expl);
      const last = !session.queue.length;
      parts.push(el("button", { class: "btn primary", id: "next", text: last ? "Finish" : "Next", onclick: showCard, style: "margin-top:14px" }));
      parts.push(el("p", { class: "hint", text: "Space or Enter for next · d toggles the deep dive · z undoes" }));
    } else {
      parts.push(el("p", { class: "hint", text: "Press 1–" + session.choices.length + " to answer · 0 means you don't know" }));
    }
    const root = el("div", {}, parts);
    render(root);
    if (session.undo) root.querySelector("#undo").hidden = false;
  }

  function choose(i) {
    if (!session || session.mode !== "quiz" || session.shown || !session.choices[i]) return;
    session.shown = true;
    session.picked = i;
    const c = session.queue[0];
    applyGrade(session.choices[i].ok ? GRADE.GOOD : GRADE.AGAIN);
    renderQuiz(c);
  }

  function chooseDontKnow() {
    if (!session || session.mode !== "quiz" || session.shown) return;
    session.shown = true;
    session.picked = -2;
    const c = session.queue[0];
    applyGrade(GRADE.AGAIN);
    renderQuiz(c);
  }

  function undo() {
    const u = session && session.undo;
    if (!u) return;
    const states = statesOf(u.mode);
    if (u.requeued) { const i = session.queue.lastIndexOf(u.card); if (i >= 0) session.queue.splice(i, 1); }
    else { session.graded -= 1; if (u.countedOk) session.ok -= 1; }
    if (u.addedMissed) session.missed.delete(u.card.id);
    if (u.before) states[u.card.id] = u.before; else delete states[u.card.id];
    db.days[u.dayKey] = u.day; // the day the review happened, even if the 3am rollover has passed since
    if (u.wasNew && db.newToday.date === u.dayKey) { // the allowance is per day; a new day already reset it
      if (u.mode === "quiz") db.newToday.nq = Math.max(0, db.newToday.nq - 1);
      else db.newToday.n = Math.max(0, db.newToday.n - 1);
    }
    session.queue.unshift(u.card);
    session.undo = null;
    save();
    showCard();
  }

  function finish() {
    const pct = session.graded ? Math.round(100 * session.ok / session.graded) : 0;
    const word = session.mode === "quiz" ? "correct" : "recalled";
    const tomorrow = addDays(today(), 1);
    let nextDue = 0;
    const states = statesOf(session.mode);
    Object.keys(states).forEach(function (id) { if (states[id].due === tomorrow) nextDue += 1; });
    render(el("div", { class: "done" }, [
      el("h1", { text: "Session done" }),
      el("p", { text: session.graded + " " + (session.mode === "quiz" ? "questions" : "cards") + " · " + pct + "% " + word }),
      el("p", { class: "sub", text: nextDue + " come due tomorrow." }),
      el("button", { class: "btn primary", text: "Back to decks", onclick: home }),
    ]));
    session = null;
  }

  // ---- settings, export/import
  function settings() {
    session = null;
    const msg = el("p", { class: "msg", role: "status" });
    const box = el("textarea", { "aria-label": "Progress backup JSON", spellcheck: "false" });
    const perDay = el("input", { type: "number", min: "0", max: "100", value: String(db.settings.newPerDay), style: "width:5rem;padding:8px;border-radius:8px;border:1px solid var(--rule);background:var(--surface);color:var(--ink);font:inherit" });
    perDay.addEventListener("change", function () {
      const v = Math.max(0, Math.min(100, parseInt(perDay.value, 10) || 0));
      db.settings.newPerDay = v; perDay.value = String(v); save(); msg.textContent = "Saved: " + v + " new cards per day, in each mode.";
    });
    // Counts the companion CLI reads. Derived at export time and never stored. Flashcard progress only:
    // "mature" there means recalled, not recognised.
    function summary() {
      const out = { exported: today(), decks: {} };
      DECKS.forEach(function (d) {
        const c = counts(d, "flash");
        out.decks[d.id] = { title: d.title, total: c.total, due: c.due, new: c.fresh, mature: c.mature };
      });
      return out;
    }
    function doExport() {
      box.value = JSON.stringify(Object.assign({}, db, { summary: summary() }));
      box.select();
      msg.textContent = "Backup shown below. Copying...";
      copyText(box.value).then(function (copied) {
        msg.textContent = copied ? "Backup copied to clipboard (also shown below)." : "Could not copy automatically. Select the text below and copy it.";
      });
    }
    function doImport() {
      let data;
      try { data = JSON.parse(box.value); } catch (e) { msg.textContent = "That is not valid JSON."; return; }
      if (!isObj(data) || !isObj(data.states)) { msg.textContent = "That does not look like a backup."; return; }
      const result = normalize(data); // replaces everything on this device, with defaults for anything missing
      db = result.db; save();
      perDay.value = String(db.settings.newPerDay);
      msg.textContent = "Imported " + Object.keys(db.states).length + " card records" +
        (Object.keys(db.quiz).length ? " and " + Object.keys(db.quiz).length + " quiz records" : "") +
        (result.skipped ? " (skipped " + result.skipped + " invalid)" : "") + ".";
    }
    function doReset() {
      if (!confirm("Erase all progress on this device? Export a backup first if unsure.")) return;
      const keep = db.settings;
      db = emptyDb(); db.settings = keep; save(); msg.textContent = "Progress erased.";
    }
    render(el("div", {}, [
      el("div", { class: "topbar" }, [el("button", { class: "btn ghost", text: "← Back", onclick: home }), el("span")]),
      el("h1", { text: "Settings" }),
      el("h2", { text: "New cards per day" }),
      el("label", {}, [perDay]),
      el("h2", { text: "Backup" }),
      el("p", { class: "note", text: "Progress lives only in this browser. Export it to move to another device or to keep a copy; paste it into Import there." }),
      el("div", { class: "row2" }, [
        el("button", { class: "btn", text: "Export", onclick: doExport }),
        el("button", { class: "btn", text: "Import", onclick: doImport }),
        el("button", { class: "btn", text: "Reset progress", onclick: doReset }),
      ]),
      box, msg,
    ]));
  }

  // ---- keyboard
  document.addEventListener("keydown", function (e) {
    if (!session || e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT" || e.metaKey || e.ctrlKey) return;
    const k = e.key;
    if (k === "z") { undo(); return; }
    if (k === "Escape") { home(); return; }
    if (k === "d") { const dv = document.querySelector(".dive"); if (dv) dv.open = !dv.open; return; }
    if (session.result && (k === " " || k === "Enter" || k === "ArrowRight") && e.target.tagName !== "BUTTON") {
      e.preventDefault(); showCard(); return;   // the flashcard deep-dive screen
    }
    if (session.mode === "quiz") {
      if (!session.shown) {
        if (/^[1-4]$/.test(k)) choose(Number(k) - 1);
        else if (k === "0") chooseDontKnow();
      } else if ((k === " " || k === "Enter" || k === "ArrowRight") && e.target.tagName !== "BUTTON") {
        e.preventDefault(); showCard(); // a focused button handles its own Enter/Space click
      }
      return;
    }
    if (k === " " || k === "Enter") { if (!session.shown) { e.preventDefault(); reveal(); } }
    else if (k === "0") dontKnow();
    else if (session.shown && /^[1-4]$/.test(k)) grade(Number(k));
  });

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    addEventListener("load", function () { navigator.serviceWorker.register("./sw.js").catch(function () {}); });
  }
  home();
})();
