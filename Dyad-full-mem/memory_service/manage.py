#!/usr/bin/env python3
"""
Memory Service Management CLI

Commands:
- start: Start the memory service
- stop: Stop the memory service
- status: Check service status
- clear: Clear all memory data
- stats: Show statistics
"""

import sys
import os
import subprocess
import requests
import sqlite3
from pathlib import Path

BASE_URL = "http://localhost:8002"
DB_PATH = Path(__file__).parent / "data" / "memory.db"

def check_service():
    """Check if service is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        return response.status_code == 200
    except:
        return False

def start_service():
    """Start the memory service"""
    if check_service():
        print("✅ Service is already running")
        return
    
    print("🚀 Starting Memory Service...")
    subprocess.Popen(
        [sys.executable, "server.py"],
        cwd=Path(__file__).parent,
        creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == 'nt' else 0
    )
    
    import time
    for i in range(10):
        time.sleep(1)
        if check_service():
            print("✅ Service started successfully")
            return
    
    print("❌ Failed to start service")

def show_status():
    """Show service status"""
    if check_service():
        print("✅ Service is running")
        print(f"   URL: {BASE_URL}")
        print(f"   Health: {BASE_URL}/health")
    else:
        print("❌ Service is not running")

def clear_data():
    """Clear all memory data"""
    if not DB_PATH.exists():
        print("ℹ️  No data to clear")
        return
    
    response = input("⚠️  This will delete ALL memory data. Continue? (yes/no): ")
    if response.lower() != 'yes':
        print("Cancelled")
        return
    
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM conversations")
        cursor.execute("DELETE FROM memories")
        cursor.execute("DELETE FROM facts")
        
        conn.commit()
        conn.close()
        
        print("✅ All memory data cleared")
    except Exception as e:
        print(f"❌ Error clearing data: {e}")

def show_stats():
    """Show database statistics"""
    if not DB_PATH.exists():
        print("ℹ️  No database found")
        return
    
    try:
        conn = sqlite3.connect(str(DB_PATH))
        cursor = conn.cursor()
        
        cursor.execute("SELECT COUNT(*) FROM conversations")
        conv_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM memories")
        mem_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM facts")
        fact_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT session_id) FROM conversations")
        session_count = cursor.fetchone()[0]
        
        conn.close()
        
        print("\n📊 Memory Service Statistics:")
        print(f"   Sessions: {session_count}")
        print(f"   Conversations: {conv_count}")
        print(f"   Memories: {mem_count}")
        print(f"   Facts: {fact_count}")
        print(f"   Database: {DB_PATH}")
        print(f"   Size: {DB_PATH.stat().st_size / 1024:.2f} KB\n")
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")

def show_help():
    """Show help message"""
    print("""
Memory Service Management CLI

Usage: python manage.py <command>

Commands:
  start    - Start the memory service
  status   - Check service status
  clear    - Clear all memory data
  stats    - Show statistics
  help     - Show this help message

Examples:
  python manage.py start
  python manage.py stats
    """)

def main():
    if len(sys.argv) < 2:
        show_help()
        return
    
    command = sys.argv[1].lower()
    
    commands = {
        'start': start_service,
        'status': show_status,
        'clear': clear_data,
        'stats': show_stats,
        'help': show_help,
    }
    
    if command in commands:
        commands[command]()
    else:
        print(f"❌ Unknown command: {command}")
        show_help()

if __name__ == "__main__":
    main()