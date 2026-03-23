import React from 'react'

const MarketOverview = () => {
  return (
   <div className="bg-black border border-white/5 p-4 rounded-xl shadow-lg">
      <h2 className="text-lg mb-2 text-white">Market</h2>

      <p className="text-slate-400">BTC/USDT</p>
      <p className="text-emerald-400 text-xl font-bold">$45,200</p>
      <p className="text-emerald-400 text-sm font-medium">+2.5%</p>
    </div>
  )
}

export default MarketOverview