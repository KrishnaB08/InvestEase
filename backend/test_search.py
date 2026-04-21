import requests

def test_search():
    print("Testing Yahoo Finance Search Proxy...")
    try:
        res = requests.get("http://localhost:8000/searchStock?q=RELIANCE")
        print(f"Status Code: {res.status_code}")
        data = res.json()
        print(f"Found {len(data.get('quotes', []))} quotes")
        if data.get('quotes'):
            print("First quote symbol:", data['quotes'][0].get('symbol'))
            print("SUCCESS: Search is working!")
        else:
            print("WARNING: No quotes found. Yahoo might be throttling or the query is too specific.")
    except Exception as e:
        print(f"ERROR: Search failed: {e}")

if __name__ == "__main__":
    test_search()
