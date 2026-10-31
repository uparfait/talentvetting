/* ui/field.jsx: the template's outlined field (fields/field.jsx): the label rests in the box and floats onto the border on
   focus or once filled; a required field shows a brand asterisk. Field({ label, name, as: 'input' | 'textarea' |
   'select', options, help, ...input props }); help: its explanation behind a help icon beside the field (the template
   has no hint lines under fields). Uncontrolled by default. */
import { useId } from 'react';
import { help_tip } from './bits.jsx';

export function Field({ label, name, as = 'input', options = [], help, hint, className = '', ...rest }) {
  const auto = useId(), id = rest.id || `f_${name}_${auto.replace(/:/g, '')}`, tip = help || hint;
  const ctl = as === 'textarea' ? <textarea id={id} name={name} rows={4} placeholder=" " {...rest} />
    : as === 'select' ? <select id={id} name={name} {...rest}><option value="">Choose…</option>
      {options.map(o => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={v} value={v}>{l}</option>; })}</select>
    : <input id={id} name={name} placeholder=" " {...rest} />;
  const box = <div className={`field ${tip ? 'min-w-0 flex-1' : className}`}><label htmlFor={id}>{label}{rest.required ? <>{' '}<span className="text-accent" aria-hidden="true">*</span></> : null}</label>{ctl}</div>;
  return tip ? <div className={`flex items-center gap-1 ${className}`}>{box}{help_tip(tip, label)}</div> : box;
}
/* the values of a form as an object (checkboxes as true / false) */
export const form_values = f => Object.fromEntries([...new FormData(f)].map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
