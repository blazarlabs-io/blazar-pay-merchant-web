"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@repo/ui/components/ui/card";
import { Ada } from "../icons/ada";
import { Usdm } from "../icons/Usdm";
import { useTheme } from "next-themes";
import { cn } from "@repo/ui/lib/utils";
import { useWallet } from "~/src/context/wallet";
import { useEffect, useState } from "react";
import { Wbtc } from "../icons/wbtc";

export const Balance = () => {
  const { theme } = useTheme();
  const { accounts } = useWallet();

  const [usd, setUsd] = useState<number>(0);
  const [usdFromAda, setUsdFromAda] = useState<number>(0);
  const [usdFromWbtc, setUsdFromWbtc] = useState<number>(0);
  const [ada, setAda] = useState<number>(0);
  const [usdm, setUsdm] = useState<number>(0);
  const [wbtc, setWbtc] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setTotal(
        Number(
          accounts.filter((w) => w.balance.currency === "USD")[0]?.balance
            ?.amount,
        ) || 0,
      );
    }
  }, [accounts]);
  return (
    <Card
      className={cn(
        "shadow-none bg-gradient-to-br",
        theme === "light"
          ? "from-[#FFD5E9] to-[#8CE4F3]"
          : "from-[#852f58] to-[#00a3c0]",
      )}
    >
      <CardHeader></CardHeader>
      <CardContent>
        {accounts && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start justify-start w-full gap-2">
              <p className="text-base text-muted-foreground">Current balance</p>
              <div className="flex items-center gap-2">
                <p className="text-6xl font-bold">{`$${total.toFixed(2)}`}</p>
                <span className="font-semibold text-muted-foreground">USD</span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-start w-full gap-4">
              {accounts &&
                accounts.length > 0 &&
                accounts.map((w) => (
                  <div key={w.balance.currency}>
                    {w.balance.currency !== "USD" && (
                      <div className="flex flex-col items-end justify-start w-full gap-0">
                        <div className="flex items-center gap-2">
                          <Ada className="w-5 h-5" />
                          <p className="text-lg font-bold">
                            {w.balance.amount}
                          </p>
                          <span className="text-xs font-semibold text-muted-foreground min-w-[32px] text-end">
                            {w.balance.currency}
                          </span>
                        </div>
                        <p className="text-xs foreground">
                          {`$${w.balance.asUsd}`} USD
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
