/**
 * Elite AI Trading Assistant - Backend-Powered.
 */

const BACKEND_URL = "http://localhost:8000/chat";

/**
 * Main entry point for the AI Assistant.
 * Forwards requests to the FastAPI institutional layer.
 */
export async function generateAssistantResponse(input, telemetry) {
    // 1. Prepare Request (Consolidate Decision vs Chat Mode)
    const isDecisionRequest = typeof input === "object" && input !== null;
    
    // To backend, we always send { message, data }
    const requestData = {
        message: isDecisionRequest ? "SYSTEM: Generate Final Decision Response." : input,
        data: telemetry
    };

    try {
        const response = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) throw new Error("Backend Offline");

        const result = await response.json();
        
        // Return Decision object if in decision mode, else text reply
        if (isDecisionRequest) {
            try {
                // Backend returns a JSON string in 'reply' for decision mode
                return JSON.parse(result.reply);
            } catch (e) {
                console.error("Failed to parse AI decision JSON:", e, result.reply);
                // Fallback structured response
                return {
                    decision: "WAIT",
                    confidence: 50,
                    reason: ["Response formatting mismatch"],
                    trigger: "Awaiting valid structural response",
                    summary: "The AI returned a non-structured response. Monitor manual signals."
                };
            }
        }
        
        return result.reply;

    } catch (error) {
        console.error("AI Assistant Error:", error);
        
        // Intelligent Fallback (Institutional Hardcoding)
        const bias = telemetry.trend === "UPTREND" ? "UPTREND" : "DOWNTREND";
        return `Decision: WAIT\nReason: Market telemetry is currently buffering. Status is ${bias}.\nSuggestion: Wait for server synchronization to complete.`;
    }
}
