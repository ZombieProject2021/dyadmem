/**
 * Auto Fix Panel Component
 * Displays automatic error fixes and their status
 */

import React, { useState, useEffect } from 'react';
import { errorInterceptor, ErrorLog } from '@/integrations/error-interceptor';

interface FixLog {
  id: string;
  error: ErrorLog;
  status: 'pending' | 'fixing' | 'fixed' | 'failed';
  issue?: string;
  solution?: string;
  timestamp: string;
}

export function AutoFixPanel() {
  const [fixLogs, setFixLogs] = useState<FixLog[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoFixEnabled, setAutoFixEnabled] = useState(true);

  useEffect(() => {
    // Poll for error queue updates
    const interval = setInterval(() => {
      const errors = errorInterceptor.getErrorQueue();
      if (errors.length > 0) {
        // Convert errors to fix logs
        const newFixLogs = errors.map((error, index) => ({
          id: `${Date.now()}-${index}`,
          error,
          status: 'pending' as const,
          timestamp: new Date().toLocaleTimeString(),
        }));

        setFixLogs((prev) => [...newFixLogs, ...prev].slice(0, 20)); // Keep last 20
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    setFixLogs([]);
    errorInterceptor.clearErrorQueue();
  };

  const handleToggleAutoFix = (enabled: boolean) => {
    setAutoFixEnabled(enabled);
    if (enabled) {
      errorInterceptor.enable();
    } else {
      errorInterceptor.disable();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fixed':
        return 'bg-green-100 text-green-800';
      case 'fixing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fixed':
        return '✓';
      case 'fixing':
        return '⟳';
      case 'failed':
        return '✗';
      case 'pending':
      default:
        return '⚠';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-sm">Auto Fix Panel</h3>
          {fixLogs.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
              {fixLogs.length} errors
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={autoFixEnabled}
              onChange={(e) => handleToggleAutoFix(e.target.checked)}
              className="w-3 h-3"
            />
            Auto Fix
          </label>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? '−' : '+'}
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="overflow-y-auto max-h-80">
          {fixLogs.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
              No errors detected
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {fixLogs.map((log) => (
                <div key={log.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)} {log.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>
                  </div>

                  {/* Error Message */}
                  <div className="mb-2">
                    <p className="text-xs font-mono text-gray-700 dark:text-gray-300 break-words">
                      {log.error.message}
                    </p>
                  </div>

                  {/* Solution (if available) */}
                  {log.solution && (
                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs">
                      <p className="font-semibold text-blue-800 dark:text-blue-200 mb-1">Solution:</p>
                      <p className="text-blue-700 dark:text-blue-300">{log.solution}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Copy error to clipboard
                        navigator.clipboard.writeText(log.error.message);
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
                    >
                      Copy
                    </button>
                    <button
                      onClick={() => {
                        // Remove from list
                        setFixLogs((prev) => prev.filter((l) => l.id !== log.id));
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg flex justify-between text-xs">
        <button
          onClick={handleClearLogs}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition"
        >
          Clear All
        </button>
        <span className="text-gray-500 dark:text-gray-400">
          {autoFixEnabled ? '🔧 Auto-fixing enabled' : '⏸ Auto-fixing disabled'}
        </span>
      </div>
    </div>
  );
}

export default AutoFixPanel;
