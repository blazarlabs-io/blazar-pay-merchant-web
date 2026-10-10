import config from "@repo/ui/tailwind.config";

// The shared config lists the UI package as ../../packages/ui (monorepo layout). Here it lives in
// ./packages/ui, so without this path none of its component classes (Sheet, Button, Sidebar) are built.
export default {
  ...config,
  content: [...config.content, "./packages/ui/src/**/*.{ts,tsx}"],
};
