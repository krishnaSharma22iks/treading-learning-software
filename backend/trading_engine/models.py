from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class SignalType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    NO_TRADE = "NO TRADE"


class Trend(str, Enum):
    UPTREND = "UPTREND"
    DOWNTREND = "DOWNTREND"
    SIDEWAYS = "SIDEWAYS"


class AnalystDecision(str, Enum):
    ENTER = "ENTER NOW"
    WAIT = "WAIT FOR CONFIRMATION"
    AVOID = "AVOID TRADE"


class AnalystResponse(BaseModel):
    decision: AnalystDecision = Field(..., description="Analyst's final decision")
    confidence: int = Field(..., ge=0, le=100)
    reason: List[str] = Field(default_factory=list)
    suggestion: str = Field("", description="Suggested action")
    better_entry: Optional[float] = Field(None)
    risk_note: Optional[str] = Field(None)

    def to_dict(self):
        return {
            "decision": self.decision.value,
            "confidence": self.confidence,
            "reason": self.reason,
            "suggestion": self.suggestion,
            "better_entry": self.better_entry,
            "risk_note": self.risk_note
        }


class FinalDecision(str, Enum):
    BUY = "BUY"
    SELL = "SELL"
    WAIT = "WAIT"
    NO_TRADE = "NO TRADE"


class FinalDecisionResponse(BaseModel):
    final_decision: FinalDecision = Field(..., description="Institutional final verdict")
    confidence: int = Field(..., ge=0, le=100)
    trade_quality_score: int = Field(..., ge=0, le=100)
    reason: List[str] = Field(default_factory=list)
    execution_plan: str = Field("")
    trigger: Optional[str] = Field(None)
    invalidation: Optional[str] = Field(None)
    note: Optional[str] = Field(None)
    better_entry: Optional[float] = Field(None)
    risk_warning: Optional[str] = Field(None)

    def to_dict(self):
        return {
            "final_decision": self.final_decision.value,
            "confidence": self.confidence,
            "trade_quality_score": self.trade_quality_score,
            "reason": self.reason,
            "execution_plan": self.execution_plan,
            "trigger": self.trigger,
            "invalidation": self.invalidation,
            "note": self.note,
            "better_entry": self.better_entry,
            "risk_warning": self.risk_warning
        }


class TradePlanResponse(BaseModel):
    market_bias: str = Field(..., description="BUY / SELL / NEUTRAL")
    current_condition: str = Field(..., description="TRENDING / CHOPPY")
    best_action: str = Field(..., description="WAIT / ENTER / AVOID")
    entry_plan: str = Field(..., description="Ideal entry zone")
    confirmation_trigger: str = Field(..., description="Exact condition to enter")
    invalidation: str = Field(..., description="When trade idea fails")
    risk_level: str = Field(..., description="LOW / MEDIUM / HIGH")
    summary: str = Field(..., description="Simple explanation for user")

    def to_dict(self):
        return {
            "market_bias": self.market_bias,
            "current_condition": self.current_condition,
            "best_action": self.best_action,
            "entry_plan": self.entry_plan,
            "confirmation_trigger": self.confirmation_trigger,
            "invalidation": self.invalidation,
            "risk_level": self.risk_level,
            "summary": self.summary
        }


class SMCDecision(str, Enum):
    ENTER = "ENTER"
    WAIT = "WAIT"
    NO_TRADE = "NO TRADE"


class SMCResponse(BaseModel):
    decision: SMCDecision = Field(..., description="SMC Expert's decision")
    bias: str = Field(..., description="BUY / SELL / NEUTRAL")
    confidence: int = Field(..., ge=0, le=100)
    reason: List[str] = Field(default_factory=list)
    entry_zone: str = Field("", description="Institutional entry range")
    trigger: str = Field("", description="SMC trigger condition")
    invalidation: str = Field("", description="SMC invalidation level")
    liquidity_sweep: bool = Field(False)
    at_order_block: bool = Field(False)
    bos_detected: bool = Field(False)
    choch_detected: bool = Field(False)

    def to_dict(self):
        return {
            "decision": self.decision.value,
            "bias": self.bias,
            "confidence": self.confidence,
            "reason": self.reason,
            "entry_zone": self.entry_zone,
            "trigger": self.trigger,
            "invalidation": self.invalidation,
            "liquidity_sweep": self.liquidity_sweep,
            "at_order_block": self.at_order_block,
            "bos_detected": self.bos_detected,
            "choch_detected": self.choch_detected
        }


class MarketStructure(str, Enum):
    HH = "HH"  # Higher High
    HL = "HL"  # Higher Low
    LH = "LH"  # Lower High
    LL = "LL"  # Lower Low
    BOS = "BOS"  # Break of Structure
    CHOCH = "CHOCH"  # Change of Character


class ConfidenceBreakdown(BaseModel):
    trend_strength: int = Field(..., ge=0, le=100)
    volume_strength: int = Field(..., ge=0, le=100)
    structure_strength: int = Field(..., ge=0, le=100)
    momentum_strength: int = Field(..., ge=0, le=100)

    def to_dict(self):
        return {
            "trend_strength": self.trend_strength,
            "volume_strength": self.volume_strength,
            "structure_strength": self.structure_strength,
            "momentum_strength": self.momentum_strength
        }


class SignalResponse(BaseModel):
    signal: SignalType = Field(..., description="BUY / SELL / NO TRADE")
    entry: Optional[float] = Field(None, description="Entry price")
    stop_loss: Optional[float] = Field(None, description="Stop loss price")
    take_profit: Optional[float] = Field(None, description="Take profit price")
    risk_reward_ratio: str = Field(..., description="Calculated R:R, must be 1:2 or better")
    confidence: int = Field(..., ge=0, le=100, description="Confidence score 0-100")
    confidence_breakdown: Optional[ConfidenceBreakdown] = Field(None)
    trend: Trend = Field(..., description="Detected HTF trend")
    reason: List[str] = Field(default_factory=list, description="Reasons for signal")
    analyst: Optional[AnalystResponse] = Field(None, description="Expert analyst confirmation")
    final_verdict: Optional[FinalDecisionResponse] = Field(None, description="Institutional execution verdict")
    trade_plan: Optional[TradePlanResponse] = Field(None, description="Complete institutional trade plan")
    smc_expert: Optional[SMCResponse] = Field(None, description="SMC expert analysis")

    def to_dict(self):
        return {
            "signal": self.signal.value,
            "entry": self.entry,
            "stop_loss": self.stop_loss,
            "take_profit": self.take_profit,
            "risk_reward_ratio": self.risk_reward_ratio,
            "confidence": self.confidence,
            "confidence_breakdown": self.confidence_breakdown.to_dict() if self.confidence_breakdown else None,
            "trend": self.trend.value,
            "reason": self.reason,
            "analyst": self.analyst.to_dict() if self.analyst else None,
            "final_verdict": self.final_verdict.to_dict() if self.final_verdict else None,
            "trade_plan": self.trade_plan.to_dict() if self.trade_plan else None,
            "smc_expert": self.smc_expert.to_dict() if self.smc_expert else None
        }
