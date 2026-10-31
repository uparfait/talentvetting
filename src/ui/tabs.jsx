/* ui/tabs.jsx: Tabs({ tabs: [[key, label, count]], cur, on }), the template's segmented pills: the current one filled,
   each with its count; scrolls sideways on a phone instead of wrapping. */
import { cls } from '../lib/index.js';

export const Tabs = ({ tabs, cur, on, label = 'Sections' }) => <div className="tv_tabs" role="tablist" aria-label={label}>
  {tabs.map(([k, l, n]) => <button key={k} type="button" role="tab" aria-selected={cur === k} className={cls('tv_tab', cur === k && 'on')} onClick={() => on(k)}>
    {l}{n != null ? <span className="tv_tab_n">{n}</span> : null}</button>)}</div>;
