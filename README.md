# FutureX - AI Prediction Market Oracle

**Submitted for the Celo Mobile Games & Prediction Markets Hackathon**

FutureX is an advanced trading analysis multi-agent dApp combining AI and machine learning to deliver real-time market insights, technical analysis, and price predictions. It serves as a powerful **Oracle for Prediction Markets**, helping users make informed decisions on Celo-based prediction platforms.

## Hackathon Track: Prediction Markets
FutureX fits the **Prediction Markets** category by providing the essential data layer and probability assessments needed for successful prediction market participation. By leveraging AI models (Scikit-learn, TensorFlow) and real-time data, FutureX empowers users to predict crypto price movements with higher confidence.

## Key Features
- **AI-Powered Predictions**: Machine learning models forecast price trends.
- **Market Analysis**: Real-time technical analysis and sentiment analysis.
- **Conversational AI Agent**: Chat interface powered by **GOAT SDK** and **Vercel AI SDK** to query market data and perform on-chain actions.
- **On-Chain Actions**: Execute transactions directly from the chat (Send CELO/cUSD, DCA with Balmy, etc.).
- **MiniPay Integrated**: Fully compatible with Opera MiniPay for a seamless mobile blockchain experience.
- **Celo Blockchain**: Built on Celo for fast, low-cost transactions.

## Technologies
- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI
- **AI & Agents**: Vercel AI SDK, GOAT SDK (Great Onchain Agent Toolkit)
- **Blockchain**: Celo (Testnet/Mainnet), Viem, Wagmi
- **Plugins**: 
  - `@goat-sdk/plugin-erc20` (Token transfers)
  - `@goat-sdk/plugin-superfluid` (Streaming payments)
  - `@goat-sdk/plugin-balmy` (DCA strategies)
  - `@goat-sdk/plugin-allora` (AI Inference)
- **Backend**: Python Flask (ML Models: Scikit-learn, TensorFlow)

## Project Structure

```
tradi/
├── frontend/                 # Next.js application (Mobile-first UI)
│   ├── app/                  # Pages and routes (home, analyze, predictions)
│   ├── components/           # UI components (charts, forms, prediction displays)
│   └── public/               # Static assets and images
├── backend/                  # Flask API server
│   ├── app/                  # Core application
│   │   ├── models/           # ML prediction models (sklearn, tensorflow. arima)
│   │   └── routes/           # API endpoints for data and predictions
│   └── utils/                # Trading strategies and data processing
└── README.md                 # Project documentation     
```

## Installation

1. Clone this repository and navigate into it:

```bash
git clone https://github.com/emiridbest/tradi
cd tradi
```
# Backend Setup
2. Install the required packages:

```bash
pip install -r requirements.txt  
```

3. Setup environment variables

```bash

# Create .env file and add these variables
OPENAI_API_KEY="your_openai_api_key_here"
PRIVATE_KEY="your_agent_private_key" # all private keys may not work...so ask me for it
ENVIRONMENT=testnet
```

4. Running the agent

```bash
python main.py 
```


# Frontend setup
5. Open new terminal in the root directory of the project and install dependencies

```bash
cd frontend
npm install
```

6. Setup environment variables
-  Create `.env` file in the `frontend` directory
-  Add the following variables:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:5000
   WALLET_PRIVATE_KEY="your_agent_wallet_private_key"
   RPC_PROVIDER_URL="https://forno.celo.org" # or https://alfajores-forno.celo-testnet.org
   ALLORA_API_KEY="your_allora_api_key"
   OPENAI_API_KEY="your_openai_api_key"
   ```

7. Run react app

```bash
npm run dev

```

Visit `http://localhost:3000` in your web browser to access the application.

## Celo & MiniPay Integration
FutureX is optimized for the Celo ecosystem and integrated with MiniPay:
- **Connect Wallet**: Users can connect their MiniPay wallet directly via the UI.
- **Agent Wallet**: The AI agent has its own server-side wallet to execute complex tasks on behalf of the user (with permissions).
- **Token Support**: Native support for CELO, cUSD, and USDC.

## Next Steps:
- Incorporate and test live trading strategies
- Test automated trading
- Full Celo Smart Contract integration for on-chain prediction verification.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
# Screenshots


![chat_analysis](https://github.com/emiridbest/tradi/blob/main/assets/chat_analysis.png) 

![dashboard](https://github.com/emiridbest/tradi/blob/main/assets/dashboard.png)

![loading](https://github.com/emiridbest/tradi/blob/main/assets/loading.png)

![price_prediction](https://github.com/emiridbest/tradi/blob/main/assets/price_prediction.png) 

![real_time](https://github.com/emiridbest/tradi/blob/main/assets/real_time.png)
