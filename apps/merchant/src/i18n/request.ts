import { getRequestConfig } from "next-intl/server";
import { client } from "../lib/sanity/client";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const locale = "en";
  const messages = {};

  const publicPages = await client.fetch('*[_type == "publicPages"]');
  publicPages.forEach((page: any) => {});

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
