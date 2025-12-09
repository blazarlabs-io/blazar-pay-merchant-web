"use client";

import { Card, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { PageHeader } from "../layouts/page-header";

import { useAuth } from "@/features/authentication/context/auth-provider";
import { Separator } from "@repo/ui/components/ui/separator";
import { useRouter } from "next/navigation";
import { CashOut as CashOutIcon } from "../icons/CashOut";
import { Receive } from "../icons/Receive";
import { RecentTransactionsSection } from "../sections/recent-transactions-section";
import { Balance } from "../widgets/balance";
import { Cashout } from "../widgets/cashout";
import { ReceivePayment } from "../widgets/receive-payment";
import { Topup } from "../widgets/topup";
import { SendPayment } from "../widgets/send-payment";
import { Button } from "@repo/ui/components/ui/button";
import { db } from "~/src/lib/firebase/services/db";

export const DashboardHomePage = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader
        title="Home"
        subtitle={`Welcome back ${user?.displayName || user?.email || ""}`}
      />
      {/* <Button
        size="sm"
        onClick={() => {
          db.trigger
            .setPendingPayTigger("W3JoAcPKXmeUN2ZPPSXsawfLqu73")
            .then(() => {})
            .catch((error: any) => {
              console.log(error);
            });
        }}
      >
        Send Payment
      </Button> */}
      <Separator className="w-full" />
      {/* * BALANCE */}
      <div>
        <Balance />
      </div>
      {/* * ACTIONS */}
      <div className="grid justify-between w-full gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {/* * TOPUP */}
        <Card className="shadow-none rounded-[96px] w-full bg-[#222128] border-input flex items-center justify-between min-h-[124px]">
          <CardHeader className="flex flex-row items-center justify-start gap-4">
            <div className="flex items-center justify-center p-2 bg-white rounded-full">
              <CashOutIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-white">Topup</CardTitle>
              <p className="text-sm text-white/60">
                Topup your balance using your favourite payment method.
              </p>
            </div>
          </CardHeader>
          <div className="flex flex-row items-center pr-6">
            <div className="flex items-center min-h-full">
              <Topup>Topup</Topup>
            </div>
          </div>
        </Card>
        {/* * CASHOUT */}
        <Card className="shadow-none rounded-[96px] w-full bg-[#222128] border-input flex items-center justify-between min-h-[124px]">
          <CardHeader className="flex flex-row items-center justify-start gap-4">
            <div className="flex items-center justify-center p-2 bg-white rounded-full">
              <CashOutIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-white">Cashout</CardTitle>
              <p className="text-sm text-white/60">
                Cashout your balance to your bank account.
              </p>
            </div>
          </CardHeader>
          <div className="flex flex-row items-center pr-6">
            <div className="flex items-center min-h-full">
              <Cashout>Cashout</Cashout>
            </div>
          </div>
        </Card>
        {/* * SEND PAYMENT */}
        <Card className="rounded-[96px] shadow-none w-full bg-[#222128] border-input flex items-center justify-between min-h-[124px]">
          <CardHeader className="flex flex-row items-center justify-start gap-4">
            <div className="flex items-center justify-center p-2 bg-white rounded-full">
              <Receive className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-white">Send payment</CardTitle>
              <p className="text-sm text-white/60">
                Send a payment to any user in your wallet.
              </p>
            </div>
          </CardHeader>
          <div className="flex flex-row items-center pr-6">
            <div className="flex items-center min-h-full">
              <SendPayment>Send</SendPayment>
            </div>
          </div>
        </Card>
        {/* * RECEIVE PAYMENT */}
        <Card className="rounded-[96px] shadow-none w-full bg-[#222128] border-input flex items-center justify-between min-h-[124px]">
          <CardHeader className="flex flex-row items-center justify-start gap-4">
            <div className="flex items-center justify-center p-2 bg-white rounded-full">
              <Receive className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-white">Receive payment</CardTitle>
              <p className="text-sm text-white/60">
                Receive a payment from any client in your wallet.
              </p>
            </div>
          </CardHeader>
          <div className="flex flex-row items-center pr-6">
            <div className="flex items-center min-h-full">
              <ReceivePayment>Receive</ReceivePayment>
            </div>
          </div>
        </Card>
      </div>
      {/* * RECENT TRANSACTIONS */}
      <RecentTransactionsSection />
    </div>
  );
};
