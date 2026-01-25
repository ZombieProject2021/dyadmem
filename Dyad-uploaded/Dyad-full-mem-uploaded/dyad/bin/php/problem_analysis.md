# Анализ проблемы затирания данных в Dyad

## Обнаруженная проблема

В файле `/home/ubuntu/src/ipc/handlers/chat_stream_handlers.ts` (строки 252-283) есть логика, которая удаляет последние сообщения при параметре `redo: true`:

```typescript
// Handle redo option: remove the most recent messages if needed
if (req.redo) {
  // Get the most recent messages
  const chatMessages = [...chat.messages];

  // Find the most recent user message
  let lastUserMessageIndex = chatMessages.length - 1;
  while (
    lastUserMessageIndex >= 0 &&
    chatMessages[lastUserMessageIndex].role !== "user"
  ) {
    lastUserMessageIndex--;
  }

  if (lastUserMessageIndex >= 0) {
    // Delete the user message
    await db
      .delete(messages)
      .where(eq(messages.id, chatMessages[lastUserMessageIndex].id));

    // If there's an assistant message after the user message, delete it too
    if (
      lastUserMessageIndex < chatMessages.length - 1 &&
      chatMessages[lastUserMessageIndex + 1].role === "assistant"
    ) {
      await db
        .delete(messages)
        .where(
          eq(messages.id, chatMessages[lastUserMessageIndex + 1].id),
        );
    }
  }
}
```

## Текущее поведение

Параметр `redo` определён в интерфейсе `ChatStreamParams` как опциональный:
- `/home/ubuntu/src/ipc/ipc_types.ts` (строка 46): `redo?: boolean;`

В компоненте `ChatInput.tsx` все вызовы `streamMessage` явно передают `redo: false`:
- Строка 216: `redo: false,`
- Строка 552: `redo: false,`
- Строка 578: `redo: false,`

**Однако**, если где-то в коде `redo` передаётся как `true` или если есть другая логика, которая может случайно активировать удаление, это приведёт к потере истории сообщений.

## Возможные причины проблемы

1. **Непреднамеренная активация redo**: Возможно, в каком-то месте кода параметр `redo` устанавливается в `true` по умолчанию или по ошибке.

2. **Отсутствие защиты от случайного удаления**: Даже если `redo: false`, могут быть другие условия или баги, которые приводят к удалению данных.

3. **Проблемы с состоянием**: Если состояние чата не синхронизируется правильно, могут возникать ситуации, когда старые сообщения кажутся "новыми" и удаляются.

## Рекомендуемое решение

### Вариант 1: Полное отключение функции redo (если она не используется)
Если функция redo не нужна пользователю, можно полностью удалить эту логику из кода.

### Вариант 2: Добавление защиты и логирования
Добавить дополнительные проверки и логирование, чтобы понять, когда и почему происходит удаление:
- Логировать все случаи, когда `redo === true`
- Добавить подтверждение перед удалением
- Добавить опцию в настройках для включения/отключения функции redo

### Вариант 3: Архивирование вместо удаления
Вместо физического удаления сообщений из базы данных, можно добавить поле `archived` или `deleted` и помечать сообщения как архивные, сохраняя всю историю.

## Следующие шаги

Нужно определить, какой вариант решения предпочтительнее для пользователя.
