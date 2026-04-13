// Simple string hash for deterministic randomness
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

// Seeded random generator
const seededRandom = (seed) => {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export const generateAIAnalysis = (ticker) => {
  const seed = hashString(ticker.toUpperCase());
  const rand = (min, max, offset=0) => min + seededRandom(seed + offset) * (max - min);
  
  const price = rand(100, 4000, 1);
  const trendOutcome = seededRandom(seed + 2);
  const trend = trendOutcome > 0.6 ? 'Uptrend' : trendOutcome > 0.3 ? 'Sideways' : 'Downtrend';
  
  const volOutcome = seededRandom(seed + 3);
  const volatility = volOutcome > 0.7 ? 'High' : volOutcome > 0.3 ? 'Medium' : 'Low';
  
  const momOutcome = seededRandom(seed + 4);
  const momentum = momOutcome > 0.5 ? 'Strong' : 'Weak';
  
  const decisionMap = {
    'Uptrend': { decision: 'Invest', checkTrend: true, checkEntry: true },
    'Sideways': { decision: 'Wait', checkTrend: false, checkEntry: false },
    'Downtrend': { decision: 'Avoid', checkTrend: false, checkEntry: false }
  };
  
  const dScore = decisionMap[trend];
  // Slightly adjust decision based on Volatility
  let finalDecision = dScore.decision;
  if (volatility === 'High' && trend !== 'Downtrend') finalDecision = 'Wait';
  
  const confidence = Math.floor(rand(65, 92, 5));
  
  // OHLC Generation
  const generateOHLC = () => {
    let currentPrice = price * (trend === 'Uptrend' ? 0.8 : trend === 'Downtrend' ? 1.2 : 0.95);
    const history = [];
    const volatilityMultiplier = volatility === 'High' ? 0.04 : volatility === 'Medium' ? 0.02 : 0.01;
    
    for (let i = 0; i < 60; i++) {
      const open = currentPrice;
      let dayTrend = trend === 'Uptrend' ? 0.005 : trend === 'Downtrend' ? -0.005 : 0;
      const close = open * (1 + dayTrend + (Math.random() - 0.5) * volatilityMultiplier);
      const high = Math.max(open, close) * (1 + Math.random() * volatilityMultiplier * 0.5);
      const low = Math.min(open, close) * (1 - Math.random() * volatilityMultiplier * 0.5);
      
      history.push({ 
        time: Math.floor(Date.now() / 1000) - (60 - i) * 86400, // Daily candles back 60 days
        open, high, low, close 
      });
      currentPrice = close;
    }
    // Set the latest close to our exact 'price'
    history[history.length - 1].close = price;
    return history;
  };
  
  const ohlcData = generateOHLC();
  const entryZone = price * 0.98;
  const target = price * 1.12;
  const stopLoss = price * 0.92;

  return {
    ticker: ticker.toUpperCase(),
    name: `${ticker.toUpperCase()} INC.`,
    sector: ['Technology', 'Energy', 'Finance', 'FMCG'][Math.floor(rand(0, 3, 6))],
    marketCap: `₹${(rand(10000, 900000, 7) / 1000).toFixed(1)}k Cr`,
    price: parseFloat(price.toFixed(2)),
    
    technical: {
      trend,
      volatility,
      momentum
    },
    
    decisionInfo: {
      action: finalDecision, // 'Invest', 'Wait', 'Avoid'
      confidence,
      riskLevel: volatility
    },
    
    explanation: finalDecision === 'Invest' 
      ? `The stock is demonstrating a clear ${trend.toLowerCase()} with ${momentum.toLowerCase()} momentum. Despite current ${volatility.toLowerCase()} volatility, technical indicators suggest further upside before major resistance.`
      : finalDecision === 'Wait'
      ? `While not overtly negative, the stock is currently trading ${trend.toLowerCase()}. Given the ${volatility.toLowerCase()} risk profile, it is safer to wait for a clearer breakout or better entry point.`
      : `The prevailing ${trend.toLowerCase()} combined with ${momentum.toLowerCase()} momentum flags a structural weakness. Capital allocation is not recommended until a reversal pattern forms.`,
      
    debate: {
      bull: [
        "Consistent higher lows established over the last quarter.",
        "Sector rotation indicates incoming institutional volume.",
        "Trading near a strong historical support level."
      ],
      bear: [
        "Macro headwinds could suppress discretionary spending.",
        "Technical resistance at the 200-day moving average.",
        "Volume is fading on recent upward micro-trends."
      ]
    },
    
    news: [
      {
        headline: volatility === 'High' ? "Unexpected Industry Policy Change" : "Quarterly Earnings Align with Estimates",
        impactChain: volatility === 'High' ? "Policy Impact -> Profit Margins Shrink -> Volatile Pricing" : "Stable Growth -> Investor Confidence -> Steady Accumulation",
        effect: volatility === 'High' ? "Negative Bias" : "Positive Bias",
        impactLevel: volatility === 'High' ? "High" : "Low",
        sectorAffected: "Yes"
      }
    ],
    
    scenarios: {
      worst: -Math.floor(rand(12, 25, 8)),
      expected: Math.floor(rand(5, 12, 9)),
      best: Math.floor(rand(15, 30, 10))
    },
    
    suggestion: {
      amountRange: `₹${Math.floor(rand(10, 50, 11))}k - ₹${Math.floor(rand(50, 150, 12))}k`,
      percentage: "5-10%"
    },
    
    timeframe: "Swing/Medium-Term",
    
    framework: {
      trend: dScore.checkTrend,
      risk: volatility !== 'High',
      news: true,
      entry: dScore.checkEntry,
      exit: true,
      summary: finalDecision === 'Invest' ? "Safe to allocate capital." : "Wait for better opportunity."
    },
    
    chart: {
      data: ohlcData,
      entryPoints: { entryZone, target, stopLoss }
    }
  };
};
