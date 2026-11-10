import nodemailer from "nodemailer";

type ResetEmail = { to: string; name: string; resetUrl: string };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

  const safeName = escapeHtml(name || "");

  await transporter.sendMail({
    from: `"Track Your Amaal" <${user}>`,
    to,
    subject: "Password reset - Track Your Amaal",
    text: `Assalam-o-alaikum ${name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link will expire soon. If you did not request this, you can ignore this email.`,
    html: `
      <p>Assalam-o-alaikum ${safeName},</p>
      <p>Click the button below to reset your password:</p>
      <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a></p>
      <p>This link will expire soon. If you did not request this, you can ignore this email.</p>
    `,
  });

  return true;
}