import { DashboardSettingsPage } from "@/components/pages/dashboard-settings-page";

// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = "force-dynamic";

export default function Settings() {
  return <DashboardSettingsPage />;
}
