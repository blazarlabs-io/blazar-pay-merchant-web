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
  contacts: any;
  maxToSpend: number;
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
  contacts: null,
  maxToSpend: 0,
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
  const [maxToSpend, setMaxToSpend] = useState<number>(0);
  const [terminalConnected, setTerminalConnected] = useState<boolean>(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([
    {
      name: "ada",
      symbol: "ADA",
      decimals: 6,
      amount: 0,
      icon: "/images/ada-token.png",
      selected: true,
      assetUnit: "lovelace",
    },
    {
      name: "usdm",
      symbol: "USDM",
      decimals: 0,
      amount: 0,
      icon: "/images/usdm-token.png",
      selected: false,
      assetUnit:
        "77484e67c1ed6c96f55b89206cb5d6caae9a09a0bd473bba817929fe5553444d",
    },
    {
      name: "wbtc",
      symbol: "WBTC",
      decimals: 8,
      amount: 0,
      icon: "/images/wbtc-token.png",
      selected: false,
      assetUnit:
        "d2a8592ec9673ac18fea1044885f94518e954ab0cb2b6bb0a328d2af425443",
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
  const updateSetAccounts = useCallback(
    async (tmp: any): Promise<any> => {
      return new Promise(async (resolve, reject) => {
        // Validate response structure
        if (!tmp || typeof tmp !== "object") {
          console.error(
            "Invalid API response: expected object, got",
            typeof tmp,
          );
          resolve({ adaBalance: 0, usdmBalance: 0, wbtcBalance: 0 });
          return;
        }

        // Ensure totalInL1 and totalInL2 exist, default to empty objects
        const totalInL1 = tmp.totalInL1 || {};
        const totalInL2 = tmp.totalInL2 || {};

        // Get asset units with fallback
        const adaAssetUnit =
          availableAssets.find((a) => a.name === "ada")?.assetUnit ||
          "lovelace";
        const usdmAssetUnit =
          availableAssets.find((a) => a.name === "usdm")?.assetUnit || "";
        const wbtcAssetUnit =
          availableAssets.find((a) => a.name === "wbtc")?.assetUnit || "";

        // Safely extract balances with proper null/undefined handling
        const adaBalanceL1 = totalInL1[adaAssetUnit] || 0;
        const adaBalanceL2 = totalInL2[adaAssetUnit] || 0;
        const usdmBalanceL1 = totalInL1[usdmAssetUnit] || 0;
        const usdmBalanceL2 = totalInL2[usdmAssetUnit] || 0;
        const wbtcBalanceL1 = totalInL1[wbtcAssetUnit] || 0;
        const wbtcBalanceL2 = totalInL2[wbtcAssetUnit] || 0;

        const adaBalance = (adaBalanceL1 || 0) + (adaBalanceL2 || 0);
        const usdmBalance = (usdmBalanceL1 || 0) + (usdmBalanceL2 || 0);
        const wbtcBalance = (wbtcBalanceL1 || 0) + (wbtcBalanceL2 || 0);

        const fixedWbtcBalance = parseFloat(
          (parseFloat(wbtcBalance) / 100000000).toFixed(8),
        );

        try {
          const adaRate = await getAdaToUsd();
          const wbtcRate = await getWbtcToUsd();
          const usdFromAda = (adaBalance / 1000000) * adaRate;
          const usdFromWbtc = fixedWbtcBalance * Number(wbtcRate.toFixed(2)); //Number(fixedWbtcBalance / 100000000) * Number(wbtcRate.toFixed(2));

          const formattedUsdFromWbtc = usdFromWbtc.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4,
            useGrouping: false,
          });

          console.info("\n\n\n=========================================");
          console.info("ADA BALANCE L1", adaBalanceL1);
          console.info("ADA BALANCE L2", adaBalanceL2);
          console.info("USDM BALANCE L1", usdmBalanceL1);
          console.info("USDM BALANCE L2", usdmBalanceL2);
          console.info("WBTC BALANCE L1", wbtcBalanceL1);
          console.info("WBTC BALANCE L2", wbtcBalanceL2);
          console.info("ADA TOTAL BALANCE", adaBalance);
          console.info("USDM TOTAL BALANCE", usdmBalance);
          console.info("WBTC TOTAL BALANCE", wbtcBalance);
          console.info("FIXED WBTC BALANCE", fixedWbtcBalance);
          console.log("ADA RATE", adaRate);
          console.log("WBTC RATE", Number(wbtcRate.toFixed(2)));
          console.log("USD FROM ADA", usdFromAda);
          console.log("USD FROM WBTC", usdFromWbtc);
          console.log("USD FROM WBTC FORMATTED", formattedUsdFromWbtc);
          console.info("=========================================\n\n\n");

          const newAccounts: Wallet[] = [
            {
              name: (wallet as any)._walletName,
              address: address,
              balance: {
                amount: (Number(adaBalance) / 1000000).toFixed(2),
                currency: "ADA",
                asUsd: usdFromAda.toFixed(2),
              },
              icon: browserWallets?.find(
                (w: any) => w.name === (wallet as any)._walletName,
              )?.icon,
            },
            {
              name: (wallet as any)._walletName,
              address: address,
              balance: {
                amount: usdFromAda + usdFromWbtc + usdmBalance,
                currency: "USD",
                asUsd: usdFromAda + usdFromWbtc + usdmBalance,
              },
              icon: browserWallets?.find(
                (w: any) => w.name === (wallet as any)._walletName,
              )?.icon,
            },
            {
              name: (wallet as any)._walletName,
              address: address,
              balance: {
                amount: Number(usdmBalance).toFixed(2),
                currency: "USDM",
                asUsd: Number(Number(usdmBalance).toFixed(2)),
              },
              icon: browserWallets?.find(
                (w: any) => w.name === (wallet as any)._walletName,
              )?.icon,
            },
            {
              name: (wallet as any)._walletName,
              address: address,
              balance: {
                amount: fixedWbtcBalance,
                currency: "WBTC",
                asUsd: formattedUsdFromWbtc,
              },
              icon: browserWallets?.find(
                (w: any) => w.name === (wallet as any)._walletName,
              )?.icon,
            },
          ];
          setAccounts(() => newAccounts);
          resolve({ adaBalance, usdmBalance, wbtcBalance });
        } catch (error) {
          console.error("Error updating accounts:", error);
          // Return zero balances on error rather than null
          resolve({ adaBalance: 0, usdmBalance: 0, wbtcBalance: 0 });
        }
      });
    },
    [wallet, current, address, browserWallets, availableAssets],
  );

  const onConfirmation = useCallback(
    (txHash: string) => {
      setIsConfirming(() => true);
      blockfrost.onTxConfirmed(txHash, async () => {
        try {
          console.log(
            "\n\n[TX-XONFIRMED]",
            wallet,
            localStorage.getItem("wallet") as string,
            "\n\n",
          );

          const walletAddress =
            (localStorage.getItem("wallet") as string) || address;

          // Validate address before making API call
          if (!walletAddress || walletAddress.length < 10) {
            console.error("Invalid wallet address for balance query");
            setIsConfirming(() => false);
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
            setIsConfirming(() => false);
            return;
          }

          const tmp = await balanceRes.json();
          const { adaBalance, usdmBalance, wbtcBalance } =
            await updateSetAccounts(tmp);

          setMaxToSpend(
            () => (adaBalance || 0) + (usdmBalance || 0 + wbtcBalance || 0),
          );
        } catch (error) {
          console.error("Error in onConfirmation:", error);
        } finally {
          setIsConfirming(() => false);
        }
      });
    },
    [address, updateSetAccounts, wallet],
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
            const balanceL1 = tmp.totalInL1 || {};
            const balanceL2 = tmp.totalInL2 || {};

            console.log(
              "\n\n",
              "TANSACTIONS",
              tmp.fundsInL1,
              tmp.fundsInL2,
              "\n\n",
            );

            setMaxToSpend(() => balanceL1 + balanceL2);

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
          const { adaBalance, usdmBalance, wbtcBalance } =
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
              const { adaBalance, usdmBalance, wbtcBalance } =
                await updateSetAccounts(tmp);
              await db.trigger.setCompletePayTrigger(user?.uid);
              console.log(
                "\n\n[BALANCE UPDATED]",
                adaBalance + usdmBalance + wbtcBalance,
                "\n\n",
              );
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
    contacts,
    maxToSpend,
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
