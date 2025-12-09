import { Separator } from "@repo/ui/components/ui/separator";
import { PageHeader } from "../layouts/page-header";
import { TransactionsHistory } from "../sections/transactions-history";

export const DashboardHistoryPage = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="History" subtitle="View your transaction history" />
      <Separator className="w-full" />
      <TransactionsHistory />
    </div>
  );
};
