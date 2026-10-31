/* app.jsx: the root. Finds the route, checks who may open it (the session's user and role), draws the page (lazy, with
   a loader), inside the app shell for /app pages; the toasts and the dialog sit on top of everything. A kept session
   asks the server who it is once on start (an expired token signs out). */
import { Suspense, useEffect } from 'react';
import { use_path, go, match, query, ROUTES, PAGES } from './router/index.js';
import { use_session, me } from './net/index.js';
import { load_me } from './api/index.js';
import { App_shell } from './shell/app_shell.jsx';
import { Toasts, Modal_host, page_loader } from './ui/index.js';
import { Not_found } from './pages/public/not_found.jsx';

const find = p => { for (const [pat, page, who] of ROUTES) { const params = match(pat, p); if (params) return { page, who, params }; } return null; };
/* where a signed in person goes from a guest page (sign in, register): back where they were going (?next=), else /app */
const next = () => { const n = query().get('next') || ''; return n.startsWith('/') && !n.startsWith('//') ? n : '/app'; };
const allowed = (who, u) => who === 'public' || (who === 'guest' ? !u : !!u && (who === 'user' || u.role === who));

export default function App() {
  const path = use_path(), u = use_session();
  useEffect(() => { if (me()) load_me().catch(() => {}); }, []);
  const hit = find(path), ok = !!hit && allowed(hit.who, u);
  const to = !hit || ok ? null : hit.who === 'guest' && u ? next() : u ? '/app' : `/sign-in?next=${encodeURIComponent(path)}`;
  useEffect(() => { if (to) go(to, true); }, [to]);
  const Page = ok ? PAGES[hit.page] : null;
  const body = !hit ? <Not_found /> : !ok ? page_loader() : <Suspense fallback={page_loader()}><Page params={hit.params} /></Suspense>;
  return <>{ok && path.startsWith('/app') ? <App_shell>{body}</App_shell> : body}<Toasts /><Modal_host /></>;
}
