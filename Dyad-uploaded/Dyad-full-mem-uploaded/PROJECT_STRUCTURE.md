# 📁 Структура проекта Dyad-full-mem

## Обзор

Этот проект интегрирует Dyad AI App Builder с системой управления памятью на основе EverMemOS.

```
Dyad-full-mem/
├── dyad/                          # Dyad приложение (Electron)
│   ├── src/
│   │   ├── memory/                # 🆕 Модуль интеграции памяти
│   │   │   ├── memory_bridge.ts   # HTTP клиент для Memory Service
│   │   │   └── memory_integration.ts  # Хуки автосохранения
│   │   ├── db/                    # SQLite база Dyad
│   │   ├── ipc/                   # IPC коммуникация
│   │   └── ...                    # Остальной код Dyad
│   ├── package.json
│   └── .env                       # 🔑 API ключи и конфигурация
│
├── memory_service/                # Memory Service (FastAPI + SQLite)
│   ├── server.py                  # 🚀 Главный сервер FastAPI
│   ├── memory_manager.py          # 💾 Менеджер памяти
│   ├── requirements.txt           # Python зависимости
│   ├── test_service.py            # 🧪 Тесты
│   ├── manage.py                  # 🛠️ CLI для управления
│   ├── data/                      # SQLite база данных
│   │   └── memory.db              # База памяти
│   └── logs/                      # Логи сервиса
│
├── config/                        # Конфигурация
│   ├── memory_service.env         # Настройки Memory Service
│   └── dyad.env.template          # Шаблон для Dyad .env
│
├── start.bat                      # 🚀 Запуск для Windows
├── package.json                   # NPM скрипты
│
└── Документация
    ├── README.md                  # Основная документация
    ├── QUICK_START.md             # Быстрый старт
    ├── INTEGRATION_GUIDE.md       # Руководство по интеграции
    └── PROJECT_STRUCTURE.md       # Этот файл
```

## Ключевые компоненты

### 1. Dyad (Electron приложение)

**Основное**: AI app builder с локальной базой данных SQLite.

**Новые компоненты**:
- `src/memory/memory_bridge.ts` - HTTP клиент для общения с Memory Service
- `src/memory/memory_integration.ts` - Автоматическое сохранение сообщений

**База данных**: `sqlite.db` (в user data directory)
- Хранит приложения, чаты, сообщения
- Остается без изменений

### 2. Memory Service (FastAPI + SQLite)

**Назначение**: Долговременная память с умным поиском.

**Компоненты**:

#### `server.py` - FastAPI сервер
Endpoints:
- `GET /health` - проверка здоровья
- `POST /api/memory/store` - сохранить память
- `POST /api/memory/search` - поиск в памяти
- `GET /api/memory/stats/{session_id}` - статистика
- `DELETE /api/memory/{session_id}` - удалить сессию

#### `memory_manager.py` - Менеджер памяти
Функции:
- Хранение разговоров в SQLite
- Извлечение ключевых фактов (endpoints, bugs, features)
- Создание эпизодических резюме
- Поиск с использованием BM25 и TF-IDF

**База данных**: `data/memory.db`

Таблицы:
```sql
conversations - полная история чатов
memories      - эпизодические резюме
facts         - извлеченные факты
```

#### `test_service.py` - Тесты
Проверяет:
- Health check
- Store memory
- Search memory
- Get stats

#### `manage.py` - CLI утилита
Команды:
```bash
python manage.py start   # Запуск сервиса
python manage.py status  # Статус
python manage.py stats   # Статистика
python manage.py clear   # Очистить данные
```

### 3. Конфигурация

#### `config/memory_service.env`
```env
MEMORY_SERVICE_PORT=8002
MEMORY_SERVICE_HOST=0.0.0.0
DATABASE_PATH=data/memory.db
LOG_LEVEL=INFO
```

#### `dyad/.env` (создается пользователем)
```env
OPENAI_API_KEY=sk-...
MEMORY_SERVICE_URL=http://localhost:8002
MEMORY_AUTO_SAVE=true
```

### 4. Скрипты запуска

#### `start.bat` (Windows)
Автоматически:
1. Проверяет Python и Node.js
2. Устанавливает зависимости
3. Запускает Memory Service
4. Запускает Dyad

#### `package.json` - NPM скрипты
```json
{
  "start": "cd dyad && npm start",
  "memory:start": "cd memory_service && python server.py",
  "memory:test": "cd memory_service && python test_service.py",
  "memory:stats": "cd memory_service && python manage.py stats"
}
```

## Поток данных

