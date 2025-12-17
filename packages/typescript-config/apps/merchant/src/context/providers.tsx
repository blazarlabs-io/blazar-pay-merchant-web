"use client";

import { AuthProvider } from "../features/authentication/context/auth-provider";
import { APIProvider } from "@vis.gl/react-google-maps";
import { TransactionsProvider } from "./transactions";
import { CmsProvider } from "./cms";
import { WalletProvider } from "./wallet";
import { MeshProvider } from "@meshsdk/react";
import { usePublicConfig } from "../hooks/use-public-config";

function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  const { config, loading, error } = usePublicConfig();

  // Don't block the app while loading Google Maps config
  // Just render children without Google Maps until config loads
  if (loading || error || !config) {
    return <>{children}</>; // Render children without Google Maps
  }

  return (
    <APIProvider apiKey={config.googleMaps?.apiKey || ""}>
      {children}
    </APIProvider>
  );
}

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <AuthProvider>
        <CmsProvider>
          <MeshProvider>
            <WalletProvider>
              <TransactionsProvider>
                <GoogleMapsProvider>{children}</GoogleMapsProvider>
              </TransactionsProvider>
            </WalletProvider>
          </MeshProvider>
        </CmsProvider>
      </AuthProvider>
    </>
  );
};
