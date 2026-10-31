/* ui/password.jsx: the template's password field (account/auth_shell.jsx pw_field): an outlined field with a show / hide
   button; with rules (a new password), the template's strength meter, its word and the rules ticked as they are met
   (account/pw_rules.js, set_password_page.jsx). Password({ label, name, auto, rules }). */
import { useState } from 'react';
import { ic } from '../icons/index.js';

export const PW_RULES = [['len', 'At least 8 characters', v => v.length >= 8], ['case', 'Upper and lower case letters', v => /[a-z]/.test(v) && /[A-Z]/.test(v)],
  ['num', 'A number', v => /\d/.test(v)], ['sym', 'A symbol, such as ! ? # @', v => /[^\w\s]/.test(v)]];
const WORDS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

export function Password({ label = 'Password', name = 'password', auto = 'current-password', rules = false, id = `pw_${name}`, initial = '' }) {
  const [show, set_show] = useState(false), [v, set_v] = useState(initial), ok = PW_RULES.filter(([, , t]) => t(v)).length;
  return <><div className="field"><label htmlFor={id}>{label} <span className="text-accent" aria-hidden="true">*</span></label><div className="relative">
    <input id={id} name={name} type={show ? 'text' : 'password'} autoComplete={auto} required className="pr-12" placeholder=" " value={v} onChange={e => set_v(e.target.value)} />
    <button type="button" className="icon_btn absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2" aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}
      onClick={() => set_show(!show)}>{ic(show ? 'eye_off' : 'eye', 'h-5 w-5')}</button></div></div>
    {rules ? <div className="-mt-2 grid gap-2"><meter min="0" max="4" low="2" high="3" optimum="4" value={ok} aria-label="Password strength"></meter>
      <p className="text-xs text-muted" aria-live="polite">{v ? WORDS[ok] : 'Type a password'}</p>
      <ul className="pw_rules grid gap-1.5 text-sm">{PW_RULES.map(([k, l, t]) => <li key={k} className={t(v) ? 'ok' : ''}>{ic('check', 'h-4 w-4 shrink-0')}{l}</li>)}</ul></div> : null}</>;
}
