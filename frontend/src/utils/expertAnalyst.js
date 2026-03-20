/**
 * Expert Analyst logic based on professional trading principles.
 * Validates signals and provides intelligent confirmation.
 */

export const AnalystDecision = {
    ENTER: "ENTER NOW",
    WAIT: "WAIT FOR CONFIRMATION",
    AVOID: "AVOID TRADE"
};

export function validateTradeSetup({
    signal,
    entry,
    sl,
    tp,
    trend,
    support,
    resistance,
    rsi,
    volumeSpike,
    lastCandles
}) {
    const reasons = [];
    let decision = AnalystDecision.WAIT;
    let confidence = 50;
    let suggestion = "";
    let betterEntry = null;
    let riskNote = null;

    if (signal === "HOLD" || signal === "NO TRADE" || !signal) {
        return {
            decision: AnalystDecision.AVOID,
            confidence: 0,
            reason: ["No underlying signal detected"],
            suggestion: "Wait for strategy trigger"
        };
    }

    // 1. ENTRY VALIDATION
    if (signal === "BUY" && support) {
        const distToSupport = (entry - support) / entry;
        if (distToSupport > 0.02) {
            reasons.push("Entry is too far from support (mid-zone)");
            confidence -= 20;
        } else {
            reasons.push("Optimal entry near support zone");
            confidence += 10;
        }
    }

    if (signal === "SELL" && resistance) {
        const distToRes = (resistance - entry) / entry;
        if (distToRes > 0.02) {
            reasons.push("Entry is too far from resistance (mid-zone)");
            confidence -= 20;
        } else {
            reasons.push("Optimal entry near resistance zone");
            confidence += 10;
        }
    }

    // 2. CANDLE CONFIRMATION
    if (lastCandles && lastCandles.length >= 2) {
        const lastCandle = lastCandles[lastCandles.length - 1];
        const prevCandle = lastCandles[lastCandles.length - 2];
        
        const bodySize = Math.abs(lastCandle.close - lastCandle.open);
        const wickTop = lastCandle.high - Math.max(lastCandle.open, lastCandle.close);
        const wickBottom = Math.min(lastCandle.open, lastCandle.close) - lastCandle.low;

        if (signal === "BUY") {
            if (wickBottom > bodySize) {
                reasons.push("Strong bullish rejection wick detected");
                confidence += 15;
            }
            if (lastCandle.close < prevCandle.high * 0.999) {
                reasons.push("Weak close, price struggling to break local high");
                confidence -= 10;
                decision = AnalystDecision.WAIT;
                suggestion = "Wait for a strong close above previous candle high";
            }
        }

        if (signal === "SELL") {
            if (wickTop > bodySize) {
                reasons.push("Strong bearish rejection wick detected");
                confidence += 15;
            }
            if (lastCandle.close > prevCandle.low * 1.001) {
                reasons.push("Weak close, price holding above local low");
                confidence -= 10;
                decision = AnalystDecision.WAIT;
                suggestion = "Wait for a strong close below previous candle low";
            }
        }
    }

    // 3. VOLUME ANALYSIS
    if (volumeSpike) {
        reasons.push("High volume confirms institutional interest");
        confidence += 20;
    } else {
        reasons.push("Low volume suggests weak momentum");
        confidence -= 10;
        if (decision === AnalystDecision.WAIT) {
            suggestion += " and volume buildup";
        }
    }

    // 4. FAKE SIGNAL DETECTION / TREND ALIGNMENT
    const isUptrend = trend.includes("UPTREND");
    const isDowntrend = trend.includes("DOWNTREND");

    if (signal === "BUY" && !isUptrend) {
        reasons.push("Counter-trend trade (Risky)");
        confidence -= 30;
        riskNote = "HTF Trend is not bullish. High probability of fakeout.";
    }
    
    if (signal === "SELL" && !isDowntrend) {
        reasons.push("Counter-trend trade (Risky)");
        confidence -= 30;
        riskNote = "HTF Trend is not bearish. High probability of fakeout.";
    }

    // 5. FINAL DECISION
    if (confidence >= 75) {
        decision = AnalystDecision.ENTER;
        suggestion = "Execute with standard risk parameters";
    } else if (confidence < 40) {
        decision = AnalystDecision.AVOID;
        suggestion = "Risk-to-reward or probability too low";
    } else {
        decision = AnalystDecision.WAIT;
        if (!suggestion) {
            suggestion = "Wait for price action to clarify near levels";
        }
    }

    return {
        decision,
        confidence: Math.max(0, Math.min(100, confidence)),
        reason: reasons,
        suggestion,
        betterEntry,
        riskNote
    };
}
