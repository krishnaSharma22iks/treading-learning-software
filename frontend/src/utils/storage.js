export const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage (Key: ${key}):`, error);
  }
};

export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading from localStorage (Key: ${key}):`, error);
    return null;
  }
};

// --------------------------------------------------------
// 🔥 Strict Trade History Storage Utility
// --------------------------------------------------------

export const getTrades = () => {
  try {
    const trades = getData("trade_history");
    return Array.isArray(trades) ? trades : [];
  } catch (error) {
    console.error("Error parsing trade history array:", error);
    return [];
  }
};

export const saveTrade = (trade) => {
  try {
    const trades = getTrades();
    
    // Unshift adds the new trade immediately to the front (latest first)
    trades.unshift({
      ...trade,
      id: trade.id || Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: trade.date || new Date().getTime() // Unified timestamp assignment fallback
    });
    
    saveData("trade_history", trades);
  } catch (error) {
    console.error("Error securely caching new trade:", error);
  }
};

export const clearTrades = () => {
  try {
    localStorage.removeItem("trade_history");
  } catch (error) {
    console.error("Error strictly wiping trade cache:", error);
  }
};