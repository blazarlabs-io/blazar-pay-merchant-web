import "server-only";
import * as sgMail from "@sendgrid/mail";
import { emailTemplates } from "@/utils/";
import { ActionCodeSettings } from "firebase-admin/auth";
import { env } from "@/lib/env";
import { getAdminAuth, initAdmin } from "@/lib/firebase/admin";
import { validateJsonBody, isValidEmail } from "@/lib/validation/http";

export async function POST(request: Request) {
  // Validate JSON body
  const bodyResult = await validateJsonBody(request);
  if (!bodyResult.ok) {
    return Response.json({ error: bodyResult.error }, { status: 400 });
  }

  const { email } = bodyResult.body;

  // Validate email
  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return Response.json(
      { error: "Invalid or missing email" },
      { status: 400 },
    );
  }

  await initAdmin();
  const auth = getAdminAuth();

  sgMail.setApiKey(env.SENDGRID_API_KEY);

  const baseUrl = env.APP_URL + "/password-reset";

  const actionCodeSettings: ActionCodeSettings = {
    url: baseUrl,
    handleCodeInApp: true,
  };

  const url = await auth.generatePasswordResetLink(email, actionCodeSettings);

  const params = url.split("?")[1];
  const recoveryLink = `${baseUrl}?${params}`;

  const msg: sgMail.MailDataRequired = {
    to: email,
    from: env.TRACECORK_EMAIL, // Use the email address or domain you verified above
    templateId: emailTemplates["password-recovery"],
    personalizations: [
      {
        to: [{ email: email }],
        dynamicTemplateData: {
          recoveryLink,
        },
      },
    ],
  };

  await sgMail.send(msg);

  return Response.json({
    success: true,
  });
}
