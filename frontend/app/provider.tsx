"use client";
import { Alfajores, Celo } from "@celo/rainbowkit-celo/chains";
import { RainbowKitProvider, connectorsForWallets } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { ReactNode } from "react";
import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';

const client = new ChainhooksClient({
  baseUrl: CHAINHOOKS_BASE_URL.mainnet,
  apiKey: process.env.CHAINHOOKS_API_KEY,
});

async function manageChainhooks() {
  try {
    // Check API status
    const status = await client.getStatus();
    console.log('API Status:', status.status);
    console.log('Server Version:', status.server_version);

    // List all chainhooks
    const { results, total } = await client.getChainhooks({ limit: 50 });
    console.log(`Found ${total} chainhooks`);

    // Get details of first chainhook
    if (results.length > 0) {
      const firstChainhook = await client.getChainhook(results[0].uuid);
      console.log('First chainhook:', firstChainhook.definition.name);
    }

  } catch (error: any) {
    console.error('Error managing chainhooks:', error.message);
  }
}
manageChainhooks();
const queryClient = new QueryClient();

const connectors : any= connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [injectedWallet({ appName: "FutureX"})],
  },
]);

const config = createConfig({
  chains: [Celo],
  transports: {
    [Celo.id]: http(),
  },
  connectors,
});

const appInfo = {
  appName: "FutureX",
};


export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}


export default AppProvider;