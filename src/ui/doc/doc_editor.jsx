/* ui/doc/doc_editor.jsx: Doc_editor({ label, value, on_change, placeholder }), a small Word-like editor in the look of
   the template's document editor (src/editor): the pill toolbar, the grey workspace and a white page with the document's
   own typography (Arial, headings, lists), then the word count. The page is contentEditable; formatting uses the
   browser's editing commands, as the template does. value is HTML (Markdown from older jobs is turned into HTML once);
   on_change gets clean HTML. */
import { useEffect, useRef, useState } from 'react';
import { doc_html, sanitize } from '../../lib/doc.js';
import { Doc_toolbar } from './doc_toolbar.jsx';

const STATES = ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];
const words = t => (t.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;

export function Doc_editor({ label = 'Details', value, on_change, placeholder = 'Write here' }) {
  const page = useRef(null), [on, set_on] = useState({}), [n, set_n] = useState(0);
  useEffect(() => { page.current.innerHTML = doc_html(value); set_n(words(page.current.innerText)); }, []);   // eslint-disable-line react-hooks/exhaustive-deps
  const read = () => {   /* the formats where the caret is: lit buttons and the style menu's name */
    const s = getSelection(); if (!s.rangeCount || !page.current.contains(s.anchorNode)) return;
    const o = {}; for (const k of STATES) { try { o[k] = document.queryCommandState(k); } catch { o[k] = false; } }
    const el = s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement;
    o.block = el.closest('h1, h2, h3, blockquote, p, li, div')?.tagName.toLowerCase(); set_on(o);
  };
  useEffect(() => { let t; const f = () => { clearTimeout(t); t = setTimeout(read, 60); }; document.addEventListener('selectionchange', f);
    return () => { document.removeEventListener('selectionchange', f); clearTimeout(t); }; }, []);
  const changed = () => { const el = page.current; set_n(words(el.innerText)); on_change(el.innerText.trim() ? sanitize(el.innerHTML) : ''); };
  const run = (cmd, v) => { const el = page.current; if (document.activeElement !== el) el.focus();
    document.execCommand('styleWithCSS', false, false); document.execCommand(cmd, false, v ?? null); changed(); read(); };
  const paste = e => { e.preventDefault(); const h = e.clipboardData.getData('text/html');
    document.execCommand(h ? 'insertHTML' : 'insertText', false, h ? sanitize(h) : e.clipboardData.getData('text/plain')); };
  return <div className="doc_ed"><Doc_toolbar on={on} run={run} />
    <div className="doc_ws"><div className="doc_page"><div ref={page} className="doc_content pg_body" contentEditable suppressContentEditableWarning role="textbox"
      aria-multiline="true" aria-label={label} data-placeholder={placeholder} spellCheck onInput={changed} onPaste={paste} onKeyUp={read} onMouseUp={read} /></div></div>
    <p className="doc_status" aria-live="polite">{n} {n === 1 ? 'word' : 'words'}</p></div>;
}
