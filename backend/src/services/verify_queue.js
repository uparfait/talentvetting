/* services/verify_queue.js: verification runs by itself after every profile change (nobody presses a button).
   queue_verify(user_id) starts it after the reply (waitUntil keeps the function alive on Vercel; locally the promise
   simply runs). It waits a few seconds so a burst of edits makes one run, then claims the profile (verifying set; a
   claim older than 2 minutes is taken over), so one run at a time. When the profile changed during a run it runs
   again, so the summary ends up matching the profile. The steps of the last run are kept on it (checks, checked). */
const { waitUntil } = require('@vercel/functions');
const { col } = require('../db/connect');
const { now } = require('../db/ids');
const { quietly } = require('./apply_quiet');

const DELAY_MS = 4000, CLAIM_MS = 120000, ROUNDS = 3;
const sleep = ms => new Promise(done => setTimeout(done, ms));

async function claim(user_id) {
  const old = new Date(Date.now() - CLAIM_MS).toISOString();
  const r = await (await col('profiles')).updateOne({ _id: user_id, $or: [{ verifying: null }, { verifying: { $lt: old } }] }, { $set: { verifying: now() } });
  return r.modifiedCount === 1;
}

async function run(user_id) {
  await sleep(DELAY_MS);
  if (!(await claim(user_id))) return;   /* a run is going: it sees this change and runs again */
  const profiles = await col('profiles'), { verify } = require('./verify');
  try {
    for (let i = 0, again = true; i < ROUNDS && again; i++) {
      const start = now(), r = await verify(user_id);
      const p = await profiles.findOneAndUpdate({ _id: user_id }, { $set: { checks: r.steps, checked: now() } }, { returnDocument: 'after', projection: { updated: 1 } });
      again = !!p?.updated && p.updated > start;
    }
  } finally {
    await profiles.updateOne({ _id: user_id }, { $set: { verifying: null } });
  }
  const p = await profiles.findOne({ _id: user_id }, { projection: { updated: 1, checked: 1 } });
  if (p?.updated && p.checked && p.updated > p.checked) queue_verify(user_id);   /* changed while the claim was let go */
}

function queue_verify(user_id) {
  const job = quietly('[verify] queue', () => run(user_id));
  try { waitUntil(job); } catch { /* no request context: the promise runs by itself */ }
  return job;
}

module.exports = { queue_verify };
