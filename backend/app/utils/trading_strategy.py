import pandas as pd
import numpy as np
import yfinance as yf

def fetch_stock_data(symbol: str, timeframe: str, interval: str = 'hour') -> pd.DataFrame:
    """
    Fetch historical stock data with timeframe and interval selection.
    
    Parameters:
        symbol (str): Stock symbol, e.g., 'AAPL', 'MSFT'
        timeframe (str): Time period, e.g., '1M', '3M', '1Y'
        interval (str): Data frequency - 'hour', 'day', '15m', etc.
    
    Returns:
        pd.DataFrame: Historical stock data
    """
    try:
        end_date = pd.Timestamp.now()
        
        # Map timeframes to days
        timeframe_dict = {
            '1M': 30,
            '3M': 90, 
            '6M': 180,
            '1Y': 365,
            '2Y': 730,
            '5Y': 1825
        }
        
        # Map interval parameter to yfinance interval strings
        interval_dict = {
            'minute': '1m',    # 1 minute
            '5min': '5m',      # 5 minutes
            '15min': '15m',    # 15 minutes
            '30min': '30m',    # 30 minutes
            'hour': '1h',      # 1 hour
            'day': '1d',       # 1 day
            'week': '1wk',     # 1 week
            'month': '1mo'     # 1 month
        }
        
        # Set the interval (default to 1h if not specified)
        yf_interval = interval_dict.get(interval, '1h')
        
        # Handle cryptocurrency symbols
        if symbol.upper() in ['BTC', 'ETH', 'DOGE', 'XRP', 'SOL']:
            symbol = f"{symbol}-USD"
            
        # Common company name to ticker mapping
        symbol_map = {
            'NVIDIA': 'NVDA',
            'MICROSOFT': 'MSFT',
            'APPLE': 'AAPL',
            'GOOGLE': 'GOOGL',
            'AMAZON': 'AMZN',
            'TESLA': 'TSLA',
            'META': 'META',
            'NETFLIX': 'NFLX'
        }
        if symbol.upper() in symbol_map:
            symbol = symbol_map[symbol.upper()]

        # Determine period based on timeframe and interval constraints
        # yfinance intraday data (interval < 1d) is limited to last 60 days
        is_intraday = yf_interval in ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h']
        
        period_map = {
            '1M': '1mo',
            '3M': '3mo',
            '6M': '6mo',
            '1Y': '1y',
            '2Y': '2y',
            '5Y': '5y'
        }
        
        yf_period = period_map.get(timeframe, '1y')
        
        if is_intraday:
            # If requesting intraday data for > 60 days, cap it at 1mo or max 60d
            # Using '1mo' is safer for reliability
            if timeframe not in ['1M']:
                print(f"Adjusting period to '1mo' for intraday interval {yf_interval}")
                yf_period = '1mo'

        print(f"Downloading data for {symbol} with period {yf_period} and interval {yf_interval}")
        
        try:
            data = yf.download(
                symbol,
                period=yf_period,
                interval=yf_interval,
                progress=False,
                threads=False
            )
        except Exception as download_error:
            print(f"yfinance download failed: {download_error}")
            raise Exception(f"Failed to download data from Yahoo Finance: {str(download_error)}")
        
        if data.empty:
            # Try with a larger timeframe or different interval if first attempt fails
            print(f"No data found for {symbol} with {yf_interval}. Retrying with '1d' interval...")
            try:
                # Fallback to 1d interval with original requested period
                fallback_period = period_map.get(timeframe, '1y')
                data = yf.download(
                    symbol,
                    period=fallback_period,
                    interval='1d',
                    progress=False,
                    threads=False
                )
            except:
                pass
                
            if data.empty:
                raise Exception(f"No data found for symbol {symbol}. Please ensure you are using the correct ticker symbol (e.g., NVDA for Nvidia, AAPL for Apple).")
        
        # Handle MultiIndex columns (common in new yfinance versions)
        if isinstance(data.columns, pd.MultiIndex):
            # If the columns are MultiIndex, we need to flatten them or select the correct level
            # Usually level 0 is Price Type (Open, Close, etc) and level 1 is Ticker
            # But sometimes it's reversed or different depending on how many tickers
            try:
                # Check if 'Close' is in level 0
                if 'Close' in data.columns.get_level_values(0):
                    data.columns = data.columns.get_level_values(0)
                # Check if 'Close' is in level 1
                elif 'Close' in data.columns.get_level_values(1):
                    data.columns = data.columns.get_level_values(1)
            except Exception as e:
                print(f"Error handling MultiIndex columns: {e}")
                # Fallback: try to just keep the first level
                data.columns = data.columns.get_level_values(0)

        # Ensure we have the required columns
        required_columns = ['Close', 'Open', 'High', 'Low', 'Volume']
        missing_columns = [col for col in required_columns if col not in data.columns]
        
        if missing_columns:
             # Sometimes yfinance returns 'Adj Close' instead of 'Close'
            if 'Adj Close' in data.columns and 'Close' not in data.columns:
                data['Close'] = data['Adj Close']
            else:
                print(f"Warning: Missing columns {missing_columns} in data for {symbol}")

        data = data.dropna()

        return data
    
    except Exception as e:
        raise Exception(f"Error fetching {interval} data for {symbol}: {str(e)}")
    
