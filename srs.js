// Spaced-repetition scheduler (SM-2 variant). Pure functions: no DOM, no storage.
// build.py inlines this file into the page; srs.test.js imports it under node.
const GRADE = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 };
const ROLLOVER_HOURS = 3; // reviews before 3am still count toward the previous day
const MIN_EASE = 1.3;
const MAX_EASE = 3.0;

function pad(n) { return String(n).padStart(2, "0"); }

function todayStr(now) {
  const d = new Date((now || new Date()).getTime() - ROLLOVER_HOURS * 3600e3);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

function dayNum(s) {
  const p = s.split("-").map(Number);
  return Math.round(Date.UTC(p[0], p[1] - 1, p[2]) / 864e5);
}

function addDays(s, n) {
  const d = new Date(dayNum(s) * 864e5 + n * 864e5);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}

function newState() {
  return { ease: 2.5, interval: 0, reps: 0, due: null, lapses: 0 };
}

function clampEase(e) { return Math.min(MAX_EASE, Math.max(MIN_EASE, e)); }

// Returns the next state after grading a card. `state` may be null for a new card.
function schedule(state, grade, today) {
  const s = Object.assign(newState(), state || {});
  if (grade === GRADE.AGAIN) {
    return Object.assign(s, {
      reps: 0, interval: 0, lapses: s.lapses + 1, ease: clampEase(s.ease - 0.2), due: today,
    });
  }
  const prev = s.interval;
  s.reps += 1;
  if (s.reps === 1) {
    s.interval = grade === GRADE.EASY ? 3 : 1;
  } else if (s.reps === 2) {
    s.interval = grade === GRADE.EASY ? 6 : grade === GRADE.HARD ? 2 : 3;
  } else if (grade === GRADE.HARD) {
    s.interval = Math.max(prev + 1, Math.round(prev * 1.2));
  } else if (grade === GRADE.GOOD) {
    s.interval = Math.max(prev + 1, Math.round(prev * s.ease));
  } else {
    s.interval = Math.max(prev + 2, Math.round(prev * s.ease * 1.3));
  }
  if (grade === GRADE.HARD) s.ease = clampEase(s.ease - 0.15);
  if (grade === GRADE.EASY) s.ease = clampEase(s.ease + 0.15);
  s.due = addDays(today, s.interval);
  return s;
}

function intervalLabel(days) {
  if (days <= 0) return "again";
  if (days < 30) return days + "d";
  if (days < 365) return Math.round(days / 30) + "mo";
  return (Math.round(days / 36.5) / 10) + "y";
}

function previewLabels(state, today) {
  const out = {};
  [GRADE.AGAIN, GRADE.HARD, GRADE.GOOD, GRADE.EASY].forEach(function (g) {
    out[g] = intervalLabel(schedule(state, g, today).interval);
  });
  return out;
}

function isNew(state) { return !state || state.due === null; }
function isDue(state, today) { return !isNew(state) && state.due <= today; }
function isMature(state) { return !isNew(state) && state.interval >= 21; }

// Due cards first (oldest due first), then up to `newLeft` unseen cards in deck order.
function buildQueue(cards, states, today, newLeft) {
  const due = cards.filter(function (c) { return isDue(states[c.id], today); });
  due.sort(function (a, b) { return states[a.id].due < states[b.id].due ? -1 : states[a.id].due > states[b.id].due ? 1 : 0; });
  const fresh = cards.filter(function (c) { return isNew(states[c.id]); }).slice(0, Math.max(0, newLeft));
  return due.concat(fresh);
}

// Consecutive days with at least one review, ending today (or yesterday if today is empty).
function streak(days, today) {
  let d = (days[today] && days[today].n > 0) ? today : addDays(today, -1);
  let n = 0;
  while (days[d] && days[d].n > 0) { n += 1; d = addDays(d, -1); }
  return n;
}

if (typeof module !== "undefined") {
  module.exports = { GRADE, todayStr, dayNum, addDays, newState, schedule, intervalLabel,
    previewLabels, isNew, isDue, isMature, buildQueue, streak };
}
