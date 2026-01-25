from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
import json
import logging
from pathlib import Path

from memory_manager import MemoryManager

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Dyad Memory Service")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize memory manager
memory_manager = MemoryManager()

# Request/Response Models
class Message(BaseModel):
    role: str
    content: str
    timestamp: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        arbitrary_types_allowed = True

class StoreMemoryRequest(BaseModel):
    session_id: str
    app_id: Optional[str] = None
    messages: List[Message]
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        arbitrary_types_allowed = True

class SearchMemoryRequest(BaseModel):
    session_id: str
    query: str
    app_id: Optional[str] = None
    limit: int = 10
    
    class Config:
        arbitrary_types_allowed = True

class MemoryResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    data: Optional[Any] = None
    
    class Config:
        arbitrary_types_allowed = True

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await memory_manager.initialize()
    logger.info("Memory Service started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    await memory_manager.close()
    logger.info("Memory Service shut down")

@app.get("/")
async def root():
    return {
        "service": "Dyad Memory Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/memory/store", response_model=MemoryResponse)
async def store_memory(request: StoreMemoryRequest):
    """
    Store conversation memory
    
    This endpoint automatically stores chat history from Dyad
    """
    try:
        logger.info(f"Storing memory for session: {request.session_id}")
        
        result = await memory_manager.store_conversation(
            session_id=request.session_id,
            app_id=request.app_id,
            messages=[
                {
                    "role": msg.role,
                    "content": msg.content,
                    "timestamp": msg.timestamp.isoformat() if msg.timestamp else datetime.now().isoformat(),
                    "metadata": msg.metadata or {}
                }
                for msg in request.messages
            ],
            metadata=request.metadata or {}
        )
        
        return MemoryResponse(
            success=True,
            message="Memory stored successfully",
            data=result
        )
        
    except Exception as e:
        logger.error(f"Error storing memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/search", response_model=MemoryResponse)
async def search_memory(request: SearchMemoryRequest):
    """
    Search relevant memories
    
    This endpoint retrieves relevant context from stored memories
    """
    try:
        logger.info(f"Searching memory for session: {request.session_id}, query: {request.query[:100]}")
        
        results = await memory_manager.search_memories(
            session_id=request.session_id,
            query=request.query,
            app_id=request.app_id,
            limit=request.limit
        )
        
        return MemoryResponse(
            success=True,
            message="Memory search completed",
            data=results
        )
        
    except Exception as e:
        logger.error(f"Error searching memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/memory/stats/{session_id}")
async def get_memory_stats(session_id: str):
    """
    Get memory statistics for a session
    """
    try:
        stats = await memory_manager.get_stats(session_id)
        return MemoryResponse(
            success=True,
            data=stats
        )
    except Exception as e:
        logger.error(f"Error getting stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/memory/{session_id}")
async def delete_memory(session_id: str):
    """
    Delete all memories for a session
    """
    try:
        await memory_manager.delete_session(session_id)
        return MemoryResponse(
            success=True,
            message=f"Memories for session {session_id} deleted"
        )
    except Exception as e:
        logger.error(f"Error deleting memory: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("MEMORY_SERVICE_PORT", "8002"))
    uvicorn.run(app, host="0.0.0.0", port=port)