import { LoginPage } from "@/features/authentication";

// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = "force-dynamic";

export default function Login() {
  return <LoginPage />;
}
