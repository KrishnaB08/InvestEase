import yfinance as yf

def test_yf():
    print("Testing yfinance...")
    try:
        ticker = yf.Ticker("RELIANCE.NS")
        info = ticker.info
        print(f"Name: {info.get('shortName')}")
        print(f"Price: {info.get('currentPrice')}")
        print("SUCCESS: yfinance is working!")
    except Exception as e:
        print(f"ERROR: yfinance failed: {e}")

if __name__ == "__main__":
    test_yf()
