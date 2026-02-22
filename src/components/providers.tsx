"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";
import { TooltipProvider } from "@/components/ui/tooltip";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Fetch failed");
    throw error;
  }
  return res.json();
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
      >
        <SWRConfig
          value={{
            fetcher,
            revalidateOnFocus: false,
            dedupingInterval: 2000,
          }}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </SWRConfig>
      </ThemeProvider>
    </SessionProvider>
  );
}
