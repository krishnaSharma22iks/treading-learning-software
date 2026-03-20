import pandas as pd
from typing import Dict, Any

def generate_confidence_score(flags: Dict[str, bool]) -> int:
    """
    Score based on predefined weights:
    Structure alignment (30%)
    Volume confirmation (20%)
    Liquidity sweep (20%)
    RSI confirmation (10%)
    EMA trend alignment (10%)
    Clean S/R reaction (10%)
    """
    score = 0
    if flags.get('structure_alignment'): score += 30
    if flags.get('volume_confirmation'): score += 20
    if flags.get('liquidity_sweep'): score += 20
    if flags.get('rsi_confirmation'): score += 10
    if flags.get('ema_alignment'): score += 10
    if flags.get('sr_reaction'): score += 10
        
    return score

def evaluate_strategy(row: pd.Series, htf_trend: str) -> Dict[str, Any]:
    """
    Evaluates strict BUY/SELL entry logic on a single candle row.
    Requires HTF Trend as an input from the higher timeframe.
    """
    signal = 'NO TRADE'
    reasons = []
    
    # Flags for confidence scoring
    flags = {
        'structure_alignment': False,
        'volume_confirmation': False,
        'liquidity_sweep': False,
        'rsi_confirmation': False,
        'ema_alignment': False,
        'sr_reaction': False
    }

    # 1. MTF Structure Alignment
    ltf_trend = row.get('Trend_Status', 'SIDEWAYS')
    if ltf_trend == htf_trend and htf_trend != 'SIDEWAYS':
        flags['structure_alignment'] = True
        reasons.append(f"HTF and LTF trend aligned ({htf_trend})")

    # 2. Volume Confirmation
    if row.get('Volume_Spike', False):
        flags['volume_confirmation'] = True
        reasons.append("Volume spike confirmed")

    # 3. Liquidity Sweep
    bullish_sweep = row.get('Bullish_Sweep', False)
    bearish_sweep = row.get('Bearish_Sweep', False)
    if bullish_sweep or bearish_sweep:
        flags['liquidity_sweep'] = True
        reasons.append("Liquidity sweep detected")

    # 4. RSI Confirmation
    rsi = row.get('RSI', 50)
    rsi_oversold = rsi < 30
    rsi_overbought = rsi > 70
    if rsi_oversold or rsi_overbought:
        flags['rsi_confirmation'] = True
        reasons.append("RSI confirmation")

    # 5. EMA Alignment
    close = row.get('Close', 0)
    ema_50 = row.get('EMA_50', 0)
    ema_200 = row.get('EMA_200', 0)
    
    price_above_emas = close > ema_50 and close > ema_200
    price_below_emas = close < ema_50 and close < ema_200
    
    if price_above_emas or price_below_emas:
        flags['ema_alignment'] = True
        reasons.append("EMA trend alignment")

    # 6. Support / Resistance Reaction
    support_bounce = row.get('Support_Bounce', False)
    resistance_rej = row.get('Resistance_Rejection', False)
    
    if support_bounce or resistance_rej:
        flags['sr_reaction'] = True
        reasons.append("Support/Resistance reaction")

    # --- STRICT ENTRY LOGIC ---
    # BUY conditions
    buy_conditions = (
        htf_trend == 'UPTREND' and 
        flags['structure_alignment'] and
        flags['sr_reaction'] and support_bounce and
        flags['liquidity_sweep'] and bullish_sweep and
        flags['volume_confirmation'] and 
        (flags['rsi_confirmation'] and rsi_oversold) and
        price_above_emas
    )

    # SELL conditions
    sell_conditions = (
        htf_trend == 'DOWNTREND' and 
        flags['structure_alignment'] and
        flags['sr_reaction'] and resistance_rej and
        flags['liquidity_sweep'] and bearish_sweep and
        flags['volume_confirmation'] and 
        (flags['rsi_confirmation'] and rsi_overbought) and
        price_below_emas
    )

    if buy_conditions:
        signal = 'BUY'
    elif sell_conditions:
        signal = 'SELL'
        
    confidence = generate_confidence_score(flags)

    # Rejection of weak setups / choppy markets
    # If confidence is lower than expected, or trend is sideway
    if signal != 'NO TRADE' and confidence < 70:
        # Override if weak
        signal = 'NO TRADE'
        reasons.append(f"Rejected setup due to low confidence ({confidence} < 70)")

    if htf_trend == 'SIDEWAYS':
        signal = 'NO TRADE'
        reasons.append("Choppy/Sideways market detected")

    return {
        "signal": signal,
        "confidence": confidence,
        "reasons": reasons,
        "trend": htf_trend
    }
