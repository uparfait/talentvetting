/* db/connect.js: one MongoClient per process, reused across serverless calls (a warm function keeps its pool). Indexes
   are made once after the first connection. col(name) gives a collection; bucket() the GridFS bucket for documents. */
const { MongoClient, GridFSBucket } = require('mongodb');
const config = require('../config');
const { prepare_dns } = require('./dns');
const { ensure_indexes } = require('./indexes');

let db = null, connecting = null;
async function connect() {
  if (db) return db;
  if (!connecting) connecting = (async () => {
    if (!config.mongo_uri) throw new Error('MONGO_URI missing');
    await prepare_dns(config.mongo_uri);
    const client = new MongoClient(config.mongo_uri, { serverSelectionTimeoutMS: 10000, maxPoolSize: 10, retryWrites: true });
    await client.connect();
    const d = client.db(config.db_name);
    await ensure_indexes(d);
    client.on('close', () => { db = null; });
    return (db = d);
  })().finally(() => { connecting = null; });
  return connecting;
}
const col = async name => (await connect()).collection(name);
const bucket = async () => new GridFSBucket(await connect(), { bucketName: 'docs' });
module.exports = { connect, col, bucket };
