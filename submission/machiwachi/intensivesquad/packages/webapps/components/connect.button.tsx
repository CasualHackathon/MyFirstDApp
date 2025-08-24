"use client";
import { ConnectButton as RainbowConnectButton } from "@rainbow-me/rainbowkit";
export function ConnectButton() {
  return (
    <RainbowConnectButton
      chainStatus={{
        smallScreen: "none",
        largeScreen: "none",
      }}
      accountStatus={{
        smallScreen: "avatar",
        largeScreen: "avatar",
      }}
      showBalance={{
        smallScreen: false,
        largeScreen: true,
      }}
    />
  );
}
