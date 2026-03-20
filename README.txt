================================================================================
  IKS TRADES X — TRADING LEARNING SOFTWARE
  Comprehensive Technical Documentation
================================================================================

VERSION   : 4.2 (Algorithmic Telemetry)
AUTHOR    : IKS Trades X Team
TECH STACK: FastAPI (Backend) + React + Vite + TailwindCSS V4 (Frontend)
AI ENGINE : Google Gemini AI (gemini-flash-latest)
DATA FEED : Binance REST API (Klines / Candlestick)

================================================================================
  TABLE OF CONTENTS
================================================================================
  1.  Project Overview
  2.  Directory Structure
  3.  Backend (FastAPI + Gemini AI)
  4.  Frontend Application Entry
  5.  Strategies (Signal Engines)
       5a. Scalping Mode
       5b. Intraday Mode
       5c. Swing Mode
  6.  Utility Functions
       6a. extraIndicators.js
       6b. expertAnalyst.js
       6c. decisionEngine.js
       6d. smcExpert.js
       6e. assistantLogic.js
       6f. indicators.js
       6g. signalFilter.js
       6h. multiTimeframe.js
       6i. confirmation.js
       6j. backtestEngine.js
       6k. analytics.js
       6l. storage.js
       6m. strategy.js
       6n. ai.js
  7.  UI Components
  8.  Signal Flow (End-to-End Logic)
  9.  Risk Management Rules
  10. API Reference
  11. Setup & Run Instructions

================================================================================
  1. PROJECT OVERVIEW
================================================================================

IKS Trades X is a professional-grade crypto trading learning & signal terminal
built for educational and analytical purposes. It connects to Binance live market
data, applies multiple institutional trading strategies, runs them through an
AI-powered decision engine, and presents high-probability BUY/SELL/WAIT signals
in a premium web dashboard.

Core Features:
  - Real-time TradingView chart (via embed widget)
  - 6 deployable trading strategies (Scalp / Intraday / Swing)
  - RSI, EMA, ATR, Volume, Support/Resistance analysis
  - Institutional SMC (Smart Money Concepts) signal overlay
  - Expert Analyst validation layer
  - Final institutional Decision Engine
  - AI Trading Assistant (Gemini-powered real-time chat)
  - Trade History log with purge functionality
  - Analytics dashboard (win rate, avg risk, profit factor)

================================================================================
  2. DIRECTORY STRUCTURE
================================================================================

Trading Learning software/
├── backend/
│   ├── main.py              → FastAPI server with Gemini AI /chat endpoint
│   ├── requirements.txt     → Python dependencies
│   ├── .env                 → API key environment file
│   ├── .env.example         → Template for .env
│   ├── trading_engine/      → (Reserved for advanced engine expansion)
│   ├── test_engine.py       → Engine unit tests
│   ├── test_api_key.py      → Gemini API connectivity test
│   └── list_models.py       → Lists all available Gemini models
│
├── frontend/
│   ├── index.html           → HTML entry point
│   ├── package.json         → Node.js dependencies
│   ├── vite.config.js       → Vite configuration
│   └── src/
│       ├── main.jsx         → React DOM entry point
│       ├── App.jsx          → Root component with router setup
│       ├── index.css        → Global styles (Tailwind + glassmorphism)
│       ├── pages/
│       │   └── Dashboard.jsx → Main trading terminal page
│       ├── components/      → UI Components (see Section 7)
│       ├── strategies/      → Trading strategy engines (see Section 5)
│       └── utils/           → Core indicator & logic utilities (see Section 6)

================================================================================
  3. BACKEND — FastAPI + Gemini AI
================================================================================

FILE: backend/main.py
─────────────────────
Purpose: Institutional AI Trading Assistant API endpoint.

Dependencies:
  - google-genai        → Gemini 2.x SDK
  - fastapi             → REST API framework
  - uvicorn             → ASGI server
  - python-dotenv       → .env file loader
  - pydantic            → Request body validation

