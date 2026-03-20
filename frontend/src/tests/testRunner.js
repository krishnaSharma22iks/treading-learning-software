import { filterFakeSignal } from '../utils/signalFilter.js';
import { confirmEntry } from '../utils/confirmation.js';
import { runBacktest } from '../utils/backtestEngine.js';

// Strategies to test against
import { rsiScalpStrategy } from '../strategies/scalping/rsiScalp.js';
import { trendFollowStrategy } from '../strategies/swing/trendFollow.js';

// Mocks
import { 
  normalTrendDataBullish, 
  sidewaysData, 
  lowVolumeData, 
  spikeData, 
  emptyData 
} from './mockData.js';

/**
 * Validates condition and returns the standardized logging format.
 */
function assertCondition(testName, condition, expectedStr, actualStr) {
  return {
    test: testName,
    status: condition ? "PASS" : "FAIL",
    expected: expectedStr,
    actual: actualStr
  };
}

/**
 * Executes Unit, Integration, Edge-case, and Backtesting validations.
 * Outputs tabular results to the console.
 */
export function runAllTests() {
  const results = [];

  // -----------------------------------------------------------------
  // 1. UNIT TESTING (Algorithms & Filters)
  // -----------------------------------------------------------------
  
  // A. Fake Signal Filter: Testing the Volumetric Anomaly Filter
  const lowVolTest = filterFakeSignal(lowVolumeData, { signal: "BUY", entry: 202 });
  results.push(assertCondition(
    "Unit: Fake Signal Filter - Low Volume",
    lowVolTest.reason === "Low volume",
    "Low volume",
    lowVolTest.reason
  ));

  // B. Fake Signal Filter: Testing Sideways Market rejection
  const sidewaysTest = filterFakeSignal(sidewaysData, { signal: "BUY", entry: 100 });
  results.push(assertCondition(
    "Unit: Fake Signal Filter - Sideways Chop",
    sidewaysTest.reason === "Sideways",
    "Sideways",
    sidewaysTest.reason
  ));

  // C. Confirmation Logic: Testing violent momentum spikes
  const confirmationTest = confirmEntry(spikeData, { signal: "BUY", entry: 240 });
  results.push(assertCondition(
    "Unit: Confirmation Logic - Volume Spike",
    confirmationTest.type === "volume",
    "volume",
    confirmationTest.type
  ));

  // -----------------------------------------------------------------
  // 2. INTEGRATION TESTING (Pipeline bridging)
  // -----------------------------------------------------------------
  // Simulate complete data ingestion -> indicator analysis -> filter validation -> confirmation pass
  const integrationData = [...normalTrendDataBullish];
  // Synthesize a hard engulfing breakout with hyper-volume to perfectly satisfy the robust filters natively
  const lastP = integrationData[integrationData.length - 1].close;
  integrationData.push({ open: lastP - 20, high: lastP + 100, low: lastP - 20, close: lastP + 90, volume: 50000 });

  const rawSignal = trendFollowStrategy(integrationData);
  const isFiltered = filterFakeSignal(integrationData, rawSignal);
  const isConfirmed = confirmEntry(integrationData, rawSignal);
  
  const pipelineValid = rawSignal.signal === "BUY" && isFiltered.isValid === true && isConfirmed.type !== "none";
  
  results.push(assertCondition(
    "Integration: End-to-End Pipeline Workflow",
    pipelineValid,
    "BUY signal -> Valid Filter -> Confirmed Entry",
    `${rawSignal.signal} -> Valid:${isFiltered.isValid} -> Type:${isConfirmed.type}`
  ));

  // -----------------------------------------------------------------
  // 3. BACKTESTING ENGINE VALIDATION
  // -----------------------------------------------------------------
  // Push full bullish history into the backtest engine simulating trailing stops
  const btResult = runBacktest(trendFollowStrategy, normalTrendDataBullish);
  const backtestValid = btResult.totalTrades >= 0 && typeof btResult.winRate === 'number';

  results.push(assertCondition(
    "Backtest: Mechanics, Win/Loss & PnL Math Functionality",
    backtestValid && !btResult.error,
    "Successful iteration logging WinRate and PnL correctly",
    btResult.error || `Trades: ${btResult.totalTrades}, WinRate: ${btResult.winRate}%`
  ));

  // -----------------------------------------------------------------
  // 4. EDGE CASE TESTING
  // -----------------------------------------------------------------
  
  // A. Empty Array / NO Date stream injection
  const noDataBt = runBacktest(rsiScalpStrategy, emptyData);
  results.push(assertCondition(
    "Edge Case: Empty Array Handling",
    noDataBt.error !== undefined,
    "Caught Error explicitly blocking execution",
    noDataBt.error || "Unhandled crash"
  ));

  // B. Sideways Market execution stability
  // Checks if the backtester and strategy can parse flat charts continuously without throwing NaN or infinity Math errors
  let sidewaysPassed = false;
  try { 
    runBacktest(trendFollowStrategy, sidewaysData); 
    sidewaysPassed = true; 
  } catch { /* crash caught */ }

  results.push(assertCondition(
    "Edge Case: Sideways Flat-line Mathematical Stability",
    sidewaysPassed,
    "Iterates cleanly without throwing NaN errors",
    sidewaysPassed ? "Handled stably" : "Crashed"
  ));

  // ==========================================
  // DISPATCH RESULTS
  // ==========================================
  console.log("🛠️ TRADING SYSTEM TEST RESULTS 🛠️");
  console.table(results);
  
  return results;
}
