from google import genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- 🛰️ INSTITUTIONAL CONFIGURATION ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBNB0iWL9HOdHFPe6d9R2hG8bi_pJsS6bo")
client = genai.Client(api_key=GEMINI_API_KEY)

app = FastAPI(title="Elite Institutional Trading AI")

# ✅ FIX: Explicit CORS for React -> FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    data: Dict[str, Any]

def get_dynamic_prompt(message: str, data: Dict[str, Any]) -> str:
    """
    Constructs a professional, context-aware institutional prompt.
    """
    return f"""
You are a professional AI crypto trading assistant.
Analyze the following USER QUESTION and MARKET DATA to provide a high-probability trading decision.

🔴 IMPORTANT RULES:
- ALWAYS respond specifically based on USER QUESTION.
- NEVER repeat same answer.
- ALWAYS use MARKET DATA in reasoning.
- Keep answers SHORT and PRACTICAL.

INPUT DATA:
- User Question: "{message}"
- Price: {data.get('price')}
- Trend: {data.get('trend')}
- Support: {data.get('support')}
- Resistance: {data.get('resistance')}
- Volume: {data.get('volume')}
- RSI: {data.get('rsi')}
- SMC Data: {data.get('smc_data', {})}
- Expert Decision: {data.get('expert_decision')}

LOGIC (STRICT):
- If candle not confirmed -> WAIT
- If volume LOW -> NO TRADE
- If price near resistance -> avoid BUY
- If price near support -> avoid SELL
- If trend unclear -> WAIT

OUTPUT FORMAT (STRICT):
Decision: BUY / SELL / WAIT / NO TRADE
Reason: short (based on data + question)
Suggestion: short (actionable)

Make every response different and act like a professional trader. No extra text.
"""

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    print(f"--- 📥 NEW REQUEST: {req.message[:50]}... ---")
    
    # Model fallback chain: try preferred first, fallback to lite
    MODELS_TO_TRY = ["gemini-flash-latest", "gemini-2.0-flash-lite", "gemini-2.0-flash-lite-001"]
    
    prompt = get_dynamic_prompt(req.message, req.data)
    last_error = None
    
    for model_name in MODELS_TO_TRY:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt
            )
            
            reply = response.text.strip()
            
            print(f"--- 📤 AI RESPONSE (via {model_name}) ---")
            print(reply)
            
            return {"reply": reply}
            
        except Exception as e:
            print(f"⚠️ Model [{model_name}] failed: {str(e)[:100]}")
            last_error = e
            continue
    
    # All models failed — use intelligent institutional fallback
    print(f"❌ ALL MODELS FAILED. Last error: {str(last_error)}")
    bias = req.data.get('trend', 'NEUTRAL')
    return {
        "reply": f"Decision: WAIT\nReason: Market structure is currently {bias} but telemetry requires further confirmation.\nSuggestion: Monitor key level zones and wait for institutional volume."
    }


@app.get("/health")
async def health_check():
    return {"status": "Elite Trading Service Online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