Configuration:
  - GEMINI_API_KEY      → Loaded from .env or defaults to hardcoded key
  - Model               → gemini-flash-latest (confirmed working)
  - CORS                → Enabled for all origins (development mode)

ENDPOINT: POST /chat
─────────────────────
  Request Body:
    {
      "message": "string (user question or SYSTEM trigger)",
      "data": {
        "price":          float   → Current asset price
        "trend":          string  → "UPTREND 📈" / "DOWNTREND 📉"
        "support":        float   → Calculated support level
        "resistance":     float   → Calculated resistance level
        "rsi":            float   → RSI value (0–100)
        "volume":         string  → "HIGH" / "BASELINE"
        "smc_data":       object  → SMC analysis data
        "expert_decision":string  → Analyst decision
        "verdict":        object  → Final decision engine output
      }
    }

  Response Body:
    { "reply": "string (formatted AI response)" }

  Prompt Logic:
    - Injects live market data into a structured prompt
    - Forces strict output format: Decision / Reason / Suggestion
    - Different behavior for SYSTEM: Generate Final Decision Response
    - Falls back to institutional hardcoded response if Gemini fails

ENDPOINT: GET /health
─────────────────────
  Returns: { "status": "Elite Trading Service Online" }

FILE: backend/requirements.txt
──────────────────────────────
  google-genai
  fastapi
  uvicorn
  python-dotenv
  pydantic

================================================================================
  4. FRONTEND APPLICATION ENTRY
================================================================================

FILE: src/main.jsx
  - Renders <App /> into #root DOM element
  - Uses React 18 createRoot API

FILE: src/App.jsx
  - Sets up basic routing
  - Renders <Dashboard /> as the primary view

FILE: src/index.css
  - @import "tailwindcss"
  - @theme block: custom font and color tokens
  - .glass          → backdrop-blur glassmorphism base class
  - .glass-card     → rounded glassmorphism card with shadow
  - .premium-shadow → blue-tinted deep box shadow
  - Custom ::-webkit-scrollbar styling
  - @keyframes neon-pulse animation + .animate-neon class

FILE: src/pages/Dashboard.jsx
  - Main orchestration component
  - State managed: mode, strategy, pair, signal, entry, sl, tp, price,
                   support, resistance, rsi, trend, volumeSpike, ai,
                   expert, verdict, tradePlan, smcData, isSidePanelOpen
  - On load (useEffect) → fetches Binance klines (interval=5m, limit=100)
  - Computes: closes[], volumes[], MA(50), currentPrice
  - Applies strategy based on mode + strategy selection
  - Pipes results through: validateTradeSetup() → getFinalDecision() →
    getSMCAnalysis() to build full signal chain
  - Renders: Header | ModeSelector | StrategySelector | Chart |
             SignalCard | AnalyticsDashboard | TradeHistory |
             TradePlanCard | SMCExpert | DeepAnalysisPanel (slide-in) |
             TradingAssistant (inside panel)
  - Mobile: floating TrendingUp FAB triggers side panel

================================================================================
  5. STRATEGIES (SIGNAL ENGINES)
================================================================================

Each strategy accepts formatted candlestick data (array of {open,high,low,close,volume})
and returns a standardized result object:
  { signal, entry, sl, tp, reason, support?, resistance? }

Signal values: "BUY" | "SELL" | "HOLD"

────────────────────────────────────────
  5a. SCALPING MODE
────────────────────────────────────────

FILE: strategies/scalping/rsiScalp.js
  FUNCTION: rsiScalpStrategy(data)
  ─────────────────────────────────
  Logic:
    1. Calculates RSI(14) for the current and previous candle close.
    2. BUY signal: RSI crossed FROM below 30 TO above 30 (oversold recovery).
    3. SELL signal: RSI crossed FROM above 70 TO below 70 (overbought reversal).
    4. Risk: 0.2% of current price per trade.
    5. Reward: 2:1 RR (Risk x2 for TP).
  Use Case: High-frequency momentum scalping off RSI extremes.
  Note: No S/R levels returned (not natively calculated in this strategy).

