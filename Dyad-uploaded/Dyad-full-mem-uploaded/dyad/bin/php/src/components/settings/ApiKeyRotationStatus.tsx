import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ApiKeyRotationStatusProps {
  provider: string;
  apiKeys: string[];
  currentKeyIndex?: number;
  isRotating?: boolean;
}

export function ApiKeyRotationStatus({
  provider,
  apiKeys,
  currentKeyIndex = 0,
  isRotating = false,
}: ApiKeyRotationStatusProps) {
  if (apiKeys.length <= 1) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        API Key Rotation Status
      </div>

      <Alert
        variant={isRotating ? "default" : "default"}
        className={
          isRotating
            ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
            : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
        }
      >
        {isRotating ? (
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        )}
        <AlertTitle className="text-sm">
          {isRotating ? "Rotating API Keys" : "API Key Rotation Ready"}
        </AlertTitle>
        <AlertDescription className="text-xs mt-1">
          <div className="flex items-center gap-2">
            <span>
              Using key <strong>{currentKeyIndex + 1}</strong> of{" "}
              <strong>{apiKeys.length}</strong>
            </span>
            {isRotating && (
              <span className="text-yellow-600 dark:text-yellow-400">
                (Quota exceeded, switched to backup key)
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
        <div>Available API Keys:</div>
        <div className="flex flex-wrap gap-1">
          {apiKeys.map((key, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded text-xs font-mono ${
                index === currentKeyIndex
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  : index < currentKeyIndex
                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              Key {index + 1}
              {index === currentKeyIndex && " (active)"}
              {index < currentKeyIndex && " (exhausted)"}
            </span>
          ))}
        </div>
      </div>

      <Alert variant="default" className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
        <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-sm">How it works</AlertTitle>
        <AlertDescription className="text-xs mt-1">
          When the current API key reaches its quota limit, the application will automatically switch to the next available key. This ensures uninterrupted service.
        </AlertDescription>
      </Alert>
    </div>
  );
}
