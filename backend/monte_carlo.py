import numpy as np
import pandas as pd
from data_fetcher import get_stock_history

def run_simulation(symbol: str, initial_investment: float = 10000, days: int = 90, iterations: int = 1000):
    """
    Run a Monte Carlo simulation for a stock.
    Returns:
        - paths: All 1,000 paths for visualization
        - stats: Worst, Average, and Best case outcomes
    """
    df = get_stock_history(symbol)
    daily_returns = df["daily_return"].dropna()
    
    mu = daily_returns.mean()
    sigma = daily_returns.std()
    
    # Starting price from the latest data
    start_price = df["Close"].iloc[-1]
    
    # Generate random returns based on normal distribution
    # Shape: (days, iterations)
    random_returns = np.random.normal(mu, sigma, (days, iterations))
    
    # Calculate price paths
    # price_t = price_{t-1} * (1 + return_t)
    # We use cumprod to calculate the path
    price_paths = start_price * (1 + random_returns).cumprod(axis=0)
    
    # Prepend the start price to each path
    initial_prices = np.full((1, iterations), start_price)
    price_paths = np.vstack([initial_prices, price_paths])
    
    # Scale paths by initial investment ratio
    scale_factor = initial_investment / start_price
    portfolio_paths = price_paths * scale_factor
    
    # Final values for each iteration
    final_values = portfolio_paths[-1, :]
    
    # Sort final values to find percentiles
    sorted_final = np.sort(final_values)
    
    # Worst (5th percentile), Average (50th), Best (95th)
    worst_case = sorted_final[int(0.05 * iterations)]
    avg_case = np.median(sorted_final)
    best_case = sorted_final[int(0.95 * iterations)]
    
    return {
        "symbol": symbol,
        "initial_investment": initial_investment,
        "days": days,
        "stats": {
            "worst": round(float(worst_case), 2),
            "average": round(float(avg_case), 2),
            "best": round(float(best_case), 2)
        },
        "paths": portfolio_paths.T.tolist()  # Sending all paths for the chart
    }

def simulate_crash(current_value: float, crash_pct: float = 0.18):
    """Simulate a sudden market crash."""
    return round(current_value * (1 - crash_pct), 2)
