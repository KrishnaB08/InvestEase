from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

from data_fetcher import get_stock_stats, STOCK_LIST
from monte_carlo import run_simulation, simulate_crash
from ml_model import calculate_loss_probability
from ai_engine import get_ai_advice
from news_fetcher import get_stock_news, get_news_headlines_for_ai
from database import save_fear_score, get_fear_scores, save_trade, get_trades, get_portfolio_summary
from fx_service import convert_currency, get_trend

load_dotenv()

app = FastAPI(title="InvestEase API", version="2.0")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationRequest(BaseModel):
    symbol: str
    investment: float = 10000
    days: int = 90

class TradeRequest(BaseModel):
    symbol: str
    type: str  # "BUY" or "SELL"
    price: float
    qty: int
    total: float
    profit: Optional[float] = None

@app.get("/")
def home():
    return {"message": "InvestEase API is live!", "status": "nominal", "version": "2.0"}

@app.get("/stocks")
def list_stocks():
    return {"stocks": list(STOCK_LIST.keys())}

@app.get("/stock/{symbol}/stats")
def stock_stats(symbol: str):
    try:
        return get_stock_stats(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/simulate")
def start_simulation(req: SimulationRequest):
    try:
        return run_simulation(req.symbol, req.investment, req.days)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/risk/{symbol}")
def get_risk(symbol: str):
    try:
        return calculate_loss_probability(symbol)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/stock/{symbol}/chart")
def get_chart_data(symbol: str):
    try:
        from data_fetcher import get_frontend_chart_data
        return {"data": get_frontend_chart_data(symbol)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========================
# NEWS API
# ========================

@app.get("/news/{symbol}")
def get_news(symbol: str):
    """Fetch recent news for a stock from NewsAPI."""
    try:
        news = get_stock_news(symbol)
        return {"symbol": symbol, "news": news, "count": len(news)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========================
# AI ADVICE (now with real news)
# ========================

@app.get("/ai-advice/{symbol}")
def ai_advice(symbol: str):
    try:
        stats = get_stock_stats(symbol)
        # Fetch real news headlines for Claude's context
        news_headlines = get_news_headlines_for_ai(symbol)
        return get_ai_advice(
            symbol=symbol,
            price=stats["current_price"],
            volatility=stats["volatility_pct"],
            news_headlines=news_headlines
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========================
# FX / CURRENCY API
# ========================

@app.get("/fx/convert")
def fx_convert(amount: float, from_currency: str = "USD", to_currency: str = "INR"):
    """Live forex conversion for frontend currency lab."""
    try:
        return convert_currency(amount=amount, from_currency=from_currency, to_currency=to_currency)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/fx/trend")
def fx_trend(base: str = "USD", quote: str = "INR", days: int = 7):
    """Fetch short-term forex trend series for charting."""
    try:
        return get_trend(base=base, quote=quote, days=days)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ========================
# FEAR SCORE (MongoDB-backed)
# ========================

@app.post("/fear-score")
def log_fear_score(data: dict):
    """Save a fear score survey response. Persisted to MongoDB if configured."""
    result = save_fear_score(data)
    return result

@app.get("/fear-score/history")
def get_fear_history():
    """Retrieve fear score history from MongoDB."""
    scores = get_fear_scores()
    return {"history": scores}

# ========================
# TRADE HISTORY (MongoDB-backed)
# ========================

@app.post("/trades")
def log_trade(trade: TradeRequest):
    """Save a trade to persistent storage."""
    trade_data = trade.dict()
    result = save_trade(trade_data)
    return result

@app.get("/trades/history")
def trade_history():
    """Retrieve trade history."""
    trades = get_trades()
    return {"trades": trades}

@app.get("/portfolio/summary")
def portfolio_summary():
    """Get aggregated portfolio from trade history."""
    return get_portfolio_summary()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
