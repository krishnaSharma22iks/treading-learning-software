import React from 'react'

const MarketOverview = () => {
  return (
   <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h2 className="text-lg mb-2">Market</h2>

      <p>BTC/USDT</p>
      <p className="text-green-400 text-xl">$45,200</p>
      <p className="text-green-400 text-sm">+2.5%</p>
    </div>
  )
}

export default MarketOverview