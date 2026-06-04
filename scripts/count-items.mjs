import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items, collections } from '@wix/data';
import fs from 'node:fs';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const wix = createClient({
  modules: { items, collections },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY,
    siteId: process.env.WIX_SITE_ID,
    accountId: process.env.WIX_ACCOUNT_ID,
  }),
});

const list = await wix.collections.listDataCollections();
const ids = (list.collections || [])
  .filter(c => c.collectionType === 'NATIVE')
  .map(c => c._id);

for (const id of ids) {
  try {
    const r = await wix.items.query(id).limit(1).find();
    let total = r.totalCount;
    if (total == null) {
      const big = await wix.items.query(id).limit(1000).find();
      total = big.items?.length ?? '?';
    }
    console.log(`${id}: ${total}`);
  } catch (e) {
    console.log(`${id}: ERR ${e?.message || e}`);
  }
}
