import yfinance as yf
import pandas as pd
import numpy as np

STOCK_LIST = {
    # Tech & IT
    "RELIANCE":  "RELIANCE.NS",
    "TCS":       "TCS.NS",
    "INFOSYS":   "INFY.NS",
    "WIPRO":     "WIPRO.NS",
    "HCL TECH":  "HCLTECH.NS",
    "LTIMINDTREE": "LTIM.NS",
    
    # Banking & Finance
    "HDFC BANK": "HDFCBANK.NS",
    "ICICI BANK": "ICICIBANK.NS",
    "SBI":       "SBIN.NS",
    "AXIS BANK": "AXISBANK.NS",
    "BAJAJ FIN": "BAJFINANCE.NS",
    
    # Auto & Manufacturing
    "TATA MOTORS": "TATAMOTORS.NS",
    "MAHINDRA":  "M&M.NS",
    "MARUTI":    "MARUTI.NS",
    
    # Energy & Adani
    "ADANI ENT": "ADANIENT.NS",
    "ADANI GREEN": "ADANIGREEN.NS",
    "NTPC":      "NTPC.NS",
    "TATA POWER": "TATAPOWER.NS",
    
    # Consumer & Others
    "ITC":       "ITC.NS",
    "HUL":       "HINDUNILVR.NS",
    "ZOMATO":    "ZOMATO.NS",
    "JIO FIN":   "JIOFIN.NS",
    
    # Commodities (Using popular Indian ETFs or Global Futures)
    "GOLD":      "GOLDBEES.NS",
    "SILVER":    "SILVER.NS",
    "COPPER":    "HG=F",
    "PLATINUM":  "PL=F",
    "CRUDE OIL": "CL=F"
}

def get_stock_history(symbol: str, period: str = "2y"):
    """Fetch historical price data from Yahoo Finance."""
    if symbol in STOCK_LIST:
        symbol = STOCK_LIST[symbol]
    elif ".NS" not in symbol and ".BO" not in symbol:
        symbol = symbol.upper() + ".NS"

    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period)

    if df.empty:
        raise ValueError(f"No data found for {symbol}")

    df["daily_return"] = df["Close"].pct_change()
    return df

def get_current_price(symbol: str) -> float:
    """Get the latest price of a stock."""
    if symbol in STOCK_LIST:
        symbol = STOCK_LIST[symbol]
    elif ".NS" not in symbol:
        symbol = symbol.upper() + ".NS"

    ticker = yf.Ticker(symbol)
    info = ticker.info
    price = info.get("currentPrice") or \
            info.get("regularMarketPrice") or \
            info.get("previousClose", 0)
    return float(price)

def get_stock_stats(symbol: str) -> dict:
    """Get summarized statistics for a stock."""
    df = get_stock_history(symbol)
    current_price = get_current_price(symbol)
    daily_returns = df["daily_return"].dropna()

    return {
        "symbol":          symbol,
        "name":            symbol.replace(".NS", ""),
        "current_price":   round(current_price, 2),
        "volatility_pct":  round(float(daily_returns.std()) * 100, 3),
        "avg_daily_return":round(float(daily_returns.mean()) * 100, 4),
        "week52_high":     round(float(df["High"].max()), 2),
        "week52_low":      round(float(df["Low"].min()), 2),
        "data_days":       len(df)
    }

def get_frontend_chart_data(symbol: str, period: str = "6mo") -> list:
    """Fetch history and map precisely to Lightweight Charts {time, open, high, low, close}."""
    df = get_stock_history(symbol, period)
    chart_data = []
    
    # yfinance uses datetime index
    for index, row in df.iterrows():
        # Ensure time is integer unix timestamp in SECONDS
        unix_time = int(index.timestamp())
        chart_data.append({
            "time": unix_time,
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2)
        })
        
    return chart_data
