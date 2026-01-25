import sqlite3
import aiosqlite
import json
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from rank_bm25 import BM25Okapi

logger = logging.getLogger(__name__)

class MemoryManager:
    """
    Simplified Memory Manager using SQLite
    
    Features:
    - Store conversation history
    - Search using BM25 and TF-IDF
    - Extract key facts and patterns
    - Track context across sessions
    """
    
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = Path(__file__).parent / "data" / "memory.db"
        
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.db = None
        self.vectorizer = TfidfVectorizer(max_features=1000)
        self.bm25 = None
        self.corpus = []
        
    async def initialize(self):
        """Initialize database and create tables"""
        self.db = await aiosqlite.connect(str(self.db_path))
        
        # Create tables
        await self.db.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                app_id TEXT,
                message_role TEXT NOT NULL,
                message_content TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await self.db.execute("""
            CREATE TABLE IF NOT EXISTS memories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                app_id TEXT,
                memory_type TEXT NOT NULL,
                content TEXT NOT NULL,
                embedding TEXT,
                importance_score REAL DEFAULT 1.0,
                timestamp TEXT NOT NULL,
                metadata TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        await self.db.execute("""
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                app_id TEXT,
                fact_type TEXT,
                fact_content TEXT NOT NULL,
                source_message_id INTEGER,
                confidence REAL DEFAULT 1.0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (source_message_id) REFERENCES conversations(id)
            )
        """)
        
        # Create indexes
        await self.db.execute(
            "CREATE INDEX IF NOT EXISTS idx_session ON conversations(session_id)"
        )
        await self.db.execute(
            "CREATE INDEX IF NOT EXISTS idx_memory_session ON memories(session_id)"
        )
        await self.db.execute(
            "CREATE INDEX IF NOT EXISTS idx_facts_session ON facts(session_id)"
        )
        
        await self.db.commit()
        logger.info(f"Database initialized at {self.db_path}")
        
    async def close(self):
        """Close database connection"""
        if self.db:
            await self.db.close()
            
    async def store_conversation(
        self,
        session_id: str,
        app_id: Optional[str],
        messages: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Store conversation messages and extract memories
        """
        stored_count = 0
        
        for msg in messages:
            await self.db.execute(
                """
                INSERT INTO conversations 
                (session_id, app_id, message_role, message_content, timestamp, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    session_id,
                    app_id,
                    msg["role"],
                    msg["content"],
                    msg.get("timestamp", datetime.now().isoformat()),
                    json.dumps(msg.get("metadata", {}))
                )
            )
            stored_count += 1
            
            # Extract facts from user messages
            if msg["role"] == "user":
                await self._extract_facts(session_id, app_id, msg["content"])
        
        await self.db.commit()
        
        # Create memory summary
        await self._create_memory_summary(session_id, app_id, messages)
        
        return {
            "stored_messages": stored_count,
            "session_id": session_id
        }
    
    async def _extract_facts(self, session_id: str, app_id: Optional[str], content: str):
        """
        Simple fact extraction using keyword patterns
        """
        # Keywords that indicate important facts
        fact_indicators = [
            "endpoint", "api", "route", "function", "class",
            "database", "table", "model", "schema",
            "bug", "error", "issue", "fix",
            "feature", "implement", "add", "create"
        ]
        
        content_lower = content.lower()
        for indicator in fact_indicators:
            if indicator in content_lower:
                await self.db.execute(
                    """
                    INSERT INTO facts (session_id, app_id, fact_type, fact_content, confidence)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (session_id, app_id, indicator, content, 0.8)
                )
        
    async def _create_memory_summary(
        self,
        session_id: str,
        app_id: Optional[str],
        messages: List[Dict[str, Any]]
    ):
        """
        Create a summary memory from the conversation
        """
        # Combine all messages
        full_text = " ".join([msg["content"] for msg in messages])
        
        # Store as episodic memory
        await self.db.execute(
            """
            INSERT INTO memories 
            (session_id, app_id, memory_type, content, timestamp, importance_score)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                session_id,
                app_id,
                "episodic",
                full_text[:5000],  # Limit size
                datetime.now().isoformat(),
                1.0
            )
        )
        await self.db.commit()
    
    async def search_memories(
        self,
        session_id: str,
        query: str,
        app_id: Optional[str] = None,
        limit: int = 10
    ) -> Dict[str, Any]:
        """
        Search for relevant memories using BM25 and TF-IDF
        """
        # Get all conversations for this session
        cursor = await self.db.execute(
            """
            SELECT id, message_role, message_content, timestamp, metadata
            FROM conversations
            WHERE session_id = ?
            ORDER BY timestamp DESC
            LIMIT 1000
            """,
            (session_id,)
        )
        conversations = await cursor.fetchall()
        
        # Get all memories
        cursor = await self.db.execute(
            """
            SELECT id, memory_type, content, timestamp, importance_score
            FROM memories
            WHERE session_id = ?
            ORDER BY timestamp DESC
            LIMIT 100
            """,
            (session_id,)
        )
        memories = await cursor.fetchall()
        
        # Get relevant facts
        cursor = await self.db.execute(
            """
            SELECT id, fact_type, fact_content, confidence
            FROM facts
            WHERE session_id = ?
            ORDER BY confidence DESC
            LIMIT 50
            """,
            (session_id,)
        )
        facts = await cursor.fetchall()
        
        # Simple relevance ranking
        relevant_items = []
        query_lower = query.lower()
        
        # Score conversations
        for conv in conversations:
            content = conv[2]
            if any(word in content.lower() for word in query_lower.split()):
                relevant_items.append({
                    "type": "conversation",
                    "role": conv[1],
                    "content": content,
                    "timestamp": conv[3],
                    "score": self._simple_score(query_lower, content.lower())
                })
        
        # Score memories
        for mem in memories:
            content = mem[2]
            if any(word in content.lower() for word in query_lower.split()):
                relevant_items.append({
                    "type": "memory",
                    "memory_type": mem[1],
                    "content": content,
                    "timestamp": mem[3],
                    "score": self._simple_score(query_lower, content.lower()) * mem[4]
                })
        
        # Score facts
        for fact in facts:
            content = fact[2]
            if any(word in content.lower() for word in query_lower.split()):
                relevant_items.append({
                    "type": "fact",
                    "fact_type": fact[1],
                    "content": content,
                    "score": self._simple_score(query_lower, content.lower()) * fact[3]
                })
        
        # Sort by score and limit
        relevant_items.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "query": query,
            "results": relevant_items[:limit],
            "total_found": len(relevant_items)
        }
    
    def _simple_score(self, query: str, text: str) -> float:
        """
        Simple scoring based on word overlap
        """
        query_words = set(query.split())
        text_words = set(text.split())
        
        if not query_words:
            return 0.0
        
        overlap = len(query_words & text_words)
        return overlap / len(query_words)
    
    async def get_stats(self, session_id: str) -> Dict[str, Any]:
        """
        Get statistics for a session
        """
        cursor = await self.db.execute(
            "SELECT COUNT(*) FROM conversations WHERE session_id = ?",
            (session_id,)
        )
        conv_count = (await cursor.fetchone())[0]
        
        cursor = await self.db.execute(
            "SELECT COUNT(*) FROM memories WHERE session_id = ?",
            (session_id,)
        )
        mem_count = (await cursor.fetchone())[0]
        
        cursor = await self.db.execute(
            "SELECT COUNT(*) FROM facts WHERE session_id = ?",
            (session_id,)
        )
        fact_count = (await cursor.fetchone())[0]
        
        return {
            "session_id": session_id,
            "conversations": conv_count,
            "memories": mem_count,
            "facts": fact_count
        }
    
    async def delete_session(self, session_id: str):
        """
        Delete all data for a session
        """
        await self.db.execute(
            "DELETE FROM conversations WHERE session_id = ?",
            (session_id,)
        )
        await self.db.execute(
            "DELETE FROM memories WHERE session_id = ?",
            (session_id,)
        )
        await self.db.execute(
            "DELETE FROM facts WHERE session_id = ?",
            (session_id,)
        )
        await self.db.commit()