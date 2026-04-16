import axios from 'axios';

// Centralized API configuration
const API_BASE = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout for AI calls
  headers: {
    'Content-Type': 'application/json'
  }
});

// ========================
// STOCK DATA
// ========================

export const fetchStocks = () => 
  api.get('/stocks').then(res => res.data.stocks);

export const fetchStockStats = (symbol) => 
  api.get(`/stock/${symbol}/stats`).then(res => res.data);

export const fetchChartData = (symbol) => 
  api.get(`/stock/${symbol}/chart`).then(res => res.data.data);

export const fetchRisk = (symbol) => 
  api.get(`/risk/${symbol}`).then(res => res.data);

// ========================
// AI ADVISOR
// ========================

export const searchStock = (query) => 
  api.get(`/searchStock?q=${query}`).then(res => res.data.quotes);

export const getStockDetails = (symbol) => 
  api.get(`/getStockData?symbol=${symbol}`).then(res => res.data);

export const fetchAIAdviceDynamic = (payload) => 
  api.post(`/ai-advice`, payload).then(res => res.data);

export const fetchFxConversion = (amount, fromCurrency, toCurrency) =>
  api.get('/fx/convert', {
    params: { amount, from_currency: fromCurrency, to_currency: toCurrency }
  }).then(res => res.data);

export const fetchFxTrend = (base = 'USD', quote = 'INR', days = 7) =>
  api.get('/fx/trend', {
    params: { base, quote, days }
  }).then(res => res.data);

// ========================
// NEWS
// ========================

export const fetchNews = (symbol) => 
  api.get(`/news/${symbol}`).then(res => res.data);

// ========================
// SIMULATION
// ========================

export const runSimulation = (symbol, investment = 10000, days = 90) => 
  api.post('/simulate', { symbol, investment, days }).then(res => res.data);

// ========================
// FEAR SCORE
// ========================

export const postFearScore = (data) => 
  api.post('/fear-score', data).then(res => res.data);

export const fetchFearHistory = () => 
  api.get('/fear-score/history').then(res => res.data.history);

// ========================
// TRADE HISTORY
// ========================

export const postTrade = (trade) => 
  api.post('/trades', trade).then(res => res.data);

export const fetchTradeHistory = () => 
  api.get('/trades/history').then(res => res.data.trades);

export const fetchPortfolioSummary = () => 
  api.get('/portfolio/summary').then(res => res.data);

export { API_BASE };
export default api;
