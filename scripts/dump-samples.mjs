import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import fs from 'node:fs';
for (const l of fs.readFileSync('.env.local','utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}
const wix = createClient({ modules:{items}, auth: ApiKeyStrategy({apiKey:process.env.WIX_API_KEY, siteId:process.env.WIX_SITE_ID, accountId:process.env.WIX_ACCOUNT_ID})});
for (const id of ['Import1','Import2','Import3','Bewertung_Professoren','BewertungProfessorenKIT','TUProfessorenBewertung','Universitaten']) {
  console.log('\n===',id,'===');
  try {
    const r = await wix.items.query(id).limit(2).find();
    for (const item of r.items) console.log(JSON.stringify(item, null, 2));
  } catch (e) { console.log('ERR', e?.message); }
}
