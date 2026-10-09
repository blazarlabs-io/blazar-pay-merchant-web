"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import ReceivePaymentAnim from "../anims/receive-payment-anim";
import { useWallet } from "@/context/wallet";
import { cn } from "@repo/ui/lib/utils";
import {
  ASSETS,
  AssetUnit,
  Payment,
  TERMINAL_STATES,
  formatBaseUnits,
  toBaseUnits,
} from "@/types/payment-contract";
import { pollPayment } from "@/lib/hydra/poll-payment";

type ReceivePaymentProps = {
  children: React.ReactNode;
};

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

export const ReceivePayment = ({ children }: ReceivePaymentProps) => {
  const { availableAssets, updateAvailableAssets, refreshBalances } =
    useWallet();
  const [value, setValue] = useState<string>("");
  const [requesting, setRequesting] = useState<boolean>(false);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const paymentId = payment?.paymentId;
  const isFinal = payment ? TERMINAL_STATES.includes(payment.state) : false;

  // The backend record is the only source of truth: poll it until it is final.
  useEffect(() => {
    if (!paymentId) return;
    const controller = new AbortController();
    pollPayment(paymentId, {
      signal: controller.signal,
      onUpdate: (p) => {
        setPayment(p);
        setError(null);
      },
      onError: (e) => setError(errorMessage(e)),
    }).then((final) => {
      if (final?.state === "confirmed") refreshBalances();
    });
    return () => controller.abort();
  }, [paymentId]);

  const handleRequestFunds = async () => {
    setError(null);
    const assetUnit = availableAssets.find((a) => a.selected)
      ?.assetUnit as AssetUnit;
    const merchantAddress = localStorage.getItem("wallet");
    if (!merchantAddress) {
      setError("Connect your wallet first");
      return;
    }

    let amountBaseUnits: string;
    try {
      amountBaseUnits = toBaseUnits(value, ASSETS[assetUnit].decimals);
    } catch (e) {
      setError(errorMessage(e));
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch("/api/hydra/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantAddress, assetUnit, amountBaseUnits }),
      });
      if (!res.ok) throw new Error(`Payment request failed (${res.status})`);
      setPayment(await res.json());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setRequesting(false);
    }
  };

  const handleNewRequest = () => {
    setPayment(null);
    setError(null);
    setValue("");
  };

  const handleAssetSelect = (asset: any) => {
    const newAssets = availableAssets.map((a: any) => {
      if (a.name === asset.name) {
        return { ...a, selected: true };
      } else {
        return { ...a, selected: false };
      }
    });
    updateAvailableAssets(newAssets);
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
          {!payment ? (
            <>
              <Image
                src="/images/receive-payment.png"
                alt="Receive Payment"
                width={212}
                height={48}
                className=""
              />
              <SheetTitle>Request payment</SheetTitle>
              <SheetDescription>
                Type the amount you want to receive.
              </SheetDescription>
              <div className="flex flex-col items-center justify-center py-4">
                <SheetDescription>Choose a token</SheetDescription>
                <div className="flex items-center justify-center gap-4 py-4">
                  {availableAssets.map((asset: any) => (
                    <button
                      key={asset.name}
                      className={cn(
                        "max-w-fit p-[0px] rounded-full border-4",
                        asset.selected
                          ? "border-primary animate-pulse"
                          : "border-transparent",
                      )}
                      style={{
                        backgroundColor: "transparent",
                      }}
                      onClick={() => handleAssetSelect(asset)}
                    >
                      <Image
                        src={asset.icon}
                        alt={asset.symbol}
                        width={48}
                        height={48}
                        className=""
                      />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {!isFinal && <ReceivePaymentAnim />}
              <SheetTitle className="pt-[32px]">
                {payment.state === "confirmed"
                  ? "Payment confirmed"
                  : payment.state === "failed"
                    ? "Payment failed"
                    : payment.state === "expired"
                      ? "Payment request expired"
                      : "Awaiting payment"}
              </SheetTitle>
              {!isFinal && (
                <SheetDescription>
                  Make sure the client's phone hovers over the hydrapay payment
                  terminal.
                </SheetDescription>
              )}
            </>
          )}
        </SheetHeader>
        {!payment ? (
          <>
            <div>
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                style={{
                  font: "inherit",
                  padding: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "3rem",
                  textAlign: "center",
                }}
                inputMode="decimal"
                type="text"
              />
            </div>
            <div>
              <Button onClick={handleRequestFunds} disabled={requesting}>
                Request
              </Button>
            </div>
          </>
        ) : (
          <>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 py-4 text-sm max-w-full">
              <dt className="text-muted-foreground">Amount</dt>
              <dd>
                {formatBaseUnits(payment.amountBaseUnits, payment.decimals)}{" "}
                {ASSETS[payment.assetUnit].symbol}
              </dd>
              <dt className="text-muted-foreground">State</dt>
              <dd>{payment.state}</dd>
              <dt className="text-muted-foreground">Hydra tx</dt>
              <dd className="break-all">{payment.hydraTxId ?? "-"}</dd>
              <dt className="text-muted-foreground">Snapshot</dt>
              <dd>{payment.snapshotNumber ?? "-"}</dd>
              {payment.error && (
                <>
                  <dt className="text-muted-foreground">Error</dt>
                  <dd className="text-destructive">{payment.error}</dd>
                </>
              )}
            </dl>
            {isFinal ? (
              <Button onClick={handleNewRequest}>New request</Button>
            ) : (
              <LoaderCircle className="animate-spin text-foreground" />
            )}
          </>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </SheetContent>
    </Sheet>
  );
};
