import { DashboardHomePage } from "@/components/pages/dashboard-home-page";

// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = "force-dynamic";

export default function Home() {
  return <DashboardHomePage />;
}
