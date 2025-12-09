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
// @ts-ignore - Optional import
import { esusu } from "@/agent/src";
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
    const { messages, userAddress } = await req.json();

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
        plugins: [sendETH(), erc20({ tokens }), esusu(), superfluid(), allora({
            apiKey: process.env.ALLORA_API_KEY,
        }), balmy()],
    });

    // Extract the initial analysis from the chat history to provide context
    const analysisContext = Array.isArray(messages) ? messages.find((m: any) => m.role === 'assistant')?.content : null;

    const result = streamText({
        model: openai("gpt-4o-mini") as LanguageModelV1,
        system: `You are a helpful AI trading assistant and onchain agent.
        
        Your capabilities:
        1. Analyze market data and trading signals provided in the chat history.
        2. Perform onchain transactions on the Celo blockchain (sending tokens, DCA, etc.) using the provided tools.
        3. Answer questions about the technical analysis and recommendations provided earlier in the conversation.
        
        ${analysisContext ? `CURRENT MARKET ANALYSIS CONTEXT:\n${analysisContext}\n\nUse the above analysis as the primary context when answering questions about "the response", "the analysis", or "what do you think".` : ''}
        
        If the user asks to perform an action (like "buy this token" or "send 5 USDC"), use the appropriate tool.
        If the user asks for advice or clarification, use the provided analysis and your general knowledge.
        You are a helpful agent that performs onchain transactions like claiming usdt for users who are on minipay or celo for users who are not on minipay via the Esusu faucet on the Celo blockchain. The connected user's address is ${userAddress}.
            Always ensure you are sending tokens to the correct address.
                Never send tokens to any address other than ${userAddress}.
                Always ensure you send only claim tokens to ${userAddress}.
                Never sent tokens to yourself.
                Never you confuse user address which is ${userAddress} with your own address which is ${account.address}.
                Your address is only used to sign transactions.
                Your address is not the recipient address for claimed tokens.
                Your address is never the destination for claimed tokens.
                If you are unsure about any request, ask for clarification instead of making assumptions.
                Your address is ${account.address}, and you must not send claimed tokens to this address, and you must not confuse this address with ${userAddress}.`,
        //@ts-ignore
        tools: tools,
        maxSteps: 20,
        messages,
    });

    return result.toDataStreamResponse();
}