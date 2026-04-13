import numpy as np
import pandas as pd
from data_fetcher import get_stock_history

def calculate_loss_probability(symbol: str):
    """
    Analyzes historical volatility and trends to predict 
    the probability of losing money in a 30-day window.
    """
    df = get_stock_history(symbol, period="1y")
    returns = df["daily_return"].dropna()
    
    # annualized volatility
    volatility = returns.std() * np.sqrt(252)
    
    # Calculate RSI (Relative Strength Index) for trend
    delta = df["Close"].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    current_rsi = rsi.iloc[-1]
    
    # Heuristic Risk Score (0-100)
    # High volatility = high risk
    # Low RSI (< 30) = oversold (potential bounce, but risky trend)
    # High RSI (> 70) = overbought (potential drop)
    
    risk_score = (volatility * 100) * 0.7  # Volatility is usually 0.15-0.40
    
    if current_rsi > 70:
        risk_score += 20  # Overbought penalty
    elif current_rsi < 30:
        risk_score += 10  # Downward momentum penalty
        
    # Cap at 100, Min at 5
    risk_score = max(5, min(95, risk_score))
    
    return {
        "symbol": symbol,
        "loss_probability": round(float(risk_score), 1),
        "volatility_annual": round(float(volatility), 3),
        "current_rsi": round(float(current_rsi), 1),
        "risk_level": "High" if risk_score > 60 else "Medium" if risk_score > 30 else "Low"
    }
