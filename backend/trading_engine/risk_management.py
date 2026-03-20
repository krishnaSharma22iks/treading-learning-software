import pandas as pd
import numpy as np
from typing import Tuple, Optional

def calculate_rr(entry: float, stop_loss: float, take_profit: float, signal_type: str) -> float:
    """
    Calculates the Risk:Reward ratio.
    """
    if signal_type == "BUY":
        risk = entry - stop_loss
        reward = take_profit - entry
    elif signal_type == "SELL":
        risk = stop_loss - entry
        reward = entry - take_profit
    else:
        return 0.0

    if risk <= 0:
        return 0.0
    return round(reward / risk, 2)

def calculate_trade_parameters(row: pd.Series, signal_type: str) -> Tuple[Optional[float], Optional[float], Optional[float], float]:
    """
    Calculates entry, stop loss, and take profit for a given setup.
    Enforces minimum 1:2 R:R.
    """
    entry = float(row['Close'])
    
    if signal_type == "BUY":
        # SL below recent support/pivot low
        buffer = entry * 0.001 # 0.1% buffer
        last_low = float(row.get('Last_Pivot_Low_Price', entry * 0.99))
        if pd.isna(last_low):
            last_low = entry * 0.99
            
        stop_loss = last_low - buffer
        
        # Risk amount
        risk = entry - stop_loss
        
        # Take profit at recent resistance/pivot high, or at minimum 1:2
        last_high = float(row.get('Last_Pivot_High_Price', entry * 1.05))
        if pd.isna(last_high):
            last_high = entry * 1.05
            
        next_res = last_high
        min_tp = entry + (risk * 2.0)
        
        # If next resistance is further than 1:2, target resistance. Else, at least hit 1:2.
        take_profit = max(next_res, min_tp)
        
        rr = calculate_rr(entry, stop_loss, take_profit, signal_type)
        return entry, stop_loss, take_profit, rr

    elif signal_type == "SELL":
        # SL above recent resistance/pivot high
        buffer = entry * 0.001
        last_high = float(row.get('Last_Pivot_High_Price', entry * 1.01))
        if pd.isna(last_high):
            last_high = entry * 1.01
            
        stop_loss = last_high + buffer
        
        risk = stop_loss - entry
        
        # Next support
        last_low = float(row.get('Last_Pivot_Low_Price', entry * 0.95))
        if pd.isna(last_low):
            last_low = entry * 0.95
            
        next_sup = last_low
        min_tp = entry - (risk * 2.0)
        
        take_profit = min(next_sup, min_tp)

        rr = calculate_rr(entry, stop_loss, take_profit, signal_type)
        return entry, stop_loss, take_profit, rr

    return None, None, None, 0.0

def evaluate_risk_management(df: pd.DataFrame) -> pd.DataFrame:
    """
    Wrapper to simulate SL/TP/RR if a trade were to be taken at each candle.
    For vectorization, we can apply the logic, but usually this is used per-trigger.
    For this module, it holds the helper functions.
    """
    return df
