"use client";

import { resolvePrivateKey } from "@meshsdk/core";
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
import { LoaderCircle, Unplug } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { disconnect } from "process";
import { useCallback, useEffect, useState } from "react";
import { useWallet } from "~/src/context/wallet";
import { cn } from "~/src/utils/shadcn";
import * as c from "@dcspark/cardano-multiplatform-lib-browser";
import { getPrivateKey } from "~/src/utils/wallet-client";
import { blockfrost } from "~/src/lib/blockfrost/client";

type CashoutProps = {
  children: React.ReactNode;
};

export const Cashout = ({ children }: CashoutProps) => {
  const {
    connected,
    current,
    browserWallets,
    connecting,
    connect,
    maxToSpend,
    wallet,
    onConfirmation,
  } = useWallet();
  const { theme } = useTheme();

  const [amount, setAmount] = useState<string>(
    (maxToSpend / 1000000).toFixed(2).toString() || "0",
  );

  const handleWalletConnect = useCallback(
    async (wallet: any) => {
      await connect(wallet.name, true);

      if (current) {
        setAmount((maxToSpend / 1000000).toFixed(2).toString());
      }
    },
    [current],
  );

  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setAmount("");
  }, []);

  useEffect(() => {
    console.log("MAX TO SPEND", (maxToSpend / 1000000).toFixed(2));
    if (maxToSpend && maxToSpend !== undefined) {
      setAmount((maxToSpend / 1000000).toFixed(2).toString());
    }
  }, []);

  function splitToArray(input: string): string[] {
    return input.trim().split(/\s+/);
  }

  const handleChashout = useCallback(async () => {
    // SECURITY: Never log seed phrases - removed console.log for security
    const seed = current?.seedPhrase as string;
    if (!seed) {
      console.error("No seed phrase available for cashout");
      return;
    }
    const pk = getPrivateKey(seed as string);

    const funds: any[] = [];
    current?.transactions.map(async (t: any) => {
      const transaction_id = t.txHash;
      const serialized_index = c.PlutusData.new_integer(
        c.BigInteger.from_str(t.outputIndex.toString()),
      ).to_cbor_hex();

      const msgToSign = `d8799fd8799f5820${transaction_id}${serialized_index}ffff`;
      const signature = pk.sign(Buffer.from(msgToSign, "hex")).to_hex();
      funds.push({
        signature: signature,
        ref: { hash: t.txHash, index: Number(t.outputIndex) },
      });

      // SECURITY: Removed detailed logging of sensitive transaction data
      // Only log non-sensitive information for debugging
      console.log("Transaction processing completed for:", transaction_id);
    });

    const newCashout = {
      address: current?.address, //"addr_test1qqkmdp58hy4urz4zyszpdawfr23fhc3aky27rd7wh0u95h2pvaaxc8qdc6kmpuhz4t5kchxcneya5qtwfes0549pyujqveuc6j", // The user's Cardano address requesting the withdrawal (destination address).
      owner: "user", // the owner kind of the order
      funds_utxos: funds, // An array of output references of the Funds UTxOs to withdraw.
      network_layer: "L1", // Must be "L1". This endpoint is for L1 withdrawals only.
    };

    try {
      const res = await fetch(`/api/hydra/withdraw`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCashout),
      });

      const data = await res.json();
      console.log("DATA", data);
      const cborHex = data.cborHex;
      const signedTx = await wallet.signTx(cborHex);
      const txHash = await blockfrost.submitTx(signedTx);
      onConfirmation(txHash);
      console.log("signedTx", txHash);
    } catch (error) {
      console.log("ERROR", error);
    }
  }, [current?.transactions, current?.address, current?.seedPhrase]);
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
            Cashout your balance to your preffered wallet.
          </SheetDescription>
        </SheetHeader>
        {connected && current ? (
          <>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <p className="text-sm">Use a browser wallet</p>
            <div className="flex items-center justify-center gap-4">
              {browserWallets &&
                Object.keys(browserWallets).length > 0 &&
                Object.keys(browserWallets).map((wallet: any) => (
                  <Button
                    key={wallet}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleWalletConnect(browserWallets[wallet])}
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
                      browserWallets[wallet] &&
                      browserWallets[wallet]?.name === wallet ? (
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
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={() => {
                handleChashout();
              }}
              type="button"
            >
              Cashout
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
