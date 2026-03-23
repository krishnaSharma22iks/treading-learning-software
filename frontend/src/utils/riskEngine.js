/**
 * Institutional Risk Management Engine
 * Enforces capital preservation and risk-per-trade rules.
 */

export const calculateRiskAssessment = (entry, sl, tp, balance = 10000) => {
  if (!entry || !sl) {
    return {
      riskLevel: "CRITICAL",
      warning: "STOP LOSS MANDATORY: No SL detected in current setup.",
      isValid: false
    };
  }

  const isBuy = tp > entry;
  const riskAmount = Math.abs(entry - sl);
  const rewardAmount = Math.abs(tp - entry);
  
  // 1. Risk Reward Ratio
  const rr = (rewardAmount / riskAmount).toFixed(2);
  
  // 2. Percentage Risk
  // Assume a standard lot size or 100% equity for risk calculation logic in this context
  // Here we calculate percentage of price move relative to entry
  const pctRisk = ((riskAmount / entry) * 100).toFixed(2);
  
  let riskLevel = "LOW";
  let warning = null;
  let isValid = true;

  if (pctRisk > 2.0) {
    riskLevel = "HIGH";
    warning = `EXCESSIVE RISK: ${pctRisk}% per trade exceeds the 2% institutional limit.`;
    isValid = false;
  } else if (pctRisk > 1.0) {
    riskLevel = "MEDIUM";
    warning = `CAUTION: ${pctRisk}% risk is near the upper limit.`;
  }

  if (rr < 1.0 && tp) {
    warning = warning ? `${warning} | POOR RR: ${rr} < 1.0` : `POOR RR: ${rr} < 1.0`;
    isValid = false;
  }

  return {
    rr,
    pctRisk,
    riskLevel,
    warning,
    isValid,
    riskAmount,
    rewardAmount
  };
};

/**
 * Validates if the trade meets basic safety criteria
 */
export const validateTradeSafety = (assessment) => {
  return assessment.isValid && assessment.riskLevel !== "CRITICAL";
};
