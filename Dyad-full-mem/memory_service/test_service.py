#!/usr/bin/env python3
"""
Test script for Memory Service

Tests basic functionality:
- Store memory
- Search memory
- Get stats
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8002"

def test_health():
    print("\n=== Testing Health Check ===")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_store_memory():
    print("\n=== Testing Store Memory ===")
    
    data = {
        "session_id": "test-session-001",
        "app_id": "test-app-001",
        "messages": [
            {
                "role": "user",
                "content": "I created a new API endpoint /api/users/create",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "assistant",
                "content": "Great! The endpoint /api/users/create has been added.",
                "timestamp": datetime.now().isoformat()
            },
            {
                "role": "user",
                "content": "There's a bug in the authentication function validateToken()",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "metadata": {
            "test": True
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/memory/store", json=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_search_memory():
    print("\n=== Testing Search Memory ===")
    
    data = {
        "session_id": "test-session-001",
        "query": "What API endpoints did I create?",
        "limit": 5
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/memory/search", json=data)
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Found {len(result.get('data', {}).get('results', []))} results")
        print(f"Response: {json.dumps(result, indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_get_stats():
    print("\n=== Testing Get Stats ===")
    
    try:
        response = requests.get(f"{BASE_URL}/api/memory/stats/test-session-001")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("  MEMORY SERVICE TEST SUITE")
    print("="*60)
    
    tests = [
        ("Health Check", test_health),
        ("Store Memory", test_store_memory),
        ("Search Memory", test_search_memory),
        ("Get Stats", test_get_stats),
    ]
    
    results = []
    for name, test_func in tests:
        result = test_func()
        results.append((name, result))
    
    print("\n" + "="*60)
    print("  TEST RESULTS")
    print("="*60)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")
    
    if passed == total:
        print("\n✅ All tests passed!")
    else:
        print("\n❌ Some tests failed!")

if __name__ == "__main__":
    main()