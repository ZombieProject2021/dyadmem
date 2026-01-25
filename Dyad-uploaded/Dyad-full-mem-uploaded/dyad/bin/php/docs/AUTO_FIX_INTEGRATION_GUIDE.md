# 🔧 Auto Fix System Integration Guide

## ✨ Что это?

Система автоматического перехвата и фиксинга ошибок:

✅ **Перехватывает красные ошибки** из консоли  
✅ **Отправляет Gemini LLM** для анализа  
✅ **Получает решение** от нейросети  
✅ **Автоматически применяет фикс** к файлам  
✅ **Показывает статус** в панели  

---

## 🎯 Как это работает?

### Процесс

```
1. Ошибка в консоли (красная)
   ↓
2. ErrorInterceptor перехватывает
   ↓
3. Отправляет Gemini LLM
   ↓
4. LLM анализирует и предлагает решение
   ↓
5. Автоматически применяет фикс к файлу
   ↓
6. Триггерит rebuild проекта
   ↓
7. Показывает результат в панели
```

### Пример

```
Консоль:
❌ TypeError: Cannot read property 'map' of undefined

ErrorInterceptor:
→ Перехватил ошибку
→ Отправил Gemini

Gemini:
→ Проанализировал
→ Предложил: Добавить проверку на undefined

API:
→ Применил фикс
→ Обновил файл

Результат:
✓ Ошибка исправлена!
✓ Проект пересобран
✓ Все работает!
```

---

## 📁 Файлы системы

| Файл | Описание |
|------|---------|
| `src/integrations/error-interceptor.ts` | Перехватчик ошибок |
| `src/api/fix-error/route.ts` | API для применения фиксов |
| `src/components/AutoFixPanel.tsx` | Панель отображения фиксов |

---

## 🚀 Установка

### Шаг 1: Скопируйте файлы

```bash
# Перехватчик ошибок
cp error_interceptor.ts src/integrations/error-interceptor.ts

# API эндпоинт
cp fix_error_route.ts src/api/fix-error/route.ts

# Компонент панели
cp AutoFixPanel.tsx src/components/AutoFixPanel.tsx
```

### Шаг 2: Импортируйте в главное приложение

```typescript
// src/main.tsx или src/app.tsx

import { errorInterceptor } from '@/integrations/error-interceptor';
import AutoFixPanel from '@/components/AutoFixPanel';

// Initialize error interceptor
errorInterceptor;

// Add component to your app
export function App() {
  return (
    <div>
      {/* Your app content */}
      <AutoFixPanel />
    </div>
  );
}
```

### Шаг 3: Убедитесь что Gemini LLM настроена

```typescript
// src/integrations/ai/client.ts

import { Anthropic } from '@anthropic-sdk/sdk';

export function getAIClient() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    defaultHeaders: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
    },
  });
}
```

---

## ⚙️ Конфигурация

### Изменить интервал обработки

```typescript
// src/integrations/error-interceptor.ts

private processInterval = 5000; // 5 seconds
// Измените на нужный интервал (в миллисекундах)
```

### Изменить размер очереди

```typescript
// src/integrations/error-interceptor.ts

private maxQueueSize = 10; // Max 10 errors in queue
// Измените на нужный размер
```

### Добавить свои ключевые слова ошибок

```typescript
// src/integrations/error-interceptor.ts

private isErrorMessage(message: string): boolean {
  const errorKeywords = [
    'error',
    'failed',
    'exception',
    // Добавьте свои
    'custom-error',
  ];
  // ...
}
```

---

## 🎓 Примеры использования

### Пример 1: Автоматический фикс TypeError

```
Консоль:
❌ TypeError: Cannot read property 'map' of undefined

Что происходит:
1. ErrorInterceptor перехватывает
2. Отправляет Gemini
3. Gemini предлагает: Добавить проверку
4. Фикс применяется автоматически
5. Файл обновляется
6. Проект пересобирается

Результат:
✓ Ошибка исправлена
✓ Код работает
```

### Пример 2: Автоматический фикс API ошибки

