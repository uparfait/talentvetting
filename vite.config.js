/* vite.config.js: the dev server (npm run dev) and the build (npm run build, into dist/).
   React sits in its own file, so returning visitors keep it cached between releases. */
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rolldownOptions: {
      output: { codeSplitting: { groups: [{ name: 'react', test: /node_modules[\/](react|react-dom|scheduler)[\/]/ }] } }
    }
  }
});
