/**
 * Generates various market conditions for testing strategies and filters.
 */

export const emptyData = [];

// Generates a smooth upward or downward trend
export const generateTrendData = (length, startPrice, trend) => {
  return Array.from({ length }, (_, i) => ({
    timestamp: new Date(Date.now() + i * 60000).toISOString(),
    open: startPrice + (i * trend),
    high: startPrice + (i * trend) + 10,
    low: startPrice + (i * trend) - 10,
    close: Math.max(1, startPrice + (i * trend) + (trend > 0 ? 5 : -5)), 
    volume: 1500 + Math.random() * 500
  }));
};

// Generates purely flat/choppy sideways data with identical closes
export const sidewaysData = Array.from({ length: 150 }, (_, i) => ({
  timestamp: new Date(Date.now() + i * 60000).toISOString(),
  open: 100,
  high: 101,
  low: 99,
  close: 100 + (Math.random() * 0.1 - 0.05), // Moves less than 0.1%
  volume: 1000
}));

// Generates healthy trend but specifically starves the volume metric near the end
export const lowVolumeData = [
  ...generateTrendData(100, 100, 1).map(d => ({ ...d, volume: 5000 })),
  ...Array.from({ length: 15 }, () => ({ open: 200, high: 205, low: 195, close: 202, volume: 10 })) // < 10 volume anomaly
];

// Generates stable data interrupted by a violent 2x price spike to trigger SL and Engulfing checks
export const spikeData = [
  ...Array.from({ length: 99 }, () => ({ open: 100, high: 102, low: 98, close: 100, volume: 1000 })),
  { open: 100, high: 250, low: 95, close: 240, volume: 25000 } // Violent expansion
];

export const normalTrendDataBullish = generateTrendData(150, 100, 2);
export const normalTrendDataBearish = generateTrendData(150, 500, -2);