FILE: strategies/scalping/breakoutScalp.js
  FUNCTION: breakoutScalpStrategy(data)
  ─────────────────────────────────────
  Logic:
    1. Calculates 20-period resistance (max high) and support (min low).
    2. Calculates average volume over 20 periods.
    3. BUY signal: Previous candle BELOW resistance AND current candle
                   ABOVE resistance AND current volume > 1.5x avg volume.
    4. SELL signal: Previous above support AND current BELOW support
                    AND volume > 1.5x avg volume.
    5. Risk: 0.2%. Reward: 2:1 RR (1:2 risk/reward ratio).
  Use Case: Volume-confirmed breakout scalping.
  Returns: { signal, entry, sl, tp, reason, support, resistance }

────────────────────────────────────────
  5b. INTRADAY MODE
────────────────────────────────────────

FILE: strategies/intraday/trendPullback.js
  FUNCTION: trendPullbackStrategy(data)
  ─────────────────────────────────────
  Logic:
    1. Calculates 50-period MA as trend filter.
    2. Support = min low over last 30 candles; Resistance = max high.
    3. BUY signal: MA < Price (uptrend) AND previous candle near support
                   (within 1%) AND current candle closes bullish.
    4. SELL signal: MA > Price (downtrend) AND previous near resistance
                    AND current candle closes bearish.
    5. SL: Just beyond S/R with 0.2% buffer. TP: 2:1 RR.
  Use Case: Trend-following intraday with pullback entries.

FILE: strategies/intraday/srBounce.js
  FUNCTION: srBounceStrategy(data)
  ─────────────────────────────────
  Logic:
    - Bounces from S/R zones using price proximity checks.
    - BUY near support; SELL near resistance.
    - Volume filter applied to confirm institutional bounce.

────────────────────────────────────────
  5c. SWING MODE
────────────────────────────────────────

FILE: strategies/swing/trendFollow.js
  FUNCTION: trendFollowStrategy(data)
  ──────────────────────────────────
  Logic:
    1. MA Fast (20-period), MA Slow (100-period).
    2. ATR proxy = average absolute close-to-close movement over 14 periods.
    3. BUY signal: FastMA > SlowMA AND price > FastMA (strong uptrend aligned).
    4. SELL signal: FastMA < SlowMA AND price < FastMA (strong downtrend aligned).
    5. SL: 2.5x ATR below/above entry. TP: 5x ATR (1:2 risk/reward).
  Use Case: Swing trading riding strong macro trends with ATR-based exits.

FILE: strategies/swing/breakoutSwing.js
  FUNCTION: breakoutSwingStrategy(data)
  ─────────────────────────────────────
  Logic:
    - Detects multi-day range breakouts on larger candle lookback.
    - Volume confirmation required.
    - SL below breakout candle low. TP based on range projection.

================================================================================
  6. UTILITY FUNCTIONS
================================================================================

────────────────────────────────────────
  6a. extraIndicators.js
────────────────────────────────────────

  calculateTrend(price, ma) → "UPTREND 📈" | "DOWNTREND 📉" | "SIDEWAYS"
    → Compares current price to 50MA average.

  calculateVolume(volumes[]) → { volumeSpike: bool, currentVolume: float }
    → Returns true if last volume > 1.5x the 20-period average.

  calculateRSI(closes[], period=14) → float (0–100)
    → Standard RSI formula using avg gains/losses over period.

  generateAIMessage(signal, trend, volumeSpike) → string
    → Returns a natural language market message based on signal state.

────────────────────────────────────────
  6b. expertAnalyst.js
