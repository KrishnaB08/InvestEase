import os
from ai_engine import get_ai_advice

def test_ai():
    print("Testing AI Advisor...")
    try:
        response = get_ai_advice(
            symbol="RELIANCE.NS",
            name="Reliance Industries",
            price=2900.0,
            change=1.5,
            trend="Uptrend",
            risk="Moderate",
            currency="INR"
        )
        print("Response received:")
        import json
        print(json.dumps(response, indent=2))
        
        if "Live AI is temporarily unavailable" in response.get("explanation", ""):
            print("\nWARNING: Falling back to structured response. AI might be broken or key missing.")
        else:
            print("\nSUCCESS: AI Advisor is working!")
            
    except Exception as e:
        print(f"\nCRITICAL ERROR: {str(e)}")

if __name__ == "__main__":
    test_ai()
