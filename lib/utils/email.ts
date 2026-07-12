interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

interface SendOtpEmailInput {
  to: string;
  code: string;
  purpose: "login" | "register";
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { sent: false as const, reason: "Email service not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { sent: false as const, reason: body || "Email delivery failed." };
  }

  return { sent: true as const };
}

export async function sendOtpEmail(input: SendOtpEmailInput) {
  const actionLabel = input.purpose === "login" ? "sign in" : "registration";

  return sendTransactionalEmail({
    to: input.to,
    subject: `TransitOps verification code: ${input.code}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827">
        <p>Use this code to ${actionLabel} to TransitOps:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;margin:16px 0">${input.code}</p>
        <p style="color:#6b7280;font-size:14px">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });
}
