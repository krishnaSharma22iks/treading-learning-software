import pandas as pd
from typing import Dict, Any, List, Optional
from .models import AnalystResponse, AnalystDecision

def validate_trade_setup(
    signal: str,
    entry: float,
    sl: float,
    tp: float,
    trend: str,
    support: Optional[float],
    resistance: Optional[float],
    rsi: float,
    volume_spike: bool,
    last_candles: pd.DataFrame
) -> AnalystResponse:
    """
    Expert validation logic based on professional trading principles.
    """
    reasons = []
    decision = AnalystDecision.WAIT
    confidence = 50
    suggestion = ""
    better_entry = None
    risk_note = None

    if signal == "NO TRADE":
        return AnalystResponse(
            decision=AnalystDecision.AVOID,
            confidence=0,
            reason=["No underlying signal detected"],
            suggestion="Wait for strategy trigger"
        )

    # 1. ENTRY VALIDATION
    # Proximity to S/R
    if signal == "BUY" and support is not None:
        dist_to_support = (entry - support) / entry
        if dist_to_support > 0.02: # More than 2% away from support
            reasons.append("Entry is too far from support (mid-zone)")
            confidence -= 20
        else:
            reasons.append("Optimal entry near support zone")
            confidence += 10

    if signal == "SELL" and resistance is not None:
        dist_to_res = (resistance - entry) / entry
        if dist_to_res > 0.02:
            reasons.append("Entry is too far from resistance (mid-zone)")
            confidence -= 20
        else:
            reasons.append("Optimal entry near resistance zone")
            confidence += 10

    # 2. CANDLE CONFIRMATION
    last_candle = last_candles.iloc[-1]
    prev_candle = last_candles.iloc[-2]
    
    body_size = abs(last_candle['Close'] - last_candle['Open'])
    wick_top = last_candle['High'] - max(last_candle['Open'], last_candle['Close'])
    wick_bottom = min(last_candle['Open'], last_candle['Close']) - last_candle['Low']

    if signal == "BUY":
        if wick_bottom > body_size:
            reasons.append("Strong bullish rejection wick detected")
            confidence += 15
        if last_candle['Close'] < prev_candle['High'] * 0.999: # Not breaking previous high strongly
            reasons.append("Weak close, price struggling to break local high")
            confidence -= 10
            decision = AnalystDecision.WAIT
            suggestion = "Wait for a strong close above previous candle high"

    if signal == "SELL":
        if wick_top > body_size:
            reasons.append("Strong bearish rejection wick detected")
            confidence += 15
        if last_candle['Close'] > prev_candle['Low'] * 1.001:
            reasons.append("Weak close, price holding above local low")
            confidence -= 10
            decision = AnalystDecision.WAIT
            suggestion = "Wait for a strong close below previous candle low"

    # 3. VOLUME ANALYSIS
    if volume_spike:
        reasons.append("High volume confirms institutional interest")
        confidence += 20
    else:
        reasons.append("Low volume suggests weak momentum")
        confidence -= 10
        if decision == AnalystDecision.WAIT:
            suggestion += " and volume buildup"

    # 4. FAKE SIGNAL DETECTION / TREND ALIGNMENT
    if signal == "BUY" and trend != "UPTREND":
        reasons.append("Counter-trend trade (Risky)")
        confidence -= 30
        risk_note = "HTF Trend is not bullish. High probability of fakeout."
    
    if signal == "SELL" and trend != "DOWNTREND":
        reasons.append("Counter-trend trade (Risky)")
        confidence -= 30
        risk_note = "HTF Trend is not bearish. High probability of fakeout."

    # 5. FINAL DECISION
    if confidence >= 75:
        decision = AnalystDecision.ENTER
        suggestion = "Execute with standard risk parameters"
    elif confidence < 40:
        decision = AnalystDecision.AVOID
        suggestion = "Risk-to-reward or probability too low"
    else:
        decision = AnalystDecision.WAIT
        if not suggestion:
            suggestion = "Wait for price action to clarify near levels"

    return AnalystResponse(
        decision=decision,
        confidence=max(0, min(100, confidence)),
        reason=reasons,
        suggestion=suggestion,
        better_entry=better_entry,
        risk_note=risk_note
    )
