"use client";

import { Button } from "@repo/ui/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/ui/table";
import { Copy } from "lucide-react";
import { useEffect } from "react";
import { useTransactions } from "~/src/context/transactions";

export const TransactionsHistory = () => {
  const { transactions } = useTransactions();

  useEffect(() => {
    console.log("XXXXXXXXXtransactions", transactions);
  }, [transactions]);

  return (
    <div className="mt-6">
      <div className="">
        <Table className="">
          <TableCaption>A list of your transactions.</TableCaption>
          <TableHeader className="">
            <TableRow className="">
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead className="">Hash</TableHead>
              <TableHead className="">Origin</TableHead>
              <TableHead className="">Destination</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium max-w-[164px] truncate">
                      {transaction.id}
                    </span>
                    <Button variant="ghost" className="ml-2 text-xs">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium max-w-[164px] truncate">
                      {transaction.transactionHash}
                    </span>
                    <Button variant="ghost" className="ml-2 text-xs">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium max-w-[164px] truncate">
                      {transaction.originWallet.address}
                    </span>
                    <Button variant="ghost" className="ml-2 text-xs">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-medium max-w-[164px] truncate">
                      {transaction.destinationWallet.address}
                    </span>
                    <Button variant="ghost" className="ml-2 text-xs">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.ammount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
