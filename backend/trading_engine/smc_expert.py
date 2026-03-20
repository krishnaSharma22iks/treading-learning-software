import pandas as pd
from typing import Dict, Any, List, Optional
from .models import SMCResponse, SMCDecision

def get_smc_analysis(
    price: float,
    trend: str,
    market_structure: str,
    liquidity_sweep: bool,
    equal_highs: bool,
    equal_lows: bool,
    order_block_zone: Optional[str],
    current_location: str, # "AT OB", "NEAR OB", "MID", "BREAKOUT"
    bos: bool,
    choch: bool,
    volume: str,
    candle_status: str,
    candle_strength: str,
    session: str
) -> SMCResponse:
    """
    Institutional Smart Money Concepts (SMC) Expert Logic.
    """
    reasons = []
    decision = SMCDecision.NO_TRADE
    confidence = 50
    bias = "NEUTRAL"
    entry_zone = order_block_zone or "N/A"
    trigger = "Enter after confirmation candle from key zone."
    invalidation = "Level where structural bias fails."

    # --- 🔍 ANALYSIS STEPS ---

    # 1. Structure Check
    if market_structure == "CHOPPY":
        reasons.append("Market structure is CHOPPY. No clear institutional direction.")
        return SMCResponse(
            decision=SMCDecision.NO_TRADE,
            bias="NEUTRAL",
            confidence=10,
            reason=reasons,
            entry_zone="N/A"
        )

    # 2. Liquidity Logic
    if not liquidity_sweep:
        reasons.append("Liquidity NOT swept yet. High probability of fakeout.")
        decision = SMCDecision.WAIT
        trigger = "Wait for liquidity grab (EQH/EQL) before entry."
    else:
        reasons.append("Liquidity sweep confirmed. Institutional move imminent.")
        confidence += 20

    # 3. Order Block Validation
    if current_location == "MID":
        reasons.append("Price is in MID-ZONE. No mathematical edge.")
        return SMCResponse(
            decision=SMCDecision.NO_TRADE,
            bias="NEUTRAL",
            confidence=20,
            reason=reasons,
            entry_zone=entry_zone,
            trigger="Wait for price to reach Order Block."
        )
    elif current_location in ["AT OB", "NEAR OB"]:
        reasons.append(f"Price is {current_location}. High conviction area.")
        confidence += 20
    
    # 4. BOS/CHOCH Confirmation
    if bos:
        reasons.append("Break of Structure (BOS) confirms trend continuation.")
        confidence += 15
    if choch:
        reasons.append("Change of Character (CHOCH) suggests structural shift.")
        confidence += 15

    # 5 & 6. Final Decision Logic
    bias = "BUY" if trend == "UPTREND" else "SELL" if trend == "DOWNTREND" else "NEUTRAL"

    if liquidity_sweep and current_location in ["AT OB", "NEAR OB"] and (bos or choch) and candle_status == "CLOSED" and candle_strength == "STRONG":
        if volume == "HIGH" and session in ["LONDON", "NEW_YORK"]:
            decision = SMCDecision.ENTER
            trigger = " Sniper entry confirmed at key mitigation block."
            reasons.append("All SMC institutional criteria met.")
            confidence = min(confidence + 30, 98)
        else:
            decision = SMCDecision.WAIT
            reasons.append("Waiting for volume or session volatility.")
            confidence = min(confidence + 10, 80)
    else:
        if decision != SMCDecision.WAIT:
            decision = SMCDecision.NO_TRADE
            reasons.append("Setup failed SMC institutional filters.")

    return SMCResponse(
        decision=decision,
        bias=bias,
        confidence=confidence,
        reason=reasons or ["Monitoring SMC structure"],
        entry_zone=entry_zone,
        trigger=trigger,
        invalidation=invalidation,
        liquidity_sweep=liquidity_sweep,
        at_order_block=current_location == "AT OB",
        bos_detected=bos,
        choch_detected=choch
    )
