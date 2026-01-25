import log from "electron-log";
import {
  isQuotaError,
  rotateToNextKey,
  getNextApiKey,
  formatKeyInfo,
} from "./api_key_rotation";

const logger = log.scope("quota-error-handler");

/**
 * Оборачивает функцию запроса к API с автоматической обработкой ошибок квоты
 */
export async function withQuotaFallback<T>(
  provider: string,
  apiKeyString: string,
  requestFn: (apiKey: string) => Promise<T>,
): Promise<T> {
  try {
    // Получаем первый доступный ключ
    const keyInfo = getNextApiKey(provider, apiKeyString);
    if (!keyInfo) {
      throw new Error(`No API keys available for provider: ${provider}`);
    }

    logger.info(`Attempting request with ${formatKeyInfo(provider, apiKeyString)}`);

    return await requestFn(keyInfo.key);
  } catch (error: any) {
    if (!isQuotaError(error)) {
      // Если это не ошибка квоты, просто выбросим ошибку
      logger.error(`Non-quota error for provider ${provider}:`, error);
      throw error;
    }

    logger.warn(
      `Quota error detected for ${provider}. Attempting to rotate to next key...`,
    );

    // Пытаемся переключиться на следующий ключ
    const hasNextKey = rotateToNextKey(provider);

    if (!hasNextKey) {
      const errorMessage = `All API keys exhausted for provider: ${provider}. Original error: ${error.message}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Получаем следующий ключ и пытаемся снова
    const nextKeyInfo = getNextApiKey(provider, apiKeyString);
    if (!nextKeyInfo) {
      throw new Error(`Failed to get next API key for provider: ${provider}`);
    }

    logger.info(
      `Retrying with next key: ${formatKeyInfo(provider, apiKeyString)}`,
    );

    try {
      return await requestFn(nextKeyInfo.key);
    } catch (retryError: any) {
      logger.error(
        `Retry failed for provider ${provider}:`,
        retryError,
      );

      // Если это опять ошибка квоты, пытаемся еще раз
      if (isQuotaError(retryError)) {
        const hasAnotherKey = rotateToNextKey(provider);
        if (hasAnotherKey) {
          const anotherKeyInfo = getNextApiKey(provider, apiKeyString);
          if (anotherKeyInfo) {
            logger.info(
              `Trying another key: ${formatKeyInfo(provider, apiKeyString)}`,
            );
            return await requestFn(anotherKeyInfo.key);
          }
        }
      }

      throw retryError;
    }
  }
}

/**
 * Создает обработчик ошибок для конкретного провайдера
 */
export function createQuotaErrorHandler(provider: string, apiKeyString: string) {
  return {
    /**
     * Обрабатывает ошибку и возвращает информацию о переключении
     */
    handleError: async (
      error: any,
      requestFn: (apiKey: string) => Promise<any>,
    ): Promise<{ success: boolean; error?: string; message?: string }> => {
      if (!isQuotaError(error)) {
        return {
          success: false,
          error: error.message,
        };
      }

      const hasNextKey = rotateToNextKey(provider);
      if (!hasNextKey) {
        return {
          success: false,
          error: `All API keys exhausted for provider: ${provider}`,
        };
      }

      const nextKeyInfo = getNextApiKey(provider, apiKeyString);
      if (!nextKeyInfo) {
        return {
          success: false,
          error: `Failed to get next API key for provider: ${provider}`,
        };
      }

      try {
        await requestFn(nextKeyInfo.key);
        return {
          success: true,
          message: `Switched to API key ${nextKeyInfo.index + 1}/${nextKeyInfo.total}`,
        };
      } catch (retryError: any) {
        return {
          success: false,
          error: retryError.message,
        };
      }
    },

    /**
     * Получает информацию о текущем состоянии ключей
     */
    getStatus: () => {
      const keys = apiKeyString.split(",").map((k) => k.trim());
      return {
        provider,
        totalKeys: keys.length,
        keysInfo: formatKeyInfo(provider, apiKeyString),
      };
    },
  };
}

/**
 * Форматирует сообщение об ошибке для пользователя
 */
export function formatQuotaErrorMessage(
  provider: string,
  currentKeyIndex: number,
  totalKeys: number,
): string {
  if (totalKeys === 1) {
    return `API quota exceeded for ${provider}. Please check your API key or wait before retrying.`;
  }

  if (currentKeyIndex >= totalKeys - 1) {
    return `API quota exceeded for ${provider}. All backup API keys have also been exhausted. Please add more API keys or wait before retrying.`;
  }

  return `API quota exceeded for ${provider}. Switched to backup API key (${currentKeyIndex + 1}/${totalKeys}).`;
}
