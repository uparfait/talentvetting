/* ai/index.js: the AI layer other modules import (backend_modules.md section A).
   run(task, prompt_parts, { owner, label, schema, files }) -> { data, provider, model, ms }
   score_profile(profile, job, { owner, label, user, experience_months }) -> { score, parts, reasoning, evidence, strengths, gaps, provider, model }
   read_skills(text, { owner, known }) -> [skill]
   extract_text({ buffer, type }) -> string
   check_document({ buffer, type, name, text }, { user, item, owner }) -> { status, flags, summary, provider, model }
   crawl_link(link, { owner, user }) -> { status, host, title, summary, note }
   synthesize(user, profile, { owner, experience_text }) -> { items, words, at, model }
   proctor_report(events, { owner, label, kind }) -> { verdict, integrity, findings, provider, model } */
const { run } = require('./gateway');
const { score_profile } = require('./tasks/score_profile');
const { read_skills } = require('./tasks/read_skills');
const { extract_text, check_document } = require('./documents');
const { crawl_link } = require('./crawler');
const { synthesize } = require('./tasks/synthesize');
const { proctor_report } = require('./tasks/proctor_report');

module.exports = { run, score_profile, read_skills, extract_text, check_document, crawl_link, synthesize, proctor_report };
