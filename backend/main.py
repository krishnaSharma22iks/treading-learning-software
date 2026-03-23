from google import genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os
import json
import traceback
from dotenv import load_dotenv

import pandas as pd
from trading_engine.indicators import add_ema, add_rsi
from trading_engine.models import SignalType, Trend

# Load environment variables
load_dotenv()

# --- 🛰️ INSTITUTIONAL CONFIGURATION ---
AI_API_KEY = os.getenv("AI_API_KEY")

print("Loaded API Key:", AI_API_KEY)

if AI_API_KEY is None:
    print("API key missing")
else:
    print("API Key Loaded")

client = genai.Client(api_key=AI_API_KEY)

app = FastAPI(title="Elite Institutional Trading AI")

# --- 🔍 MODEL DISCOVERY ---
def list_available_models():
    print("-----------------------------------")
    print("📡 DISCOVERING AVAILABLE AI MODELS:")
    try:
        models = client.models.list()
        for m in models:
            # Look for flash models specifically
            if "flash" in m.name.lower():
                print(f"  - {m.name} (Supported)")
            else:
                print(f"  - {m.name}")
    except Exception as e:
        print(f"❌ Could not list models: {e}")
    print("-----------------------------------")

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

def get_dynamic_prompt(data: Dict[str, Any]) -> str:
    """
    Constructs a professional, context-aware institutional prompt.
    """
    strategy = data.get('active_strategy_rules', {})
    
    return f"""
    You are a professional trading assistant.
    Analyze market for:
    Symbol: {data.get('symbol', 'BTCUSDT')}
    Trading Type: {data.get('trading_type', 'Intraday')}
    Timeframe: {data.get('timeframe', '15m')}
    Market context: {data}
    
    RETURN ONLY JSON:
    {{
      "signal": "BUY" | "SELL" | "HOLD",
      "entry": number,
      "stop_loss": number,
      "take_profit": number,
      "confidence": number,
      "strategy": "{strategy.get('name', 'AI Institutional')}"
    }}
    """

def get_chat_prompt(message: str, data: Dict[str, Any]) -> str:
    """
    Standard institutional chat prompt.
    """
    return f"""
    You are an Elite Institutional AI Trading Assistant. 
    User Question: {message}
    Market Context: Price {data.get('price')}, Trend {data.get('trend')}.
    
    Provide a professional, concise, and actionable answer.
    """

# --- 🚀 ROBUST AI WRAPPER ---
def call_gemini_with_fallback(prompt: str, mime_type: str = "application/json"):
    """
    Attempts to call Gemini with a primary model and fallbacks if it fails.
    Verified IDs: gemini-2.0-flash, gemini-flash-latest, gemini-2.5-flash
    """
    models_to_try = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash"]
    
    last_error = None
    for model_name in models_to_try:
        print(f"🚀 Calling Gemini model [{model_name}]...")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config={"response_mime_type": mime_type}
            )
            print(f"✅ Gemini response received (via {model_name})")
            return response
        except Exception as e:
            last_error = e
            print(f"⚠️ Gemini {model_name} failed: {str(e)}")
            # Skip to next model if 404 or 503, but 429 usually applies to all Flash models
            # However, we'll try the next anyway in case of project-specific limits
            continue
            
    if last_error is not None:
        print(f"❌ Gemini Error: All models failed. Last error: {str(last_error)}")
        raise last_error  # type: ignore
    
    raise Exception("No Gemini models available for retry.")

class SignalRequest(BaseModel):
    symbol: str
    trading_type: str
    timeframe: str
    data: Dict[str, Any]

