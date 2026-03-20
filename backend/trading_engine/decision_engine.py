import pandas as pd
from typing import Dict, Any, List, Optional
from .models import FinalDecisionResponse, FinalDecision, AnalystDecision

def get_final_decision(
    signal: str,
    entry: float,
    sl: float,
    tp: float,
    trend: str,
    support: Optional[float],
    resistance: Optional[float],
    rsi: float,
    volume_spike: bool,
    market_structure: str,
    candle_status: str, # "OPEN" or "CLOSED"
    candle_strength: str, # "STRONG" or "WEAK"
    entry_quality: str, # "GOOD", "MID", "BAD"
    analyst_decision: AnalystDecision,
    session: str # "ASIAN", "LONDON", "NEW YORK", etc.
) -> FinalDecisionResponse:
    """
    Refined institutional-grade crypto trading decision engine.
    Extremely conservative execution logic to protect capital.
    """
    reasons = []
    final_decision = FinalDecision.NO_TRADE
    confidence = 50
    trade_quality_score = 0
    execution_plan = ""
    trigger = ""
    invalidation = ""
    note = "Protect capital above all else."
    risk_warning = None

    # --- 🔴 RULES (STRICT) ---
    
    # 1. If candle is OPEN → return WAIT
    if candle_status == "OPEN":
        reasons.append("Candle is OPEN. Awaiting closure to confirm structural validity.")
        return FinalDecisionResponse(
            final_decision=FinalDecision.WAIT,
            confidence=30,
            trade_quality_score=50,
            reason=reasons,
            execution_plan="Monitor for candle close in next interval.",
            note="Never jump into an unconfirmed open candle."
        )

    # 2. If volume is LOW → return NO TRADE
    if not volume_spike:
        reasons.append("Institutional volume is LOW. No conviction behind the move.")
        return FinalDecisionResponse(
            final_decision=FinalDecision.NO_TRADE,
            confidence=10,
            trade_quality_score=20,
            reason=reasons,
            execution_plan="Stand aside. Institutional money is not participating.",
            note="Low volume breakouts are high-risk fakeouts."
        )

    # 3. If entry is MID → return NO TRADE
    if entry_quality == "MID":
        reasons.append("Entry quality is MID (not at key S/R level).")
        return FinalDecisionResponse(
            final_decision=FinalDecision.NO_TRADE,
            confidence=20,
            trade_quality_score=40,
            reason=reasons,
            execution_plan="Trade rejected. No edge in mid-zone entries.",
            note="Mid-zone trading has poor R:R and low probability."
        )

    if entry_quality == "BAD":
        reasons.append("Entry quality is BAD (chasing the move).")
        return FinalDecisionResponse(
            final_decision=FinalDecision.NO_TRADE,
            confidence=0,
            trade_quality_score=10,
            reason=reasons,
            execution_plan="Avoid chasing price. Wait for mean reversion.",
            note="Chasing leads to large drawdowns."
        )

    # 4. If expert says WAIT → return WAIT
    if analyst_decision == AnalystDecision.WAIT:
        reasons.append("Expert analyst recommends waiting for confirmation.")
        return FinalDecisionResponse(
            final_decision=FinalDecision.WAIT,
            confidence=40,
            trade_quality_score=60,
            reason=reasons,
            execution_plan="Watch for specific pattern completion as noted by analyst.",
            note="Patience is a professional competitive advantage."
        )

    # 5. If expert says AVOID → return NO TRADE
    if analyst_decision == AnalystDecision.AVOID:
        reasons.append("Expert analyst has rejected this setup entirely.")
        return FinalDecisionResponse(
            final_decision=FinalDecision.NO_TRADE,
            confidence=0,
            trade_quality_score=0,
            reason=reasons,
            execution_plan="Search for new setups. This one is void.",
            note="Trust the structural analysis."
        )

    # 6. Only allow BUY/SELL if: Strong close + HIGH volume + Near S/R + Trend aligned.
    
    # Trigger/Invalidation logic
    if signal == "BUY":
        trigger = f"Strong bullish close above {entry} confirming support at {support}"
        invalidation = f"Price invalidates if close below {sl}"
        note = "Ensure stop-loss is hardware-set."
    elif signal == "SELL":
        trigger = f"Strong bearish close below {entry} confirming resistance at {resistance}"
        invalidation = f"Price invalidates if close above {sl}"
        note = "Monitor for potential liquidity sweeps above resistance."

    # Final Verification for Execution
    is_strong_close = candle_strength == "STRONG"
    is_trend_aligned = (signal == "BUY" and trend == "UPTREND") or (signal == "SELL" and trend == "DOWNTREND")
    
    if is_strong_close and volume_spike and entry_quality == "GOOD" and is_trend_aligned:
        final_decision = FinalDecision.BUY if signal == "BUY" else FinalDecision.SELL
        execution_plan = f"EXECUTE {final_decision}. Optimal institutional parameters met."
        confidence = 95
        trade_quality_score = 100
    else:
        # One or more strict criteria failed
        if not is_strong_close: reasons.append("Candle strength is WEAK. Lacks momentum.")
        if not is_trend_aligned: reasons.append(f"Trade is counter-trend ({trend}). High risk.")
        
        final_decision = FinalDecision.WAIT
        execution_plan = "Setup detected but lacks final conviction. WAIT for stronger candle/trend alignment."
        confidence = 65
        trade_quality_score = 70

    return FinalDecisionResponse(
        final_decision=final_decision,
        confidence=confidence,
        trade_quality_score=trade_quality_score,
        reason=reasons or ["All institutional parameters verified."],
        execution_plan=execution_plan,
        trigger=trigger,
        invalidation=invalidation,
        note=note
    )
