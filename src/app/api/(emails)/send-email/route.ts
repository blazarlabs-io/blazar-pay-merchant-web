import "server-only";
import * as sgMail from "@sendgrid/mail";
import { env } from "@/lib/env";
import { validateJsonBody, isValidEmail } from "@/lib/validation/http";

export async function POST(request: Request) {
  // Validate JSON body
  const bodyResult = await validateJsonBody(request);
  if (!bodyResult.ok) {
    return Response.json({ error: bodyResult.error }, { status: 400 });
  }

  const data = bodyResult.body;

  // Validate required fields
  if (!data.to || typeof data.to !== 'string' || !isValidEmail(data.to)) {
    return Response.json({ error: "Invalid or missing 'to' email" }, { status: 400 });
  }

  if (!data.templateId || typeof data.templateId !== 'string' || !data.templateId.trim()) {
    return Response.json({ error: "Invalid or missing templateId" }, { status: 400 });
  }

  sgMail.setApiKey(env.SENDGRID_API_KEY);

  let msg: sgMail.MailDataRequired = {
    to: data.to,
    from: env.TRACECORK_EMAIL, // Use the email address or domain you verified above
    templateId: data.templateId,
  };

  if (data.attachments !== undefined) {
    msg = {
      ...msg,
      personalizations: [
        {
          to: [{ email: data.to }],
          dynamicTemplateData: data.dynamicTemplateData,
        },
      ],
      attachments: data.attachments,
    };
  } else {
    msg = {
      ...msg,
      personalizations: [
        {
          to: [{ email: data.to }],
          dynamicTemplateData: data.dynamicTemplateData,
        },
      ],
    };
  }

  await sgMail.send(msg);

  return Response.json({
    success: true,
  });
}
