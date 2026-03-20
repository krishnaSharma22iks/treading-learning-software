import pandas as pd
import numpy as np
import sys
import os

# Ensure the package can be imported from the current directory
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from trading_engine import SignalEngine

def construct_mock_data(trend="UPTREND", n_candles=200):
    """
    Creates a mock OHLCV DataFrame that mathematically forms a specific trend.
    """
    dates = pd.date_range(end=pd.Timestamp.now(), periods=n_candles, freq='5min')
    df = pd.DataFrame(index=dates, columns=['Open', 'High', 'Low', 'Close', 'Volume'])
    
    # Base price
    price = 10000.0
    
    for i in range(n_candles):
        # Determine movement
        if trend == "UPTREND":
            move = np.random.normal(loc=10.0, scale=20.0)
        elif trend == "DOWNTREND":
            move = np.random.normal(loc=-10.0, scale=20.0)
        else:
            move = np.random.normal(loc=0.0, scale=20.0)
            
        open_p = price
        close_p = price + move
        high_p = max(open_p, close_p) + abs(np.random.normal(0, 10))
        low_p = min(open_p, close_p) - abs(np.random.normal(0, 10))
        vol = abs(np.random.normal(100, 50))
        
        # Inject specific setups at the end
        if i == n_candles - 1:
            if trend == "UPTREND":
                # Create a bullish setup (RSI oversold by making previous candles dip)
                vol = 1000 # Volume spike
                low_p = low_p - 100 # Sweep below support
                close_p = open_p + 50 # Bullish close
                high_p = close_p + 10
            elif trend == "DOWNTREND":
                vol = 1000
                high_p = high_p + 100
                close_p = open_p - 50
                low_p = close_p - 10

        df.loc[df.index[i]] = [open_p, high_p, low_p, close_p, vol]
        price = close_p

    # Ensure numeric types
    for col in df.columns:
        df[col] = pd.to_numeric(df[col])
        
    return df

def test_signal_engine():
    print("Testing Engine...")
    engine = SignalEngine()
    
    # Mock data for all timeframes
    print("\\n[Test Case 1] Uptrend Data")
    df_1h_up = construct_mock_data(trend="UPTREND", n_candles=200)
    df_15m_up = construct_mock_data(trend="UPTREND", n_candles=200)
    df_5m_up = construct_mock_data(trend="UPTREND", n_candles=200)
    df_1m_up = construct_mock_data(trend="UPTREND", n_candles=200)
    
    result_up = engine.generate_signal(df_1m_up, df_5m_up, df_15m_up, df_1h_up)
    print("Result UPTREND:")
    print(result_up)
    
    print("\\n[Test Case 2] Sideways Data")
    df_1h_side = construct_mock_data(trend="SIDEWAYS", n_candles=200)
    result_side = engine.generate_signal(df_1h_side, df_1h_side, df_1h_side, df_1h_side)
    print("Result SIDEWAYS:")
    print(result_side)

if __name__ == "__main__":
    test_signal_engine()
    print("Tests completed.")
