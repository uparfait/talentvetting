/* ui/field.jsx: the template's outlined field: the label rests in the box and floats onto the border on focus or once
   filled. Field({ label, name, as: 'input' | 'textarea' | 'select', options, hint, ...input props }); uncontrolled by default. */
let n = 0;
export function Field({ label, name, as = 'input', options = [], hint, className = '', ...rest }) {
  const id = rest.id || `f_${name}_${++n}`;
  const ctl = as === 'textarea' ? <textarea id={id} name={name} rows={4} placeholder=" " {...rest} />
    : as === 'select' ? <select id={id} name={name} {...rest}><option value="">Choose</option>
      {options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}</select>
    : <input id={id} name={name} placeholder=" " {...rest} />;
  return <div className={`field ${className}`}><label htmlFor={id}>{label}</label>{ctl}
    {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}</div>;
}
/* the values of a form as an object (checkboxes as true / false) */
export const form_values = f => Object.fromEntries([...new FormData(f)].map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
