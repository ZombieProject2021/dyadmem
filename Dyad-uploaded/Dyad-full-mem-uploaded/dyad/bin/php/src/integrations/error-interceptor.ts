/**
 * Error Interceptor for Dyad
 * Captures errors from console logs (DISABLED by default to prevent infinite loops)
 */

interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  type: 'error' | 'uncaught-exception' | 'api-error';
  file?: string;
  line?: number;
  column?: number;
}

interface FixSuggestion {
  issue: string;
  solution: string;
  code: string;
  file: string;
  autoApply: boolean;
}

class ErrorInterceptor {
  private errorQueue: ErrorLog[] = [];
  private isProcessing = false;
  private maxQueueSize = 10;
  private processInterval = 5000; // 5 seconds
  private isEnabled = false; // DISABLED by default

  constructor() {
    this.setupInterceptors();
    console.log('[ErrorInterceptor] Initialized (disabled by default)');
  }

  /**
   * Enable error interceptor
   */
  public enable() {
    this.isEnabled = true;
    this.startProcessingQueue();
    console.log('[ErrorInterceptor] Enabled');
  }

  /**
   * Disable error interceptor
   */
  public disable() {
    this.isEnabled = false;
    console.log('[ErrorInterceptor] Disabled');
  }

  /**
   * Setup error interceptors
   */
  private setupInterceptors() {
    // Intercept console.error
    const originalError = console.error;
    console.error = (...args: any[]) => {
      originalError(...args);
      if (this.isEnabled) {
        this.captureError({
          timestamp: new Date().toISOString(),
          message: args.join(' '),
          type: 'error',
        });
      }
    };

    // Intercept uncaught exceptions
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event: ErrorEvent) => {
        if (this.isEnabled) {
          this.captureError({
            timestamp: new Date().toISOString(),
            message: event.message,
            stack: event.error?.stack,
            type: 'uncaught-exception',
            file: event.filename,
            line: event.lineno,
            column: event.colno,
          });
        }
      });

      // Intercept unhandled promise rejections
      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        if (this.isEnabled) {
          this.captureError({
            timestamp: new Date().toISOString(),
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack,
            type: 'error',
          });
        }
      });

      // Intercept fetch errors (but don't intercept /api/fix-error calls)
      const originalFetch = window.fetch;
      window.fetch = async (...args: any[]) => {
        try {
          const response = await originalFetch(...args);
          if (!response.ok && this.isEnabled && !args[0]?.includes('/api/fix-error')) {
            this.captureError({
              timestamp: new Date().toISOString(),
              message: `API Error: ${response.status} ${response.statusText} - ${args[0]}`,
              type: 'api-error',
            });
          }
          return response;
        } catch (error: any) {
          if (this.isEnabled && !args[0]?.includes('/api/fix-error')) {
            this.captureError({
              timestamp: new Date().toISOString(),
              message: `Fetch Error: ${error.message}`,
              stack: error.stack,
              type: 'error',
            });
          }
          throw error;
        }
      };
    }
  }

  /**
   * Capture error
   */
  private captureError(error: ErrorLog) {
    // Only capture errors (not warnings or info)
    if (!this.isErrorMessage(error.message)) {
      return;
    }

    console.log(`[ErrorInterceptor] Captured error: ${error.message}`);

    // Add to queue
    if (this.errorQueue.length < this.maxQueueSize) {
      this.errorQueue.push(error);
    } else {
      // Remove oldest error if queue is full
      this.errorQueue.shift();
      this.errorQueue.push(error);
    }
  }

  /**
   * Check if message is an error
   */
  private isErrorMessage(message: string): boolean {
    const errorKeywords = [
      'error',
      'failed',
      'exception',
      'uncaught',
      'cannot',
      'undefined',
      'null',
      'syntax',
      'type error',
      'reference error',
      'range error',
      'invalid',
      'not found',
      'not defined',
    ];

    const lowerMessage = message.toLowerCase();
    return errorKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Start processing error queue
   */
  private startProcessingQueue() {
    setInterval(() => {
      if (this.isEnabled && this.errorQueue.length > 0 && !this.isProcessing) {
        this.processErrorQueue();
      }
    }, this.processInterval);
  }

  /**
   * Process error queue
   */
  private async processErrorQueue() {
    if (this.isProcessing || this.errorQueue.length === 0 || !this.isEnabled) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.errorQueue.length > 0) {
        const error = this.errorQueue.shift();
        if (error) {
          await this.fixError(error);
        }
      }
    } catch (err) {
      console.error('[ErrorInterceptor] Error processing queue:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Fix error using LLM
   */
  private async fixError(error: ErrorLog) {
    try {
      console.log(`[ErrorInterceptor] Fixing error: ${error.message}`);

      // Create prompt for LLM
      const prompt = this.createFixPrompt(error);

      // Get fix suggestion from LLM
      const fixSuggestion = await this.getFixFromLLM(prompt);

      if (fixSuggestion) {
        // Apply fix automatically
        await this.applyFix(fixSuggestion);
      }
    } catch (err) {
      console.error('[ErrorInterceptor] Error fixing:', err);
    }
  }

  /**
   * Create fix prompt for LLM
   */
  private createFixPrompt(error: ErrorLog): string {
    return `
You are a code debugger. An error occurred in the application:

Error Type: ${error.type}
Timestamp: ${error.timestamp}
Message: ${error.message}
${error.stack ? `Stack: ${error.stack}` : ''}
${error.file ? `File: ${error.file}` : ''}
${error.line ? `Line: ${error.line}` : ''}

Please analyze this error and provide:
1. What caused the error
2. How to fix it
3. The corrected code (if applicable)

Format your response as JSON:
{
  "issue": "description of the issue",
  "solution": "how to fix it",
  "code": "corrected code or fix",
  "file": "file to modify",
  "autoApply": true
}
`;
  }

  /**
   * Get fix from LLM using fetch
   */
  private async getFixFromLLM(prompt: string): Promise<FixSuggestion | null> {
    try {
      // Use fetch to call LLM API
      const response = await fetch('/api/fix-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data as FixSuggestion;
    } catch (err) {
      console.error('[ErrorInterceptor] Error getting fix from LLM:', err);
      return null;
    }
  }

  /**
   * Apply fix automatically
   */
  private async applyFix(fix: FixSuggestion) {
    try {
      console.log(`[ErrorInterceptor] Applying fix: ${fix.issue}`);

      // Send fix to backend to apply
      const response = await fetch('/api/apply-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: fix.file,
          code: fix.code,
          issue: fix.issue,
          solution: fix.solution,
        }),
      });

      if (response.ok) {
        console.log(`[ErrorInterceptor] Fix applied successfully`);
        // Trigger rebuild
        this.triggerRebuild();
      } else {
        console.error(`[ErrorInterceptor] Failed to apply fix: ${response.statusText}`);
      }
    } catch (err) {
      console.error('[ErrorInterceptor] Error applying fix:', err);
    }
  }

  /**
   * Trigger rebuild
   */
  private async triggerRebuild() {
    try {
      await fetch('/api/rebuild', {
        method: 'POST',
      });
    } catch (err) {
      console.error('[ErrorInterceptor] Error triggering rebuild:', err);
    }
  }

  /**
   * Get error queue
   */
  public getErrorQueue(): ErrorLog[] {
    return [...this.errorQueue];
  }

  /**
   * Clear error queue
   */
  public clearErrorQueue() {
    this.errorQueue = [];
  }
}

// Initialize error interceptor (DISABLED by default)
export const errorInterceptor = new ErrorInterceptor();

// Export for use in other modules
export { ErrorLog, FixSuggestion };
