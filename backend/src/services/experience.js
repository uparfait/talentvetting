/* services/experience.js: a job seeker's experience, worked out from the work entries (start, end or current):
   overlapping jobs count once and a current one runs to today. experience(profile) -> { months, text }. span(start,
   end) is how long one thing lasted, as text ('4 years', '1 year 6 months'). */
const MONTH_MS = 30.44 * 864e5;

const day = s => { const d = new Date(String(s || '')); return isNaN(d) ? null : d; };

function months_of(profile) {
  const today = new Date();
  const spans = (profile?.work || []).map(w => [day(w.start), w.current || !w.end ? today : day(w.end)])
    .filter(([a, b]) => a && b && b >= a).sort((x, y) => x[0] - y[0]);
  if (!spans.length) return 0;
  let total = 0, [s, e] = spans[0];
  for (const [a, b] of spans.slice(1)) {
    if (a <= e) { if (b > e) e = b; } else { total += e - s; [s, e] = [a, b]; }
  }
  return Math.round((total + (e - s)) / MONTH_MS);
}

const count = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
function months_text(months) {
  if (!months) return 'no work experience yet';
  const y = Math.floor(months / 12), m = months % 12;
  return [y ? count(y, 'year') : '', m ? count(m, 'month') : ''].filter(Boolean).join(' ');
}

const span = (start, end) => { const a = day(start), b = day(end); if (!a || !b || b < a) return '';
  const months = Math.round((b - a) / MONTH_MS); return months ? months_text(months) : 'under a month'; };
const experience = profile => { const months = months_of(profile); return { months, text: months_text(months) }; };

module.exports = { months_of, months_text, experience, span };
