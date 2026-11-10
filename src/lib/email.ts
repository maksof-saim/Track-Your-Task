import nodemailer from "nodemailer";
import { RESET_TOKEN_TTL_MS } from "@/lib/password-reset";

type ResetEmail = { to: string; name: string; resetUrl: string };

const APP_NAME = "Track Your Amaal";
const TAGLINE = "Amaal Tracker";

const COLORS = {
  emerald: "#0b5d4b",
  emeraldDark: "#084538",
  gold: "#b8963e",
  goldLight: "#e3cf9a",
  cream: "#f6f3ea",
  text: "#23302c",
  muted: "#66726d",
};

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatTtl(ms: number) {
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes >= 60 && minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${minutes} minutes`;
}

function getBaseUrl() {
  return (process.env.APP_URL ?? "https://track-your-amaal.vercel.app").replace(/\/+$/, "");
}

function buildHtml(name: string, resetUrl: string) {
  const safeName = escapeHtml(name || "there");
  const safeUrl = escapeHtml(resetUrl);
  const logoUrl = `${getBaseUrl()}/email-logo.png`;
  const ttl = formatTtl(RESET_TOKEN_TTL_MS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Reset your ${APP_NAME} password. This link is valid for ${ttl}.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="${COLORS.cream}" style="background-color:${COLORS.cream};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;">

          <!-- Header -->
          <tr>
            <td align="center" bgcolor="${COLORS.emerald}" style="background-color:${COLORS.emerald};border-radius:12px 12px 0 0;padding:28px 24px 22px 24px;">
              <div style="font-family:${SERIF};font-size:20px;line-height:30px;color:${COLORS.goldLight};padding-bottom:14px;" dir="rtl">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </div>
              <img src="${logoUrl}" width="56" height="56" alt="${APP_NAME}" style="display:block;margin:0 auto 12px auto;border:0;border-radius:12px;">
              <div style="font-family:${SERIF};font-size:24px;line-height:30px;font-weight:bold;color:#ffffff;">
                ${APP_NAME}
              </div>
              <div style="font-family:${SANS};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${COLORS.goldLight};padding-top:4px;">
                ${TAGLINE}
              </div>
            </td>
          </tr>
          <tr>
            <td height="4" bgcolor="${COLORS.gold}" style="background-color:${COLORS.gold};font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:32px 32px 8px 32px;font-family:${SANS};font-size:15px;line-height:25px;color:${COLORS.text};">
              <h1 style="margin:0 0 16px 0;font-family:${SERIF};font-size:22px;line-height:30px;color:${COLORS.emeraldDark};">Reset your password</h1>
              <p style="margin:0 0 14px 0;">Assalam-o-alaikum ${safeName},</p>
              <p style="margin:0 0 24px 0;">We received a request to reset the password for your ${APP_NAME} account. Click the button below to choose a new password. This link is valid for <strong>${ttl}</strong>.</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td bgcolor="#ffffff" align="center" style="background-color:#ffffff;padding:0 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="${COLORS.emerald}" style="background-color:${COLORS.emerald};border-radius:8px;border-bottom:3px solid ${COLORS.gold};">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 36px;font-family:${SANS};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">Reset Password</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 32px 28px 32px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLORS.muted};">
              <p style="margin:0 0 6px 0;">Button kaam na kare to ye link browser mein paste karein:</p>
              <p style="margin:0;word-break:break-all;"><a href="${safeUrl}" style="color:${COLORS.emerald};">${safeUrl}</a></p>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="${COLORS.cream}" style="background-color:${COLORS.cream};border-left:4px solid ${COLORS.gold};padding:14px 16px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLORS.text};">
                    If you did not request this, you can safely ignore this email. Your password will not change. Never share this link with anyone.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="${COLORS.emeraldDark}" style="background-color:${COLORS.emeraldDark};border-radius:0 0 12px 12px;padding:20px 24px;font-family:${SANS};font-size:12px;line-height:18px;color:${COLORS.goldLight};">
              ${APP_NAME} &middot; Track your daily prayers and zikr<br>
              This is an automated message, please do not reply.
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

  const ttl = formatTtl(RESET_TOKEN_TTL_MS);

  await transporter.sendMail({
    from: `"${APP_NAME}" <${user}>`,
    replyTo: user,
    to,
    subject: `Reset your ${APP_NAME} password`,
    text: [
      `Assalam-o-alaikum ${name || "there"},`,
      "",
      `We received a request to reset the password for your ${APP_NAME} account.`,
      `Use the link below to choose a new password (valid for ${ttl}):`,
      "",
      resetUrl,
      "",
      "If you did not request this, you can safely ignore this email. Your password will not change.",
      "",
      APP_NAME,
    ].join("\n"),
    html: buildHtml(name, resetUrl),
  });

  return true;
}