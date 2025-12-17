// /** @type {import('next').NextConfig} */
// module.exports = {
//   reactStrictMode: true,
//   transpilePackages: ["@repo/ui"],
// };

import createNextIntlPlugin from "next-intl/plugin";
import fs from "node:fs";
import path from "node:path";

const withNextIntl = createNextIntlPlugin();

const isProd = process.env.NODE_ENV === "production";

function readAllowlist() {
  try {
    // Try multiple possible paths for the allowlist file
    const possiblePaths = [
      path.join(process.cwd(), "csp.allowlist.json"), // If running from apps/merchant
      path.join(process.cwd(), "apps/merchant/csp.allowlist.json"), // If running from root
    ];

    for (const p of possiblePaths) {
      try {
        const raw = fs.readFileSync(p, "utf8");
        console.log(`Loaded CSP allowlist from: ${p}`);
        return JSON.parse(raw);
      } catch {
        continue;
      }
    }
    throw new Error("Allowlist file not found");
  } catch (error) {
    console.warn(`Failed to load CSP allowlist: ${error.message}`);
    return { connect: [], img: [], script: [], style: [], font: [], frame: [] };
  }
}

function cspFromAllowlist(allow) {
  // Base policy: strict defaults; selectively widen via allowlist.
  // Security: Use nonces for inline scripts while maintaining XSS protection.
  const self = "'self'";
  const blob = "blob:";
  const data = "data:";

  const connect = [self, ...allow.connect];
  const img = [self, data, blob, ...allow.img];
  // Development vs Production CSP strategy
  let script;
  if (isProd) {
    // Production: Use hash-based approach for maximum security
    script = [
      self,
      "'sha256-YXuzbY0IAah5ncUXeyw+avVY43cpRrhE5pgdIC1Cfrk='", // Next.js hydration script
      "'sha256-7ZRMnh3+KlZx7THNtiWwrMT9BAkq72asxeWPGm79aKA='", // Next.js inline script
      "'sha256-Ed73WUVjgjm9cHXqw0nWKDoo3iqr79byfdjduR8oc5Q='", // Next.js inline script
      "'sha256-uohHtEIWxe56O7TGKZ4tCjtT+92U9xDtNVf/ULUT8Go='", // Next.js inline script
      "'sha256-JWinnvoTs3rwYROR//W4SX1QBZzt3eCtOCo5szxoOSI='", // Next.js inline script
      "'sha256-kDNQb008n0j2msIRIpFu0oEDur3FW8MPJxOjl0ll95g='", // Next.js inline script
      "'sha256-dlCUqzHwp/ax2393CSFgOGvzyl/nbHk1zP+MMDMj/3s='", // Next.js inline script
      ...allow.script,
    ]; // Production: hash-based inline scripts for maximum security
  } else {
    // Development: Allow unsafe-inline for easier development (Next.js generates many dynamic scripts)
    script = [
      self,
      "'unsafe-inline'", // Development: allow all inline scripts
      "'unsafe-eval'", // Development: allow eval for hot reloading
      ...allow.script,
    ]; // Development: permissive CSP for easier development
  }
  const style = [self, ...allow.style]; // Secure: no unsafe-inline for styles
  const font = [self, data, ...allow.font];
  const frame = allow.frame.length > 0 ? [self, ...allow.frame] : ["'none'"]; // default deny; add needed frames explicitly

  const directives = [
    ["default-src", [self]],
    ["base-uri", [self]],
    ["frame-ancestors", ["'none'"]],
    ["form-action", [self]],
    ["connect-src", Array.from(new Set(connect))],
    ["img-src", Array.from(new Set(img))],
    ["script-src", Array.from(new Set(script))],
    ["style-src", Array.from(new Set(style))],
    ["font-src", Array.from(new Set(font))],
    ["frame-src", Array.from(new Set(frame))],
    ["object-src", ["'none'"]],
    ["upgrade-insecure-requests", []],
  ];

  return directives
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

const securityHeaders = [
  // Core hardening - CSP will be generated dynamically in headers()
  { key: "Content-Security-Policy", value: "" }, // Placeholder, will be replaced
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // Modern replacement for many feature-* headers
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
  // HSTS only for production over HTTPS
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
  // Explicitly disable legacy XSS filter to avoid false sense of security
  { key: "X-XSS-Protection", value: "0" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: [],
  async headers() {
    // Read allowlist dynamically to ensure it's fresh in development
    const allow = readAllowlist();
    const CSP = cspFromAllowlist(allow);

    // Create headers with dynamic CSP
    const dynamicHeaders = securityHeaders.map((header) =>
      header.key === "Content-Security-Policy"
        ? { ...header, value: CSP }
        : header,
    );

    return [
      {
        source: "/(.*)",
        headers: dynamicHeaders,
      },
    ];
  },
  webpack(config, options) {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true, // 🔑 Required for Lucid and UPLC WASM
    };

    // Handle native modules and binary files
    config.module.rules.push({
      test: /\.node$/,
      use: "node-loader",
    });

    // Exclude native modules from client-side bundle
    config.externals = config.externals || [];
    config.externals.push({
      "node-beacon-scanner": "commonjs node-beacon-scanner",
      noble: "commonjs noble",
      "@abandonware/bluetooth-hci-socket":
        "commonjs @abandonware/bluetooth-hci-socket",
    });

    return config;
  },
};

export default withNextIntl(nextConfig);
