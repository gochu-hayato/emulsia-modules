export function inviteEmailTemplate(orgName: string, inviteUrl: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${orgName} への招待</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
          <tr>
            <td style="background:#1a56db;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;">Emulsia</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${orgName} に招待されました</h2>
              <p style="margin:0 0 24px;color:#374151;line-height:1.6;">
                以下のボタンをクリックして招待を受諾し、アカウントを作成してください。<br />
                このリンクは72時間有効です。
              </p>
              <a href="${inviteUrl}"
                 style="display:inline-block;padding:12px 28px;background:#1a56db;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">
                招待を受諾する
              </a>
              <p style="margin:32px 0 0;font-size:13px;color:#6b7280;">
                ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください。<br />
                <a href="${inviteUrl}" style="color:#1a56db;">${inviteUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                このメールに心当たりがない場合は、無視してください。
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
