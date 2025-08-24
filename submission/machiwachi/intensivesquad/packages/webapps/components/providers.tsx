"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import {
  RainbowKitSiweNextAuthProvider,
  GetSiweMessageOptions,
} from "@rainbow-me/rainbowkit-siwe-next-auth";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";
import { SessionProvider } from "next-auth/react";

import { config } from "@/lib/wagmi";

const queryClient = new QueryClient();

const getSiweMessageOptions: GetSiweMessageOptions = () => ({
  statement: "Intensive Squad - Gamified Study Warriors",
  domain:
    typeof window !== "undefined" ? window.location.host : "localhost:3000",
});

function RainbowKitProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // const { theme } = useTheme();

  return (
    <RainbowKitSiweNextAuthProvider
      getSiweMessageOptions={getSiweMessageOptions}
    >
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </RainbowKitSiweNextAuthProvider>
  );
}

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <WagmiProvider config={config}>
      <SessionProvider session={session} refetchInterval={0}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProviderWrapper>{children}</RainbowKitProviderWrapper>
        </QueryClientProvider>
      </SessionProvider>
    </WagmiProvider>
  );
}
