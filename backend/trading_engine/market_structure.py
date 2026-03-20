import pandas as pd
import numpy as np

def identify_pivots(df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
    """
    Identifies pivot highs and lows over a given window.
    Pivot High: High is greater than the 'window' highs before and after.
    Pivot Low: Low is less than the 'window' lows before and after.
    """
    df = df.copy()
    
    # Calculate rolling max and min for highs and lows
    df['Rolling_Max'] = df['High'].rolling(window=2*window+1, center=True).max()
    df['Rolling_Min'] = df['Low'].rolling(window=2*window+1, center=True).min()
    
    # Identify Pivot Highs and Lows
    df['Is_Pivot_High'] = df['High'] == df['Rolling_Max']
    df['Is_Pivot_Low'] = df['Low'] == df['Rolling_Min']
    
    # Forward fill the last pivot values
    df['Last_Pivot_High_Price'] = df['High'].where(df['Is_Pivot_High']).ffill()
    df['Last_Pivot_Low_Price'] = df['Low'].where(df['Is_Pivot_Low']).ffill()

    return df

def analyze_market_structure(df: pd.DataFrame) -> pd.DataFrame:
    """
    Detects HH, HL, LH, LL based on recent pivots.
    Detects BOS (Break of Structure) and CHOCH (Change of Character).
    """
    df = identify_pivots(df)
    
    # We will identify the sequence of pivot highs to determine HH/LH
    pivot_highs = df[df['Is_Pivot_High']]['High']
    pivot_lows = df[df['Is_Pivot_Low']]['Low']

    df['Structure_High'] = np.nan
    df['Structure_Low'] = np.nan

    # For vectorization, compare current pivot with previous pivot
    if not pivot_highs.empty:
        prev_ph = pivot_highs.shift(1)
        hh_mask = pivot_highs > prev_ph
        # Handle NA and assign safely
        hh_index = hh_mask[hh_mask == True].index
        df.loc[hh_index, 'Structure_High'] = 'HH'
        # Reverse mask for LH
        lh_mask = pivot_highs < prev_ph
        lh_index = lh_mask[lh_mask == True].index
        df.loc[lh_index, 'Structure_High'] = 'LH'

    if not pivot_lows.empty:
        prev_pl = pivot_lows.shift(1)
        hl_mask = pivot_lows > prev_pl
        hl_index = hl_mask[hl_mask == True].index
        df.loc[hl_index, 'Structure_Low'] = 'HL'
        ll_mask = pivot_lows < prev_pl
        ll_index = ll_mask[ll_mask == True].index
        df.loc[ll_index, 'Structure_Low'] = 'LL'

    # Forward fill structure points to know the current state
    df['Last_Structure_High'] = df['Structure_High'].ffill()
    df['Last_Structure_Low'] = df['Structure_Low'].ffill()

    # Determine Trend based on Structure
    # Uptrend = recent HH and HL
    # Downtrend = recent LH and LL
    def determine_trend(row):
        if row['Last_Structure_High'] == 'HH' and row['Last_Structure_Low'] == 'HL':
            return 'UPTREND'
        elif row['Last_Structure_High'] == 'LH' and row['Last_Structure_Low'] == 'LL':
            return 'DOWNTREND'
        return 'SIDEWAYS'

    df['Trend_Status'] = df.apply(determine_trend, axis=1)

    # BOS & CHOCH detection
    # BOS (Uptrend): Price closes above previous HH
    # CHOCH (Downtrend -> Uptrend): Price closes above previous LH
    df['Is_BOS'] = False
    df['Is_CHOCH'] = False

    # Shift past pivot so current bar closing can be compared to it
    prev_pivot_high = df['Last_Pivot_High_Price'].shift(1)
    prev_pivot_low = df['Last_Pivot_Low_Price'].shift(1)
    
    # We want to identify the exact candle where a close breaks the structure
    df.loc[(df['Trend_Status'] == 'UPTREND') & (df['Close'] > prev_pivot_high) & (df['Close'].shift(1) <= prev_pivot_high), 'Is_BOS'] = True
    df.loc[(df['Trend_Status'] == 'DOWNTREND') & (df['Close'] < prev_pivot_low) & (df['Close'].shift(1) >= prev_pivot_low), 'Is_BOS'] = True

    df.loc[(df['Trend_Status'] == 'DOWNTREND') & (df['Close'] > prev_pivot_high) & (df['Close'].shift(1) <= prev_pivot_high), 'Is_CHOCH'] = True
    df.loc[(df['Trend_Status'] == 'UPTREND') & (df['Close'] < prev_pivot_low) & (df['Close'].shift(1) >= prev_pivot_low), 'Is_CHOCH'] = True

    return df

def detect_liquidity_sweeps(df: pd.DataFrame, threshold_pct: float = 0.001) -> pd.DataFrame:
    """
    Detects liquidity sweeps where equal highs/lows are temporarily broken but close reverses.
    """
    # Simply, price dips below previous pivot low, but closes above it (bullish sweep)
    # Or price goes above previous pivot high, but closes below it (bearish sweep)
    df = df.copy()
    prev_pl = df['Last_Pivot_Low_Price'].shift(1)
    prev_ph = df['Last_Pivot_High_Price'].shift(1)
    
    # Dip below PL but bullish close
    df['Bullish_Sweep'] = (df['Low'] < prev_pl) & (df['Close'] > prev_pl) & (df['Close'] > df['Open'])
    
    # Spoke above PH but bearish close
    df['Bearish_Sweep'] = (df['High'] > prev_ph) & (df['Close'] < prev_ph) & (df['Close'] < df['Open'])
    
    return df

def find_support_resistance_zones(df: pd.DataFrame, zone_buffer_pct: float = 0.005):
    """
    Creates continuous bands of Support/Resistance based on major pivot clusters.
    For local decision making, we check if price is reacting in the zone of the last major pivot.
    """
    df = df.copy()
    
    # A support zone is [Last_Pivot_Low, Last_Pivot_Low * (1 + buffer)]
    df['Support_Zone_Bottom'] = df['Last_Pivot_Low_Price']
    df['Support_Zone_Top'] = df['Last_Pivot_Low_Price'] * (1 + zone_buffer_pct)

    # A resistance zone is [Last_Pivot_High * (1 - buffer), Last_Pivot_High]
    df['Resistance_Zone_Top'] = df['Last_Pivot_High_Price']
    df['Resistance_Zone_Bottom'] = df['Last_Pivot_High_Price'] * (1 - zone_buffer_pct)

    # Detect Rejection
    # Support bounce: wick dips into zone, bullish close
    df['Support_Bounce'] = (df['Low'] <= df['Support_Zone_Top']) & (df['Close'] > df['Support_Zone_Top']) & (df['Close'] > df['Open'])
    
    # Resistance rejection: wick pokes into zone, bearish close
    df['Resistance_Rejection'] = (df['High'] >= df['Resistance_Zone_Bottom']) & (df['Close'] < df['Resistance_Zone_Bottom']) & (df['Close'] < df['Open'])

    return df
