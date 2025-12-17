"use client";

import { DbResponse, Transaction } from "@/types/db";

// LIBS
import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../lib/firebase/services/db";

export interface TransactionsContextInterface {
  transactions: Transaction[] | null;
}

const contextInitialData: TransactionsContextInterface = {
  transactions: null,
};

const TransactionsContext = createContext(contextInitialData);

export const useTransactions = (): TransactionsContextInterface => {
  const context = useContext<TransactionsContextInterface>(TransactionsContext);

  if (context === undefined) {
    throw new Error(
      "use Transactions Context must be used as within a Provider",
    );
  }

  return context;
};

export const TransactionsProvider = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  const [transactions, setTransactions] = useState<Transaction[] | null>(null);

  useEffect(() => {
    setTransactions(null);
    db.transaction
      .getAll()
      .then((response: DbResponse) => {
        setTransactions(response.data as Transaction[]);
      })
      .catch((error: DbResponse) => {
        console.log(error);
      });
  }, []);

  const value = { transactions };

  return (
    <TransactionsContext.Provider value={value}>
      {children as any}
    </TransactionsContext.Provider>
  );
};
