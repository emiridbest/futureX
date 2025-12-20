"use client";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injected } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiConfig, createConfig } from "wagmi";
import { ReactNode } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "wagmi/chains";
const queryClient = new QueryClient();


export const config = createConfig({
  chains: [celo],
  connectors: [
    injected(),
  ],
  transports: {
    [celo.id]: http('https://rpc.ankr.com/celo/e1b2a5b5b759bc650084fe69d99500e25299a5a994fed30fa313ae62b5306ee8', {
      timeout: 30_000,
      retryCount: 3,
    }),
  },
})

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
    </WagmiConfig>
  );
}

