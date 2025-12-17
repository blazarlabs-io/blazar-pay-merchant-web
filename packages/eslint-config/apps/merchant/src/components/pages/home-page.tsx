"use client";

import Image from "next/image";
import { Button } from "@repo/ui/components/ui/button";
import Link from "next/link";
import { useResponsiveSize } from "@/hooks/use-responsive-size";
import { useAuth } from "~/src/features/authentication/context/auth-provider";
import { useEffect } from "react";

export const HomePage = () => {
  const { device } = useResponsiveSize();
  const { user } = useAuth();

  return (
    <>
      <div className="mb-[64px] flex w-full flex-col gap-[48px]">
        <section className="flex flex-col w-full h-full px-48 py-16">
          <div className="relative flex items-center justify-center">
            <Image
              src="/images/hero-image.png"
              alt="Hero image"
              width={300}
              height={300}
            />
          </div>
          <div className="flex flex-col items-center justify-center w-full gap-2">
            <h1 className="text-5xl text-center font-medium leading-[64px] gap-2 flex items-center justify-center">
              Welcome to
              <Image
                src="/images/hydrapay-logo-primary.png"
                alt="Logo"
                width={212}
                height={48}
                className="mt-[-4px] ml-[4px]"
              />
            </h1>
            <p className="py-2 max-w-[620px] text-xl font-normal text-center text-muted-foreground">
              Unlock seamless, lightning-fast micropayments powered by Cardano's
              Hydra technology!
            </p>

            <Button size="lg" className="mt-4">
              <Link href={user ? "/dashboard/home" : "/signup"}>
                Get Started
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};
