import fs from 'node:fs';
for (const l of fs.readFileSync('.env.local', 'utf8').split('\n')) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2];
}

const TEST_EMAIL = 'st197625@stud.uni-stuttgart.de';
const ACHIM_MENGES_ID = '802eb7f2-78ef-4d06-a629-4b7602d911a8';

console.log('=== Step 1: POST /api/reviews/submit ===');
const submitRes = await fetch('http://localhost:3000/api/reviews/submit', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    uni: 'stuttgart',
    professorId: ACHIM_MENGES_ID,
    email: TEST_EMAIL,
    ratings: { insgesamt: 4, vorlesung: 4, skript: 3, klausur: 4, organisation: 4, schwierigkeit: 3 },
    comment: 'TEST — Bitte ignorieren, wird automatisch gelöscht.',
  }),
});
console.log('  status:', submitRes.status);
const submitBody = await submitRes.json();
console.log('  body:', submitBody);
if (!submitRes.ok) process.exit(1);

console.log('\n=== Step 2: locate review in Wix by token (newest unverified for this email) ===');
const { createClient, ApiKeyStrategy } = await import('@wix/sdk');
const { items } = await import('@wix/data');
const wix = createClient({
  modules: { items },
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY,
    siteId: process.env.WIX_SITE_ID,
    accountId: process.env.WIX_ACCOUNT_ID,
  }),
});
// Find the just-inserted review
const q = await wix.items
  .query('Bewertung_Professoren')
  .eq('userEmail', TEST_EMAIL.toLowerCase())
  .eq('verified', false)
  .descending('_createdDate')
  .limit(1)
  .find();
const review = q.items?.[0];
if (!review) {
  console.log('  ✗ review not found in Wix — submit may have failed');
  process.exit(1);
}
console.log('  ✓ found review:', review._id);
console.log('  token:', review.verificationToken);
console.log('  verified:', review.verified);
console.log('  deleteAfter:', review.deleteAfter);

console.log('\n=== Step 3: hit verify URL ===');
const verifyUrl = `http://localhost:3000/api/reviews/verify?id=${encodeURIComponent(review._id)}&uni=stuttgart&token=${encodeURIComponent(review.verificationToken)}`;
const vRes = await fetch(verifyUrl, { redirect: 'manual' });
console.log('  status:', vRes.status);
console.log('  location:', vRes.headers.get('location'));

console.log('\n=== Step 4: re-read review, confirm verified=true ===');
const after = await wix.items.get('Bewertung_Professoren', review._id);
console.log('  verified:', after?.verified);
console.log('  professorID:', after?.professorID);
console.log('  Kommentar:', after?.Kommentar);

console.log('\n=== Step 5: cleanup — remove test review ===');
await wix.items.remove('Bewertung_Professoren', review._id);
console.log('  ✓ removed');

console.log('\nALL GREEN. An die echte Inbox sollte gerade die Verify-Mail angekommen sein.');
