/* pages/recruiter/md_editor.jsx: a Markdown editor: Write (a textarea that keeps tabs as two spaces) and Preview (the
   rendered text, escaped first so nothing can inject HTML). Controlled: value and on_change. */
import { useState } from 'react';
import { md } from '../../lib/index.js';
import { Tabs } from '../../ui/index.js';

export function Md_editor({ value, on_change, label = 'Details', rows = 14 }) {
  const [tab, set_tab] = useState('write');
  const keys = e => { if (e.key !== 'Tab') return; e.preventDefault(); const t = e.currentTarget, s = t.selectionStart;
    on_change(value.slice(0, s) + '  ' + value.slice(t.selectionEnd)); requestAnimationFrame(() => t.setSelectionRange(s + 2, s + 2)); };
  return <div className="grid gap-2"><div className="flex items-center justify-between gap-3"><span className="cap">{label} (Markdown)</span>
    <Tabs tabs={[['write', 'Write'], ['preview', 'Preview']]} cur={tab} on={set_tab} label={`${label} editor`} /></div>
    {tab === 'write' ? <textarea aria-label={label} className="min-h-64 w-full font-mono text-sm" rows={rows} value={value} onKeyDown={keys}
      onChange={e => on_change(e.target.value)} placeholder={'## About the role\n- What they will do\n\n## Requirements\n- What they need'} />
      : <div className="md min-h-64 rounded-2xl border border-line p-4" dangerouslySetInnerHTML={{ __html: md(value) || '<p>Nothing to preview yet.</p>' }} />}</div>;
}