def validate_ai_signal(signal_data: Dict[str, Any], market_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Applies high-quality institutional filters to AI-generated signals.
    """
    signal = signal_data.get("signal", "HOLD")
    if signal == "HOLD":
        return signal_data

    entry = signal_data.get("entry", 0)
    sl = signal_data.get("stop_loss", 0)
    tp = signal_data.get("take_profit", 0)

    # 1. Risk Validation (Missing SL/TP)
    if not sl or not tp:
        print(f"Validation Rejected: Missing SL ({sl}) or TP ({tp})")
        return {
            "signal": "HOLD",
            "entry": entry,
            "stop_loss": sl,
            "take_profit": tp,
            "confidence": 0,
            "strategy": signal_data.get("strategy", "Validation"),
            "explanation": "Signal rejected: Missing Stop Loss or Take Profit levels."
        }

    # 2. Market Context Check
    indicators = market_context.get("indicator_analysis", {})
    if not market_context or not indicators:
        print("❌ Validation Rejected: Missing Market Context (Scraper failed or not loaded).")
        return {
            "signal": "HOLD",
            "explanation": "Signal rejected: Market indicators not detected. Please wait for chart to load."
        }

    rsi = indicators.get("rsi", 50)
    if signal == "SELL" and rsi < 35:
        print(f"Validation Rejected: SELL in Oversold RSI ({rsi})")
        return {
            "signal": "HOLD",
            "explanation": f"High risk: SELL rejected because RSI is oversold ({round(rsi, 2)})."
        }
    if signal == "BUY" and rsi > 65:
        print(f"Validation Rejected: BUY in Overbought RSI ({rsi})")
        return {
            "signal": "HOLD",
            "explanation": f"High risk: BUY rejected because RSI is overbought ({round(rsi, 2)})."
        }

    # 3. EMA Trend Validation (STRICT)
    ema_trend = indicators.get("trend")
    ema20 = indicators.get("ema20")
    ema50 = indicators.get("ema50")
    
    # Recalculate if missing or N/A
    if not ema_trend or ema_trend == "N/A":
        if ema20 is not None and ema50 is not None:
            if ema20 > ema50: ema_trend = "UP"
            elif ema20 < ema50: ema_trend = "DOWN"
            else: ema_trend = "SIDEWAYS"
        elif market_context.get("chart_data"):
            # Try from chart data
            try:
                df = pd.DataFrame(market_context.get("chart_data"))
                if not df.empty:
                    # Rename columns to Title Case for indicators.py
                    column_map = {col: col.capitalize() for col in df.columns if col.lower() in ['open', 'high', 'low', 'close', 'volume']}
                    df = df.rename(columns=column_map)
                    
                    df = add_ema(df, periods=[20, 50])
                    last = df.iloc[-1]
                    e20 = last.get("EMA_20")
                    e50 = last.get("EMA_50")
                    if e20 is not None and e50 is not None:
                        if e20 > e50: ema_trend = "UP"
                        elif e20 < e50: ema_trend = "DOWN"
                        else: ema_trend = "SIDEWAYS"
            except Exception as e:
                print(f"Trend calculation failed: {e}")

    if not ema_trend or ema_trend == "N/A":
        print("❌ Validation Rejected: EMA Trend data missing.")
        return {
            "signal": "HOLD",
            "explanation": "Signal rejected: EMA Trend data is unavailable."
        }

    # 4. Confidence Filter (Min 60%)
    confidence = signal_data.get("confidence", 0)
    if confidence <= 60:
        print(f"Validation Rejected: Low Confidence ({confidence}%)")
        return {
            "signal": "HOLD",
            "entry": entry,
            "stop_loss": sl,
            "take_profit": tp,
            "confidence": confidence,
            "strategy": signal_data.get("strategy", "Validation"),
            "explanation": f"Signal rejected: Low confidence score ({confidence}%). Minimum 60% required."
        }

    print("✅ Signal validated")
    return signal_data

def generate_fallback_signal(req: SignalRequest) -> Dict[str, Any]:
    """
    Generates a local signal based on technical indicators when AI fails.
    EMA 20, EMA 50, RSI 14 logic.
    """
    print("⚠️ GENERATING LOCAL FALLBACK SIGNAL")
    
    data = req.data
    indicators = data.get("indicator_analysis", {})
    chart_data = data.get("chart_data", [])
    current_price = data.get("price", 0)
    
    ema20 = indicators.get("ema20")
    ema50 = indicators.get("ema50")
    rsi = indicators.get("rsi")
    volume = data.get("volume", 0)
    avg_volume = 0

    # 1. Recalculate if missing and chart data is available
    if (ema20 is None or ema50 is None or rsi is None) and chart_data:
        try:
            df = pd.DataFrame(chart_data)
            if not df.empty:
                # Ensure column names match what indicators.py expects (Title Case)
                column_map = {col: col.capitalize() for col in df.columns if col.lower() in ['open', 'high', 'low', 'close', 'volume']}
                df = df.rename(columns=column_map)
                
                df = add_ema(df, periods=[20, 50])
                df = add_rsi(df, period=14)
                
                last_row = df.iloc[-1]
                ema20 = last_row.get("EMA_20", ema20)
                ema50 = last_row.get("EMA_50", ema50)
                rsi = last_row.get("RSI", rsi)
                volume = last_row.get("Volume", volume)
                
                # Volume Average (Last 20)
                if 'Volume' in df.columns:
                    avg_volume = df['Volume'].tail(20).mean()

                if not current_price:
                    current_price = last_row.get("close", 0)
        except Exception as e:
            print(f"Error calculating local indicators: {e}")

    # Defaults to avoid N/A
    ema20 = ema20 or current_price
    ema50 = ema50 or current_price
    rsi = rsi or 50
    
    signal = "HOLD"
    explanation = "Local fallback: Indicators neutral."

    # Part 3 Logic: EMA Trend + RSI Bias (35/65) + Volume Support
    trend = "SIDEWAYS"
    if ema20 > ema50: trend = "UP"
    elif ema20 < ema50: trend = "DOWN"

    bias = "HOLD"
    if rsi < 35: bias = "BUY"
    elif rsi > 65: bias = "SELL"

    # Volume filter: Only signal if volume is healthy
    volume_ok = volume >= avg_volume if avg_volume > 0 else True

    if trend == "UP" and bias == "BUY" and volume_ok:
        signal = "BUY"
        explanation = f"Fallback: Bullish Trend (EMA20 > EMA50) + Oversold RSI ({round(rsi, 2)})."
    elif trend == "DOWN" and bias == "SELL" and volume_ok:
        signal = "SELL"
        explanation = f"Fallback: Bearish Trend (EMA20 < EMA50) + Overbought RSI ({round(rsi, 2)})."

    # Risk parameters logic
    sl = 0
    tp = 0
    if signal != "HOLD" and current_price > 0:
        if signal == "BUY":
            sl = current_price * 0.99  # 1% SL
            tp = current_price * 1.015 # 1.5% TP (Min 1:1.5 RR)
        elif signal == "SELL":
            sl = current_price * 1.01  # 1% SL
            tp = current_price * 0.985 # 1.5% TP (Min 1:1.5 RR)

    print("Fallback activated")
    return {
        "signal": signal,
        "entry": round(current_price, 2),
        "stop_loss": round(sl, 2),
        "take_profit": round(tp, 2),
        "confidence": 65,
        "strategy": "Local Fallback (EMA/RSI)",
        "explanation": explanation
    }

@app.post("/generate-signal")
async def generate_signal(req: SignalRequest):
    prompt = get_dynamic_prompt(req.data)
    print(f"Prompt Sent: {prompt}")
    
    symbol = req.symbol
    try:
        print("🚀 Calling Gemini AI...")
        # Use the robust wrapper to keep the model retries but without silent local fallback
        response = call_gemini_with_fallback(prompt)
        
        print("✅ Gemini Raw Response:", response)
        reply_text = response.text.strip()
        print("🧠 Parsed AI Text:", reply_text)
        
        reply_json = json.loads(reply_text)
        
        # Ensure robust float/int casting
        reply_json["entry"] = float(reply_json.get("entry", 0))
        reply_json["stop_loss"] = float(reply_json.get("stop_loss", 0))
        reply_json["take_profit"] = float(reply_json.get("take_profit", 0))
        reply_json["confidence"] = int(reply_json.get("confidence", 0))
        
        print("Gemini Response Decoded Successfully")
        
        # 🔥 Validation Layer (Returns HOLD if data is bad, but AI call succeeded)
        validated_signal = validate_ai_signal(reply_json, req.data)
        
        print("AI request completed")
        return validated_signal
        
    except Exception as e:
        print("❌ GEMINI ERROR:", str(e))
        print("⚠️ RESTORING LOCAL FALLBACK DUE TO API FAILURE")
        return generate_fallback_signal(req)

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    is_analysis = "SYSTEM: Generate Final Decision Response." in req.message
    print(f"--- 📥 NEW {'ANALYSIS' if is_analysis else 'CHAT'} REQUEST ---")
    
    if is_analysis:
        prompt = get_dynamic_prompt(req.data)
        mime_type = "application/json"
    else:
        prompt = get_chat_prompt(req.message, req.data)
        mime_type = "text/plain"
    
    try:
        if not AI_API_KEY:
            raise HTTPException(status_code=500, detail="API key not configured")

        response = call_gemini_with_fallback(prompt, mime_type=mime_type)
        
        reply = response.text.strip()
        print(f"AI Chat Result: {reply[:100]}...")
        return {"reply": reply}
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Gemini execution failed: {error_msg}")
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return {"reply": '{"direction": "NO TRADE", "explanation": "AI Quota Exceeded (Wait 60s).", "confidence_score": 0, "risk_level": "N/A"}'}
        if is_analysis:
            return {
                "reply": '{"direction": "NO TRADE", "explanation": "System connection error.", "confidence_score": 0, "risk_level": "HIGH"}'
            }
        return {"reply": "Institutional assistant is temporarily offline for maintenance."}


@app.get("/health")
async def health_check():
    return {"status": "Elite Trading Service Online"}

if __name__ == "__main__":
    import uvicorn
    list_available_models()
    uvicorn.run(app, host="0.0.0.0", port=8000)
