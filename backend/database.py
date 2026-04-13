import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection (lazy-loaded)
_db = None
_client = None


def get_db():
    """
    Get MongoDB database connection.
    Returns None if MONGODB_URI is not configured.
    """
    global _db, _client

    if _db is not None:
        return _db

    uri = os.getenv("MONGODB_URI")
    if not uri or uri == "your_mongodb_connection_string_here":
        print("[MongoDB] No URI configured. Using in-memory fallback.")
        return None

    try:
        from pymongo import MongoClient
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        # Test connection
        _client.admin.command('ping')
        _db = _client["investease"]
        print("[MongoDB] Connected successfully to InvestEase database!")
        return _db
    except Exception as e:
        print(f"[MongoDB] Connection failed: {e}")
        return None


# ========================
# Fear Score Operations
# ========================

# In-memory fallback when MongoDB is unavailable
_memory_fear_scores = []
_memory_trades = []


def save_fear_score(data: dict) -> dict:
    """Save a fear score entry. Uses MongoDB if available, else in-memory."""
    data["timestamp"] = data.get("timestamp", datetime.utcnow().isoformat())

    db = get_db()
    if db is not None:
        try:
            result = db.fear_scores.insert_one(data)
            count = db.fear_scores.count_documents({})
            return {"status": "saved_to_db", "id": str(result.inserted_id), "count": count}
        except Exception as e:
            print(f"[MongoDB] Save fear score error: {e}")

    # Fallback to memory
    _memory_fear_scores.append(data)
    return {"status": "saved_to_memory", "count": len(_memory_fear_scores)}


def get_fear_scores() -> list:
    """Retrieve fear score history. Uses MongoDB if available, else in-memory."""
    db = get_db()
    if db is not None:
        try:
            scores = list(db.fear_scores.find({}, {"_id": 0}).sort("timestamp", -1).limit(50))
            return scores
        except Exception as e:
            print(f"[MongoDB] Fetch fear scores error: {e}")

    return _memory_fear_scores


# ========================
# Trade History Operations
# ========================

def save_trade(data: dict) -> dict:
    """Save a trade entry to MongoDB."""
    data["timestamp"] = data.get("timestamp", datetime.utcnow().isoformat())

    db = get_db()
    if db is not None:
        try:
            result = db.trades.insert_one(data)
            count = db.trades.count_documents({})
            return {"status": "saved_to_db", "id": str(result.inserted_id), "count": count}
        except Exception as e:
            print(f"[MongoDB] Save trade error: {e}")

    # Fallback to memory
    _memory_trades.append(data)
    return {"status": "saved_to_memory", "count": len(_memory_trades)}


def get_trades(limit: int = 50) -> list:
    """Retrieve trade history."""
    db = get_db()
    if db is not None:
        try:
            trades = list(db.trades.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit))
            return trades
        except Exception as e:
            print(f"[MongoDB] Fetch trades error: {e}")

    return _memory_trades[-limit:]


def get_portfolio_summary() -> dict:
    """Get aggregated portfolio from trade history."""
    trades = get_trades(limit=500)
    portfolio = {}
    total_invested = 0
    total_sold = 0

    for t in trades:
        symbol = t.get("symbol", "")
        qty = t.get("qty", 0)
        price = t.get("price", 0)

        if t.get("type") == "BUY":
            portfolio[symbol] = portfolio.get(symbol, 0) + qty
            total_invested += price * qty
        elif t.get("type") == "SELL":
            portfolio[symbol] = portfolio.get(symbol, 0) - qty
            total_sold += price * qty

    # Remove zero-quantity holdings
    portfolio = {k: v for k, v in portfolio.items() if v > 0}

    return {
        "holdings": portfolio,
        "total_invested": round(total_invested, 2),
        "total_sold": round(total_sold, 2),
        "trade_count": len(trades)
    }