────────────────────────────────────────

  FUNCTION: validateTradeSetup({ signal, entry, sl, tp, trend, support,
                                  resistance, rsi, volumeSpike, lastCandles })
  → Returns: { decision, confidence, reason, suggestion, betterEntry, riskNote }

  Decision Values:
    "ENTER NOW"            → >= 75 confidence
    "WAIT FOR CONFIRMATION"→ 40–74 confidence
    "AVOID TRADE"          → < 40 confidence

  Analysis Steps:
    1. Entry Validation  → Checks if entry is too far from S/R (> 2%)
    2. Candle Confirmation → Detects rejection wicks and weak closes
    3. Volume Analysis   → Rewards high volume, penalizes low volume
    4. Trend Alignment   → Penalizes counter-trend trades (-30 confidence)
    5. Final Decision    → Based on composite confidence score

────────────────────────────────────────
  6c. decisionEngine.js
────────────────────────────────────────

  FUNCTION: getFinalDecision({ signal, entry, sl, tp, trend, support,
              resistance, rsi, volumeSpike, marketStructure, candleStatus,
              candleStrength, entryQuality, analystDecision, session })
  → Returns: { final_decision, confidence, trade_quality_score, reason[],
                execution_plan, trigger, invalidation, note }

  STRICT RULES (applied in order, returns immediately on failure):
    Rule 1: Candle OPEN  → WAIT (35% confidence, quality 50)
    Rule 2: Volume LOW   → NO TRADE (10% confidence, quality 20)
    Rule 3: Entry MID    → NO TRADE (20% confidence, quality 40)
    Rule 4: Entry BAD    → NO TRADE (0% confidence, quality 10)
    Rule 5: Analyst says WAIT     → WAIT (40% confidence, quality 60)
    Rule 6: Analyst says AVOID    → NO TRADE (0% confidence, quality 0)

  PASS Condition (all rules pass):
    → StrongClose + VolumeSpike + GoodEntry + TrendAligned + StableStructure
    → Issues BUY or SELL with 95% confidence, quality score 100

────────────────────────────────────────
  6d. smcExpert.js
────────────────────────────────────────

  FUNCTION: getSMCAnalysis({ price, trend, marketStructure, liquiditySweep,
              orderBlockZone, currentLocation, bos, choch, volume,
              candleStatus, candleStrength, session })
  → Returns: { decision, bias, confidence, reason[], entry_zone, trigger,
                invalidation, liquidity_sweep, at_order_block, bos_detected,
                choch_detected }

  SMC Concepts Evaluated:
    - Liquidity Sweep (EQH/EQL grab)
    - Order Block (OB) location: "AT OB" vs "MID"
    - Break of Structure (BOS)
    - Change of Character (CHoCH)
    - Volume presence
    - Candle confirmation

  Full Confirmation = liquiditySweep + AT_OB + (bos OR choch) + CLOSED candle
  → Confidence 90%, Decision: ENTER

────────────────────────────────────────
  6e. assistantLogic.js
────────────────────────────────────────

  FUNCTION: generateAssistantResponse(input, telemetry)
  → Returns: string (chat reply) OR object (decision object for ELITE mode)

  Modes:
    CHAT MODE:    input is a string → sends as user question to /chat  
    DECISION MODE: input is an object → sends as "SYSTEM: Generate Decision"

  Fallback: If backend is offline → returns hardcoded institutional response.

────────────────────────────────────────
  6f. indicators.js
────────────────────────────────────────
  Core indicators library:
    - EMA (Exponential Moving Average) calculation
    - MACD components
    - Bollinger Bands
    - Stochastic RSI
    - ATR (Average True Range)

────────────────────────────────────────
  6g. signalFilter.js
────────────────────────────────────────
  Post-processing signal quality filters:
    - Minimum confidence threshold gate
    - Duplicate signal suppression
    - News risk period filter (optional)
    - Max exposure limiter

────────────────────────────────────────
  6h. multiTimeframe.js
────────────────────────────────────────
  HTF (Higher Timeframe) analysis:
    - Aligns 5m signal with 15m and 1h trend
    - Returns mtf_aligned: boolean
    - Penalizes counter-HTF signals

