/* db/indexes.js: the indexes every query relies on (unique emails and ID numbers, lookups by owner, job, user), and
   expiry for short lived records (camera sessions and captures). */
async function ensure_indexes(db) {
  await Promise.all([
    db.collection('users').createIndexes([{ key: { email: 1 }, unique: true, name: 'uniq_email' },
      { key: { id_number: 1 }, unique: true, name: 'uniq_id_number', partialFilterExpression: { id_number: { $type: 'string' } } }]),
    db.collection('jobs').createIndexes([{ key: { owner: 1, created: -1 }, name: 'owner' }, { key: { status: 1, created: -1 }, name: 'open' }]),
    db.collection('applications').createIndexes([{ key: { job: 1, user: 1 }, unique: true, name: 'uniq_job_user' }, { key: { user: 1, created: -1 }, name: 'user' }]),
    db.collection('tests').createIndex({ app: 1, kind: 1 }, { name: 'app_kind' }),
    db.collection('notices').createIndex({ to: 1, created: -1 }, { name: 'to' }),
    db.collection('ai_log').createIndexes([{ key: { owner: 1, at: -1 }, name: 'owner' }, { key: { at: 1 }, expireAfterSeconds: 90 * 86400, name: 'expire' }]),
    db.collection('liveness').createIndex({ created: 1 }, { expireAfterSeconds: 900, name: 'expire' }),
    db.collection('captures').createIndex({ created: 1 }, { expireAfterSeconds: 1800, name: 'expire' })
  ]);
}
module.exports = { ensure_indexes };
