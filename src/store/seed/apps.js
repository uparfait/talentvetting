/* store/seed/apps.js: the applications at the start: qualified by the QualificationAgent, and for jobs with a
   psychometric test, its score and a proctoring report when the seeker has taken it. */
import { qualification } from '../../ai/agents/qualification.js';
import { proctor } from '../../ai/agents/proctor.js';
import { rng } from '../../lib/index.js';

export function seed_apps(jobs, users, profiles, applied) {
  return applied.map(([key, email, psych], i) => {
    const job = jobs.find(j => j.key === key), u = users.find(x => x.email === email), p = profiles.find(x => x.id === u.id), r = rng(email + key);
    const events = psych == null ? [] : r.shuffle([{ kind: 'blur', at: 1 }, { kind: 'tab', at: 2 }, { kind: 'no_face', at: 3 }]).slice(0, r.int(0, 2));
    const done = psych != null || !job.psych.enabled;
    return { id: `app_${i + 1}`, job: job.id, user: u.id, created: Date.now() - (9 - i) * 3600000,
      qual: { ...qualification(p, job), model: 'gemini/gemini-flash-lite', prompt_v: 3 },
      stage: done ? 'screening' : 'psych',
      psych: psych == null ? null : { score: psych, at: Date.now() - 7200000, report: { ...proctor(events), model: 'gemini/gemini-flash-lite', prompt_v: 1 }, events } };
  }).filter(a => a.qual.qualified);   /* only qualified people can apply */
}
