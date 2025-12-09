import "server-only";
import * as sgMail from "@sendgrid/mail";
import { ActionCodeSettings } from "firebase-admin/auth";
import { emailTemplates } from "@/data/email-templates";
import { env } from "@/lib/env";
import { getAdminAuth, initAdmin } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  await initAdmin();
  const auth = getAdminAuth();

  const data = await request.json();

  sgMail.setApiKey(env.SENDGRID_API_KEY);

  const baseUrl = env.APP_URL + "/confirm-email";

  const actionCodeSettings: ActionCodeSettings = {
    url: baseUrl,
    handleCodeInApp: true,
  };

  const url = await auth.generateEmailVerificationLink(
    data.email as string,
    actionCodeSettings,
  );

  const params = url.split("?")[1];
  const verificationUrl = `${baseUrl}?${params}`;

  const msg: sgMail.MailDataRequired = {
    to: data.email,
    from: env.TRACECORK_EMAIL, // Use the email address or domain you verified above
    templateId: emailTemplates["confirmation-email"],
    personalizations: [
      {
        to: [{ email: data.email }],
        dynamicTemplateData: {
          verificationUrl,
        },
      },
    ],
  };

  await sgMail.send(msg);

  return Response.json({
    success: true,
  });
}
