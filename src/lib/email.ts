type ResetEmail = { to: string; name: string; resetUrl: string };

export async function sendPasswordResetEmail({ to, name, resetUrl }: ResetEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn("Password reset email not sent: RESEND_API_KEY or EMAIL_FROM is missing");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Password reset — Track Your Amaal",
      text: `Assalam-o-alaikum ${name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour and can only be used once. If you did not request this, please ignore this email.`,
      html: `<p>Assalam-o-alaikum ${name},</p><p>Click the button below to reset your password:</p><p><a href="${resetUrl}" style="background:#0f6b48;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block">Reset Password</a></p><p>This link is valid for 1 hour and can only be used once. If you did not request this, please ignore this email.</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}
