/**
 * Refined Institutional Final Decision Engine.
 * Incorporates strict execution filters and execution triggers.
 */

export const FinalDecision = {
    BUY: "BUY",
    SELL: "SELL",
    WAIT: "WAIT",
    NO_TRADE: "NO TRADE"
};

export function getFinalDecision({
    signal,
    entry,
    sl,
    tp,
    trend,
    support,
    resistance,
    rsi,
    volumeSpike,
    marketStructure,
    candleStatus, // "OPEN" or "CLOSED"
    candleStrength, // "STRONG" or "WEAK"
    entryQuality, // "GOOD" or "MID" or "BAD"
    analystDecision,
    session
}) {
    const reasons = [];
    let finalDecision = FinalDecision.NO_TRADE;
    let confidence = 50;
    let tradeQualityScore = 0;
    let executionPlan = "";
    let trigger = "";
    let invalidation = "";
    let note = "Protect capital above all else.";

    // --- 🔴 RULES (STRICT) ---

    // 1. If candle is OPEN → return WAIT
    if (candleStatus === "OPEN") {
        return {
            final_decision: FinalDecision.WAIT,
            confidence: 30,
            trade_quality_score: 50,
            reason: ["Candle is OPEN. Awaiting structural confirmation."],
            execution_plan: "Wait for 5m candle close before entry.",
            note: "Real-time volatility induction risk is high on open candles."
        };
    }

    // 2. If volume is LOW → return NO TRADE
    if (!volumeSpike) {
        return {
            final_decision: FinalDecision.NO_TRADE,
            confidence: 10,
            trade_quality_score: 20,
            reason: ["Institutional volume is LOW."],
            execution_plan: "Stand aside. Setup lacks institutional conviction.",
            note: "Non-institutional moves are prone to instant reversals."
        };
    }

    // 3. If entry is MID → return NO TRADE
    if (entryQuality === "MID") {
        return {
            final_decision: FinalDecision.NO_TRADE,
            confidence: 20,
            trade_quality_score: 40,
            reason: ["Entry quality is MID (mid-zone/no-man's land)."],
            execution_plan: "Reject mid-zone entry. No mathematical edge.",
            note: "Trading in the middle of a range is a gambling behavior."
        };
    }

    if (entryQuality === "BAD") {
        return {
            final_decision: FinalDecision.NO_TRADE,
            confidence: 0,
            trade_quality_score: 10,
            reason: ["Entry quality is BAD (Price extended)."],
            execution_plan: "Avoid FOMO. Setup is over-extended.",
            note: "Late entries result in stops getting hit by small pullbacks."
        };
    }

    // 4. If expert says WAIT → return WAIT
    if (analystDecision === "WAIT FOR CONFIRMATION") {
        return {
            final_decision: FinalDecision.WAIT,
            confidence: 40,
            trade_quality_score: 60,
            reason: ["Expert Analyst recommends waiting."],
            execution_plan: "Monitor for analyst-defined trigger points.",
            note: "Professional trading is 90% waiting for the right moment."
        };
    }

    // 5. If expert says AVOID → return NO TRADE
    if (analystDecision === "AVOID TRADE") {
        return {
            final_decision: FinalDecision.NO_TRADE,
            confidence: 0,
            trade_quality_score: 0,
            reason: ["Expert Analyst has rejected this setup."],
            execution_plan: "Move to the next pair. Setup structure is invalid.",
            note: "Capital preservation is the ultimate goal."
        };
    }

    // --- 🔹 ANALYSIS STEPS ---
    
    // Trigger/Invalidation logic
    if (signal === "BUY") {
        trigger = `Strong bullish close above ${entry.toFixed(2)} confirming support at ${support?.toFixed(2) || 'key level'}`;
        invalidation = `Price invalidates if 5m candle closes below ${sl.toFixed(2)}`;
        note = "Verify liquidity sweeps below support before entry if possible.";
    } else if (signal === "SELL") {
        trigger = `Strong bearish close below ${entry.toFixed(2)} confirming resistance at ${resistance?.toFixed(2) || 'key level'}`;
        invalidation = `Price invalidates if 5m candle closes above ${sl.toFixed(2)}`;
        note = "Watch for RSI divergence on the 1m timeframe for early warning.";
    }

    // 6. Only allow BUY/SELL if: Strong candle close + HIGH volume + Near S/R + Trend aligned.
    const isStrongClose = candleStrength === "STRONG";
    const isTrendAligned = (signal === "BUY" && trend.includes("UPTREND")) || (signal === "SELL" && trend.includes("DOWNTREND"));

    if (isStrongClose && volumeSpike && entryQuality === "GOOD" && isTrendAligned && marketStructure !== "CHOPPY" && trend !== "SIDEWAYS") {
        finalDecision = signal === "BUY" ? FinalDecision.BUY : FinalDecision.SELL;
        executionPlan = `EXECUTE ${finalDecision}. High probability institutional setup verified.`;
        confidence = 95;
        tradeQualityScore = 100;
    } else {
        if (!isStrongClose) reasons.push("Candle strength is WEAK.");
        if (!isTrendAligned) reasons.push("Trade is counter-trend.");
        if (marketStructure === "CHOPPY" || trend === "SIDEWAYS") reasons.push("Market structure is UNSTABLE (CHOPPY/SIDEWAYS).");
        
        finalDecision = FinalDecision.WAIT;
        executionPlan = "Lacks institutional alignment. WAIT for stronger conviction.";
        confidence = 65;
        tradeQualityScore = 75;
    }


    return {
        final_decision: finalDecision,
        confidence,
        trade_quality_score: tradeQualityScore,
        reason: reasons.length ? reasons : ["All institutional filters verified."],
        execution_plan: executionPlan,
        trigger,
        invalidation,
        note
    };
}
