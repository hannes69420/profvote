import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items, collections } from '@wix/data';
import fs from 'node:fs';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const { WIX_API_KEY, WIX_SITE_ID, WIX_ACCOUNT_ID } = process.env;
if (!WIX_API_KEY || !WIX_SITE_ID) {
  console.error('Missing WIX_API_KEY / WIX_SITE_ID');
  process.exit(1);
}

const wix = createClient({
  modules: { items, collections },
  auth: ApiKeyStrategy({ apiKey: WIX_API_KEY, siteId: WIX_SITE_ID, accountId: WIX_ACCOUNT_ID }),
});

function summarize(v) {
  if (v === null || v === undefined) return String(v);
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === 'object') {
    if (v.$date) return `Date(${v.$date})`;
    const keys = Object.keys(v).slice(0, 3).join(',');
    return `{${keys}${Object.keys(v).length > 3 ? ',…' : ''}}`;
  }
  const s = String(v);
  return s.length > 70 ? s.slice(0, 70) + '…' : s;
}

const list = await wix.collections.listDataCollections();
const cols = list.collections || [];
console.log(`# Found ${cols.length} collection(s)\n`);

const out = [];
for (const c of cols) {
  const id = c._id || c.id;
  const row = {
    id,
    displayName: c.displayName,
    collectionType: c.collectionType,
    permissions: c.permissions,
    fields: (c.fields || []).map(f => ({
      key: f.key, displayName: f.displayName, type: f.type, systemField: f.systemField,
    })),
    count: null, samples: [], error: null,
  };
  try {
    const q = await wix.items.query(id).limit(3).find();
    row.count = q.totalCount ?? q.items?.length ?? null;
    row.samples = q.items || [];
  } catch (e) {
    row.error = e?.details?.applicationError?.description || e?.message || String(e);
  }
  out.push(row);
}

console.log('## RAW JSON\n');
console.log(JSON.stringify(out, null, 2));

console.log('\n## MARKDOWN TABLE\n');
console.log('| Collection ID | Type | Items | Fields (key:type) | Sample values |');
console.log('|---|---|---|---|---|');
for (const r of out) {
  const fields = r.fields
    .filter(f => !f.systemField)
    .map(f => `${f.key}:${f.type}`)
    .join(', ') || '—';
  const sample = r.samples[0] || {};
  const sampleStr = Object.entries(sample)
    .filter(([k]) => !k.startsWith('_'))
    .slice(0, 6)
    .map(([k, v]) => `${k}=${summarize(v)}`)
    .join('; ') || (r.error ? `ERR: ${r.error}` : '(empty)');
  console.log(`| \`${r.id}\` | ${r.collectionType || '?'} | ${r.count ?? '?'} | ${fields} | ${sampleStr} |`);
}