────────────────────────────────────────
  6i. confirmation.js
────────────────────────────────────────
  Candle confirmation logic:
    - Detects engulfing patterns
    - Pin bar / hammer / shooting star detection
    - Three-candle continuation patterns
    - Returns confirmation_type and strength

────────────────────────────────────────
  6j. backtestEngine.js
────────────────────────────────────────
  Simulated backtest runner:
    - Takes historical OHLCV data and a strategy function
    - Runs each bar through the strategy
    - Tracks: wins, losses, total trades
    - Calculates: win rate, profit factor, max drawdown
    - Returns full backtest report object

────────────────────────────────────────
  6k. analytics.js
────────────────────────────────────────
  FUNCTION: getAnalytics()
    - Reads trade history from localStorage
    - Computes: totalTrades, wins, losses, winRate%, avgRiskReward
    - Returns analytics object for the AnalyticsDashboard component

────────────────────────────────────────
  6l. storage.js
────────────────────────────────────────
  Trade History persistence layer:
    - saveTrade(trade)     → Pushes to localStorage tradeHistory array
    - getTradeHistory()    → Returns all saved trades
    - clearTradeHistory()  → Wipes all history from localStorage

────────────────────────────────────────
  6m. strategy.js
────────────────────────────────────────
  Strategy selection and execution router:
    - Maps (mode, strategy) → strategy function
    - Validates data before execution
    - Normalizes output format across all strategies

────────────────────────────────────────
  6n. ai.js
────────────────────────────────────────
  Lightweight AI wrapper:
    - generateSimpleResponse(prompt)
    - Used as a low-latency alternative for simple signal analysis

================================================================================
  7. UI COMPONENTS
================================================================================

┌───────────────────────────────────────────────────────────────────────────┐
│  COMPONENT            PURPOSE                                               │
├───────────────────────────────────────────────────────────────────────────┤
│  Navbar.jsx           Top navigation bar with branding (IKS Trades X)      │
│  Chart.jsx            TradingView embedded advanced chart widget            │
│                         → Props: pair (e.g. "BTCUSDT")                     │
│                         → Config: 5m, dark theme, drawing tools enabled     │
│  Controls.jsx         Crypto pair selector (BTCUSDT, ETHUSDT, etc.)         │
│  ModeSelector.jsx     Mode tabs: Scalping | Intraday | Swing                │
│                         → Uses framer-motion for animated active state       │
│  StrategySelector.jsx Displays available strategies for selected mode        │
│  SignalCard.jsx        Primary BUY/SELL/WAIT signal display                 │
│                         → Shows: Entry, SL, TP, RSI, Trend, Volume, S/R    │
│                         → Color coded: Green=BUY, Red=SELL, Amber=WAIT      │
│  AnalyticsDashboard.jsx Live analytics: Win Rate, Trades, Risk/Reward       │
│  TradeHistory.jsx     Logged trade history table with Purge button           │
│  TradePlanCard.jsx    Institutional execution summary card                  │
│  SMCExpert.jsx        SMC (Smart Money Concepts) analysis display           │
│  TradingAssistant.jsx Gemini AI chat component (embedded in side panel)     │
│                         → Supports ELITE DECISION mode via button           │
│  SignalStrength.jsx   Visual indicator of signal quality score              │
│  MarketOverview.jsx   Top-level market snapshot widget                      │
│  SLTP.jsx             Stop Loss / Take Profit display component             │
└───────────────────────────────────────────────────────────────────────────┘

================================================================================
  8. SIGNAL FLOW (END-TO-END)
