// Memory Integration Hook for Dyad
// This file provides hooks to automatically save chat messages to Memory Service

import { memoryBridge } from './memory_bridge';
import type { Message } from './memory_bridge';
import log from 'electron-log';

const logger = log.scope('memory-integration');

interface ChatMessage {
  id: number;
  chatId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  [key: string]: any;
}

interface App {
  id: number;
  name: string;
  path: string;
  [key: string]: any;
}

class MemoryIntegration {
  private enabled: boolean = true;
  private batchSize: number = 10;
  private messageQueue: ChatMessage[] = [];
  private saveTimeout: NodeJS.Timeout | null = null;
  
  constructor() {
    this.checkServiceAvailability();
  }

  /**
   * Check if Memory Service is available
   */
  async checkServiceAvailability() {
    const available = await memoryBridge.isAvailable();
    if (available) {
      logger.info('Memory Service is available');
    } else {
      logger.warn('Memory Service is not available - memory features disabled');
      this.enabled = false;
    }
  }

  /**
   * Save a single message to memory service
   */
  async saveMessage(
    chatId: number,
    appId: number | null,
    message: ChatMessage
  ): Promise<void> {
    if (!this.enabled) return;

    try {
      const memoryMessage: Message = {
        role: message.role,
        content: message.content,
        timestamp: message.createdAt?.toISOString() || new Date().toISOString(),
        metadata: {
          messageId: message.id,
          chatId: chatId,
        }
      };

      await memoryBridge.storeMemory({
        session_id: `chat-${chatId}`,
        app_id: appId ? `app-${appId}` : undefined,
        messages: [memoryMessage]
      });

      logger.info(`Saved message ${message.id} to memory service`);
    } catch (error) {
      logger.error('Failed to save message to memory:', error);
    }
  }

  /**
   * Save multiple messages in batch
   */
  async saveMessages(
    chatId: number,
    appId: number | null,
    messages: ChatMessage[]
  ): Promise<void> {
    if (!this.enabled || messages.length === 0) return;

    try {
      const memoryMessages: Message[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.createdAt?.toISOString() || new Date().toISOString(),
        metadata: {
          messageId: msg.id,
          chatId: chatId,
        }
      }));

      await memoryBridge.storeMemory({
        session_id: `chat-${chatId}`,
        app_id: appId ? `app-${appId}` : undefined,
        messages: memoryMessages,
        metadata: {
          batch: true,
          count: messages.length
        }
      });

      logger.info(`Saved ${messages.length} messages to memory service`);
    } catch (error) {
      logger.error('Failed to save messages to memory:', error);
    }
  }

  /**
   * Queue a message for batch saving
   */
  queueMessage(
    chatId: number,
    appId: number | null,
    message: ChatMessage
  ): void {
    if (!this.enabled) return;

    this.messageQueue.push(message);

    // Clear existing timeout
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    // Save immediately if queue is full
    if (this.messageQueue.length >= this.batchSize) {
      this.flushQueue(chatId, appId);
    } else {
      // Otherwise save after 5 seconds
      this.saveTimeout = setTimeout(() => {
        this.flushQueue(chatId, appId);
      }, 5000);
    }
  }

  /**
   * Flush queued messages
   */
  private async flushQueue(
    chatId: number,
    appId: number | null
  ): Promise<void> {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    await this.saveMessages(chatId, appId, messages);
  }

  /**
   * Search memory for relevant context
   */
  async searchContext(
    chatId: number,
    query: string,
    limit: number = 10
  ): Promise<any[]> {
    if (!this.enabled) return [];

    try {
      const results = await memoryBridge.searchMemory({
        session_id: `chat-${chatId}`,
        query: query,
        limit: limit
      });

      logger.info(`Found ${results.length} relevant memories for query: ${query.substring(0, 50)}...`);
      return results;
    } catch (error) {
      logger.error('Failed to search memory:', error);
      return [];
    }
  }

  /**
   * Get memory statistics for a chat
   */
  async getStats(chatId: number): Promise<any> {
    if (!this.enabled) return null;

    try {
      const stats = await memoryBridge.getStats(`chat-${chatId}`);
      return stats;
    } catch (error) {
      logger.error('Failed to get memory stats:', error);
      return null;
    }
  }

  /**
   * Delete all memories for a chat
   */
  async deleteChat(chatId: number): Promise<boolean> {
    if (!this.enabled) return false;

    try {
      await memoryBridge.deleteSession(`chat-${chatId}`);
      logger.info(`Deleted memories for chat ${chatId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete chat memories:', error);
      return false;
    }
  }

  /**
   * Enable/disable memory integration
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    memoryBridge.setEnabled(enabled);
    logger.info(`Memory integration ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Export singleton instance
export const memoryIntegration = new MemoryIntegration();

// Auto-save hook for new messages
export function useAutoSaveMemory(
  chatId: number,
  appId: number | null
) {
  return {
    saveMessage: (message: ChatMessage) => {
      memoryIntegration.queueMessage(chatId, appId, message);
    },
    searchContext: (query: string, limit?: number) => {
      return memoryIntegration.searchContext(chatId, query, limit);
    },
    getStats: () => {
      return memoryIntegration.getStats(chatId);
    }
  };
}
