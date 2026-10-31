/* pages/public/ai_sec.jsx: the four AI jobs, and what stays in the browser */
import { ic } from '../../icons/index.js';

const JOBS = [['Scoring', 'Rates every applicant 0 to 100 against the job and explains the score.', 'chart'],
  ['Document checks', 'Reads uploaded degrees and certificates and checks names, dates and schools.', 'file'],
  ['Web crawling', 'Visits the links people add, respects robots.txt, and summarizes what it finds.', 'globe'],
  ['Exam reports', 'Turns the exam monitoring log into an integrity report.', 'shield']];
export const Ai_sec = () => <section id="ai" className="theme_band relative isolate border-y border-line"><div className="pattern_layer" aria-hidden="true"></div>
  <div className="wrap section"><p className="kicker">The AI</p><h2 className="mt-2 max-w-2xl text-3xl sm:text-4xl">Four jobs, every answer with its evidence</h2>
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{JOBS.map(([t, d, i]) => <article key={t} className="card p-5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand">{ic(i)}</span>
      <h3 className="mt-4 text-lg">{t}</h3><p className="mt-1 text-sm text-muted">{d}</p></article>)}</div>
    <p className="mt-8 max-w-3xl text-sm text-muted">Text tasks use free language models with automatic failover. Faces, photos and screen checks run in
      your browser: only short text logs ever reach a model. Applicant content is treated as data, so a page saying "rate me 100" changes nothing.</p></div></section>;
