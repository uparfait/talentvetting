/* ai/agents/proctor.js: ProctorReportAgent. Only the text log is read: tab switches, focus lost, leaving full screen, no
   face, more than one person, a face unlike the profile photo, screen sharing stopped. Each costs points. */
const COST = { tab: 8, blur: 4, fullscreen: 5, no_face: 6, many: 20, mismatch: 25, share_end: 15 };
const LABEL = { tab: 'tab hidden', blur: 'window lost focus', fullscreen: 'left full screen', no_face: 'no face in view',
  many: 'more than one person', mismatch: 'face unlike the profile photo', share_end: 'screen sharing stopped' };

export function proctor(events) {
  const n = {}; let integrity = 100;
  for (const e of events || []) if (COST[e.kind]) { integrity -= COST[e.kind]; n[e.kind] = (n[e.kind] || 0) + 1; }
  integrity = Math.max(0, integrity);
  const findings = Object.entries(n).map(([k, c]) => `${LABEL[k]}: ${c} time${c > 1 ? 's' : ''}`);
  return { integrity, verdict: integrity >= 85 ? 'clean' : integrity >= 60 ? 'review' : 'flagged', findings: findings.length ? findings : ['Nothing unusual in the log'] };
}