```
Консоль:
❌ API Error: 404 Not Found - /api/users

Что происходит:
1. ErrorInterceptor перехватывает
2. Отправляет Gemini
3. Gemini предлагает: Проверить URL
4. Фикс применяется
5. API работает

Результат:
✓ Ошибка исправлена
✓ API работает
```

### Пример 3: Автоматический фикс Syntax Error

```
Консоль:
❌ SyntaxError: Unexpected token }

Что происходит:
1. ErrorInterceptor перехватывает
2. Отправляет Gemini
3. Gemini находит лишнюю скобку
4. Фикс применяется
5. Синтаксис исправляется

Результат:
✓ Ошибка исправлена
✓ Код компилируется
```

---

## 📊 Auto Fix Panel

### Функции

- ✅ Отображает список ошибок
- ✅ Показывает статус каждой ошибки
- ✅ Показывает предложенное решение
- ✅ Позволяет включить/отключить автофикс
- ✅ Позволяет скопировать ошибку
- ✅ Позволяет удалить ошибку из списка

### Статусы

| Статус | Описание |
|--------|---------|
| ⚠ PENDING | Ошибка обнаружена, ожидает обработки |
| ⟳ FIXING | Идет обработка, LLM анализирует |
| ✓ FIXED | Фикс применен успешно |
| ✗ FAILED | Ошибка при применении фикса |

---

## 🔌 API Endpoints

### POST /api/fix-error

Применить фикс к файлу.

**Request:**
```json
{
  "file": "src/components/UserList.tsx",
  "code": "const users = data?.users || [];",
  "issue": "Cannot read property 'map' of undefined",
  "solution": "Added null check for data"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fix applied to src/components/UserList.tsx",
  "issue": "Cannot read property 'map' of undefined",
  "solution": "Added null check for data"
}
```

---

## 🆘 Решение проблем

### Проблема: Фиксы не применяются

**Решение:**
1. Проверьте что API эндпоинт `/api/fix-error` работает
2. Проверьте что Gemini LLM настроена
3. Проверьте логи консоли на ошибки

### Проблема: Панель не отображается

**Решение:**
1. Убедитесь что компонент импортирован в App
2. Проверьте что CSS стили загружены
3. Проверьте консоль на ошибки

### Проблема: Ошибки не перехватываются

**Решение:**
1. Убедитесь что errorInterceptor инициализирован
2. Проверьте что ошибки содержат ключевые слова
3. Добавьте свои ключевые слова в isErrorMessage()

### Проблема: Gemini не отвечает

**Решение:**
1. Проверьте API ключ
2. Проверьте интернет соединение
3. Проверьте лимиты API

---

## 📚 Документация

### ErrorInterceptor API

```typescript
// Получить очередь ошибок
const errors = errorInterceptor.getErrorQueue();

// Очистить очередь
errorInterceptor.clearErrorQueue();
```

### Типы данных

```typescript
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
```

---

## 🎯 Лучшие практики

1. **Проверяйте панель** - смотрите какие ошибки были исправлены
2. **Проверяйте файлы** - убедитесь что фиксы применены правильно
3. **Тестируйте** - после автоматического фикса протестируйте функцию
4. **Отключайте если нужно** - используйте toggle для отключения автофикса
5. **Смотрите логи** - проверяйте консоль для деталей

---

## 🔄 Workflow

### Типичный процесс

1. **Разработка** - пишите код
2. **Ошибка** - возникает ошибка
3. **Перехват** - ErrorInterceptor перехватывает
4. **Анализ** - Gemini анализирует
5. **Фикс** - автоматически применяется
6. **Rebuild** - проект пересобирается
7. **Проверка** - вы видите результат в панели
8. **Продолжение** - продолжаете разработку

---

## 🚀 Готово!

Система автоматического фиксинга ошибок готова к использованию!

**Ошибки будут перехватываться и исправляться автоматически!** 🔧

**Вы сможете сосредоточиться на разработке!** 💪

---

**Версия:** 1.0 Auto Fix System  
**Дата:** 2024-01-17  
**Статус:** ✅ Полностью готово к использованию

**Разрабатывайте без страха перед ошибками!** 🎉
