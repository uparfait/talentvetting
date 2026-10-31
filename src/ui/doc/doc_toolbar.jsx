/* ui/doc/doc_toolbar.jsx: the document editor's toolbar (the template's editor/chrome/toolbar.jsx): one pill row that
   scrolls sideways on a phone: undo, redo | the text style (Normal text, headings, quote) | bold, italic, underline,
   strike | bulleted and numbered lists, indent | alignment | link, line | clear formatting. Buttons keep the selection
   in the page (mousedown does not take focus); the active formats are lit (on). */
import { ic } from '../../icons/index.js';
import { use_pop } from '../pop.jsx';

export const STYLES = [['p', 'Normal text', '14px'], ['h1', 'Heading 1', '20px'], ['h2', 'Heading 2', '17px'], ['h3', 'Heading 3', '15px'], ['blockquote', 'Quote', '14px']];
const keep = e => { if (!e.target.closest('input')) e.preventDefault(); };
const sep = k => <span key={k} className="tb_sep" aria-hidden="true"></span>;

function Style_menu({ cur, run }) {
  const p = use_pop(), label = (STYLES.find(s => s[0] === cur) || STYLES[0])[1];
  return <div className="relative flex-none" ref={p.ref}><button type="button" className={`tb_dd w-[7.5rem] ${p.open ? 'open' : ''}`} aria-haspopup="menu" aria-expanded={p.open} onClick={p.toggle}>
    <span className="lbl">{label}</span>{ic('ed_drop')}</button>
    {p.open ? <div className="pop ed_menu left-0 w-56" role="menu">{STYLES.map(([t, l, fs]) => <button key={t} type="button" role="menuitem" className="menu_item ed_mi"
      style={{ fontSize: fs, fontWeight: t[0] === 'h' ? 600 : 400 }} onClick={() => { p.close(); run('formatBlock', t); }}>{l}</button>)}</div> : null}</div>;
}

function Link_btn({ run }) {
  const p = use_pop(), add = e => { e.preventDefault(); const v = new FormData(e.currentTarget).get('url').trim(); p.close(); if (v) run('createLink', /^(https:|mailto:)/i.test(v) ? v : `https://${v}`); };
  return <div className="relative flex-none" ref={p.ref}><button type="button" className={`tb_btn ${p.open ? 'open' : ''}`} aria-label="Link" data-tip="Link" onClick={p.toggle}>{ic('link')}</button>
    {p.open ? <form className="pop right-0 grid w-72 gap-2 p-3 sm:left-0 sm:right-auto" onSubmit={add}><div className="field"><label htmlFor="ed_url">Link address</label>
      <input id="ed_url" name="url" type="url" placeholder=" " autoFocus /></div><button className="btn btn_primary btn_sm justify-self-end">Apply</button></form> : null}</div>;
}

export function Doc_toolbar({ on, run }) {
  const b = (cmd, i, l, v) => <button key={cmd + (v || '')} type="button" className={`tb_btn ${on[cmd] ? 'active' : ''}`} aria-label={l} aria-pressed={on[cmd] ? 'true' : undefined}
    data-tip={l} onClick={() => run(cmd, v)}>{ic(i)}</button>;
  return <div className="doc_tb" role="toolbar" aria-label="Formatting" onMouseDown={keep}>
    {b('undo', 'ed_undo', 'Undo')}{b('redo', 'ed_redo', 'Redo')}{sep(1)}<Style_menu cur={on.block} run={run} />{sep(2)}
    {b('bold', 'ed_bold', 'Bold')}{b('italic', 'ed_italic', 'Italic')}{b('underline', 'ed_underline', 'Underline')}{b('strikeThrough', 'ed_strike', 'Strikethrough')}{sep(3)}
    {b('insertUnorderedList', 'ed_bullets', 'Bulleted list')}{b('insertOrderedList', 'ed_numbers', 'Numbered list')}{b('outdent', 'ed_outdent', 'Decrease indent')}{b('indent', 'ed_indent', 'Increase indent')}{sep(4)}
    {b('justifyLeft', 'ed_left', 'Align left')}{b('justifyCenter', 'ed_center', 'Align center')}{b('justifyRight', 'ed_right', 'Align right')}{b('justifyFull', 'ed_justify', 'Justify')}{sep(5)}
    <Link_btn run={run} />{b('insertHorizontalRule', 'ed_rule', 'Horizontal line')}{sep(6)}{b('removeFormat', 'ed_clear', 'Clear formatting')}<span className="tb_fill"></span></div>;
}
