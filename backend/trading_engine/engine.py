import pandas as pd
from typing import Dict, Any

from .models import SignalResponse, SignalType, Trend
from .indicators import compile_indicators
from .market_structure import analyze_market_structure, find_support_resistance_zones, detect_liquidity_sweeps
from .risk_management import calculate_trade_parameters
from .strategy import evaluate_strategy
from .analyst import validate_trade_setup
from .decision_engine import get_final_decision
from .smc_expert import get_smc_analysis
from .models import SignalResponse, Trend, AnalystResponse, FinalDecisionResponse, TradePlanResponse, SMCResponse

class SignalEngine:
    def __init__(self):
        pass
        
    def _process_timeframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Runs all the computations on a single timeframe dataframe.
        """
        if df is None or df.empty:
            return df
            
        df = compile_indicators(df)
        df = analyze_market_structure(df)
        df = find_support_resistance_zones(df)
        df = detect_liquidity_sweeps(df)
        return df

    def generate_signal(self, data_1m: pd.DataFrame, data_5m: pd.DataFrame, data_15m: pd.DataFrame, data_1h: pd.DataFrame, pair: str = "BTCUSDT") -> dict:
        """
        Main entry point. Takes multi-timeframe OHLCV pandas DataFrames.
        DataFrames are expected to be ordered chronologically (oldest to newest).
        """
        # Process the HTF first to get the main trend
        df_1h = self._process_timeframe(data_1h)
        htf_trend = 'SIDEWAYS'
        if df_1h is not None and not df_1h.empty:
            htf_trend = df_1h.iloc[-1]['Trend_Status']

        # We will use the 5m timeframe for entry signals 
        df_entry = self._process_timeframe(data_5m)
        if df_entry is None or df_entry.empty:
            return self._empty_signal()

        # Look at the most recent completed candle (or current candle)
        current_candle = df_entry.iloc[-1]
        
        # 1. Evaluate Strategy
        strategy_result = evaluate_strategy(current_candle, htf_trend)
        signal = strategy_result['signal']
        confidence = strategy_result['confidence']
        reasons = strategy_result['reasons']
        
        entry = None
        stop_loss = None
        take_profit = None
        rr_str = "0:0"
        
        if signal in ['BUY', 'SELL']:
            # 2. Add Risk Management logic
            e, sl, tp, rr = calculate_trade_parameters(current_candle, signal)
            
            if rr >= 2.0:
                entry = e
                stop_loss = sl
                take_profit = tp
                rr_str = f"1:{rr}"
                reasons.append(f"Valid R:R achieved ({rr_str})")
            else:
                signal = 'NO TRADE'
                reasons.append(f"Rejected: Invalid R:R ({rr}) < 2.0")
                confidence = 0

        # --- EXPERT ANALYST CONFIRMATION ---
        analyst_response = validate_trade_setup(
            signal=signal,
            entry=entry,
            sl=stop_loss,
            tp=take_profit,
            trend=htf_trend,
            support=current_candle.get('Support_Zone_Top'),
            resistance=current_candle.get('Resistance_Zone_Bottom'),
            rsi=current_candle.get('RSI', 50),
            volume_spike=current_candle.get('Volume_Spike', False),
            last_candles=df_entry.tail(5)
        )

        # --- SHARED PARAMETERS ---
        volume_spike = current_candle.get('Volume_Spike', False)
        # The 'entry' variable is already defined and calculated above.
        # The line 'entry = current_candle['Close']' from the instruction snippet
        # would overwrite the calculated entry and is likely a simplification for a different context.
        # Keeping the calculated 'entry' for consistency with risk management.
        
        # --- FINAL INSTITUTIONAL DECISION ---
        # Feature Extraction
        candle_strength = "STRONG"
        body = abs(current_candle['Close'] - current_candle['Open'])
        if body < (current_candle['High'] - current_candle['Low']) * 0.3:
            candle_strength = "WEAK"
            
        entry_quality = "GOOD"
        if signal == "BUY" and current_candle.get('Support_Zone_Top'):
            if (current_candle['Close'] - current_candle['Support_Zone_Top']) / current_candle['Close'] > 0.01:
                entry_quality = "MID"
        elif signal == "SELL" and current_candle.get('Resistance_Zone_Bottom'):
            if (current_candle['Resistance_Zone_Bottom'] - current_candle['Close']) / current_candle['Close'] > 0.01:
                entry_quality = "MID"

        final_verdict = get_final_decision(
            signal=signal,
            entry=entry,
            sl=stop_loss,
            tp=take_profit,
            trend=htf_trend,
            support=current_candle.get('Support_Zone_Top'),
            resistance=current_candle.get('Resistance_Zone_Bottom'),
            rsi=current_candle.get('RSI', 50),
            volume_spike=current_candle.get('Volume_Spike', False),
            market_structure=current_candle.get('Last_Structure_High', "CHOPPY"), # Simplified
            candle_status="CLOSED",
            candle_strength=candle_strength,
            entry_quality=entry_quality,
            analyst_decision=analyst_response.decision,
            session="LONDON" # Placeholder
        )

        # --- CONSTRUCT TRADE PLAN ---
        risk_level = "MEDIUM"
        if final_verdict.trade_quality_score > 85: risk_level = "LOW"
        elif final_verdict.trade_quality_score < 60: risk_level = "HIGH"

        # Determine relevant zone for entry plan
        entry_zone_info = "relevant zone"
        if signal == "BUY" and current_candle.get('Support_Zone_Top') is not None:
            entry_zone_info = f"support ({current_candle['Support_Zone_Top']:.2f})"
        elif signal == "SELL" and current_candle.get('Resistance_Zone_Bottom') is not None:
            entry_zone_info = f"resistance ({current_candle['Resistance_Zone_Bottom']:.2f})"

        trade_plan = TradePlanResponse(
            market_bias=signal,
            current_condition="TRENDING" if htf_trend != "SIDEWAYS" else "CHOPPY",
            best_action=final_verdict.final_decision.value,
            entry_plan=f"Look for entries near {entry_zone_info} zone.",
            confirmation_trigger=final_verdict.trigger or "Awaiting confirmation trigger",
            invalidation=final_verdict.invalidation or "Invalidated on structural break",
            risk_level=risk_level,
            summary=f"Institutional setup detected with {final_verdict.trade_quality_score}% quality score. {final_verdict.execution_plan}"
        )

        # --- SMC EXPERT ANALYSIS ---
        # Basic SMC Feature Detection
        liquidity_sweep = volume_spike and abs(current_candle['High'] - current_candle['Low']) > (df_entry['High'] - df_entry['Low']).mean() * 1.5
        bos = current_candle['Close'] > df_entry['High'].shift(1).max() if signal == "BUY" else current_candle['Close'] < df_entry['Low'].shift(1).min()
        
        current_location = "MID"
        if signal == "BUY" and current_candle.get('Support_Zone_Top'):
            if abs(entry - current_candle['Support_Zone_Top']) / entry < 0.005:
                current_location = "AT OB"
        elif signal == "SELL" and current_candle.get('Resistance_Zone_Bottom'):
            if abs(entry - current_candle['Resistance_Zone_Bottom']) / entry < 0.005:
                current_location = "AT OB"

        smc_response = get_smc_analysis(
            price=entry,
            trend=htf_trend,
            market_structure=current_candle.get('Last_Structure_High', "TRENDING"),
            liquidity_sweep=liquidity_sweep,
            equal_highs=False,
            equal_lows=False,
            order_block_zone=f"{current_candle.get('Support_Zone_Top', 0):.2f}" if signal == "BUY" else f"{current_candle.get('Resistance_Zone_Bottom', 0):.2f}",
            current_location=current_location,
            bos=bos,
            choch=False, # Complex to detect without pivot history
            volume="HIGH" if volume_spike else "BASELINE",
            candle_status="CLOSED",
            candle_strength=candle_strength,
            session="LONDON"
        )

        # Construct strictly typed SignalResponse
        try:
            response = SignalResponse(
                pair=pair,
                signal=signal, # Python model uses str or SignalType
                entry=entry,
                stop_loss=stop_loss,
                take_profit=take_profit,
                risk_reward_ratio=rr_str,
                confidence=confidence,
                trend=Trend(htf_trend),
                reason=reasons,
                analyst=analyst_response,
                final_verdict=final_verdict,
                trade_plan=trade_plan,
                smc_expert=smc_response
            )
            return response.to_dict()
        except Exception as e:
            # Fallback for unexpected failures in typing
            return self._empty_signal(reasons=[f"Internal formatting error: {str(e)}"])

    def _empty_signal(self, reasons=None) -> dict:
        return {
            "signal": "NO TRADE",
            "entry": None,
            "stop_loss": None,
            "take_profit": None,
            "risk_reward_ratio": "0:0",
            "confidence": 0,
            "trend": "SIDEWAYS",
            "reason": reasons or ["Insufficient data or error in processing"]
        }
