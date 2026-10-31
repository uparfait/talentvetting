/* services/apply_quiet.js: quietly(label, fn) runs a side task (a notice, queueing a score) so that a failure is logged
   but never breaks what the person asked for. It returns a promise that always resolves. */
function quietly(label, fn) {
  try { return Promise.resolve(fn()).catch(e => console.error(label, e?.message || e)); }
  catch (e) { console.error(label, e?.message || e); return Promise.resolve(); }
}

module.exports = { quietly };
