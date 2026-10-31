/* routes/pipeline.js: a job's pipeline after screening (mounted on /jobs beside routes/jobs.js): start over, the
   shortlist, its path (an exam or a message), the exam draft, the best performers, the final selection and publishing
   the results. Each answers with the job in full so the page shows the new state at once. */
const { Router } = require('express');
const { wrap } = require('../http/errors');
const { ok } = require('../http/reply');
const { need } = require('../http/auth');
const { own_job, id_list, job_of } = require('../services/access');
const { full_of } = require('../services/jobs');
const { restart, shortlist, set_path, best, select, publish } = require('../services/pipeline');
const { save_draft } = require('../services/pipeline_exam');

const r = Router();
r.use(need('recruiter'));
const body = req => (req.body && typeof req.body === 'object' && !Array.isArray(req.body) ? req.body : {});
/* run a step on the recruiter's own job, then answer with the job as it is now */
const step = fn => wrap(async (req, res) => {
  const job = await own_job(req, req.params.id);
  await fn(job, body(req));
  ok(res, await full_of(await job_of(job._id)));
});

r.post('/:id/restart', step(job => restart(job)));
r.post('/:id/shortlist', step((job, b) => shortlist(job, id_list(b.ids))));
r.post('/:id/path', step((job, b) => set_path(job, b)));
r.put('/:id/exam', step((job, b) => save_draft(job, b.questions)));
r.post('/:id/best', step((job, b) => best(job, id_list(b.ids))));
r.post('/:id/select', step((job, b) => select(job, id_list(b.ids))));
r.post('/:id/publish', step(job => publish(job)));
module.exports = r;
