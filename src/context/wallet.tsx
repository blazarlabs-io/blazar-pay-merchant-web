"use client";

import { Asset, DbResponse, Transaction, UserData, Wallet } from "@/types/db";

// LIBS
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { db } from "../lib/firebase/services/db";
import { db as fdb } from "../lib/firebase/client";
import {
  useLovelace,
  useWallet as useMeshWallet,
  useWalletList,
} from "@meshsdk/react";
import { browser } from "process";
import { parse } from "path";
import { useAuth } from "@/features/authentication/context/auth-provider";
import { collection, doc, onSnapshot, Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";
import { getAdaToUsd, getWbtcToUsd } from "../lib/coinwatch";
import { blockfrost } from "../lib/blockfrost/client";
import {
  TRIGGERS,
  PAY_TRIGGER,
  USERS,
} from "../lib/firebase/services/constants";
import { ASSETS, formatBaseUnits } from "@/types/payment-contract";

const USDM_UNIT =
  "77484e67c1ed6c96f55b89206cb5d6caae9a09a0bd473bba817929fe5553444d";
const BTC_UNIT = "d2a8592ec9673ac18fea1044885f94518e954ab0cb2b6bb0a328d2af425443";

export interface WalletContextInterface {
  terminalConnected: boolean;
  updateTerminalConnected: (connected: boolean) => void;
  accounts: Wallet[];
  updateAccounts: (accounts: Wallet[]) => void;
  current: any;
  wallet: any;
  browserWallets: any[];
  updateBrowserWallets: (browserWallets: any) => void;
  connect: (name: string, persist?: boolean) => void;
  state: any;
  connected: boolean;
  connecting: boolean;
  disconnect: () => void;
  error: any;
  address: string;
  loading: boolean;
  isConfirming: boolean;
  onConfirmation: (txHash: string) => void;
  refreshBalances: () => Promise<void>;
  contacts: any;
  availableAssets: Asset[];
  updateAvailableAssets: (assets: Asset[]) => void;
}

const contextInitialData: WalletContextInterface = {
  terminalConnected: false,
  updateTerminalConnected: () => {},
  accounts: [],
  updateAccounts: () => {},
  current: null,
  wallet: null,
  browserWallets: [],
  updateBrowserWallets: () => {},
  connect: () => {},
  state: null,
  connected: false,
  connecting: false,
  disconnect: () => {},
  error: null,
  address: "",
  loading: false,
  isConfirming: false,
  onConfirmation: () => {},
  refreshBalances: async () => {},
  contacts: null,
  availableAssets: [],
  updateAvailableAssets: () => {},
};

const WalletContext = createContext(contextInitialData);

export const useWallet = (): WalletContextInterface => {
  const context = useContext<WalletContextInterface>(WalletContext);

  if (context === undefined) {
    throw new Error("use Wallet Context must be used as within a Provider");
  }

  return context;
};

export const WalletProvider = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [accounts, setAccounts] = useState<Wallet[]>([]);
  const [browserWallets, setBrowserWallets] = useState<any>(null);
  const [contacts, setContacts] = useState<any>(null);
  const [current, setCurrent] = useState<any>(null);
  const [terminalConnected, setTerminalConnected] = useState<boolean>(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([
    {
      name: "ada",
      symbol: "ADA",
      decimals: ASSETS.lovelace.decimals,
      amount: 0,
      icon: "/images/ada-token.png",
      selected: true,
      assetUnit: "lovelace",
    },
    {
      name: "usdm",
      symbol: "USDM",
      decimals: ASSETS[USDM_UNIT].decimals,
      amount: 0,
      icon: "/images/usdm-token.png",
      selected: false,
      assetUnit: USDM_UNIT,
    },
    {
      name: "wbtc",
      symbol: "WBTC",
      decimals: ASSETS[BTC_UNIT].decimals,
      amount: 0,
      icon: "/images/wbtc-token.png",
      selected: false,
      assetUnit: BTC_UNIT,
    },
  ]);

  const wallets = useWalletList();
  const lovelace = useLovelace();
  const {
    wallet,
    state,
    connected,
    name,
    connecting,
    connect: connectWallet,
    disconnect: disconnectWallet,
    error,
    address,
  } = useMeshWallet();

  // * UPDATE TERMINAL CONNECTED
  const updateTerminalConnected = (connected: boolean) => {
    setTerminalConnected(connected);
  };

  // * UPDATE BROWSER WALLETS
  const updateBrowserWallets = (wallets: any[]) => {
    setBrowserWallets(wallets);
  };

  // * UPDATE ACCOUNTS
  const updateAccounts = (accounts: Wallet[]) => {
    setAccounts(accounts);
  };

  // * UPDATE AVAILABLE ASSETS
  const updateAvailableAssets = (assets: Asset[]) => {
    setAvailableAssets(assets);
  };

  // * UPDATE SET ACCOUNTS
  // The merchant's L2 balance is what it received in the head (`totalInL2`); `payableInL2` covers only
  // user funds, so it is always empty for a merchant. L1 is shown apart and never added to it.
  const updateSetAccounts = useCallback(
    async (tmp: any): Promise<void> => {
      if (!tmp || typeof tmp !== "object") {
        console.error("Invalid API response: expected object, got", typeof tmp);
        return;
      }
      const totalInL1: Record<string, number> = tmp.totalInL1 || {};
      const totalInL2: Record<string, number | string> = tmp.totalInL2 || {};

      try {
        // USD values are display-only, so floats are fine from here on.
        const usdRate: Record<string, number> = {
          ada: await getAdaToUsd(),
          usdm: 1,
          wbtc: await getWbtcToUsd(),
        };
        const base = {
          name: (wallet as any)._walletName,
          address: address,
          icon: browserWallets?.find(
            (w: any) => w.name === (wallet as any)._walletName,
          )?.icon,
        };
        let totalUsd = 0;
        const perAsset: Wallet[] = availableAssets.flatMap((a) => {
          const l2 = formatBaseUnits(
            String(totalInL2[a.assetUnit] ?? 0),
            a.decimals,
          );
          const l1 = formatBaseUnits(
            String(totalInL1[a.assetUnit] ?? 0),
            a.decimals,
          );
          const rate = usdRate[a.name] ?? 0;
          totalUsd += Number(l2) * rate;
          return [
            {
              ...base,
              balance: {
                amount: l2,
                currency: `${a.symbol} L2`,
                asUsd: (Number(l2) * rate).toFixed(2),
              },
            },
            {
              ...base,
              balance: {
                amount: l1,
                currency: `${a.symbol} L1`,
                asUsd: (Number(l1) * rate).toFixed(2),
              },
            },
          ];
        });
        setAccounts([
          {
            ...base,
            balance: { amount: totalUsd, currency: "USD", asUsd: totalUsd },
          },
          ...perAsset,
        ]);
      } catch (error) {
        console.error("Error updating accounts:", error);
      }
    },
    [wallet, current, address, browserWallets, availableAssets],
  );

  // * REFRESH BALANCES FROM HYDRA QUERY-FUNDS
  const refreshBalances = useCallback(async () => {
    const walletAddress = (localStorage.getItem("wallet") as string) || address;

    // Validate address before making API call
    if (!walletAddress || walletAddress.length < 10) {
      console.error("Invalid wallet address for balance query");
      return;
    }

    const balanceRes = await fetch(
      `/api/hydra/query-funds?address=${walletAddress}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!balanceRes.ok) {
      console.error("Balance query failed:", balanceRes.status);
      return;
    }

    const tmp = await balanceRes.json();
    await updateSetAccounts(tmp);
  }, [address, updateSetAccounts]);

  // * L1 TX CONFIRMED (topup), THEN REFRESH
  const onConfirmation = useCallback(
    (txHash: string) => {
      setIsConfirming(() => true);
      blockfrost.onTxConfirmed(txHash, async () => {
        try {
          await refreshBalances();
        } catch (error) {
          console.error("Error in onConfirmation:", error);
        } finally {
          setIsConfirming(() => false);
        }
      });
    },
    [refreshBalances],
  );

  // * CONNECT
  const connect = useCallback(
    async (name: string, persist?: boolean) => {
      setLoading(true);
      await connectWallet(name, persist);

      // await updateSetAccounts();
    },
    [lovelace, address],
  );

  // * DISCONNECT
  const disconnect = useCallback(async () => {
    setLoading(true);
    await disconnectWallet();
    setLoading(false);
    // * SET LOCAL STORE ADDRESS
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("wallet");
    }
  }, [lovelace, address]);

  // * EDIT USER IN DB
  const editUserInDb = async (action: string, user: User, wallet: Wallet) => {
    const userData: UserData = {
      id: user?.uid as string,
      type: "merchant",
      email: user?.email as string,
      name: (user?.displayName as string) ?? "",
      avatar: (user?.photoURL as string) || "",
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      emailVerified: (user?.emailVerified as boolean) || false,
      wallet: wallet,
    };

    /*
    console.log("\n\nXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
    console.log("ACTION:", action);
    console.log("USER:", user);
    console.log("WALLET:", wallet);
    console.log("USER DATA:", userData);
    console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXX\n\n");
    */

    let updateRes: DbResponse;

    if (action === "create") {
      updateRes = await db.user.create(user.uid, userData);
    } else if (action === "update") {
      updateRes = await db.user.update(user?.uid as string, userData);
    }
  };

  // * ON MOUNT UPDATE BROWSER WALLETS
  useEffect(() => {
    setBrowserWallets(wallets);
  }, [wallets]);

  // * ON MOUNT CHECK IF USER EXISTS IN DB AND GET USER DATA
  useEffect(() => {
    // * 1. Check if user exists in DB.
    if (user) {
      db.user
        .getOne(user?.uid)
        .then(async (res: DbResponse) => {
          if (res.data) {
            // * If user exists, get user data.
            // console.log("user exists");

            const walletAddress =
              (localStorage.getItem("wallet") as string) || address;

            // Validate address before making API call
            if (!walletAddress || walletAddress.length < 10) {
              console.error("Invalid wallet address for balance query");
              return;
            }

            const balanceRes = await fetch(
              `/api/hydra/query-funds?address=${walletAddress}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              },
            );

            if (!balanceRes.ok) {
              console.error("Balance query failed:", balanceRes.status);
              return;
            }

            const tmp = await balanceRes.json();
            const txs1 = tmp.fundsInL1 || [];

            console.log(
              "\n\n",
              "TANSACTIONS",
              tmp.fundsInL1,
              tmp.fundsInL2,
              "\n\n",
            );

            const _wallet: Wallet = res.data.wallet;
            _wallet.transactions = txs1;

            setCurrent((w: Wallet) => {
              return { ...w, ..._wallet };
            });
          } else {
            // * If user does not exist, create user in DB.
            console.log("user does not exist", wallet);

            let walletData: Wallet | null;

            if (wallet) {
              walletData = {
                name: ((wallet as any)._walletName as string) || "",
                address: (address as string) || "",
                balance: {
                  amount: (lovelace as any) || 0,
                  currency: "ADA",
                  asUsd: Number(lovelace) * (await getAdaToUsd()),
                },
                icon:
                  (browserWallets?.find(
                    (w: any) => w.name === (wallet as any)._walletName,
                  )?.icon as string) || "",
                transactions: [],
                seedPhrase: "",
                publicKey: "",
              };
            } else {
              walletData = {
                name: "",
                address: "",
                balance: {
                  amount: 0,
                  currency: "",
                  asUsd: 0,
                },
                icon: "",
                transactions: [],
                seedPhrase: "",
                publicKey: "",
              };
            }
            editUserInDb("create", user, walletData as Wallet);
          }
        })
        .catch((error: DbResponse) => {
          console.log(error);
        });
    }
  }, [user, wallet, address, lovelace]);

  // *
  useEffect(() => {
    if (user && db) {
      db.user
        .getAll()
        .then((res: DbResponse) => {
          if (res.data) {
            setContacts(
              res.data.filter(
                (u: UserData) => u.type === "merchant" && u.id !== user.uid,
              ),
            );
          }
        })
        .catch((error: DbResponse) => {
          console.log(error);
        });
    }
  }, [user, db]);

  useEffect(() => {
    if (
      connected &&
      browserWallets &&
      browserWallets.length > 0 &&
      lovelace !== undefined &&
      address !== undefined
    ) {
      setLoading(() => true);

      // * SET LOCAL STORE ADDRESS
      if (typeof window !== "undefined") {
        window.localStorage.setItem("wallet", address);
      }

      const currentWallet = {
        ...current,
        name: (wallet as any)._walletName,
        address: address,
        balance: (parseFloat(lovelace) / 1000000).toFixed(2),
        icon: browserWallets?.find(
          (w: any) => w.name === (wallet as any)._walletName,
        )?.icon,
      };

      setCurrent(() => currentWallet);

      // * GET ADA-USD TICKER
      fetch(new Request("https://api.livecoinwatch.com/coins/single"), {
        method: "POST",
        headers: new Headers({
          "content-type": "application/json",
          "x-api-key": process.env
            .NEXT_PUBLIC_LIVE_COIN_WATCH_API_KEY as string,
        }),
        body: JSON.stringify({
          currency: "USD",
          code: "ADA",
          meta: true,
        }),
      })
        .then(async (res) => {
          const data = await res.json();

          // Validate address before making API call
          if (!address || address.length < 10) {
            console.error("Invalid wallet address for balance query");
            setLoading(() => false);
            return;
          }

          const balanceRes = await fetch(
            `/api/hydra/query-funds?address=${address}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!balanceRes.ok) {
            console.error("Balance query failed:", balanceRes.status);
            setLoading(() => false);
            return;
          }

          setLoading(() => false);
          const tmp = await balanceRes.json();
          await updateSetAccounts(tmp);
        })
        .catch((err) => {
          console.error("Error fetching balance:", err);
          setLoading(() => false);
        });
    }
  }, [connected, browserWallets, lovelace, address, wallet]);

  useEffect(() => {
    if (db && user) {
      const triggersRef = collection(fdb, USERS, user?.uid as string, TRIGGERS);

      const payTriggerUnsubs = onSnapshot(triggersRef, (querySnapshot) => {
        const triggers: any[] = [];

        if (querySnapshot.empty) {
          console.log("No triggers found");
          return;
        }

        querySnapshot.forEach(async (doc) => {
          const data = doc.data();
          triggers.push(data);
          if (data.status === "pending") {
            // API URL is now handled server-side

            const walletAddress =
              (localStorage.getItem("wallet") as string) || address;

            // Validate address before making API call
            if (!walletAddress || walletAddress.length < 10) {
              console.error("Invalid wallet address for balance query");
              return;
            }

            const fullUrl = `/api/hydra/query-funds?address=${walletAddress}`;

            console.log("Fetching balance from:", fullUrl);

            try {
              const balanceRes = await fetch(fullUrl, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (!balanceRes.ok) {
                throw new Error(`HTTP error! status: ${balanceRes.status}`);
              }

              const tmp = await balanceRes.json();
              await updateSetAccounts(tmp);
              await db.trigger.setCompletePayTrigger(user?.uid);
              console.log("\n\n[BALANCE UPDATED]\n\n");
            } catch (error) {
              console.error("Failed to fetch balance:", error);
              console.error("API URL:", fullUrl);
              console.error("Wallet address:", walletAddress);
            }
          }
        });
      });

      return () => {
        payTriggerUnsubs();
      };
    }
  }, [user, db]);

  const value = {
    accounts,
    updateAccounts,
    current,
    browserWallets,
    updateBrowserWallets,
    connect,
    state,
    connected,
    connecting,
    error,
    name,
    disconnect,
    address,
    wallet,
    lovelace,
    loading,
    isConfirming,
    onConfirmation,
    refreshBalances,
    contacts,
    terminalConnected,
    updateTerminalConnected,
    availableAssets,
    updateAvailableAssets,
  };

  return (
    <WalletContext.Provider value={value}>
      {children as React.ReactNode}
    </WalletContext.Provider>
  );
};
