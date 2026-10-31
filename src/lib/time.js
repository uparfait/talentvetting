/* lib/time.js: dates for people (Oct 31, 2026), times ago, and sleep(ms) for the simulated network */
export const fmt_date = t => t ? new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
export const fmt_dt = t => t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';
export function ago(t) {
  const s = (Date.now() - t) / 1e3;
  return s < 60 ? 'just now' : s < 3600 ? `${Math.floor(s / 60)} min ago` : s < 86400 ? `${Math.floor(s / 3600)} h ago` : fmt_date(t);
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export const age_of = dob => dob ? Math.floor((Date.now() - Date.parse(dob)) / 31557600000) : 0;
