// Memory Bridge - Integration between Dyad and Memory Service
import axios from 'axios';

const MEMORY_SERVICE_URL = process.env.MEMORY_SERVICE_URL || 'http://localhost:8002';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface StoreMemoryRequest {
  session_id: string;
  app_id?: string;
  messages: Message[];
  metadata?: Record<string, any>;
}

export interface SearchMemoryRequest {
  session_id: string;
  query: string;
  app_id?: string;
  limit?: number;
}

export interface MemorySearchResult {
  type: 'conversation' | 'memory' | 'fact';
  content: string;
  score: number;
  timestamp?: string;
  [key: string]: any;
}

export class MemoryBridge {
  private baseUrl: string;
  private enabled: boolean;

  constructor(baseUrl: string = MEMORY_SERVICE_URL) {
    this.baseUrl = baseUrl;
    this.enabled = true;
  }

  /**
   * Check if memory service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 2000
      });
      return response.status === 200;
    } catch (error) {
      console.warn('Memory service not available:', error);
      return false;
    }
  }

  /**
   * Store conversation memory automatically
   */
  async storeMemory(request: StoreMemoryRequest): Promise<any> {
    if (!this.enabled) {
      console.log('Memory bridge disabled');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/memory/store`,
        request,
        { timeout: 10000 }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to store memory:', error);
      throw error;
    }
  }

  /**
   * Search for relevant memories
   */
  async searchMemory(request: SearchMemoryRequest): Promise<MemorySearchResult[]> {
    if (!this.enabled) {
      console.log('Memory bridge disabled');
      return [];
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/memory/search`,
        {
          ...request,
          limit: request.limit || 10
        },
        { timeout: 10000 }
      );
      return response.data?.data?.results || [];
    } catch (error) {
      console.error('Failed to search memory:', error);
      return [];
    }
  }

  /**
   * Get memory statistics
   */
  async getStats(sessionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/memory/stats/${sessionId}`,
        { timeout: 5000 }
      );
      return response.data?.data;
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return null;
    }
  }

  /**
   * Delete session memory
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await axios.delete(
        `${this.baseUrl}/api/memory/${sessionId}`,
        { timeout: 5000 }
      );
      return true;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  /**
   * Enable/disable memory bridge
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// Export singleton instance
export const memoryBridge = new MemoryBridge();