================================================================================

  [1] Binance API → Fetch last 100 candles (5m interval)
          ↓
  [2] Calculate indicators:
      - closes[], volumes[], currentPrice
      - 50MA → Trend
      - 20-period volume → volumeSpike
      - RSI(14) → rsiValue
          ↓
  [3] Strategy Engine (based on mode + strategy selection):
      rsiScalp / breakoutScalp / trendPullback / srBounce / trendFollow / breakoutSwing
      → Outputs: { signal, entry, sl, tp, support, resistance, reason }
          ↓
  [4] Expert Analyst (validateTradeSetup):
      → Validates entry distance, wick patterns, volume, trend alignment
      → Returns: { decision: ENTER/WAIT/AVOID, confidence, reason[] }
          ↓
  [5] Final Decision Engine (getFinalDecision):
      → Runs 6 institutional strict rules
      → If all pass, issues EXECUTE BUY/SELL with 95% confidence
      → Returns: { final_decision, confidence, quality_score, execution_plan }
          ↓
  [6] SMC Analysis (getSMCAnalysis):
      → Evaluates liquidity sweeps, order blocks, BOS/CHoCH
      → Returns: { decision: ENTER/WAIT/NO_TRADE, bias, entry_zone }
          ↓
  [7] Frontend Rendering:
      → SignalCard shows primary decision
      → SMCExpert shows SMC layer
      → TradePlanCard shows execution summary
          ↓
  [8] AI Chat Layer (TradingAssistant → assistantLogic → /chat → Gemini):
      → Accepts user questions or SYSTEM decision trigger
      → Returns real-time analytical response

================================================================================
  9. RISK MANAGEMENT RULES
================================================================================

All strategies enforce the following risk parameters. These rules are not
discretionary — they are codified into the decision engine:

  1. NEVER trade on an OPEN candle      → Always wait for 5m close
  2. NEVER trade on LOW volume          → Requires institutional interest
  3. NEVER take MID-ZONE entries         → Only near S/R zones (< 2% distance)
  4. Risk per trade = 0.2% of price     → Applied across all scalp strategies
  5. Reward/Risk = 2:1 minimum          → All strategies use at least 1:2 RR
  6. Counter-trend trades penalized     → -30 confidence applied if not aligned
  7. Expert WAIT overrides execution    → No trade if analyst is uncertain
  8. Expert AVOID cancels trade         → Setup structure invalid

================================================================================
  10. API REFERENCE
================================================================================

Backend API:
  Base URL   : http://localhost:8000
  POST /chat : AI Assistant interaction (see Section 3 for schema)
  GET /health: Health check

External APIs:
  Binance Klines:
    URL: https://api.binance.com/api/v3/klines
    Params: symbol=BTCUSDT, interval=5m, limit=100
    Returns: OHLCV candlestick array

  TradingView Widget:
    Source: https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js
    Config: dark theme, 5m interval, drawing tools enabled

================================================================================
  11. SETUP & RUN INSTRUCTIONS
================================================================================

  PREREQUISITES:
    - Node.js >= 18.x
    - Python >= 3.10
    - Git (optional)

  ── BACKEND SETUP ──────────────────────────

  1. Navigate to backend folder:
     cd "Trading Learning software/backend"

  2. Create virtual environment:
     python -m venv .venv
     .venv\Scripts\activate   (Windows)

  3. Install dependencies:
     pip install -r requirements.txt

  4. Set your Gemini API key:
     Create a .env file with: GEMINI_API_KEY=your_key_here

  5. Start the server:
     python -m uvicorn main:app --reload

  Backend runs at: http://localhost:8000

  ── FRONTEND SETUP ─────────────────────────

  1. Navigate to frontend folder:
     cd "Trading Learning software/frontend"

  2. Install dependencies:
     npm install

  3. Start development server:
     npm run dev

  Frontend runs at: http://localhost:5173

  ── VERIFY CONNECTION ───────────────────────

  - Visit http://localhost:5173
  - Select a trading pair and mode
  - The chart should load with live Binance data
  - Click "VIEW SIGNALS" to open the deep analysis panel
  - Type a question in the AI assistant to test Gemini connectivity

================================================================================
  END OF DOCUMENTATION
  IKS Trades X — Institutional Grade Learning Terminal
================================================================================
