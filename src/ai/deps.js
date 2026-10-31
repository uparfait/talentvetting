/* ai/deps.js: what the AI layer uses from the rest of the app, in one place (a server swaps these for its own) */
export { db } from '../store/index.js';
export { uid, sleep, rng, similarity, vec, cosine, words, word_count } from '../lib/index.js';