def momentum_trading_strategy(data, short_window=5, long_window=20):
    """Generate trading signals based on moving average crossover strategy."""
    # Create a copy to avoid modifying original
    signals = pd.DataFrame(index=data.index)
    
    if len(data) < long_window:
        # Not enough data for strategy
        signals['price'] = data['Close']
        signals['short_mavg'] = data['Close'] # Fallback
        signals['long_mavg'] = data['Close']  # Fallback
        signals['signal'] = 0.0
        signals['positions'] = 0.0
        return signals

    # Create price and moving average columns
    signals['price'] = data['Close']
    signals['short_mavg'] = data['Close'].rolling(window=short_window, min_periods=1).mean()
    signals['long_mavg'] = data['Close'].rolling(window=long_window, min_periods=1).mean()
    
    # Create signals
    signals['signal'] = 0.0
    
    # Use .iloc for position-based indexing to avoid index issues
    # Create a boolean mask for the condition
    condition = signals['short_mavg'] > signals['long_mavg']
    
    # Apply signal where condition is true, starting from short_window
    # We use numpy to handle this efficiently and safely
    signals['signal'] = np.where(condition, 1.0, 0.0)
    
    # Zero out the first 'short_window' signals as they are based on incomplete data
    signals.iloc[:short_window, signals.columns.get_loc('signal')] = 0.0
    
    # Generate positions
    signals['positions'] = signals['signal'].diff().fillna(0.0)
    
    return signals

  
def fetch_exchange_rate(symbol: str, timeframe: str = "1M", interval: str = 'hour') -> pd.DataFrame:
    """
    Fetch historical stock data with timeframe and interval selection.
    
    Parameters:
        symbol (str): Stock symbol, e.g., 'AAPL', 'MSFT'
        timeframe (str): Time period, e.g., '1M', '3M', '1Y'
        interval (str): Data frequency - 'hour', 'day', '15m', etc.
    
    Returns:
        pd.DataFrame: Historical stock data
    """
    try:
        end_date = pd.Timestamp.now()
        
        # Map timeframes to days
        timeframe_dict = {
            '1M': 30,
            '3M': 90, 
            '6M': 180,
            '1Y': 365,
            '2Y': 730,
            '5Y': 1825
        }
        
        # Map interval parameter to yfinance interval strings
        interval_dict = {
            'minute': '1m',    # 1 minute
            '5min': '5m',      # 5 minutes
            '15min': '15m',    # 15 minutes
            '30min': '30m',    # 30 minutes
            'hour': '1h',      # 1 hour
            'day': '1d',       # 1 day
            'week': '1wk',     # 1 week
            'month': '1mo'     # 1 month
        }
        
        # Set the interval (default to 1h if not specified)
        yf_interval = interval_dict.get(interval, '1h')
        

        days = timeframe_dict[timeframe]
        if yf_interval in ['1m', '5m', '15m', '30m', '1h'] and days > 60:
            days_limit = min(days, 60)  # Limit to 60 days for intraday data
            print(f"Warning: Limiting {yf_interval} data to {days_limit} days instead of {days}")
        else:
            days_limit = days
            
        # Handle cryptocurrency symbols
        if symbol.upper() in ['BTC', 'ETH', 'DOGE', 'XRP', 'SOL']:
            symbol = f"{symbol}-USD"
            
        # Common company name to ticker mapping
        symbol_map = {
            'NVIDIA': 'NVDA',
            'MICROSOFT': 'MSFT',
            'APPLE': 'AAPL',
            'GOOGLE': 'GOOGL',
            'AMAZON': 'AMZN',
            'TESLA': 'TSLA',
            'META': 'META',
            'NETFLIX': 'NFLX'
        }
        if symbol.upper() in symbol_map:
            symbol = symbol_map[symbol.upper()]

        # Determine period based on timeframe and interval constraints
        # yfinance intraday data (interval < 1d) is limited to last 60 days
        is_intraday = yf_interval in ['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h']
        
        period_map = {
            '1M': '1mo',
            '3M': '3mo',
            '6M': '6mo',
            '1Y': '1y',
            '2Y': '2y',
            '5Y': '5y'
        }
        
        yf_period = period_map.get(timeframe, '1y')
        
        if is_intraday:
            # If requesting intraday data for > 60 days, cap it at 1mo or max 60d
            # Using '1mo' is safer for reliability
            if timeframe not in ['1M']:
                print(f"Adjusting period to '1mo' for intraday interval {yf_interval}")
                yf_period = '1mo'

        print(f"Downloading data for {symbol} with period {yf_period} and interval {yf_interval}")
        
        try:
            data = yf.download(
                symbol,
                period=yf_period,
                interval=yf_interval,
                progress=False,
                threads=False
            )
        except Exception as download_error:
            print(f"yfinance download failed: {download_error}")
            raise Exception(f"Failed to download data from Yahoo Finance: {str(download_error)}")
        
        if data.empty:
            raise Exception(f"No data found for symbol {symbol} with {yf_interval} interval")
        
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        data = data.dropna()

        # Return only the most recent (last) high price
        return data["High"].iloc[-1]
    
    except Exception as e:
        raise Exception(f"Error fetching {interval} data for {symbol}: {str(e)}")
