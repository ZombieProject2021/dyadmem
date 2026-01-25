# 🚀 Быстрый старт - Dyad с бесконечной памятью

## Минимальная установка (5 минут)

### Шаг 1: Установите зависимости

```bash
# Python зависимости для Memory Service
cd memory_service
pip install -r requirements.txt
cd ..

# Node.js зависимости для Dyad (это может занять 5-10 минут)
cd dyad
npm install
cd ..
```

### Шаг 2: Настройте API ключи

Создайте файл `dyad/.env`:

```env
OPENAI_API_KEY=your-openai-api-key-here
MEMORY_SERVICE_URL=http://localhost:8002
```

### Шаг 3: Запуск (Windows)

Просто двойной клик на `start.bat`!

Или в командной строке:

```cmd
start.bat
```

## Что происходит при запуске?

1. ✅ Проверка Python и Node.js
2. ✅ Установка зависимостей (если нужно)
3. 🚀 Запуск Memory Service (порт 8002)
4. 🚀 Запуск Dyad

## Проверка работы

### Memory Service

Откройте браузер: http://localhost:8002/health

Должно показать:
```json
{
  "status": "healthy",
  "timestamp": "2025-..."
}
```

### Dyad

Приложение откроется автоматически.

## Тестирование памяти

```bash
cd memory_service
python test_service.py
```

Это запустит тесты:
- ✅ Health Check
- ✅ Store Memory
- ✅ Search Memory
- ✅ Get Stats

## Просмотр статистики

```bash
cd memory_service
python manage.py stats
```

Покажет:
```
📊 Memory Service Statistics:
   Sessions: 5
   Conversations: 150
   Memories: 45
   Facts: 78
   Database: data/memory.db
   Size: 245.50 KB
```

## Остановка

Закройте окна:
- Memory Service
- Dyad

Или нажмите Ctrl+C в каждом окне.

## Проблемы?

### Memory Service не запускается

```bash
cd memory_service
python --version  # Должна быть 3.10+
pip install --upgrade pip
pip install -r requirements.txt
python server.py
```

### Dyad не запускается

```bash
cd dyad
node --version  # Должна быть 20+
npm install
npm start
```

### Порт 8002 занят

Измените порт в `memory_service/server.py`:

```python
port = int(os.getenv("MEMORY_SERVICE_PORT", "8003"))  # Поменяйте на 8003
```

И в `dyad/.env`:
```env
MEMORY_SERVICE_URL=http://localhost:8003
```

## Полная документация

- [README.md](README.md) - Полное описание
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Руководство по интеграции
- [memory_service/](memory_service/) - API документация

## Дальше

После запуска:

1. Создайте новый проект в Dyad
2. Начните чат с AI
3. Все сообщения автоматически сохраняются в память
4. AI будет помнить контекст даже через месяцы!

**Наслаждайтесь бесконечной памятью! 🎉**
