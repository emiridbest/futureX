import { openai } from "@ai-sdk/openai";
import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { erc20, USDC } from "@goat-sdk/plugin-erc20";
import { superfluid } from "@goat-sdk/plugin-superfluid";
import { polymarket } from "@goat-sdk/plugin-polymarket";
import { viem } from "@goat-sdk/wallet-viem";
import { generateText } from "ai";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { Token } from "@goat-sdk/plugin-erc20";
require("dotenv").config();
import { google } from '@ai-sdk/google';
import { LanguageModelV1, streamText } from 'ai';
import { sendETH, } from "@goat-sdk/wallet-evm";
import { balmy } from "@goat-sdk/plugin-balmy";
import { allora } from "@goat-sdk/plugin-allora";
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';


const tokens: Token[] = [
    {
        decimals: 6,
        symbol: "USDC",
        name: "USD Coin",
        chains: {
            "42220": {
                contractAddress: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
            },
        },
    },
    {
        decimals: 6,
        symbol: "CELO",
        name: "Celo",
        chains: {
            "42220": {
                contractAddress: "0x471EcE3750Da237f93B8E339c536989b8978a438",
            },
        },
    },
    {
        decimals: 6,
        symbol: "cUSD",
        name: "Celo Dollar",
        chains: {
            "42220": {
                contractAddress: "0x765de816845861e75a25fca122bb6898b8b1282a",
            },
        },
    }
];
export async function POST(req: Request) {
    const { messages } = await req.json();

    const privateKey = process.env.WALLET_PRIVATE_KEY;
    if (!privateKey) {
        return NextResponse.json({ error: 'WALLET_PRIVATE_KEY not set' }, { status: 500 });
    }

    // Handle private key formatting
    let formattedKey = privateKey;
    if (privateKey.startsWith('x')) {
        // Assume 'x' was a typo for '0x' or just 'x' prefix
        formattedKey = '0' + privateKey;
    } else if (!privateKey.startsWith('0x')) {
        formattedKey = '0x' + privateKey;
    }
    
    let account;
    try {
        account = privateKeyToAccount(formattedKey as `0x${string}`);
    } catch (error) {
        console.error("Invalid private key format:", error);
        return NextResponse.json({ error: 'Invalid private key configuration' }, { status: 500 });
    }

    const RPC_URL = process.env.RPC_PROVIDER_URL;


// Use Ankr RPC endpoint (can be overridden by RPC_PROVIDER_URL env var)
const rpcTransport = RPC_URL
    ? http(RPC_URL, { timeout: 30_000, retryCount: 3 })
    : http('https://rpc.ankr.com/celo/e1b2a5b5b759bc650084fe69d99500e25299a5a994fed30fa313ae62b5306ee8', {
        timeout: 30_000,
        retryCount: 3,
    });
const walletClient = createWalletClient({
    account,
    transport: rpcTransport,
    chain: celo,
});
    const tools = await getOnChainTools({
        //@ts-ignore
        wallet: viem(walletClient),
        //@ts-ignore
        plugins: [sendETH(), erc20({ tokens }), superfluid(), allora({
            apiKey: process.env.ALLORA_API_KEY,
        }), balmy()],
    });



    const result = streamText({
        model: openai("gpt-4o-mini") as LanguageModelV1,
        system: "You are a helpful agent that performs onchain transactions like sending celo,cusd, implement dolar-cost-averaging using balmy protocol, tokens etc and provides onchain advice based on data given",
        //@ts-ignore
        tools: tools,
        maxSteps: 20,
        messages,
    });

    return result.toDataStreamResponse();
}