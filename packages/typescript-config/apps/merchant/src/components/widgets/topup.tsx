"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
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
import { LoaderCircle, Unplug } from "lucide-react";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "~/src/context/wallet";
import { useToast } from "~/src/hooks/use-toast";
import { blockfrost } from "~/src/lib/blockfrost/client";
import { cn } from "~/src/utils/shadcn";
import Image from "next/image";
import { BrowserWallet, resolvePrivateKey, Wallet } from "@meshsdk/core";

type TopupProps = {
  children: React.ReactNode;
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

export const Topup = ({ children }: TopupProps) => {
  const {
    browserWallets,
    connect,
    connecting,
    connected,
    current,
    disconnect,
    wallet,
    onConfirmation,
    availableAssets,
    updateAvailableAssets,
  } = useWallet();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [localWallet, setLocalWallet] = useState<any>(null);
  const [amount, setAmount] = useState<string>("0");

  const handleWalletConnect = useCallback(async (wallet: any) => {
    setLocalWallet(wallet);
    await connect(wallet.name, true);
  }, []);

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setLocalWallet(null);
    setAmount("");
  }, []);

  const handleTopUp = useCallback(
    async (
      _amount: number,
      _address: string,
      _wallet: BrowserWallet,
      selected: any,
    ) => {
      console.log("\n\nXXXXXXXXXXXXXX");
      console.log("amount", _amount);
      console.log("address", _address);
      console.log("wallet", _wallet);
      console.log("selected", selected);
      console.log("available assets", availableAssets);
      console.log("XXXXXXXXXXXXXX\n\n");

      const rawAmount = _amount;
      const rawAdaDecimals = availableAssets?.filter(
        (a: any) => a.name === "ada",
      )[0]?.decimals;
      const rawUsdmDecimals = availableAssets?.filter(
        (a: any) => a.name === "usdm",
      )[0]?.decimals;
      const rawWbtcDecimals = availableAssets?.filter(
        (a: any) => a.name === "wbtc",
      )[0]?.decimals;

      let rawDecimals: number = 0;

      if (selected.name === "ada") {
        rawDecimals = rawAdaDecimals as number;
      } else if (selected.name === "wbtc") {
        rawDecimals = rawWbtcDecimals as number;
      } else {
        rawDecimals = rawUsdmDecimals as number;
      }

      if (
        rawAmount === undefined ||
        rawDecimals === undefined ||
        rawAmount === null ||
        rawDecimals === null
      ) {
        throw new Error("Missing amount or decimals for BigInt conversion.");
      }

      const amount = rawAmount;
      const decimals = rawDecimals;

      if (isNaN(amount) || isNaN(decimals)) {
        throw new Error(
          `Conversion failed: amount=${rawAmount}, decimals=${rawDecimals}`,
        );
      }

      const multiplier = 10 ** decimals;
      const value = amount * multiplier;
      const payload = {
        user_address: _address, //address, // The user's Cardano address from which the deposit will originate.
        public_key: current?.publicKey as string, // The public key associated to the user_address, in hex
        amount: [[selected.assetUnit, value]], // The amount of funds to deposit, in Ada, WBTC and USDM (in that order).
        // fundsUtxoRef: null, // (Optional) The output reference of an existing user funds UTxO on the Cardano blockchain to consolidate.
      };

      console.log("\n\nXXXXXXXXXXXXXX");
      console.log("amount", amount);
      console.log("typeof amount", typeof amount);
      console.log("rawAmount", rawAmount);
      console.log("decimals", decimals);
      console.log("rawDecimals", rawDecimals);
      console.log("multiplier", multiplier);
      console.log("value", value);
      console.log("typeof value", typeof value);
      console.log("XXXXXXXXXXXXXX\n\n");

      // console.info("[RAW AMOUNT]", rawAmount);
      // console.info("[AMOUNT]", amount);
      // console.info("[RAW ADA DECIMALS]", rawAdaDecimals);
      // console.info("[RAW USDM DECIMALS]", rawUsdmDecimals);
      // console.info("[RAW MULTIPLIER]", multiplier);
      // console.info("[RAW DECIMALS]", rawDecimals);
      // console.info("[PAYLOAD]", payload, "\n\n");

      const topUpRes = await fetch(`/api/hydra/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (topUpRes.ok) {
        try {
          const res = await topUpRes.json();
          const cborHex = res.cborHex;
          const signedTx = await _wallet.signTx(cborHex);
          const txHash = await blockfrost.submitTx(signedTx);
          onConfirmation(txHash);

          console.log("\n\nXXXXXXXXXXXXXX");
          console.log("RES", res);
          console.log("CBOR-HEX", cborHex);
          console.log("XXXXXXXXXXXXXX\n\n");
        } catch (error) {
          console.log(error);
          toast({
            title: "Topup failed",
            description: `Topup of ${_amount} ADA failed`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Topup failed",
          description: `Topup of ${_amount} ADA failed`,
          variant: "destructive",
        });
      }
    },
    [current, blockfrost, current?.seedPhrase],
  );

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
          <Image
            src="/images/investing.png"
            alt="Cashout"
            width={124}
            height={48}
            className=""
          />
          <SheetTitle className="text-3xl">Topup</SheetTitle>
          <SheetDescription>
            Topup your balance by following the steps bellow.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col items-center justify-center">
          {connected && current ? (
            <div>
              <div className="flex items-center gap-2 text-sm">
                <p>You are connected with</p>
                <div className="flex items-center gap-1 py-1 px-3 border rounded-[8px] border-input">
                  <img src={current.icon} className="w-6 h-6" />
                  <span className="font-bold capitalize">{current.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleDisconnect}>
                  <Unplug className="w-4 h-4" />
                </Button>
              </div>
              {/* <p></p> */}
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
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-4">
              <SheetDescription>Use a browser wallet</SheetDescription>
              <div className="flex items-center justify-center gap-4">
                {browserWallets &&
                  Object.keys(browserWallets).length > 0 &&
                  Object.keys(browserWallets).map((wallet: any) => (
                    <Button
                      key={wallet}
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleWalletConnect(browserWallets[wallet])
                      }
                      className="border rounded-[8px] border-input w-full h-full p-2"
                    >
                      <div
                        className={cn(
                          "shadow-none w-full bg-gradient-to-br",
                          "relative flex p-3 flex-col items-center justify-end gap-4 rounded-[8px] min-w-[120px] min-h-[120px]",
                          theme === "light"
                            ? "from-[#ffd5e956] to-[#8ce4f354]"
                            : "from-[#852f5954] to-[#00a3c048]",
                        )}
                      >
                        {connecting &&
                        localWallet &&
                        localWallet?.name === wallet ? (
                          <LoaderCircle className="animate-spin" size={20} />
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <img
                              src={browserWallets[wallet].icon}
                              className="w-6"
                            />
                            <span className="capitalize text-muted-foreground">
                              {browserWallets[wallet].name}
                            </span>
                          </div>
                        )}
                      </div>
                    </Button>
                  ))}
              </div>
            </div>
          )}
          <div className="flex flex-col items-center justify-center gap-2 py-4">
            <SheetDescription>Amount to topup</SheetDescription>
            <div className="flex flex-col items-center">
              <div
                style={{ display: "inline-block", position: "relative" }}
                className=""
              >
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    font: "inherit",
                    padding: 0,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    // width: "48px",
                    fontSize: "3rem",
                    textAlign: "center",
                  }}
                />
              </div>
              {/* <span className="text-muted-foreground/50">ADA (₳)</span> */}
            </div>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              type="button"
              className="min-w-[240px]"
              onClick={() =>
                handleTopUp(
                  Number(amount),
                  window.localStorage.getItem("wallet") as string,
                  wallet,
                  availableAssets.find((a: any) => a.selected),
                )
              }
            >
              Topup
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
