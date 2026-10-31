/* ai/agents/matching.js: talent matching, the top 10 job seekers who have not applied yet. Each profile and the job become
   word vectors compared by cosine (the demo's stand in for Gemini embeddings searched with pgvector). */
import { vec, cosine } from '../deps.js';
import { profile_text, job_text } from './profile_text.js';

export function top_matches(job, seekers, skip = new Set(), n = 10) {
  const jv = vec(job_text(job));
  return seekers.filter(s => !skip.has(s.user.id)).map(s => ({ ...s, fit: Math.round(cosine(jv, vec(profile_text(s.profile))) * 1000) / 10 }))
    .sort((a, b) => b.fit - a.fit).slice(0, n);
}
