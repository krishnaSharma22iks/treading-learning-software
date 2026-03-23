import requests
import json

url = "http://localhost:8000/generate-signal"

def test_signal(payload, description):
    print(f"\n--- Testing: {description} ---")
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {str(e)}")

# 1. RSI Oversold Reject SELL
test_signal({
    "symbol": "BTCUSDT",
    "trading_type": "Swing",
    "timeframe": "15m",
    "data": {
        "trend": "DOWNTREND",
        "indicator_analysis": {"rsi": 25, "trend": "DOWN"},
        "mock_response": {
            "signal": "SELL",
            "entry": 60000,
            "stop_loss": 61000,
            "take_profit": 55000,
            "confidence": 0.8,
            "strategy": "Mock Trend"
        }
    }
}, "RSI Oversold (SELL should be rejected)")

# 2. RSI Overbought Reject BUY
test_signal({
    "symbol": "BTCUSDT",
    "trading_type": "Swing",
    "timeframe": "15m",
    "data": {
        "trend": "UPTREND",
        "indicator_analysis": {"rsi": 75, "trend": "UP"},
        "mock_response": {
            "signal": "BUY",
            "entry": 60000,
            "stop_loss": 59000,
            "take_profit": 65000,
            "confidence": 0.8,
            "strategy": "Mock Trend"
        }
    }
}, "RSI Overbought (BUY should be rejected)")

# 3. Low RR Ratio Reject (1:1.0)
test_signal({
    "symbol": "BTCUSDT",
    "trading_type": "Swing",
    "timeframe": "15m",
    "data": {
        "trend": "UPTREND",
        "indicator_analysis": {"rsi": 50, "trend": "UP"},
        "mock_response": {
            "signal": "BUY",
            "entry": 60000,
            "stop_loss": 59000,
            "take_profit": 61000,
            "confidence": 0.8,
            "strategy": "Mock Trend"
        }
    }
}, "Low RR Ratio (Should be rejected)")

# 4. Valid Signal with High RR
test_signal({
    "symbol": "BTCUSDT",
    "trading_type": "Swing",
    "timeframe": "15m",
    "data": {
        "trend": "UPTREND",
        "indicator_analysis": {"rsi": 50, "trend": "UP"},
        "mock_response": {
            "signal": "BUY",
            "entry": 60000,
            "stop_loss": 59000,
            "take_profit": 62000,
            "confidence": 0.8,
            "strategy": "Mock Trend"
        }
    }
}, "Valid Signal (Should be accepted)")

# 5. EMA Trend N/A Reject
test_signal({
    "symbol": "BTCUSDT",
    "trading_type": "Swing",
    "timeframe": "15m",
    "data": {
        "trend": "UPTREND",
        "indicator_analysis": {"rsi": 50, "trend": "N/A"},
        "mock_response": {
            "signal": "BUY",
            "entry": 60000,
            "stop_loss": 59000,
            "take_profit": 62000,
            "confidence": 0.8,
            "strategy": "Mock Trend"
        }
    }
}, "EMA Trend N/A (Should be rejected)")
