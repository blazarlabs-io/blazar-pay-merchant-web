"use client";

import "@/styles/input.css";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
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
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@repo/ui/components/ui/toggle-group";
import Image from "next/image";
import { useCallback, useState } from "react";
import { useWallet } from "~/src/context/wallet";
import { UserData } from "~/src/types/db";
import SendPaymentDialog from "../dialogs/send-payment-dialog";
import SendPaymentErrorDialog from "../dialogs/send-payment-error-dialog";
import * as c from "@dcspark/cardano-multiplatform-lib-browser";
import { resolvePaymentKeyHash, resolveRewardAddress } from "@meshsdk/core";
import {
  assetsToDataPairs,
  getPrivateKey,
  MapAssets,
  MapAssetsT,
  to,
  valueTuplesToAssets,
} from "~/src/utils/wallet-client";
import { db } from "~/src/lib/firebase/services/db";
import { cn } from "~/src/utils/shadcn";

type ReceivePaymentProps = {
  children: React.ReactNode;
};

export const SendPayment = ({ children }: ReceivePaymentProps) => {
  const { contacts, current, availableAssets, updateAvailableAssets } =
    useWallet();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [selected, setSelected] = useState<UserData | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);

  const handleValueChange = useCallback(
    (value: string) => {
      if (contacts && contacts.length > 0) {
        setSelected(() =>
          contacts.find((contact: UserData) => contact.id === value),
        );
      }
    },
    [contacts],
  );

  const handleSendPayment = useCallback(() => {
    if (selected && selected !== undefined) {
      setOpenDialog(() => true);
    } else {
      setOpenErrorDialog(() => true);
    }
  }, [selected, amount]);

  const handleConfirmPayment = useCallback(async () => {
    setPaymentLoading(() => true);
    try {
      // * 1. We need to get the user's funds from the L2 wallet
      const fundsRes = await fetch(
        `/api/hydra/query-funds?address=${
          (localStorage.getItem("wallet") as string) || current?.address
        }`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const tmp = await fundsRes.json();

      const fundsInL2 = tmp?.fundsInL2;

      let txHash: string = "";
      let outputIndex: number = 0;

      txHash = fundsInL2?.[0]?.txHash as string;
      outputIndex = (fundsInL2?.[0]?.outputIndex as number) || 0;

      // ?
      const pk = getPrivateKey(current?.seedPhrase as string);
      // const amountHex = c.PlutusData.new_integer(
      //   c.BigInteger.from_str(BigInt(amount * 1000000).toString()),
      // ).to_cbor_hex();
      const paymentKey = resolvePaymentKeyHash(
        selected?.wallet?.address as string,
      );
      const rewAddr = resolveRewardAddress(selected?.wallet?.address as string);
      const stakeKey = resolvePaymentKeyHash(rewAddr);
      const transaction_id = txHash;
      const output_index = c.PlutusData.new_integer(
        c.BigInteger.from_str(BigInt(outputIndex as number).toString()),
      ).to_cbor_hex();

      // * 2. We need the user's signature
      const rawAmount = amount;

      const rawDecimals = availableAssets.filter((a: any) => a.selected)[0]
        ?.decimals;
      const _amount = Number(rawAmount);
      const decimals = Number(rawDecimals);

      if (isNaN(_amount) || isNaN(decimals)) {
        throw new Error(
          `Conversion failed: amount=${rawAmount}, decimals=${rawDecimals}`,
        );
      }

      const multiplier = 10 ** decimals;
      const value = Number(_amount * multiplier);
      const assetUnit = availableAssets.filter((a: any) => a.selected)[0]
        ?.assetUnit as string;

      const hexAssets = to(
        assetsToDataPairs(
          valueTuplesToAssets([
            [assetUnit, BigInt(value)],
            [availableAssets[0]?.assetUnit as string, 3000000n],
          ]),
        ),
        MapAssets as unknown as MapAssetsT,
        { canonical: true },
      );

      const msgToSign = `d8799f${hexAssets}d8799fd8799f581c${paymentKey}ffd8799fd8799fd8799f581c${stakeKey}ffffffffd8799f5820${transaction_id}${output_index}ffff`;
      const signature = pk.sign(Buffer.from(msgToSign, "hex")).to_hex();

      const sigObj = {
        merchant_address: selected?.wallet?.address as string,
        amount: [
          [assetUnit, value],
          [availableAssets[0]?.assetUnit as string, 3000000],
        ],
        funds_utxo_ref: {
          hash: transaction_id,
          index: outputIndex as number,
        },
        signature: signature,
      };

      console.log("\n\n[PAYLOAD]", sigObj, "\n\n");

      // * 3. We send the payment to the merchant viia tx-pipe API
      const res = await fetch(`/api/hydra/pay-merchant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sigObj),
      });

      // * 4. wait for a couple of seconds and set trigger in database
      setTimeout(async () => {
        await db.trigger.setPendingPayTigger(selected?.id as string);
      }, 3000);

      const payResData = await res.json();
      console.log("PAYMENT SENT", payResData);
      setOpenDialog(() => false);
    } catch (error) {
      console.log(error);
    }

    setPaymentLoading(() => false);

    setOpenDialog(() => false);
  }, [selected, amount, current]);

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
    <>
      <SendPaymentDialog
        open={openDialog}
        onOpenChange={handleConfirmPayment}
        loading={paymentLoading}
      />
      <SendPaymentErrorDialog
        open={openErrorDialog}
        onOpenChange={setOpenErrorDialog}
      />
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
              src="/images/hero-image.png"
              alt="Receive Payment"
              width={124}
              height={48}
              className=""
            />
            <SheetTitle className="text-3xl">Send payment</SheetTitle>
            <SheetDescription>
              Choose a user to send payment and set amount
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center gap-4">
            <ToggleGroup type="single" onValueChange={handleValueChange}>
              {contacts &&
                contacts.length > 0 &&
                contacts.map((contact: any) => (
                  <ToggleGroupItem
                    value={contact.id}
                    aria-label="Toggle bold"
                    key={contact.id}
                    className="flex flex-col items-center gap-2 p-4 border rounded-sm border-input min-w-fit min-h-fit"
                  >
                    <Avatar>
                      <AvatarImage src={contact.avatar} />
                      <AvatarFallback>
                        <span className="text-xs! text-muted-foreground!">
                          {contact.name.charAt(0).toUpperCase()}
                        </span>
                      </AvatarFallback>
                    </Avatar>
                    <p>{contact.name}</p>
                  </ToggleGroupItem>
                ))}
            </ToggleGroup>
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
            <div
              style={{ display: "inline-block", position: "relative" }}
              className=""
            >
              <div className="flex items-center justify-center w-full">
                <SheetDescription>Amount to send</SheetDescription>
              </div>
              <input
                value={amount || 0}
                type="number"
                onChange={(e) => {
                  setAmount(() =>
                    parseFloat(Number(e.target.value).toFixed(4)),
                  );
                }}
                style={{
                  font: "inherit",
                  padding: 0,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: "3rem",
                  textAlign: "center",
                }}
                step={"any"}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              onClick={handleSendPayment}
              className="min-w-[88px]"
            >
              Send
            </Button>
          </div>
          <SheetFooter></SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
};