### Сохранение памяти

```
User Message
     ↓
Dyad SQLite (messages table)
     ↓
memory_integration.ts (queueMessage)
     ↓
memory_bridge.ts (storeMemory)
     ↓
HTTP POST /api/memory/store
     ↓
Memory Service (memory_manager.py)
     ↓
SQLite (conversations, memories, facts)
```

### Поиск контекста

```
User Query
     ↓
memory_integration.ts (searchContext)
     ↓
memory_bridge.ts (searchMemory)
     ↓
HTTP POST /api/memory/search
     ↓
Memory Service (BM25 + TF-IDF search)
     ↓
Relevant memories returned
     ↓
Added to AI context
```

## Типы памяти

### Conversations
**Что**: Полная история всех сообщений
**Когда**: Сохраняется каждое сообщение
**Поиск**: По содержимому с BM25

### Memories (Episodic)
**Что**: Резюме разговоров
**Когда**: Создается при сохранении batch'а сообщений
**Поиск**: По содержимому с TF-IDF

### Facts
**Что**: Извлеченные факты
**Типы**: endpoint, api, bug, error, feature, database, etc.
**Когда**: Автоматически при сохранении
**Поиск**: По типу и содержимому

## Производительность

### Пакетная обработка
- Сообщения накапливаются в очереди
- Сохраняются batch'ами по 10 штук
- Или каждые 5 секунд

### Асинхронность
- Все операции async/await
- Не блокируют UI Dyad
- Обработка ошибок не влияет на основной функционал

### База данных
- SQLite с индексами
- Размер базы: ~30-50 KB на 100 сообщений
- Быстрый поиск даже на 10000+ сообщений

## Безопасность

### Локальное хранение
- Все данные на вашем ПК
- Нет облачных сервисов
- Полный контроль

### API ключи
- Хранятся в .env (не в git)
- Используются только Dyad
- Memory Service не требует ключей

### Порты
- Memory Service: 8002 (localhost only)
- Нет внешнего доступа

## Расширяемость

### Добавить новые типы фактов
В `memory_manager.py`:
```python
fact_indicators = [
    "endpoint", "api", "route",
    # Добавьте свои
    "component", "hook", "state"
]
```

### Изменить алгоритм поиска
В `memory_manager.py`:
```python
def _simple_score(self, query: str, text: str) -> float:
    # Ваш алгоритм
    pass
```

### Добавить векторные embeddings
1. Установите `sentence-transformers`
2. Модифицируйте `memory_manager.py`
3. Добавьте колонку `embedding` в таблицы

## Обслуживание

### Просмотр логов
```bash
# Memory Service
tail -f memory_service/logs/memory_service.log

# Dyad
# В Electron DevTools Console
```

### Бэкап базы данных
```bash
# Memory Service
cp memory_service/data/memory.db backups/memory-$(date +%Y%m%d).db

# Dyad
# База в user data directory (зависит от OS)
```

### Очистка данных
```bash
# Только Memory Service
cd memory_service
python manage.py clear

# Dyad база не затрагивается
```

## Troubleshooting

### Memory Service не запускается
1. Проверьте Python версию: `python --version` (нужна 3.10+)
2. Переустановите зависимости: `pip install -r requirements.txt`
3. Проверьте порт: `netstat -an | grep 8002`

### Dyad не сохраняет память
1. Проверьте доступность сервиса: `curl http://localhost:8002/health`
2. Проверьте логи в Electron DevTools
3. Проверьте `MEMORY_SERVICE_URL` в `.env`

### База данных повреждена
```bash
# Удалите и пересоздайте
rm memory_service/data/memory.db
# Перезапустите Memory Service - база создастся автоматически
```

## Развитие проекта

### Текущая версия: 1.0.0
✅ Базовая интеграция
✅ Автосохранение
✅ BM25/TF-IDF поиск
✅ Извлечение фактов
✅ SQLite хранилище

### Roadmap
- [ ] Vector embeddings (semantic search)
- [ ] OpenAI embeddings интеграция
- [ ] UI для просмотра памяти в Dyad
- [ ] Экспорт/импорт памяти
- [ ] Поддержка multiple проектов
- [ ] Автоматическая очистка старой памяти
- [ ] Compression для больших баз

## Лицензии

- **Dyad**: Apache 2.0
- **EverMemOS**: Apache 2.0  
- **Эта интеграция**: MIT
- **Зависимости**: Смотрите LICENSE файлы

---

**Версия документа**: 1.0.0  
**Дата**: 2026-01-25  
**Автор**: Dyad-full-mem Integration Team
