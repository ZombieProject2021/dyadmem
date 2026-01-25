# 📥 Импорт старой истории Dyad в Memory Service

## Зачем это нужно?

Если у вас уже есть проекты в обычном Dyad (без интеграции памяти), вы можете импортировать всю историю чатов в Memory Service. После импорта:

✅ Все старые разговоры будут доступны через поиск
✅ AI сможет использовать контекст из старых чатов
✅ Факты будут автоматически извлечены из старой истории
✅ Память будет работать для всех проектов (старых и новых)

## 🔍 Где находится база данных Dyad?

### Windows
```
C:\Users\<YourUsername>\AppData\Roaming\dyad\sqlite.db
```

### Linux
```
~/.config/dyad/sqlite.db
```

### macOS
```
~/Library/Application Support/dyad/sqlite.db
```

## 📋 Как импортировать

### Шаг 1: Найдите базу данных Dyad

**Windows:**
```cmd
dir %APPDATA%\dyad\sqlite.db
```

**Linux/Mac:**
```bash
ls ~/.config/dyad/sqlite.db  # Linux
ls ~/Library/Application\ Support/dyad/sqlite.db  # Mac
```

### Шаг 2: Запустите импорт

**Windows:**
```cmd
cd memory_service
python import_history.py "C:\Users\YourName\AppData\Roaming\dyad\sqlite.db"
```

**Linux:**
```bash
cd memory_service
python import_history.py ~/.config/dyad/sqlite.db
```

**macOS:**
```bash
cd memory_service
python import_history.py ~/Library/Application\ Support/dyad/sqlite.db
```

### Шаг 3: Дождитесь завершения

Скрипт покажет прогресс:

```
============================================================
  DYAD CHAT HISTORY IMPORTER
============================================================

🚀 Initializing Memory Service...
✅ Memory Service ready

📂 Opening Dyad database: /path/to/sqlite.db

📊 Found 5 apps

🔍 Processing app: My Project (ID: 1)
   Found 3 chats
   💬 Importing chat: Feature development (45 messages)
      ✅ Imported 45 messages
   💬 Importing chat: Bug fixes (23 messages)
      ✅ Imported 23 messages

...

============================================================
📊 Import Summary:
   Apps processed: 5
   Chats imported: 15
   Messages imported: 342
============================================================

✅ Import completed!
```

## 🔍 Проверка импорта

После импорта проверьте статистику:

```bash
cd memory_service
python manage.py stats
```

Должно показать:

```
📊 Memory Service Statistics:
   Sessions: 15
   Conversations: 342
   Memories: 45
   Facts: 127
   Database: 245.50 KB
```

## 🧪 Тестирование

Проверьте поиск:

```python
import requests

# Поиск по старой истории
response = requests.post("http://localhost:8002/api/memory/search", json={
    "session_id": "chat-1",  # ID вашего старого чата
    "query": "What API endpoints did I create?",
    "limit": 10
})

print(response.json())
```

## ⚙️ Что происходит при импорте?

1. **Чтение базы Dyad**: Скрипт читает все приложения, чаты и сообщения
2. **Сохранение в Memory Service**: Каждое сообщение сохраняется с метаданными
3. **Извлечение фактов**: Автоматически извлекаются:
   - API endpoints
   - Функции и классы
   - Баги и ошибки
   - Фичи и задачи
4. **Создание резюме**: Для каждого чата создается эпизодическое резюме

## 📊 Формат импорта

Каждое сообщение импортируется с метаданными:

```json
{
  "role": "user",
  "content": "Create a new API endpoint /api/users",
  "timestamp": "2025-01-20T10:30:00",
  "metadata": {
    "original_message_id": 123,
    "imported": true,
    "app_name": "My Project",
    "chat_title": "Feature development"
  }
}
```

## 🔄 Повторный импорт

Если запустить импорт повторно, сообщения будут добавлены еще раз. Чтобы избежать дублирования:

1. **Перед повторным импортом очистите базу:**
   ```bash
   python manage.py clear
   ```

2. **Или используйте другую базу Memory Service**

## 🎯 Сценарии использования

### Сценарий 1: Переход с обычного Dyad

1. Установите Dyad-full-mem
2. Импортируйте старую историю
3. Продолжайте работу - теперь с памятью!

### Сценарий 2: Объединение нескольких баз

Если у вас несколько установок Dyad:

```bash
# Импортировать из первой базы
python import_history.py /path/to/dyad1/sqlite.db

# Импортировать из второй базы
python import_history.py /path/to/dyad2/sqlite.db
```

Все будет объединено в одну базу памяти!

### Сценарий 3: Бэкап и восстановление

```bash
# 1. Экспортируйте память
cp memory_service/data/memory.db backups/memory-backup.db

# 2. Очистите и реимпортируйте
python manage.py clear
python import_history.py /path/to/dyad/sqlite.db
```

## ⚠️ Важные замечания

### Производительность
- Импорт 1000 сообщений: ~30 секунд
- Импорт 10000 сообщений: ~5 минут
- База данных растет: ~100KB на 1000 сообщений

### Безопасность
- Оригинальная база Dyad НЕ изменяется
- Импорт только читает данные
- Можно безопасно повторять

### Совместимость
- Работает с Dyad v0.12+
- Автоматически обрабатывает разные форматы timestamp
- Пропускает пустые чаты

## 🐛 Troubleshooting

### Ошибка "Database not found"

Проверьте путь:
```bash
# Windows
echo %APPDATA%\dyad

# Linux/Mac
echo ~/.config/dyad
```

### Ошибка "Database is locked"

Закройте Dyad перед импортом:
```bash
# Linux/Mac
killall dyad

# Windows
taskkill /IM dyad.exe /F
```

### Ошибка при импорте определенного чата

Скрипт пропустит проблемный чат и продолжит:
```
❌ Error importing chat 15: ...
```

Проверьте логи для деталей.

### Слишком долгий импорт

Для очень больших баз (>50000 сообщений):
1. Импортируйте по частям (по приложениям)
2. Увеличьте batch size в коде
3. Используйте SSD диск

## 📈 После импорта

### Проверьте статистику
```bash
python manage.py stats
```

### Проверьте поиск
```bash
python test_service.py
```

### Проверьте в Dyad
1. Откройте старый проект
2. Начните новый чат
3. Спросите: "What have we discussed before?"
4. AI должен вспомнить старые разговоры!

## 💡 Tips

✅ **Do:**
- Сделайте бэкап перед импортом
- Импортируйте когда Memory Service запущен
- Проверьте результаты после импорта

❌ **Don't:**
- Не импортируйте во время работы с чатом
- Не удаляйте оригинальную базу Dyad
- Не импортируйте одни и те же данные повторно

## 🎉 Готово!

После импорта все старые проекты будут иметь полную память!

**Проверьте:**
```bash
# Статистика
python manage.py stats

# Поиск
curl -X POST http://localhost:8002/api/memory/search \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "chat-1",
    "query": "what did we build?",
    "limit": 5
  }'
```

---

**Нужна помощь?** Посмотрите логи в `memory_service/logs/`
