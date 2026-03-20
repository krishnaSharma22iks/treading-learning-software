import { useState, useEffect } from "react";
import { saveData, getData } from "../utils/storage";

function Controls({ onPairChange }) {
  const [pair, setPair] = useState(() => getData("pair") || "BTCUSDT");

  useEffect(() => {
    const saved = getData("pair");
    if (saved) {
      onPairChange(saved);
    } else {
      onPairChange("BTCUSDT");
    }
  }, [onPairChange]);

  const handleChange = (e) => {
    const value = e.target.value;
    setPair(value);
    saveData("pair", value);
    onPairChange(value);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-300"></div>
      <div className="relative bg-[#131722] border border-white/5 p-1 rounded-xl flex items-center shadow-lg">
        <div className="flex items-center pl-3 pr-2 border-r border-white/10">
          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <select
          value={pair}
          onChange={handleChange}
          className="bg-transparent text-white font-extrabold text-sm tracking-wide px-3 py-2 outline-none cursor-pointer appearance-none"
        >
          <option className="bg-[#131722]" value="BTCUSDT">BTC / USDT</option>
          <option className="bg-[#131722]" value="ETHUSDT">ETH / USDT</option>
          <option className="bg-[#131722]" value="SOLUSDT">SOL / USDT</option>
          <option className="bg-[#131722]" value="BNBUSDT">BNB / USDT</option>
        </select>
        <div className="pr-3 pointer-events-none">
           <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}

export default Controls;