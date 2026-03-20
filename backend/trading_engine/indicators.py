import pandas as pd
import numpy as np


def add_ema(df: pd.DataFrame, periods: list = [20, 50, 200]) -> pd.DataFrame:
    """
    Calculates Exponential Moving Averages for the given periods.
    """
    df = df.copy()
    for period in periods:
        df[f'EMA_{period}'] = df['Close'].ewm(span=period, adjust=False).mean()
    return df


def add_rsi(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
    """
    Calculates the Relative Strength Index (RSI).
    """
    df = df.copy()
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

    # To avoid division by zero
    rs = gain / loss.replace(0, np.nan)
    df['RSI'] = 100 - (100 / (1 + rs))
    df['RSI'] = df['RSI'].fillna(100) # fillna based on your logic, usually leaving it nan is better, but maybe interpolate
    return df


def add_atr(df: pd.DataFrame, period: int = 14) -> pd.DataFrame:
    """
    Calculates Average True Range (ATR) for volatility measurement.
    """
    df = df.copy()
    high_low = df['High'] - df['Low']
    high_close = np.abs(df['High'] - df['Close'].shift())
    low_close = np.abs(df['Low'] - df['Close'].shift())
    
    ranges = pd.concat([high_low, high_close, low_close], axis=1)
    true_range = np.max(ranges, axis=1)
    
    df['ATR'] = true_range.rolling(period).mean()
    return df


def analyze_volume(df: pd.DataFrame, period: int = 20) -> pd.DataFrame:
    """
    Analyzes volume to detect spikes (e.g., volume > 1.5x of 20-period moving average).
    """
    df = df.copy()
    df['Volume_MA'] = df['Volume'].rolling(window=period).mean()
    df['Volume_Spike'] = df['Volume'] > (df['Volume_MA'] * 1.5)
    return df


def compile_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Applies all required technical indicators to the dataframe.
    """
    df = add_ema(df)
    df = add_rsi(df)
    df = add_atr(df)
    df = analyze_volume(df)
    return df
