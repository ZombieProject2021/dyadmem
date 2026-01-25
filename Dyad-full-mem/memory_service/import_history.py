#!/usr/bin/env python3
"""
Import chat history from Dyad SQLite database to Memory Service

Usage:
    python import_history.py /path/to/dyad/sqlite.db

This will import all existing chat history into Memory Service.
"""

import sys
import sqlite3
import asyncio
import aiosqlite
from pathlib import Path
from datetime import datetime
import json

from memory_manager import MemoryManager


async def import_from_dyad_db(dyad_db_path: str, memory_manager: MemoryManager):
    """
    Import chat history from Dyad SQLite database
    
    Args:
        dyad_db_path: Path to Dyad's sqlite.db
        memory_manager: MemoryManager instance
    """
    
    if not Path(dyad_db_path).exists():
        print(f"❌ Database not found: {dyad_db_path}")
        return
    
    print(f"📂 Opening Dyad database: {dyad_db_path}")
    
    # Connect to Dyad database
    dyad_db = await aiosqlite.connect(dyad_db_path)
    
    try:
        # Get all apps
        cursor = await dyad_db.execute("""
            SELECT id, name, path FROM apps
        """)
        apps = await cursor.fetchall()
        
        print(f"\n📊 Found {len(apps)} apps")
        
        total_chats = 0
        total_messages = 0
        
        for app in apps:
            app_id, app_name, app_path = app
            
            print(f"\n🔍 Processing app: {app_name} (ID: {app_id})")
            
            # Get all chats for this app
            cursor = await dyad_db.execute("""
                SELECT id, title, createdAt FROM chats
                WHERE appId = ?
            """, (app_id,))
            chats = await cursor.fetchall()
            
            print(f"   Found {len(chats)} chats")
            
            for chat in chats:
                chat_id, chat_title, created_at = chat
                total_chats += 1
                
                # Get all messages for this chat
                cursor = await dyad_db.execute("""
                    SELECT id, role, content, createdAt
                    FROM messages
                    WHERE chatId = ?
                    ORDER BY createdAt ASC
                """, (chat_id,))
                messages = await cursor.fetchall()
                
                if not messages:
                    print(f"   ⏭️  Skipping empty chat: {chat_title or f'Chat {chat_id}'}")
                    continue
                
                print(f"   💬 Importing chat: {chat_title or f'Chat {chat_id}'} ({len(messages)} messages)")
                
                # Prepare messages for import
                message_list = []
                for msg in messages:
                    msg_id, role, content, msg_created_at = msg
                    
                    # Parse timestamp
                    if isinstance(msg_created_at, int):
                        # Unix timestamp
                        timestamp = datetime.fromtimestamp(msg_created_at).isoformat()
                    else:
                        # ISO string or other format
                        timestamp = str(msg_created_at)
                    
                    message_list.append({
                        "role": role,
                        "content": content,
                        "timestamp": timestamp,
                        "metadata": {
                            "original_message_id": msg_id,
                            "imported": True,
                            "app_name": app_name
                        }
                    })
                    total_messages += 1
                
                # Import to Memory Service
                try:
                    await memory_manager.store_conversation(
                        session_id=f"chat-{chat_id}",
                        app_id=f"app-{app_id}",
                        messages=message_list,
                        metadata={
                            "chat_title": chat_title,
                            "app_name": app_name,
                            "imported_at": datetime.now().isoformat(),
                            "source": "dyad_import"
                        }
                    )
                    print(f"      ✅ Imported {len(messages)} messages")
                except Exception as e:
                    print(f"      ❌ Error importing chat {chat_id}: {e}")
        
        print(f"\n" + "="*60)
        print(f"📊 Import Summary:")
        print(f"   Apps processed: {len(apps)}")
        print(f"   Chats imported: {total_chats}")
        print(f"   Messages imported: {total_messages}")
        print(f"="*60)
        
    finally:
        await dyad_db.close()


async def main():
    if len(sys.argv) < 2:
        print("""
Usage: python import_history.py <dyad_db_path>

Example:
  Windows: python import_history.py "C:\\Users\\YourName\\AppData\\Roaming\\dyad\\sqlite.db"
  Linux:   python import_history.py ~/.config/dyad/sqlite.db
  Mac:     python import_history.py ~/Library/Application\\ Support/dyad/sqlite.db

This script will import all chat history from Dyad into Memory Service.
        """)
        sys.exit(1)
    
    dyad_db_path = sys.argv[1]
    
    print("="*60)
    print("  DYAD CHAT HISTORY IMPORTER")
    print("="*60)
    print()
    
    # Initialize Memory Manager
    print("🚀 Initializing Memory Service...")
    memory_manager = MemoryManager()
    await memory_manager.initialize()
    print("✅ Memory Service ready\n")
    
    # Import history
    await import_from_dyad_db(dyad_db_path, memory_manager)
    
    # Cleanup
    await memory_manager.close()
    
    print("\n✅ Import completed!")
    print("\n💡 Tips:")
    print("   - Run 'python manage.py stats' to see imported data")
    print("   - Old chats will now have full memory context")
    print("   - Search will work across all imported conversations")


if __name__ == "__main__":
    asyncio.run(main())
