import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import fs from 'node:fs';

for (const line of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const wix = createClient({
  modules: { items },
  auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID }),
});
const tokens = await wix.auth.generateVisitorTokens();
wix.auth.setTokens(tokens);

const name = process.argv[2] || 'Professors';
try {
  const r = await wix.items.query(name).limit(1).find();
  console.log('OK', name, 'count=', r.items?.length, 'total=', r.totalCount);
  console.log(JSON.stringify(r.items?.[0] || {}, null, 2));
} catch (e) {
  console.log('ERR for', name);
  console.log(JSON.stringify(e, null, 2));
}
