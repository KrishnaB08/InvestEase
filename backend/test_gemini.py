import sys
import os

# Add the current directory to path if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_engine import get_ai_advice
import json

def test_gemini_integration():
    print("Testing Gemini AI Integration...")
    
    test_data = {
        "symbol": "RELIANCE",
        "name": "Reliance Industries Limited",
        "price": 2850.50,
        "change": 1.25,
        "trend": "Uptrend",
        "risk": "Low",
        "currency": "INR"
    }
    
    try:
        advice = get_ai_advice(**test_data)
        
        print("\n=== GEMINI RESPONSE ===")
        print(json.dumps(advice, indent=2))
        
        if advice.get("is_fallback"):
            print("\nWARNING: Falling back to structured response. Gemini might be broken or key missing.")
            print(f"Reason: {advice.get('explanation')}")
        else:
            print("\nSUCCESS: Successfully received live analysis from Gemini!")
            
    except Exception as e:
        print(f"\nERROR: Test execution failed: {e}")

if __name__ == "__main__":
    test_gemini_integration()
