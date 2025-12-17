import { Icon } from "@iconify/react";
import { Button } from "@repo/ui/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@repo/ui/components/ui/sheet";
import Link from "next/link";
import { useState, useEffect } from "react";

export interface TerminalSettingsProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  terminalConnected: boolean;
}

export function TerminalSettings({
  open,
  setOpen,
  terminalConnected,
}: TerminalSettingsProps) {
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          style={{
            borderColor: terminalConnected ? "#ace650" : "#2e2d2d",
            color: terminalConnected ? "#ace650" : "#2e2d2d",
          }}
          className="flex items-center justify-center p-2 border rounded-lg border-sidebar-primary-foreground"
        >
          <Icon icon="lucide:nfc" width="20" height="20" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Blazar Pay Terminal Settings</SheetTitle>
          <SheetDescription>
            Manage your Blazar Pay terminal settings here.
          </SheetDescription>
        </SheetHeader>
        <div className="flex items-center justify-center py-8">
          <Button variant="outline" className="w-full">
            <Link href="http://blazar.local" target="_blank">
              Open Settings
            </Link>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
