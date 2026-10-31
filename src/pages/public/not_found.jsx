/* pages/public/not_found.jsx: an address that leads nowhere */
import { empty } from '../../ui/index.js';

export const Not_found = () => <main id="main" className="grid min-h-dvh place-items-center bg-bg p-6">
  {empty('Page not found', 'The address may be mistyped, or the page has moved.', <a href="/" className="btn btn_primary btn_sm">Go home</a>, 'bell', 'info')}</main>;
