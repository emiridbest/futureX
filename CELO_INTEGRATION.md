# Celo & MiniPay Integration Guide

## Overview
This project has been set up to support Celo MiniPay, a stablecoin wallet integrated into the Opera Mini browser. This integration allows users to connect their MiniPay wallet to the Tradi dApp.

## Current Integration
We have added a `MiniPayButton` component in the Navbar.
- **File:** `frontend/components/MiniPayButton.tsx`
- **Functionality:** Detects if the app is running inside MiniPay (Opera Mini) and requests connection.

## How to Test
1.  **Deploy the Frontend:** You must deploy your Next.js frontend to a public URL (e.g., Vercel).
2.  **Install Opera Mini:** On an Android device, install the Opera Mini browser.
3.  **Open MiniPay:** Set up your MiniPay wallet within Opera Mini.
4.  **Visit your URL:** Open your deployed URL inside the Opera Mini browser.
5.  **Connect:** Click the "Connect MiniPay" button. It should prompt you to connect your wallet.

## Future Steps for Full Prediction Market Integration
To fully realize the "Prediction Market" vision on Celo:

1.  **Smart Contracts:** Deploy a prediction market smart contract on Celo (or use an existing one like Polymarket or similar if available on Celo).
2.  **Betting:** Update the `MiniPayButton` or create a new `PlaceBet` component to send transactions (cUSD) to the smart contract.
    ```typescript
    // Example transaction
    const sendTransaction = async () => {
      const params = [
        {
          from: account,
          to: "0x...", // Prediction Market Contract Address
          value: "0x...", // Amount in Wei
          data: "0x..." // Function call data (e.g., bet on "Up")
        },
      ];
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params,
      });
    };
    ```
3.  **Oracle Data:** Use the backend AI predictions to resolve the markets or provide "confidence scores" to users before they bet.

## Resources
- [MiniPay Documentation](https://docs.celo.org/developer/build-on-minipay)
- [Celo Developer Documentation](https://docs.celo.org/)
