# Dyad with Infinite Memory

🚀 **Dyad AI App Builder с интеграцией EverMemOS для бесконечной памяти**

## 🎯 Что это?

Это интеграция двух мощных проектов:
- **Dyad** - локальный AI app builder
- **EverMemOS** - система управления памятью с точностью 93%

### Проблема, которую решаем:
Дyad забывает контекст при работе с большими проектами, теряет endpoint'ы и важную информацию.

### Решение:
Автоматическое сохранение всей истории чатов в долговременную память с умным поиском.

## 📁 Структура проекта

```
Dyad-full-mem/
├── dyad/              # Dyad приложение (Electron)
├── memory_service/    # Memory Service (FastAPI + SQLite)
│   ├── import_history.py  # 🆕 Импорт старой истории
│   └── ...
├── config/            # Конфигурация
├── start.bat          # Запуск для Windows
├── start.sh           # Запуск для Linux/Mac
└── README.md          # Эта инструкция
```

## 📥 Импорт старой истории

Если у вас уже есть проекты в обычном Dyad, вы можете импортировать всю историю:

```bash
cd memory_service
python import_history.py /path/to/dyad/sqlite.db
```

**Где найти базу Dyad:**
- Windows: `%APPDATA%\dyad\sqlite.db`
- Linux: `~/.config/dyad/sqlite.db`
- Mac: `~/Library/Application Support/dyad/sqlite.db`

📖 [Полная инструкция по импорту](IMPORT_OLD_HISTORY.md)

## ⚙️ Установка

### Требования:
- **Node.js** >= 20.x
- **Python** >= 3.10
- **Windows** (для start.bat)

### Шаг 1: Установка зависимостей Dyad

```bash
cd dyad
npm install
```

### Шаг 2: Установка зависимостей Memory Service

```bash
cd memory_service
pip install -r requirements.txt
```

### Шаг 3: Настройка API ключей

Создайте файл `dyad/.env` с вашими API ключами:

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Anthropic API Key (опционально)
ANTHROPIC_API_KEY=sk-ant-...

# Memory Service URL
MEMORY_SERVICE_URL=http://localhost:8002
```

## 🚀 Запуск

### Windows (простой способ):

Дважды кликните на `start.bat` или запустите в командной строке:

```cmd
start.bat
```

Это запустит:
1. Memory Service на порту 8002
2. Dyad приложение

### Ручной запуск:

**Терминал 1 - Memory Service:**
```bash
cd memory_service
python server.py
```

**Терминал 2 - Dyad:**
```bash
cd dyad
npm start
```

## 💡 Как это работает

### Автоматическое сохранение

1. Вы общаетесь с Dyad AI агентом
2. Каждое сообщение автоматически сохраняется в Memory Service
3. Извлекаются ключевые факты (endpoints, функции, баги, etc.)
4. Создаются резюме разговоров

### Умный поиск

1. При новом запросе система ищет релевантный контекст
2. Используются алгоритмы BM25 и TF-IDF
3. Возвращаются самые релевантные воспоминания
4. AI агент использует их для ответа

### Типы памяти

- **Conversations** - полная история чатов
- **Memories** - эпизодические резюме
- **Facts** - извлеченные ключевые факты (API, баги, фичи)

## 🔧 Конфигурация

### Memory Service (memory_service/server.py)

```python
MEMORY_SERVICE_PORT=8002  # Порт сервиса
```

### Dyad Integration

Интеграция через `src/memory/memory_bridge.ts`:

```typescript
import { memoryBridge } from './memory/memory_bridge';

// Сохранить память
await memoryBridge.storeMemory({
  session_id: chatId,
  app_id: appId,
  messages: messages
});

// Поиск в памяти
const results = await memoryBridge.searchMemory({
  session_id: chatId,
  query: userQuery,
  limit: 10
});
```

## 📊 API Endpoints

### Store Memory
```
POST /api/memory/store
{
  "session_id": "chat-123",
  "app_id": "app-456",
  "messages": [
    {"role": "user", "content": "..."}
  ]
}
```

### Search Memory
```
POST /api/memory/search
{
  "session_id": "chat-123",
  "query": "What endpoints did I create?",
  "limit": 10
}
```

### Get Stats
```
GET /api/memory/stats/{session_id}
```

### Delete Session
```
DELETE /api/memory/{session_id}
```

## 🐛 Troubleshooting

### Memory Service не запускается

```bash
cd memory_service
python -m pip install --upgrade pip
pip install -r requirements.txt
python server.py
```

### Dyad не видит Memory Service

1. Убедитесь что Memory Service запущен: `http://localhost:8002/health`
2. Проверьте `MEMORY_SERVICE_URL` в `.env`
3. Проверьте firewall

### База данных повреждена

```bash
rm memory_service/data/memory.db
# Перезапустите Memory Service
```

## 📈 Возможности

✅ **Автоматическое сохранение** всех чатов
✅ **Умный поиск** по истории
✅ **Извлечение фактов** (API, баги, фичи)
✅ **SQLite** - не требует внешних БД
✅ **Локальная работа** - всё на вашем ПК
✅ **Быстрый старт** - один BAT-файл

## 🔮 Планы развития

- [ ] Vector embeddings для семантического поиска
- [ ] Интеграция с OpenAI embeddings
- [ ] UI для просмотра памяти
- [ ] Экспорт/импорт памяти
- [ ] Поддержка множественных проектов

## 📝 Лицензия

- **Dyad**: Apache 2.0
- **EverMemOS**: Apache 2.0
- **Эта интеграция**: MIT

## 🤝 Поддержка

Если возникли проблемы:

1. Проверьте логи Memory Service: `memory_service/logs/`
2. Проверьте логи Dyad в консоли
3. Создайте issue в GitHub

## 💪 Благодарности

- [Dyad](https://github.com/dyad-sh/dyad) - за отличный AI app builder
- [EverMemOS](https://github.com/EverMind-AI/EverMemOS) - за систему памяти

---

**Создано с ❤️ для разработчиков, которым нужна бесконечная память для AI агентов**