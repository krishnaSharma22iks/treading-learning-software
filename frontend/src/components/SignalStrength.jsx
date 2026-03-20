import React from "react";

/**
 * SignalStrength visually indicates the confidence of a trade.
 * 
 * @param {number} confirmations - 1 (Weak), 2 (Medium), 3 (Strong)
 * @param {string} type - "BUY" or "SELL"
 */
function SignalStrength({ confirmations = 1, type = "BUY" }) {
  let strengthLabel = "Weak";
  let colorClass = "text-yellow-400 bg-yellow-400/10 border-yellow-400"; // Default Weak (Yellow)

  if (confirmations === 2) {
    strengthLabel = "Medium";
  } else if (confirmations >= 3) {
    strengthLabel = "Strong";
  }

  // Assign UI color mechanics based on trade direction and confirmation level
  if (confirmations >= 2) {
    if (type === "BUY") {
      // Strong/Medium Buy maps to Green
      colorClass = confirmations >= 3 
        ? "text-green-500 bg-green-500/10 border-green-500" 
        : "text-green-400 bg-green-400/10 border-green-400";
    } else if (type === "SELL") {
      // Strong/Medium Sell maps to Red
      colorClass = confirmations >= 3 
        ? "text-red-500 bg-red-500/10 border-red-500" 
        : "text-red-400 bg-red-400/10 border-red-400";
    }
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full border ${colorClass}`}>
      {/* Network-style bars matching the signal strength */}
      <div className="flex items-end space-x-1 mr-2 h-4">
        <div className={`w-1 h-2 rounded-sm ${confirmations >= 1 ? "bg-current" : "bg-gray-600"}`}></div>
        <div className={`w-1 h-3 rounded-sm ${confirmations >= 2 ? "bg-current" : "bg-gray-600"}`}></div>
        <div className={`w-1 h-4 rounded-sm ${confirmations >= 3 ? "bg-current" : "bg-gray-600"}`}></div>
      </div>
      
      <span className="text-xs font-bold uppercase tracking-wider">
        {strengthLabel} {type}
      </span>
    </div>
  );
}

export default SignalStrength;
