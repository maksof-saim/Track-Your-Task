import type { Dictionary } from "@/lib/i18n/en";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type ResetCopy = Dictionary["email"]["reset"];

type ResetEmailContent = {
  copy: ResetCopy;
  name: string;
  resetUrl: string;
  ttl: string;
};

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

/** The reset email's copy and its "valid for" text, in the account's language. */
export function getResetEmailCopy(locale?: string) {
  const copy = getDictionary(isLocale(locale) ? locale : "en").email.reset;
  return { copy, ttl: copy.ttl(RESET_TOKEN_TTL_MS) };
}

export function buildResetEmailText({ copy, name, resetUrl, ttl }: ResetEmailContent) {
  return [
    copy.greeting(name),
    "",
    ...copy.textBody(ttl),
    "",
    resetUrl,
    "",
    copy.textFooter,
    "",
    SITE_NAME,
  ].join("\n");
}

export function buildResetEmailHtml({ copy, name, resetUrl, ttl }: ResetEmailContent) {
  const safeUrl = escapeHtml(resetUrl);
  const logoUrl = `${SITE_URL}/email-logo.png`;
  const align = copy.dir === "rtl" ? "text-align:right;" : "";
  const noteEdge = copy.dir === "rtl" ? "right" : "left";

  return `<!DOCTYPE html>
<html lang="${copy.lang}" dir="${copy.dir}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(copy.subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.cream};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(copy.preview(ttl))}
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
              <img src="${logoUrl}" width="56" height="56" alt="${SITE_NAME}" style="display:block;margin:0 auto 12px auto;border:0;border-radius:12px;">
              <div style="font-family:${SERIF};font-size:24px;line-height:30px;font-weight:bold;color:#ffffff;">
                ${SITE_NAME}
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
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:32px 32px 8px 32px;font-family:${SANS};font-size:15px;line-height:25px;color:${COLORS.text};${align}">
              <h1 style="margin:0 0 16px 0;font-family:${SERIF};font-size:22px;line-height:30px;color:${COLORS.emeraldDark};">${escapeHtml(copy.heading)}</h1>
              <p style="margin:0 0 14px 0;">${escapeHtml(copy.greeting(name))}</p>
              <p style="margin:0 0 24px 0;">${escapeHtml(copy.intro(ttl))}</p>
            </td>
          </tr>

          <!-- Button -->
          <tr>
            <td bgcolor="#ffffff" align="center" style="background-color:#ffffff;padding:0 32px 28px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" bgcolor="${COLORS.emerald}" style="background-color:${COLORS.emerald};border-radius:8px;border-bottom:3px solid ${COLORS.gold};">
                    <a href="${safeUrl}" style="display:inline-block;padding:14px 36px;font-family:${SANS};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;">${escapeHtml(copy.button)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Fallback link -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 32px 28px 32px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLORS.muted};${align}">
              <p style="margin:0 0 6px 0;">${escapeHtml(copy.fallbackHint)}</p>
              <p style="margin:0;word-break:break-all;"><a href="${safeUrl}" style="color:${COLORS.emerald};">${safeUrl}</a></p>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:0 32px 32px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td bgcolor="${COLORS.cream}" style="background-color:${COLORS.cream};border-${noteEdge}:4px solid ${COLORS.gold};padding:14px 16px;font-family:${SANS};font-size:13px;line-height:20px;color:${COLORS.text};${align}">
                    ${escapeHtml(copy.securityNote)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" bgcolor="${COLORS.emeraldDark}" style="background-color:${COLORS.emeraldDark};border-radius:0 0 12px 12px;padding:20px 24px;font-family:${SANS};font-size:12px;line-height:18px;color:${COLORS.goldLight};">
              ${SITE_NAME} &middot; ${escapeHtml(copy.footerTagline)}<br>
              ${escapeHtml(copy.footerNote)}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
