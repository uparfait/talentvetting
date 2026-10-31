/* ui/tabs.jsx: Tabs({ tabs: [[key, label, count]], cur, on }), the template's tab bar (ui/widgets.jsx): underlined, the
   current one marked, each with its count; scrolls sideways on a phone instead of wrapping. */
export const Tabs = ({ tabs, cur, on, label = 'Sections' }) => <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label={label}>
  {tabs.map(([k, l, n]) => <button key={k} type="button" role="tab" aria-selected={cur === k} className={cur === k ? 'tab active' : 'tab'} onClick={() => on(k)}>
    {l}{n != null ? <span className="chip ml-1 bg-surface-2 text-muted">{n}</span> : null}</button>)}</div>;
