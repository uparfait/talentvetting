/* ui/file_box.jsx: the template's file field (files/file_box.jsx, file_tile.jsx): chosen files sit inside the field as
   small attachments above the button: an image as a square thumbnail, any other file as a chip with its name and size;
   x takes one out again (the input's own file list is rebuilt, so the form sends what is shown). File_box({ id, name,
   accept, multiple }); put it in a .field with its label. */
import { useRef, useState } from 'react';
import { ic } from '../icons/index.js';

const size = n => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);
export function File_box({ id, name, accept, multiple = false }) {
  const inp = useRef(null), [files, set_files] = useState([]);
  const take = () => set_files([...inp.current.files].map(f => ({ f, url: /^image\//.test(f.type) ? URL.createObjectURL(f) : '' })));
  const out = i => { const dt = new DataTransfer(); files.forEach((x, k) => k !== i && dt.items.add(x.f)); inp.current.files = dt.files; take(); };
  return <div className="filebox"><div className="files">{files.map(({ f, url }, i) => <div key={f.name + i} className={`file ${url ? 'media' : 'doc'}`} title={f.name}>
    {url ? <img src={url} alt={f.name} /> : <><span className="file_ico">{ic('file', 'h-5 w-5')}</span><span className="file_meta"><span className="truncate">{f.name}</span><small>{size(f.size)}</small></span></>}
    <button type="button" className="file_x" aria-label={`Remove ${f.name}`} onClick={() => out(i)}>{ic('x', 'h-3 w-3')}</button></div>)}</div>
    <input ref={inp} id={id} name={name} type="file" accept={accept} multiple={multiple} onChange={take} /></div>;
}
