"use client";

import { Separator } from "@repo/ui/components/ui/separator";
import { PageHeader } from "../layouts/page-header";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/ui/select";
import { useTheme } from "next-themes";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Button } from "@repo/ui/components/ui/button";
import { useEffect, useState } from "react";
import { db } from "~/src/lib/firebase/services/db";
import { useWallet } from "~/src/context/wallet";
import { useAuth } from "@/features/authentication/context/auth-provider";
import { Copy, LoaderCircle, Plus } from "lucide-react";
import { getPrivateKey } from "~/src/utils/wallet";
import { resolvePrivateKey } from "@meshsdk/core";

export const DashboardSettingsPage = () => {
  const { setTheme, theme } = useTheme();
  //seat burger click pipe inner lock logic inmate foot scene dream maid rapid actual false tribe melt hip solution gossip comic health blouse ozone
  const [seedPhrase, setSeedPhrase] = useState<string>("");
  const { user } = useAuth();
  const { wallet, current } = useWallet();
  const [creating, setCreating] = useState<boolean>(false);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  const handleTheme = (t: string) => {
    setTheme(t);
  };

  const handleTextAreChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSeedPhrase(e.target.value);
    // SECURITY: Never log seed phrases - removed console.log for security
  };

  const handleSaveSeedPhrase = async () => {
    // console.log(e.target.value);
    const updateRes = await db.user.update(user?.uid, {
      wallet: {
        ...wallet,
        seedPhrase: seedPhrase,
      },
    });

    console.log("UPDATE USER", updateRes);
  };

  function splitToArray(input: string): string[] {
    return input.trim().split(/\s+/);
  }

  const handleCreatePrivateKey = async () => {
    const seedPhraseArr = splitToArray(seedPhrase);
    const privateKey = resolvePrivateKey(seedPhraseArr);
    // SECURITY: Never log private keys - removed console.log for security
    setPrivateKey(() => privateKey);
    const updateRes = await db.user.update(user?.uid, {
      wallet: {
        ...wallet,
        privateKey: privateKey,
      },
    });
    // SECURITY: Never log sensitive user data - removed console.log for security
    setCreating(() => false);
  };

  useEffect(() => {
    if (current) {
      // SECURITY: Never log sensitive wallet data - removed console.log for security
      setSeedPhrase(current.seedPhrase);
      if (current && current.privateKey && current.privateKey !== undefined) {
        // SECURITY: Never log private keys - removed console.log for security
        setPrivateKey(() => current.privateKey);
      } else {
        setPrivateKey(() => null);
      }
    }
  }, [current]);

  return (
    <div className="flex flex-col w-full gap-6">
      <PageHeader title="Settings" subtitle="Manage your app settings" />
      <Separator className="w-full" />
      <div className="flex items-center justify-between gap-1 p-6 border rounded-md border-input">
        <div>
          <h2 className="text-base font-bold">Theme</h2>
          <p className="text-sm">Change the theme of the app</p>
        </div>
        <div>
          <Select value={theme} onValueChange={handleTheme}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Themes</SelectLabel>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start w-full gap-4 p-6 border rounded-md border-input">
        <div>
          <h2 className="text-base font-bold">Seed Phrase</h2>
          <p className="text-sm">Your wallet's seed phrase</p>
        </div>
        <div className="w-full">
          <Textarea
            value={seedPhrase}
            className="w-full"
            rows={1}
            onChange={handleTextAreChange}
          />
        </div>
        <div className="flex items-center justify-end w-full">
          <Button onClick={handleSaveSeedPhrase} variant="outline">
            Save
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-start justify-start w-full gap-4 p-6 border rounded-md border-input">
        <div>
          <h2 className="text-base font-bold">Private Key</h2>
          <p className="text-sm">Your wallet's private key</p>
        </div>
        <div className="w-full">
          {!privateKey ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setCreating(() => true);
                handleCreatePrivateKey();
              }}
            >
              {!creating ? (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </>
              ) : (
                <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
              )}
            </Button>
          ) : (
            <div className="flex items-center w-full gap-4">
              <p className="truncate text-muted-foreground">{privateKey}</p>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(privateKey);
                }}
                className="min-w-10"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
