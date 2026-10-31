/* main.jsx: the entry. The stylesheet (base, components, Tailwind, then overrides), then the app in #app. */
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import './styles/overrides.css';
import App from './app.jsx';

createRoot(document.getElementById('app')).render(<App />);
