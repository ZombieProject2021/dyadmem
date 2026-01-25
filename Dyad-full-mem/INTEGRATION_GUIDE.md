# Dyad Full Memory - Integration Guide

## 🔗 Интеграция с Dyad

Этот гайд показывает, как интегрировать Memory Service с Dyad для автоматического сохранения памяти.

## Файлы для интеграции

### 1. `src/memory/memory_bridge.ts`
Базовый клиент для общения с Memory Service API.

### 2. `src/memory/memory_integration.ts`
Интеграционные хуки для автоматического сохранения сообщений.

## Шаги интеграции

### Шаг 1: Добавьте axios в зависимости

```bash
cd dyad
npm install axios
```

### Шаг 2: Модифицируйте обработчик сообщений

Найдите файл, где создаются новые сообщения чата (например, `src/ipc/chat.ts` или подобный).

Добавьте импорт:

```typescript
import { memoryIntegration } from '../memory/memory_integration';
```

### Шаг 3: Автосохранение при создании сообщений

После создания нового сообщения в базе данных:

```typescript
// После создания сообщения в SQLite
const newMessage = await db.insert(messages).values({
  chatId: chatId,
  role: 'user',
  content: userInput,
  // ...
}).returning();

// Автоматически сохранить в Memory Service
await memoryIntegration.saveMessage(
  chatId,
  appId,
  newMessage[0]
);
```

### Шаг 4: Поиск контекста перед отправкой в AI

Перед отправкой запроса в AI, получите релевантный контекст:

```typescript
// Поиск релевантной памяти
const relevantMemories = await memoryIntegration.searchContext(
  chatId,
  userInput,
  5  // количество результатов
);

// Добавьте в контекст AI
if (relevantMemories.length > 0) {
  const contextString = relevantMemories
    .map(m => `[Memory: ${m.content}]`)
    .join('\n');
  
  // Добавьте в системный промпт или контекст
  const systemPrompt = `${baseSystemPrompt}\n\nRelevant context from previous conversations:\n${contextString}`;
}
```

## Пример интеграции

```typescript
import { memoryIntegration, useAutoSaveMemory } from '../memory/memory_integration';

// В компоненте чата
const ChatComponent = ({ chatId, appId }: Props) => {
  const memory = useAutoSaveMemory(chatId, appId);
  
  const handleSendMessage = async (content: string) => {
    // 1. Создать сообщение пользователя
    const userMessage = await createMessage({
      chatId,
      role: 'user',
      content,
    });
    
    // 2. Автосохранение в память
    memory.saveMessage(userMessage);
    
    // 3. Поиск контекста
    const context = await memory.searchContext(content);
    
    // 4. Отправить в AI с контекстом
    const aiResponse = await sendToAI(content, context);
    
    // 5. Сохранить ответ AI
    const assistantMessage = await createMessage({
      chatId,
      role: 'assistant',
      content: aiResponse,
    });
    
    memory.saveMessage(assistantMessage);
  };
  
  return (
    // UI компонента
  );
};
```

## Управление памятью

### Получить статистику

```typescript
const stats = await memoryIntegration.getStats(chatId);
console.log(`Conversations: ${stats.conversations}`);
console.log(`Memories: ${stats.memories}`);
console.log(`Facts: ${stats.facts}`);
```

### Удалить память чата

```typescript
await memoryIntegration.deleteChat(chatId);
```

### Включить/выключить память

```typescript
memoryIntegration.setEnabled(false);  // Выключить
memoryIntegration.setEnabled(true);   // Включить
```

## Конфигурация

Добавьте в `.env` файл Dyad:

```env
MEMORY_SERVICE_URL=http://localhost:8002
MEMORY_AUTO_SAVE=true
MEMORY_SEARCH_LIMIT=10
```

## Отладка

Логи интеграции можно найти в Electron DevTools:

```typescript
// В консоли разработчика
import log from 'electron-log';
log.scope('memory-integration').info('Memory status:', memoryIntegration.isEnabled());
```

## Тестирование

Для тестирования интеграции:

```bash
# Запустите Memory Service
cd memory_service
python server.py

# В другом терминале запустите Dyad
cd dyad
npm start
```

## Производительность

- **Пакетное сохранение**: Сообщения сохраняются пакетами по 10 штук или каждые 5 секунд
- **Асинхронность**: Все операции с памятью выполняются асинхронно
- **Обработка ошибок**: Ошибки не блокируют основной функционал Dyad

## FAQ

**Q: Что происходит, если Memory Service недоступен?**

A: Dyad продолжит работать нормально, но память не будет сохраняться.

**Q: Можно ли отключить автосохранение?**

A: Да, установите `MEMORY_AUTO_SAVE=false` в `.env` или вызовите `memoryIntegration.setEnabled(false)`.

**Q: Как удалить всю память?**

A: Запустите `python memory_service/manage.py clear`
