/* pages/recruiter/tab_applicants.jsx: everyone who applied: their stage, the qualification (skills the server found of
   those asked), the psychometric score and its integrity verdict; a row opens the candidate. */
import { go } from '../../router/index.js';
import { Data_table, chip } from '../../ui/index.js';
import { fmt_date } from '../../lib/index.js';
import { person } from '../shared/person.jsx';
import { stage_chip, LABEL } from '../shared/stage.jsx';

const VERDICT = { clean: 'ok', review: 'warn', flagged: 'bad' };
export function Tab_applicants({ job, apps }) {
  const cols = [{ k: 'name', l: 'Candidate', value: a => a.user?.name, render: a => person(a.user, a.user?.email) },
    { k: 'stage', l: 'Stage', filter: 'select', value: a => LABEL[a.stage] || a.stage, render: stage_chip },
    { k: 'qual', l: 'Skills found', value: a => a.qual?.matched?.length || 0, render: a => `${a.qual?.matched?.length || 0} of ${(job.skills || []).length}` },
    { k: 'psych', l: 'Psychometric', value: a => a.psych?.score ?? -1, render: a => a.psych ? <span className="flex items-center gap-2"><b>{a.psych.score ?? '.'}</b>
      {a.psych.report ? chip(a.psych.report.verdict, VERDICT[a.psych.report.verdict]) : null}</span> : job.psych?.enabled ? 'not taken' : 'off' },
    { k: 'created', l: 'Applied', value: a => a.created, render: a => fmt_date(a.created) }];
  return <Data_table id="applicants" title="Applicants" cols={cols} rows={apps} on_row={a => go(`/app/candidates/${a.user?.id}?job=${job.id}`)} empty_title="No one has applied yet" empty_text="Invite people from the Overview tab." />;
}
