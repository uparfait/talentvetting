/* pages/recruiter/ai_log.jsx: every AI call the gateway made: task, what it was about, provider and model, which key,
   the result (failovers show as failed calls with the key cooling down), latency and tokens. */
import { db } from '../../store/index.js';
import { Data_table, chip, help_tip } from '../../ui/index.js';
import { fmt_dt } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';

const COLS = [{ k: 'at', l: 'When', value: r => r.at, render: r => <span className="whitespace-nowrap text-sm">{fmt_dt(r.at)}</span> },
  { k: 'task', l: 'Task', render: r => <b className="font-medium">{r.task}</b> }, { k: 'label', l: 'About', render: r => <span className="trunc block">{r.label}</span> },
  { k: 'model', l: 'Provider / model', value: r => `${r.provider}/${r.model}`, render: r => <span className="text-sm">{r.provider}/{r.model}</span> },
  { k: 'key', l: 'Key' }, { k: 'ok', l: 'Result', value: r => r.ok ? 1 : 0, render: r => chip(r.ok ? 'ok' : 'failed', r.ok ? 'ok' : 'bad') },
  { k: 'ms', l: 'ms', value: r => r.ms || 0 }, { k: 'tokens', l: 'Tokens', value: r => r.tokens || 0 }, { k: 'note', l: 'Note', render: r => <span className="trunc block text-sm text-muted" data-tip={r.note}>{r.note}</span> }];
export default function Ai_log() {
  const rows = db.get('ai_log', []), fails = rows.filter(r => !r.ok).length;
  return <>{page_head('AI activity', help_tip('Each task tries its primary provider first. A 429, a 5xx or a timeout cools that key down for 60 s and moves to the next key, then the next provider. Answers must match the task schema.', 'the gateway'),
    `${rows.length} calls, ${fails} failovers. Keys and calls run on the server in production.`)}
    <Data_table label="AI calls" cols={COLS} rows={rows} empty_text="No AI calls yet: verify a profile, apply to a job or run a screening." /></>;
}
