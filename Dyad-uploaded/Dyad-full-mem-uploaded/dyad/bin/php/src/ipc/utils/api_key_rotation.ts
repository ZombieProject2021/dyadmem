import log from "electron-log";

const logger = log.scope("api-key-rotation");

/**
 * Парсит строку API ключей разделенных запятой
 * Пример: "key1, key2, key3" -> ["key1", "key2", "key3"]
 */
export function parseApiKeys(apiKeyString: string): string[] {
  if (!apiKeyString) return [];
  
  return apiKeyString
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0);
}

/**
 * Хранит состояние ротации ключей для каждого провайдера
 */
const keyRotationState: Record<string, { currentIndex: number; keys: string[] }> = {};

/**
 * Получает следующий доступный API ключ для провайдера
 * Если текущий ключ исчерпал квоту, переходит к следующему
 */
export function getNextApiKey(
  provider: string,
  apiKeyString: string,
): { key: string; index: number; total: number } | null {
  const keys = parseApiKeys(apiKeyString);
  
  if (keys.length === 0) {
    logger.warn(`No API keys found for provider: ${provider}`);
    return null;
  }

  // Инициализируем состояние если его еще нет
  if (!keyRotationState[provider]) {
    keyRotationState[provider] = { currentIndex: 0, keys };
    logger.info(
      `Initialized key rotation for ${provider} with ${keys.length} keys`,
    );
  }

  const state = keyRotationState[provider];
  const currentKey = state.keys[state.currentIndex];

  logger.info(
    `Using API key ${state.currentIndex + 1}/${state.keys.length} for provider: ${provider}`,
  );

  return {
    key: currentKey,
    index: state.currentIndex,
    total: state.keys.length,
  };
}

/**
 * Переключается на следующий API ключ при ошибке квоты
 */
export function rotateToNextKey(provider: string): boolean {
  if (!keyRotationState[provider]) {
    logger.warn(`No rotation state found for provider: ${provider}`);
    return false;
  }

  const state = keyRotationState[provider];
  const nextIndex = state.currentIndex + 1;

  if (nextIndex >= state.keys.length) {
    logger.error(
      `All API keys exhausted for provider: ${provider}. No more keys available.`,
    );
    return false;
  }

  state.currentIndex = nextIndex;
  logger.info(
    `Rotated to next API key (${nextIndex + 1}/${state.keys.length}) for provider: ${provider}`,
  );

  return true;
}

/**
 * Сбрасывает состояние ротации для провайдера
 */
export function resetKeyRotation(provider: string): void {
  if (keyRotationState[provider]) {
    delete keyRotationState[provider];
    logger.info(`Reset key rotation state for provider: ${provider}`);
  }
}

/**
 * Получает текущее состояние ротации
 */
export function getRotationState(provider: string) {
  return keyRotationState[provider] || null;
}

/**
 * Проверяет является ли ошибка ошибкой квоты/rate limit
 */
export function isQuotaError(error: any): boolean {
  const errorMessage = error?.message || error?.toString() || "";
  const errorStatus = error?.status || error?.statusCode || 0;

  // Проверяем статус коды для разных провайдеров
  if (errorStatus === 429) {
    // Too Many Requests
    return true;
  }
  if (errorStatus === 403) {
    // Forbidden (может быть квота)
    return true;
  }

  // Проверяем текст ошибки
  const quotaKeywords = [
    "quota",
    "rate limit",
    "too many requests",
    "exceeded",
    "limit",
    "429",
    "403",
    "insufficient quota",
    "resource exhausted",
  ];

  return quotaKeywords.some((keyword) =>
    errorMessage.toLowerCase().includes(keyword),
  );
}

/**
 * Обработчик ошибок с автоматической ротацией ключей
 */
export async function handleApiKeyError(
  error: any,
  provider: string,
  apiKeyString: string,
  retryFn: (apiKey: string) => Promise<any>,
): Promise<any> {
  logger.error(`API error for provider ${provider}:`, error);

  if (!isQuotaError(error)) {
    // Если это не ошибка квоты, просто выбросим ошибку
    throw error;
  }

  logger.warn(`Quota error detected for provider: ${provider}`);

  // Пытаемся переключиться на следующий ключ
  const hasNextKey = rotateToNextKey(provider);

  if (!hasNextKey) {
    throw new Error(
      `All API keys exhausted for provider: ${provider}. Original error: ${error.message}`,
    );
  }

  // Получаем следующий ключ и пытаемся снова
  const nextKeyInfo = getNextApiKey(provider, apiKeyString);
  if (!nextKeyInfo) {
    throw new Error(`Failed to get next API key for provider: ${provider}`);
  }

  logger.info(
    `Retrying with next API key for provider: ${provider}`,
  );

  try {
    return await retryFn(nextKeyInfo.key);
  } catch (retryError) {
    logger.error(`Retry failed for provider ${provider}:`, retryError);
    throw retryError;
  }
}

/**
 * Форматирует информацию о ключах для логирования
 */
export function formatKeyInfo(provider: string, apiKeyString: string): string {
  const keys = parseApiKeys(apiKeyString);
  const state = getRotationState(provider);
  const currentIndex = state?.currentIndex || 0;

  return `Provider: ${provider}, Keys: ${keys.length}, Current: ${currentIndex + 1}/${keys.length}`;
}
