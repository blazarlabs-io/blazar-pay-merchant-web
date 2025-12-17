"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

export interface LogoProps {
  className?: string;
}

export const Logo = ({ className }: LogoProps) => {
  const { theme } = useTheme();
  return (
    <Image
      src={
        theme === "dark"
          ? "/images/hydrapay-logo-white.png"
          : "/images/hydrapay-logo.png"
      }
      alt="Logo"
      width={116}
      height={48}
      className={className}
    />
  );
};
