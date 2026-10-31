/* main.jsx: the entry. The stylesheet (base, components, Tailwind, then overrides), the demo data on a first visit,
   then the app in #app. */
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/overrides.css';
import App from './app.jsx';
import { ensure_seed } from './store/index.js';

ensure_seed();
createRoot(document.getElementById('app')).render(<App />);
