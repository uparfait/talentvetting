/* ai/agents/index.js: the agents behind the gateway. Text tasks go through llm() (providers, keys, failover, logs);
   crawling is a fetch, not a model, so it runs directly. */
import { llm } from '../gateway.js';
import { qualification } from './qualification.js';
import { scoring } from './scoring.js';
import { document_check } from './document.js';
import { crawl } from './crawler.js';
import { summarize } from './summarizer.js';
import { synthesize } from './synthesizer.js';
import { grade } from './grader.js';
import { proctor } from './proctor.js';

export const agents = {
  qualify: (p, job, label) => llm('qualification', () => qualification(p, job), label),
  score: (p, job, label) => llm('scoring', () => scoring(p, job), label),
  document: (doc, e, user, label) => llm('document', () => document_check(doc, e, user), label),
  crawl: (link, p, user) => crawl(link, p, user),
  summarize: (text, label) => llm('summary', () => summarize(text), label),
  synthesize: (user, p, label) => llm('synthesis', () => synthesize(user, p), label),
  grade: (qs, answers, label) => llm('grading', () => grade(qs, answers), label),
  proctor: (events, label) => llm('proctor', () => proctor(events), label)
};
export { qualification, scoring, synthesize, proctor };
