/* pages/recruiter/tab_applicants.jsx: everyone who applied: their stage, the qualification (skills found of those asked),
   the psychometric score and its integrity verdict; a row opens the candidate. */
import { db } from '../../store/index.js';
import { go } from '../../router/index.js';
import { Data_table, chip } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { person } from '../shared/person.jsx';
import { stage_chip } from '../shared/stage.jsx';

const VERDICT = { clean: 'ok', review: 'warn', flagged: 'bad' };
export function Tab_applicants({ job, apps }) {
  const u = a => db.find('users', a.user);
  const cols = [{ k: 'name', l: 'Candidate', value: a => u(a)?.name, render: a => person(u(a), u(a)?.email) },
    { k: 'stage', l: 'Stage', render: stage_chip }, { k: 'qual', l: 'Skills found', value: a => a.qual.matched.length, render: a => `${a.qual.matched.length} of ${(job.skills || []).length}` },
    { k: 'psych', l: 'Psychometric', value: a => a.psych?.score ?? -1, render: a => a.psych ? <span className="flex items-center gap-2"><b>{a.psych.score}</b>
      {chip(a.psych.report.verdict, VERDICT[a.psych.report.verdict])}</span> : job.psych.enabled ? 'not taken' : 'off' },
    { k: 'created', l: 'Applied', value: a => a.created, render: a => fmt_date(a.created) }];
  return <Data_table label="Applicants" cols={cols} rows={apps} on_row={a => go(`/app/candidates/${a.user}?job=${job.id}`)} empty_text="No one has applied yet. Invite people from the Overview tab." />;
}
