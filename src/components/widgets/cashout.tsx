"use client";

import { resolveTxHash } from "@meshsdk/core";
import { Button } from "@repo/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useWallet } from "~/src/context/wallet";
import { merchantCashoutBody } from "@/lib/hydra/cashout";

type CashoutProps = {
  children: React.ReactNode;
};

type CashoutResult = { decommitTxId: string; utxos: string[] };

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Merchant claim: withdraws all of the merchant's L2 funds (received payments) to its own L1 address.
 * The backend builds, signs and decommits the tx and answers once it has left the head; nothing is
 * signed or submitted here. The L1 funds appear once the head posts the decrement on L1.
 */
export const Cashout = ({ children }: CashoutProps) => {
  const { refreshBalances } = useWallet();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<CashoutResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCashout = async () => {
    setError(null);
    setResult(null);
    const address = localStorage.getItem("wallet");
    if (!address) {
      setError("Connect your wallet first");
      return;
    }

    setBusy(true);
    try {
      const funds = await fetch(`/api/hydra/query-funds?address=${address}`);
      if (!funds.ok) throw new Error(`Balance query failed (${funds.status})`);
      const body = merchantCashoutBody(
        address,
        (await funds.json()).fundsInL2 ?? [],
      );
      if (!body) throw new Error("No L2 funds to cash out");

      const res = await fetch("/api/hydra/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Cashout failed (${res.status})`);
      const { cborHex } = await res.json();
      setResult({
        decommitTxId: resolveTxHash(cborHex),
        utxos: body.funds_utxos.map((u) => `${u.ref.hash}#${u.ref.index}`),
      });
      await refreshBalances();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="min-w-[88px]">{String(children)}</Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="flex flex-col items-center justify-center"
      >
        <SheetHeader className="flex flex-col items-center justify-center">
          <Image
            src="/images/cashout.png"
            alt="Cashout"
            width={124}
            height={48}
            className=""
          />
          <SheetTitle className="text-3xl">Cashout Balance</SheetTitle>
          <SheetDescription>
            Withdraw all your L2 funds (ADA, USDM and BTC received in Hydra)
            to your Cardano address.
          </SheetDescription>
        </SheetHeader>
        {result && (
          <div className="flex flex-col items-center gap-1 py-4 text-sm">
            <p className="font-bold">Cashout submitted: the funds left Hydra</p>
            <p className="break-all">Decommit tx {result.decommitTxId}</p>
            {result.utxos.map((u) => (
              <p key={u} className="break-all text-muted-foreground">
                L2 funds {u}
              </p>
            ))}
            <p className="text-muted-foreground">
              They reach your L1 address once the head posts the decrement on
              L1.
            </p>
          </div>
        )}
        {error && <p className="py-4 text-sm text-destructive">{error}</p>}
        <SheetFooter>
          <Button onClick={handleCashout} disabled={busy} type="button">
            {busy ? <LoaderCircle className="animate-spin" size={20} /> : null}
            Cashout
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
