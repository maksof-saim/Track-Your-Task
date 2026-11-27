import nodemailer from "nodemailer";
import { RESET_TOKEN_TTL_MS } from "@/lib/password-reset";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { buildResetEmailHtml } from "@/lib/emailTemplate";

type ResetEmail = { to: string; name: string; resetUrl: string; locale?: Locale };

const APP_NAME = "Track Your Amaal";

export async function sendPasswordResetEmail({ to, name, resetUrl, locale }: ResetEmail) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Password reset email not sent: GMAIL_USER or GMAIL_APP_PASSWORD is missing");
    return false;
  }

  const copy = getDictionary(isLocale(locale) ? locale : "en").email.reset;
  const ttl = copy.ttl(RESET_TOKEN_TTL_MS);

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
    subject: copy.subject,
    text: [
      copy.greeting(name),
      "",
      ...copy.textBody(ttl),
      "",
      resetUrl,
      "",
      copy.textFooter,
      "",
      APP_NAME,
    ].join("\n"),
    html: buildResetEmailHtml({ copy, name, resetUrl, ttl }),
  });

  return true;
}
