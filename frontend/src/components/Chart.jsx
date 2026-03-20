import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { Maximize2, Minimize2, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────
   Minimize button rendered via Portal → document.body
   This bypasses the TradingView iframe stacking context
───────────────────────────────────────────────────── */
function MinimizePortal({ onClose }) {
  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.button
        key="minimize-portal-btn"
        initial={{ opacity: 0, scale: 0.6, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: -10 }}
        transition={{ duration: 0.25, ease: "backOut" }}
        onClick={onClose}
        title="Minimize chart  (ESC)"
        style={{
          position:     "fixed",
          top:          16,
          right:        16,
          zIndex:       2147483647,   /* max possible z-index */
          display:      "flex",
          alignItems:   "center",
          gap:          8,
          background:   "linear-gradient(135deg, #f43f5e, #f97316)",
          color:        "#fff",
          fontWeight:   900,
          fontSize:     13,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          padding:      "10px 20px",
          borderRadius: 14,
          border:       "2px solid rgba(251,113,133,0.6)",
          boxShadow:    "0 0 0 3px rgba(244,63,94,0.25), 0 8px 32px rgba(244,63,94,0.45)",
          cursor:       "pointer",
          userSelect:   "none",
          pointerEvents: "all",
          transition:   "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = "scale(1.07)";
          e.currentTarget.style.boxShadow = "0 0 0 4px rgba(244,63,94,0.35), 0 12px 40px rgba(244,63,94,0.55)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(244,63,94,0.25), 0 8px 32px rgba(244,63,94,0.45)";
        }}
      >
        <Minimize2 style={{ width: 17, height: 17 }} />
        Minimize
      </motion.button>
    </AnimatePresence>,
    document.body
  );
}

/* ─────────────────────────────────────────────────── */

function Chart({ pair }) {
  const chartRef         = useRef(null);
  const expandedChartRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  /* Mount TradingView widget */
  const mountWidget = (targetEl) => {
    if (!targetEl) return;
    targetEl.innerHTML = "";
    const script = document.createElement("script");
    script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:            true,
      symbol:              `BINANCE:${pair}`,
      interval:            "5",
      timezone:            "Etc/UTC",
      theme:               "dark",
      style:               "1",
      locale:              "en",
      backgroundColor:     "rgba(2, 6, 23, 1)",
      gridColor:           "rgba(255, 255, 255, 0.03)",
      enable_publishing:   false,
      allow_symbol_change: true,
      container_id:        targetEl.id,
      hide_side_toolbar:   false,
      withdateranges:      true,
      details:             true,
      hotlist:             true,
      calendar:            true,
      show_popup_button:   true,
    });
    targetEl.appendChild(script);
  };

  useEffect(() => { if (!isExpanded) mountWidget(chartRef.current); }, [pair, isExpanded]);
  useEffect(() => { if (isExpanded)  mountWidget(expandedChartRef.current); }, [isExpanded, pair]);

  /* ESC key + scroll lock */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsExpanded(false); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = isExpanded ? "hidden" : "";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [isExpanded]);

  return (
    <>
      {/* ══════════════ NORMAL CARD ══════════════ */}
      <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-4 sm:p-6 shadow-2xl relative w-full h-full flex flex-col transition-all duration-500 hover:border-blue-500/20 overflow-hidden">

        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1 truncate">Live Market Stream</span>
              <span className="text-xs font-bold text-white uppercase truncate">{pair} · 5M INTERVAL</span>
            </div>
          </div>

          {/* EXPAND */}
          <button
            onClick={() => setIsExpanded(true)}
            title="Expand to fullscreen"
            className="flex-shrink-0 flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/25 border border-blue-500/30 hover:border-blue-400/60 text-blue-300 hover:text-blue-200 px-3 py-2 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-xs font-bold uppercase tracking-wider"
          >
            <Maximize2 className="w-4 h-4" />
            <span>Expand</span>
          </button>
        </div>

        {/* Chart canvas */}
        <div className="relative flex-grow w-full rounded-2xl overflow-hidden ring-1 ring-white/5 shadow-2xl bg-[#020617]">
          <div id="tradingview_institutional_chart" ref={chartRef} className="absolute inset-0 w-full h-full" />
        </div>
      </div>

      {/* ══════════════ FULLSCREEN OVERLAY ══════════════ */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              key="fs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[900]"
              onClick={() => setIsExpanded(false)}
            />

            {/* Chart panel */}
            <motion.div
              key="fs-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[950]"
              style={{ padding: "clamp(6px, 1.5vw, 14px)" }}
            >
              <div className="relative w-full h-full bg-[#020617] rounded-2xl overflow-hidden ring-2 ring-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.20)]">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400/70 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent z-10 pointer-events-none" />
                <div id="tradingview_fullscreen_chart" ref={expandedChartRef} className="absolute inset-0 w-full h-full" />
              </div>
            </motion.div>

            {/* ► MINIMIZE button via Portal (above iframe) */}
            <MinimizePortal onClose={() => setIsExpanded(false)} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Chart;