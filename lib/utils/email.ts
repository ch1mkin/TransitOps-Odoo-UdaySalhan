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

interface EmailTemplateInput {
  heading: string;
  intro: string;
  highlightHtml?: string;
  footerNote?: string;
  previewText?: string;
}

export function buildTransitOpsEmailTemplate(input: EmailTemplateInput) {
  const preview = input.previewText ?? input.intro;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${input.heading}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;color:#111827;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preview}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#2563EB 0%,#0EA5E9 55%,#14B8A6 100%);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="display:inline-block;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,0.18);text-align:center;line-height:42px;font-size:22px;">🚚</div>
                    </td>
                    <td style="padding-left:12px;">
                      <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.82);">TransitOps</p>
                      <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#ffffff;">${input.heading}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#374151;">${input.intro}</p>
                ${
                  input.highlightHtml
                    ? `<div style="margin:0 0 20px;padding:20px;border-radius:16px;background:linear-gradient(180deg,#f8fafc 0%,#eff6ff 100%);border:1px solid #dbeafe;text-align:center;">${input.highlightHtml}</div>`
                    : ""
                }
                <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${
                  input.footerNote ??
                  "If you did not request this email, you can safely ignore it."
                }</p>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px 24px;border-top:1px solid #f3f4f6;background:#fafafa;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#9ca3af;text-align:center;">
                  TransitOps · Smart Transport Operations
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
  const actionLabel = input.purpose === "login" ? "sign in" : "complete your registration";

  return sendTransactionalEmail({
    to: input.to,
    subject: `TransitOps verification code: ${input.code}`,
    html: buildTransitOpsEmailTemplate({
      heading: "Verification code",
      previewText: `Your TransitOps code is ${input.code}`,
      intro: `Use the code below to ${actionLabel}. For your security, it expires in <strong>10 minutes</strong>.`,
      highlightHtml: `
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#2563EB;">Your code</p>
        <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#0f172a;">${input.code}</p>
      `,
      footerNote:
        "Never share this code with anyone. TransitOps will never ask for it by phone or chat.",
    }),
  });
}

export async function sendLicenseReminderEmail(input: {
  to: string;
  subject: string;
  message: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: input.subject,
    html: buildTransitOpsEmailTemplate({
      heading: "License reminder",
      previewText: input.message,
      intro: input.message,
      highlightHtml: `
        <p style="margin:0;font-size:14px;line-height:1.6;color:#1e3a8a;">
          Please renew the license and update the driver record in TransitOps as soon as possible.
        </p>
      `,
      footerNote:
        "This reminder was sent by TransitOps fleet compliance monitoring.",
    }),
  });
}

export async function sendDriverRegistrationThanksEmail(input: {
  to: string;
  name: string;
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: "Thank you for submitting your driver information",
    html: buildTransitOpsEmailTemplate({
      heading: "Submission received",
      previewText: "Your driver information was submitted successfully.",
      intro: `Hi <strong>${input.name}</strong>, thank you for submitting your driver information to TransitOps.`,
      highlightHtml: `
        <p style="margin:0;font-size:15px;line-height:1.7;color:#1e3a8a;">
          Our safety team will review your details and documents. You will be contacted once your profile is approved.
        </p>
      `,
      footerNote:
        "If you did not submit this registration, please contact your fleet operator.",
    }),
  });
}
