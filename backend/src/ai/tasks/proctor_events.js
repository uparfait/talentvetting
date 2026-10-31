/* ai/tasks/proctor_events.js: the monitoring log in one shape and the rule based report. norm_event() maps each event
   to a known kind (tab, blur, fullscreen, no_face, many, mismatch, share_end, other); count_events() counts them;
   proctor_rules(counts) is the report without a model (each kind costs points), used for an empty log and whenever no
   AI provider answers. */
const KINDS = ['tab', 'blur', 'fullscreen', 'no_face', 'many', 'mismatch', 'share_end'];
const ALIAS = [[/mismatch|differ|unlike/, 'mismatch'], [/many|multiple|faces|people|persons/, 'many'], [/no.?face|absent|missing/, 'no_face'],
  [/share/, 'share_end'], [/full.?screen/, 'fullscreen'], [/tab|hidden|visib/, 'tab'], [/blur|focus/, 'blur']];
const COST = { tab: 8, blur: 4, fullscreen: 5, no_face: 6, many: 20, mismatch: 25, share_end: 15, other: 0 };
const LABEL = { tab: 'the test tab was hidden', blur: 'the window lost focus', fullscreen: 'left full screen', no_face: 'no face in view',
  many: 'more than one person in view', mismatch: 'a face unlike the profile photo', share_end: 'screen sharing stopped' };

function norm_event(e) {
  if (!e || typeof e !== 'object') return null;
  const raw = String(e.kind || '').toLowerCase(), text = String(e.text || '').slice(0, 200);
  const kind = KINDS.includes(raw) ? raw : (ALIAS.find(([re]) => re.test(raw) || re.test(text.toLowerCase())) || [])[1] || 'other';
  return { kind, text, at: when(e.at) };
}

/* ISO time, or seconds from the start when the log stores small numbers */
function when(at) {
  if (at === undefined || at === null || at === '') return '';
  if (typeof at === 'number' && at < 1e11) return `${at} s`;
  const d = new Date(at);
  return isNaN(d) ? String(at).slice(0, 40) : d.toISOString();
}

function count_events(events) {
  const n = {};
  for (const e of events) n[e.kind] = (n[e.kind] || 0) + 1;
  return n;
}

function proctor_rules(counts) {
  let integrity = 100;
  for (const [k, c] of Object.entries(counts)) integrity -= (COST[k] || 0) * c;
  integrity = Math.max(0, integrity);
  const findings = KINDS.filter(k => counts[k]).map(k => `${LABEL[k][0].toUpperCase()}${LABEL[k].slice(1)}: ${counts[k]} time${counts[k] > 1 ? 's' : ''}.`);
  const serious = (counts.mismatch || 0) + (counts.many || 0) + (counts.share_end || 0);
  const verdict = integrity < 60 || serious > 1 ? 'flagged' : integrity >= 85 && !serious ? 'clean' : 'review';
  return { verdict, integrity, findings: findings.length ? findings : ['Nothing unusual in the log'] };
}

module.exports = { norm_event, count_events, proctor_rules };
