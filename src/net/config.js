/* net/config.js: where the API lives. VITE_API_URL when it is set at build time; else the local server while the app
   runs on localhost, else the deployed API. */
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
export const API = String(import.meta.env.VITE_API_URL || (local ? 'http://localhost:5000/api' : 'https://talentvetting-backend.vercel.app/api')).replace(/\/+$/, '');
