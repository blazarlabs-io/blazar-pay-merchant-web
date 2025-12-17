"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import ReceivePaymentAnim from "../anims/receive-payment-anim";
import { socket } from "~/src/socket";
import { useWallet } from "@/context/wallet";
import { cn } from "@repo/ui/lib/utils";
import { Wallet } from "~/src/types/db";

type ReceivePaymentProps = {
  children: React.ReactNode;
};

export const ReceivePayment = ({ children }: ReceivePaymentProps) => {
  const {
    updateTerminalConnected,
    updateAvailableAssets,
    updateAccounts,
    accounts,
    onConfirmation,
  } = useWallet();
  const { availableAssets } = useWallet();
  const [value, setValue] = useState<number>(0);
  const [awaiting, setAwaiting] = useState<boolean>(false);
  const [transport, setTransport] = useState<string>("N/A");

  useEffect(() => {
    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      // setIsConnected(true);
      updateTerminalConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      updateTerminalConnected(false);
      setTransport("N/A");
    }

    socket.on("connect", onConnect);
    socket.on("payed", (data) => {
      console.log(data);
      setTimeout(() => {
        onConfirmation(data.fundsInL2.fundsUtxoRef.txHash);
        setAwaiting(false);
      }, 5000);
      // accounts.map((account: Wallet) => {
      //   if (account.address === data.address) {
      //     account.balance = data.balance;
      //   }
      // });
      // updateAccounts(accounts);
    });
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const handleRequestFunds = useCallback(() => {
    setAwaiting(true);
    socket.emit("requestFunds", {
      address: localStorage.getItem("wallet") as string,
      amount: value,
      assetUnit: availableAssets.filter((a: any) => a.selected)[0]?.assetUnit,
      decimals: availableAssets.filter((a: any) => a.selected)[0]?.decimals,
    });
  }, [value, availableAssets, socket]);

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(parseFloat(e.target.value));
    },
    [],
  );

  const handleAssetSelect = (asset: any) => {
    const newAssets = availableAssets.map((a: any) => {
      if (a.name === asset.name) {
        return { ...a, selected: true };
      } else {
        return { ...a, selected: false };
      }
    });
    console.log(newAssets);
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
          {!awaiting ? (
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
              <ReceivePaymentAnim />
              <SheetTitle className="pt-[32px]">Awaiting payment</SheetTitle>
              <SheetDescription>
                Make sure the client's phone hovers over the hydrapay payment
                terminal.
              </SheetDescription>
            </>
          )}
        </SheetHeader>
        {!awaiting ? (
          <>
            <div>
              <input
                value={value || 0}
                onChange={handleValueChange}
                style={{
                  font: "inherit",
                  padding: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "3rem",
                  textAlign: "center",
                }}
                step="any"
                min={"0.00000001"}
                type="number"
              />
            </div>
            <div>
              <Button onClick={handleRequestFunds}>Request</Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              <LoaderCircle className="animate-spin text-foreground" />
            </div>
          </>
        )}
        <SheetFooter>
          {/* <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose> */}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
