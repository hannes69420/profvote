import { Resend } from 'resend';

let cached: Resend | null = null;
function client() {
  if (!cached) {
    if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY missing');
    cached = new Resend(process.env.RESEND_API_KEY);
  }
  return cached;
}

const FROM = process.env.RESEND_FROM || 'ProfVote <onboarding@resend.dev>';

export async function sendVerificationEmail(opts: {
  to: string;
  professorName: string;
  verifyUrl: string;
}) {
  const { to, professorName, verifyUrl } = opts;
  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;background:#f5f5f7;margin:0;padding:32px;color:#1d1d1f">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;padding:40px">
      <tr><td>
        <h1 style="font-size:24px;font-weight:600;letter-spacing:-0.02em;margin:0 0 16px">Bewertung bestätigen</h1>
        <p style="font-size:16px;line-height:1.5;color:#1d1d1f;margin:0 0 16px">
          Du hast eine Bewertung für <strong>${escapeHtml(professorName)}</strong> auf ProfVote abgegeben.
          Klick zur Bestätigung auf den Button — sonst wird die Bewertung nach 3 Tagen automatisch gelöscht.
        </p>
        <p style="margin:32px 0">
          <a href="${verifyUrl}" style="display:inline-block;background:#1d1d1f;color:#fff;text-decoration:none;padding:14px 24px;border-radius:999px;font-size:14px;font-weight:500">Bewertung bestätigen</a>
        </p>
        <p style="font-size:13px;line-height:1.5;color:#6e6e73;margin:0 0 8px">
          Oder kopier diesen Link in den Browser:
        </p>
        <p style="font-size:13px;word-break:break-all;color:#0071e3;margin:0 0 32px">${verifyUrl}</p>
        <hr style="border:none;border-top:1px solid #d2d2d7;margin:24px 0">
        <p style="font-size:12px;color:#6e6e73;margin:0">
          Wenn du keine Bewertung abgegeben hast, ignorier diese Mail einfach.
        </p>
      </td></tr>
    </table>
  </body></html>`;

  const text = `Bewertung bestätigen\n\nDu hast eine Bewertung für ${professorName} auf ProfVote abgegeben. Bestätige sie hier:\n${verifyUrl}\n\nUnbestätigte Bewertungen werden nach 3 Tagen gelöscht.`;

  const res = await client().emails.send({
    from: FROM,
    to,
    subject: `Bewertung für ${professorName} bestätigen`,
    html,
    text,
  });
  if (res.error) {
    throw new Error(`Resend: ${res.error.name} — ${res.error.message}`);
  }
  return res.data;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
