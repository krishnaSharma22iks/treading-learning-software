import React from 'react';

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 truncate max-w-[120px] sm:max-w-none">IKS Trades X</span>
          </div>

          <div className="hidden lg:flex space-x-8">
            <a href="#" className="text-gray-100 text-sm font-semibold transition-colors relative after:absolute after:-bottom-5 after:left-0 after:w-full after:h-0.5 after:bg-white after:rounded-t-md">Terminal</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">Markets</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-sm font-medium transition-colors">Portfolio</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-[#0B0E14]"></div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-950 flex items-center justify-center text-sm text-white font-bold shadow-lg shadow-white/5 cursor-pointer hover:scale-105 transition-transform duration-300 ring-2 ring-white/10 overflow-hidden">
              UX
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;