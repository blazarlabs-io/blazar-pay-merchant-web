"use client";

import { useEffect } from "react";
import { useAuth } from "~/src/features/authentication/context/auth-provider";
import { useRouter } from "next/navigation";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("[PROTECTED_ROUTE] Auth state:", { loading, user: !!user });
    // Only redirect if auth is done loading and there's no user
    if (!loading && !user) {
      console.log("[PROTECTED_ROUTE] No user found, redirecting to /login");
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="flex h-full min-h-[800px] w-full flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not loading and no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  return <>{children}</>;
};
