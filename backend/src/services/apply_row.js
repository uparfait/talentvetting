/* services/apply_row.js: one application as the job seeker sees it: the job, where it stands (selected or not only once
   the recruiter publishes the results), the tests done, the next thing to do ('psych', 'exam' or null) and the face
   checks for it (failed tries, the wait before the next, blocked). Screening scores stay with the recruiter. */
const EARLY = ['psych', 'screening', 'scored'];
const PICKED = ['shortlisted', 'selected', 'not_selected'];
const JOB_FIELDS = { title: 1, owner: 1, status: 1, path: 1, message: 1, published: 1, psych: 1, skills: 1, years: 1, level: 1 };

function next_of(a, job) {
  if (a.stage === 'psych' && !a.psych) return 'psych';
  if (a.stage === 'shortlisted' && job.path === 'exam' && !a.exam) return 'exam';
  return null;
}

const identity_of = (a, next) => { const s = next && a.identity?.[next]; return s ? { fails: s.fails || 0, wait: s.wait || '', blocked: !!s.locked } : null; };

function seeker_row(a, job, company = '') {
  const stage = !job.published && ['selected', 'not_selected'].includes(a.stage) ? 'shortlisted' : a.stage;
  const message = PICKED.includes(a.stage) && job.path === 'message' ? job.message || '' : '';
  return {
    id: a._id,
    job: { id: job._id, title: job.title, company, path: job.path || null, published: !!job.published, status: job.status,
      psych_test: !!job.psych?.enabled, message },
    stage, scored: !!a.score, psych_done: !!a.psych, exam: { done: !!a.exam, score: a.exam?.score ?? null },
    created: a.created, next: next_of(a, job), identity: identity_of(a, next_of(a, job)), can_withdraw: EARLY.includes(a.stage)
  };
}

module.exports = { seeker_row, next_of, EARLY, JOB_FIELDS };
