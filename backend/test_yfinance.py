import yfinance as yf
import pandas as pd

def test_yfinance():
    symbol = "NVDA"
    print(f"Testing yfinance download for {symbol}...")
    try:
        data = yf.download(symbol, period="1mo", interval="1d", progress=False)
        if data.empty:
            print("Error: Downloaded data is empty.")
        else:
            print("Success! Data shape:", data.shape)
            print(data.head())
    except Exception as e:
        print(f"Error: yfinance download failed: {e}")

if __name__ == "__main__":
    test_yfinance()
