import type { Metadata } from "next";
import { headers } from "next/headers";
import { Providers } from "../context/providers";
import "@repo/ui/globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "../context/theme-provider";
import { Toaster } from "@repo/ui/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Hydrapay by Blazar Labs",
  description: "Trusted solutions for merchants worldwide.",
  openGraph: {
    title: "Hydrapay by Blazar Labs",
    description: "Trusted solutions for merchants worldwide.",
    url: "https://blazarlabs.io/",
    siteName: "blazarlabs.io",
    images: [
      {
        url: "https://tracecork.com/og.png",
        width: 1080,
        height: 1080,
      },
    ],
    locale: "en-US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tracecork by Blazar Labs",
    description: "Trusted solutions for wine producers worldwide.",
    images: ["https://tracecork.com/og.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Nonce from middleware (available if you need to use next/script with inline code).
  // If you don't use next/script right now, this still helps ensure dynamic rendering.
  const h = await headers();
  const nonce = h.get("x-nonce") ?? undefined;

  <Script
    src="https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit"
    strategy="afterInteractive"
    nonce={nonce}
  />

  return (
    <html lang={locale} suppressHydrationWarning>
      <body suppressHydrationWarning data-csp-nonce={nonce}>
        <ThemeProvider
          nonce={nonce}
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <Toaster />
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
