import { useWallet } from "@/context/wallet";
import { Button } from "@repo/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Link2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";

export function WalletConnect() {
  const {
    browserWallets,
    connected,
    current,
    connect,
    loading,
    disconnect,
    isConfirming,
  } = useWallet();
  const [label, setLabel] = useState<string>("Connect Wallet");
  const [icon, setIcon] = useState<string | null>(null);

  const handleWalletSelect = (wallet: any) => {
    console.log("\n\n[WALLET SELECT]", wallet, "\n\n");
    setLabel(wallet.name);
    setIcon(wallet.icon);
    connect(wallet.name);
  };

  useEffect(() => {
    if (current && Object.keys(current).length > 0) {
      setLabel(current.balance);
      setIcon(current.icon);
    }
  }, [current, connected]);
  return (
    <>
      {isConfirming && (
        <Icon icon="svg-spinners:3-dots-fade" width="24" height="24" />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="flex items-center gap-2 capitalize cursor-pointer"
            style={{
              backgroundColor: connected ? "#ace65022" : "#bf3b6522",
              borderColor: connected ? "#ace650" : "#bf3b65",
            }}
          >
            {/* {icon && <img src={icon} alt="" className="w-4 h-4" />}
          {label} */}
            {loading ? (
              <LoaderCircle
                className="animate-spin"
                style={{ color: "#ace650" }}
              />
            ) : (
              <Link2
                className="w-5 h-5"
                style={{
                  color: connected ? "#ace650" : "#bf3b65",
                }}
              />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="start">
          {/* <DropdownMenuLabel>My Account</DropdownMenuLabel> */}
          <DropdownMenuGroup className="p-2">
            {browserWallets &&
              browserWallets.length > 0 &&
              browserWallets.map((wallet: any) => (
                <DropdownMenuItem
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet)}
                  className="cursor-pointer"
                >
                  <img src={wallet.icon} alt="" className="w-4 h-4" />
                  <span className="capitalize">{wallet.name}</span>
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
          {connected && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-2">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={disconnect}
                >
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          {/*<DropdownMenuSeparator />
        <DropdownMenuItem>GitHub</DropdownMenuItem>
        <DropdownMenuItem>Support</DropdownMenuItem>
        <DropdownMenuItem disabled>API</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
