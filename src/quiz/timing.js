/* quiz/timing.js: how long a question stays on screen (the HTML-CSS quiz's formula): reading time at 160 words a minute
   (screens read slower than paper), plus thinking time by kind, plus a 5 s buffer, rounded up to 5 s. */
import { word_count } from '../lib/index.js';

const THINK = { recall: 8, application: 20, code: 45 };
export function secs_for(text, kind) {
  const k = kind || (/```|\$|=|\(\)/.test(text) ? 'code' : /why|how|explain|which.*best|calculate/i.test(text) ? 'application' : 'recall');
  return Math.ceil((word_count(text) / 160 * 60 + THINK[k] + 5) / 5) * 5;
}
