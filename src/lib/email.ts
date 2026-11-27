import nodemailer from "nodemailer";
import {
  buildResetEmailHtml,
  buildResetEmailText,
  getResetEmailCopy,
} from "@/lib/emailTemplate";
import { SITE_NAME } from "@/lib/site";

type ResetEmail = { to: string; name: string; resetUrl: string; locale?: string };

export async function sendPasswordResetEmail({ to, name, resetUrl, locale }: ResetEmail) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    console.warn("Password reset email not sent: GMAIL_USER or GMAIL_APP_PASSWORD is missing");
    return false;
  }

  const { copy, ttl } = getResetEmailCopy(locale);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user, pass },
  });

  await transporter.sendMail({
    from: `"${SITE_NAME}" <${user}>`,
    replyTo: user,
    to,
    subject: copy.subject,
    text: buildResetEmailText({ copy, name, resetUrl, ttl }),
    html: buildResetEmailHtml({ copy, name, resetUrl, ttl }),
  });

  return true;
}
