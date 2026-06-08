import { NextResponse } from 'next/server';
import { getAdminClient } from '@app/lib/profvote/wix';
import { REVIEW_COLLECTION } from '@app/lib/profvote/universities';
import type { UniversitySlug } from '@app/lib/profvote/types';

export const runtime = 'nodejs';

// Called daily at 03:00 UTC by Vercel Cron (vercel.json)
// Deletes unverified reviews where deleteAfter < now
export async function GET(req: Request) {
  // Protect endpoint: only Vercel Cron or internal calls allowed
  const authHeader = req.headers.get('authorization');
  if (
    process.env.NODE_ENV === 'production' &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const wix = getAdminClient();
  const now = new Date().toISOString();
  const unis: UniversitySlug[] = ['stuttgart', 'kit', 'tum'];
  let totalDeleted = 0;

  for (const uni of unis) {
    const collection = REVIEW_COLLECTION[uni];
    if (!collection) continue;

    try {
      // Query unverified reviews past their deleteAfter date
      const res = await wix.items
        .query(collection)
        .eq('verified', false)
        .lt('deleteAfter', now)
        .limit(100)
        .find();

      for (const item of res.items as { _id?: string }[]) {
        if (item._id) {
          await wix.items.remove(collection, item._id);
          totalDeleted++;
        }
      }
    } catch (e) {
      console.error(`Cleanup failed for ${uni}:`, e);
    }
  }

  console.log(`Cleanup: deleted ${totalDeleted} expired unverified reviews`);
  return NextResponse.json({ ok: true, deleted: totalDeleted, ran: now });
}
