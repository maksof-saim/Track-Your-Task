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
      subject: "Password reset — Track Your Task",
      text: `Assalam-o-alaikum ${name},\n\nApna password reset karne ke liye is link par click karein:\n${resetUrl}\n\nYe link 1 ghante tak valid hai aur sirf ek martaba use ho sakta hai. Agar aap ne request nahi ki to is email ko ignore karein.`,
      html: `<p>Assalam-o-alaikum ${name},</p><p>Apna password reset karne ke liye neeche button par click karein:</p><p><a href="${resetUrl}" style="background:#0f6b48;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block">Password reset karein</a></p><p>Ye link 1 ghante tak valid hai aur sirf ek martaba use ho sakta hai. Agar aap ne request nahi ki to is email ko ignore karein.</p>`,
    }),
  });

  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return true;
}
