// Email via Brevo Transactional API (no SDK — plain fetch)

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

function getConfig() {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error('BREVO_API_KEY missing');
  return {
    key,
    fromName: process.env.BREVO_FROM_NAME || 'ProfVote',
    fromEmail: process.env.BREVO_FROM_EMAIL || 'verification@profvote.de',
  };
}

export async function sendVerificationEmail(opts: {
  to: string;
  professorName: string;
  verifyUrl: string;
}) {
  const { to, professorName, verifyUrl } = opts;
  const { key, fromName, fromEmail } = getConfig();

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

  const body = {
    sender: { name: fromName, email: fromEmail },
    to: [{ email: to }],
    subject: `Bewertung für ${professorName} bestätigen`,
    htmlContent: html,
    textContent: text,
  };

  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': key,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Brevo error ${res.status}: ${(err as { message?: string }).message || res.statusText}`,
    );
  }

  return res.json();
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
