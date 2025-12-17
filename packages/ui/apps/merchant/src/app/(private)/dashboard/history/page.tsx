import { DashboardHistoryPage } from "~/src/components/pages/dashboard-history-page";
// Force dynamic rendering to prevent Cardano library issues during build
export const dynamic = 'force-dynamic';

export default function History() {
  return <DashboardHistoryPage />;
}
