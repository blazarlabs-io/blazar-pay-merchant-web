import type { Metadata } from "next";
import { AuthLayout } from "@/components/layouts/auth-layout";

export const metadata: Metadata = {
  title: "Hydra",
  description: "Trusted transactions for Solana users.",
};

export default function AuthRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthLayout>{children}</AuthLayout>;
}
