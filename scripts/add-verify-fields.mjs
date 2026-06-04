import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { collections } from '@wix/data';
import fs from 'node:fs';

for (const l of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const wix = createClient({
  modules: { collections },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY,
    siteId: process.env.WIX_SITE_ID,
    accountId: process.env.WIX_ACCOUNT_ID,
  }),
});

const FIELDS_TO_ADD = [
  { key: 'userEmail', displayName: 'Email', type: 'TEXT' },
  { key: 'verified', displayName: 'Verified', type: 'BOOLEAN' },
  { key: 'verificationToken', displayName: 'Verification token', type: 'TEXT' },
  { key: 'deleteAfter', displayName: 'Delete after', type: 'DATETIME' },
];

const TARGETS = ['BewertungProfessorenKIT', 'TUProfessorenBewertung'];

for (const target of TARGETS) {
  console.log(`\n=== ${target} ===`);
  const existing = await wix.collections.getDataCollection(target);
  const existingKeys = new Set((existing.fields || []).map((f) => f.key));

  for (const field of FIELDS_TO_ADD) {
    if (existingKeys.has(field.key)) {
      console.log(`  · ${field.key}: already present`);
      continue;
    }
    try {
      await wix.collections.createDataCollectionField(target, { field });
      console.log(`  + ${field.key}: created (${field.type})`);
    } catch (e) {
      console.log(`  ! ${field.key}: ${e?.message || JSON.stringify(e?.details || e)}`);
    }
  }
}
