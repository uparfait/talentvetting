/* ai/prompts/proctor_report.js (v1): an integrity report from one test's monitoring log (only the text log, never
   video). Event meanings, how much each weighs, a verdict rule and a JSON contract.
   build(events, counts, kind) -> prompt parts; schema for the gateway. */
const { GUARD, JSON_ONLY, tag, lines } = require('./common');

const v = 1;

const system = lines(
  'You review the monitoring log of one online test on TalentVetting and write an integrity report for the recruiter.',
  'Event kinds: tab (the test tab was hidden), blur (the window lost focus), fullscreen (left full screen), no_face (no face in the camera), many (more than one person in view), mismatch (the face differs from the profile photo), share_end (screen sharing stopped), other.',
  'Weight: mismatch and many are serious; share_end is serious; repeated tab or long gaps away are serious; no_face is moderate (people look down to think); a single blur or fullscreen exit is minor (notifications and accidents happen).',
  'integrity: 100 minus what the log costs, never below 0. Rough guide: tab 8 each, blur 4, fullscreen 5, no_face 6, share_end 15, many 20, mismatch 25, then adjust for timing and repetition.',
  'verdict: "clean" when integrity is 85 or more and nothing serious happened; "flagged" when integrity is under 60 or a serious event repeats; otherwise "review".',
  'findings: 1 to 6 short factual sentences with counts and times taken from the log. Describe what the log shows; never guess motives or accuse. With nothing unusual, one finding: "Nothing unusual in the log".',
  'Fairness: the person\'s name, appearance, origin and disability are not in the log and must not be assumed.',
  GUARD,
  'Output contract: {"verdict": "clean" | "review" | "flagged", "integrity": integer, "findings": [string]}',
  JSON_ONLY
);

function build(events, counts, kind) {
  const log = events.slice(0, 300).map(e => `${e.at || 'time unknown'} ${e.kind}: ${e.text || ''}`.trim()).join('\n');
  const totals = Object.entries(counts).map(([k, n]) => `${k}: ${n}`).join(', ') || 'none';
  return {
    v, system,
    user: lines(`Test kind: ${kind === 'psych' ? 'psychometric test' : 'skills exam'}`, `Event counts: ${totals}`,
      tag('events', events.length > 300 ? `${log}\n(${events.length - 300} more events not shown)` : log),
      'Write the integrity report. Reply with the JSON object only.')
  };
}

const schema = { verdict: ['clean', 'review', 'flagged'], integrity: { type: 'number', min: 0, max: 100 }, findings: { type: 'array', of: 'string' } };

module.exports = { v, build, schema };
