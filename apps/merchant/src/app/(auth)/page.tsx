import { redirect } from "next/navigation";

// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = "force-dynamic";

export default function AuthPage() {
  redirect("/login");
}
