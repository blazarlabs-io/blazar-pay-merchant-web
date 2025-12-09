import axios from "axios";
import { Timestamp } from "firebase/firestore";
import { initAdmin } from "@/lib/firebase/admin";
import { validateJsonBody, isValidEmail } from "@/lib/validation/http";

export async function POST(req: Request) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ message: "Only POST requests allowed" }),
      { status: 405 },
    );
  }

  // Validate JSON body
  const bodyResult = await validateJsonBody(req);
  if (!bodyResult.ok) {
    return new Response(JSON.stringify({ error: bodyResult.error }), {
      status: 400,
    });
  }

  const { uid, email, isMerchant } = bodyResult.body;

  // Validate required fields
  if (!uid || typeof uid !== "string" || !uid.trim()) {
    return new Response(JSON.stringify({ error: "Invalid or missing uid" }), {
      status: 400,
    });
  }

  if (!email || typeof email !== "string" || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "Invalid or missing email" }), {
      status: 400,
    });
  }

  if (typeof isMerchant !== "boolean") {
    return new Response(
      JSON.stringify({ error: "isMerchant must be a boolean" }),
      { status: 400 },
    );
  }

  try {
    const app = await initAdmin();
    const db = app.firestore();
    const collection = isMerchant ? "merchants" : "users";
    const res = db
      .collection(collection)
      .doc(uid)
      .set({
        createdAt: Timestamp.fromDate(new Date()),
        lastUpdated: Timestamp.fromDate(new Date()),
        uid,
        email,
      });

    console.log(res);
  } catch (error) {
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
