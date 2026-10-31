/* pages/recruiter/ai_log.jsx: every AI call the server made about this recruiter's jobs (GET /ai-log): task, what it was
   about, provider and model, the result (failovers show as failed calls), latency and tokens. */
import { use_data } from '../../net/index.js';
import { Data_table, chip, help_tip } from '../../ui/index.js';
import { fmt_dt } from '../../lib/index.js';
import { page_head } from '../shared/kpi.jsx';
import { wait } from '../shared/wait.jsx';

const COLS = [{ k: 'at', l: 'When', value: r => r.at, render: r => <span className="whitespace-nowrap text-sm">{fmt_dt(r.at)}</span> },
  { k: 'task', l: 'Task', filter: 'select', render: r => <b className="font-medium">{r.task}</b> }, { k: 'label', l: 'About', render: r => <span className="trunc block">{r.label}</span> },
  { k: 'model', l: 'Provider / model', filter: 'select', value: r => `${r.provider}/${r.model}`, render: r => <span className="text-sm">{r.provider}/{r.model}</span> },
  { k: 'ok', l: 'Result', filter: 'select', value: r => r.ok ? 'ok' : 'failed', render: r => chip(r.ok ? 'ok' : 'failed', r.ok ? 'ok' : 'bad') },
  { k: 'ms', l: 'ms', value: r => r.ms || 0 }, { k: 'tokens', l: 'Tokens', value: r => r.tokens || 0 }, { k: 'note', l: 'Note', render: r => <span className="trunc block text-sm text-muted" data-tip={r.note}>{r.note}</span> }];
export default function Ai_log() {
  const q = use_data('/ai-log'), rows = (q.data || []).map((r, i) => ({ id: r.id || `${r.at}_${i}`, ...r })), fails = rows.filter(r => !r.ok).length, hold = wait(q);
  return <>{page_head('AI activity', help_tip('Each task tries its first provider, then the next one when a provider is busy, slow or fails. Answers must match the task schema.', 'the gateway'),
    `${rows.length} calls, ${fails} failovers. Every call runs on the server.`)}
    {hold || <Data_table id="ai_log" title="AI calls" cols={COLS} rows={rows} empty_title="No AI calls yet" empty_text="Post a job or receive applications, and the calls show here." />}</>;
}
