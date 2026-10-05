const test = require("node:test");
const assert = require("node:assert");
const S = require("./srs.js");
const { GRADE } = S;
const T = "2026-10-05";

test("first Good review schedules 1 day, then 3, then grows by ease", () => {
  let s = S.schedule(null, GRADE.GOOD, T);
  assert.equal(s.interval, 1); assert.equal(s.due, "2026-10-06");
  s = S.schedule(s, GRADE.GOOD, "2026-10-06");
  assert.equal(s.interval, 3);
  s = S.schedule(s, GRADE.GOOD, "2026-10-09");
  assert.equal(s.interval, 8); // round(3 * 2.5)
});

test("Again resets, counts a lapse, lowers ease, stays due today", () => {
  let s = S.schedule(S.schedule(null, GRADE.GOOD, T), GRADE.GOOD, T);
  s = S.schedule(s, GRADE.AGAIN, T);
  assert.equal(s.reps, 0); assert.equal(s.lapses, 1); assert.equal(s.due, T);
  assert.ok(Math.abs(s.ease - 2.3) < 1e-9);
});

test("ease never leaves [1.3, 3.0]", () => {
  let s = null;
  for (let i = 0; i < 20; i++) s = S.schedule(s, GRADE.AGAIN, T);
  assert.equal(s.ease, 1.3);
  for (let i = 0; i < 30; i++) s = S.schedule(s, GRADE.EASY, T);
  assert.equal(s.ease, 3.0);
});

test("Easy always beats Good beats Hard once past the learning steps", () => {
  let base = null;
  for (let i = 0; i < 4; i++) base = S.schedule(base, GRADE.GOOD, T);
  const h = S.schedule(base, GRADE.HARD, T).interval;
  const g = S.schedule(base, GRADE.GOOD, T).interval;
  const e = S.schedule(base, GRADE.EASY, T).interval;
  assert.ok(h < g && g < e, [h, g, e].join(","));
  assert.ok(h > base.interval);
});

test("3am rollover and date math", () => {
  assert.equal(S.todayStr(new Date(2026, 9, 6, 1, 0)), "2026-10-05");
  assert.equal(S.todayStr(new Date(2026, 9, 6, 3, 0)), "2026-10-06");
  assert.equal(S.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(S.addDays("2026-03-01", -1), "2026-02-28");
});

test("queue: due oldest-first, then capped new cards", () => {
  const cards = ["a", "b", "c", "d", "e"].map((id) => ({ id }));
  const states = {
    b: { due: "2026-10-04", interval: 3, reps: 2, ease: 2.5, lapses: 0 },
    c: { due: "2026-10-01", interval: 3, reps: 2, ease: 2.5, lapses: 0 },
    e: { due: "2026-10-20", interval: 9, reps: 3, ease: 2.5, lapses: 0 },
  };
  assert.deepEqual(S.buildQueue(cards, states, T, 1).map((c) => c.id), ["c", "b", "a"]);
  assert.deepEqual(S.buildQueue(cards, states, T, 0).map((c) => c.id), ["c", "b"]);
});

test("streak counts back from today or yesterday", () => {
  const days = { "2026-10-03": { n: 4 }, "2026-10-04": { n: 2 } };
  assert.equal(S.streak(days, T), 2);           // today empty, yesterday counts
  days[T] = { n: 1 };
  assert.equal(S.streak(days, T), 3);
  assert.equal(S.streak({}, T), 0);
});

test("interval labels", () => {
  assert.equal(S.intervalLabel(0), "again");
  assert.equal(S.intervalLabel(12), "12d");
  assert.equal(S.intervalLabel(60), "2mo");
  assert.equal(S.intervalLabel(400), "1.1y");
});
