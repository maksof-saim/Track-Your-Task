import nodemailer from "nodemailer";

type ResetEmail = { to: string; name: string; resetUrl: string };

const APP_NAME = "Track Your Amaal";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(name: string, resetUrl: string) {
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(resetUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Use this link to reset your ${APP_NAME} password.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:10px;border:1px solid #e3e8e6;">
          <tr>
            <td style="padding:28px 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#0f5f52;">
              ${APP_NAME}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 0 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#222222;">
              <p style="margin:0 0 16px 0;">Assalam-o-alaikum ${safeName},</p>
              <p style="margin:0 0 20px 0;">We received a request to reset the password for your ${APP_NAME} account. Click the button below to choose a new password. This link is valid for a limited time.</p>
            </td>
          </tr>
          <tr>
            <td align="left" style="padding:0 32px 24px 32px;">
              <a href="${safeUrl}" style="display:inline-block;background-color:#0f766e;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:6px;">Reset Password</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 8px 32px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#555555;">
              <p style="margin:0 0 8px 0;">If the button does not work, copy and paste this link into your browser:</p>
              <p style="margin:0 0 20px 0;word-break:break-all;"><a href="${safeUrl}" style="color:#0f766e;">${safeUrl}</a></p>
              <p style="margin:0 0 4px 0;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#888888;border-top:1px solid #eef1ef;">
              This is an automated message from ${APP_NAME}. Please do not share this link with anyone.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendPasswordResetEmail({ to, name, resetUrl }: ResetEmail) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Password reset email not sent: GMAIL_USER or GMAIL_APP_PASSWORD is missing");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${APP_NAME}" <${user}>`,
    replyTo: user,
    to,
    subject: `Reset your ${APP_NAME} password`,
    text: [
      `Assalam-o-alaikum ${name || "there"},`,
      "",
      `We received a request to reset the password for your ${APP_NAME} account.`,
      "Use the link below to choose a new password (valid for a limited time):",
      "",
      resetUrl,
      "",
      "If you did not request a password reset, you can safely ignore this email. Your password will not change.",
      "",
      `${APP_NAME}`,
    ].join("\n"),
    html: buildHtml(name, resetUrl),
  });

  return true;
}