/* pages/shared/wait.jsx: wait(...loads) for pages that read with use_data: the template's page loader while anything has
   nothing to show yet, a card with the server's message and Try again when a load failed, else null (draw the page).
   missing(title, text, action): the card for something that is not there (or not yours). */
import { page_loader, empty } from '../../ui/index.js';

export const missing = (title, text, action = null) => <div className="card">{empty(title, text, action, 'bell', 'info')}</div>;
export function wait(...loads) {
  if (loads.some(r => r.loading)) return page_loader();
  const bad = loads.find(r => r.error)?.error;
  if (!bad) return null;
  return missing(bad.status === 404 ? 'Not found' : 'Could not load this', bad.message,
    <button type="button" className="btn btn_primary btn_sm" onClick={() => loads.forEach(r => r.reload())}>Try again</button>);
}
