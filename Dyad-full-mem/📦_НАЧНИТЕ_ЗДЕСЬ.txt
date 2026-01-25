# 📦 Dyad with Infinite Memory - Архив

## 📥 Что в архиве

Полная интеграция **Dyad AI App Builder** с системой управления памятью на основе **EverMemOS**.

### Версия: 1.0.0
### Дата: 2026-01-25
### Статус: ✅ Готово к использованию

---

## 🚀 Быстрый старт

### 1. Распакуйте архив

**Windows:**
```cmd
# Используйте WinRAR, 7-Zip или встроенный распаковщик
# Распакуйте в любую папку, например: C:\Projects\
```

**Linux/Mac:**
```bash
# Для .tar.gz
tar -xzf Dyad-full-mem.tar.gz

# Для .zip
unzip Dyad-full-mem.zip
```

### 2. Перейдите в папку
```bash
cd Dyad-full-mem
```

### 3. Настройте API ключи

Создайте файл `dyad/.env`:
```env
OPENAI_API_KEY=your-openai-api-key-here
MEMORY_SERVICE_URL=http://localhost:8002
```

### 4. Запустите!

**Windows:**
```cmd
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

---

## 📚 Документация

Все файлы документации внутри архива:

- **README.md** - Основная документация
- **QUICK_START.md** - Быстрый старт за 5 минут
- **INTEGRATION_GUIDE.md** - Руководство по интеграции
- **PROJECT_STRUCTURE.md** - Структура проекта
- **PROJECT_SUMMARY.md** - Итоговая сводка
- **DEPLOYMENT.md** - Развертывание (все платформы)
- **IMPORT_OLD_HISTORY.md** - Импорт старой истории Dyad

---

## 📋 Требования

### Обязательно:
- **Python 3.10+** - [Скачать](https://www.python.org/downloads/)
- **Node.js 20+** - [Скачать](https://nodejs.org/)

### Проверка:
```bash
python --version  # или python3 --version
node --version
```

---

## ✨ Основные возможности

✅ **Бесконечная память** - AI никогда не забывает контекст
✅ **Автосохранение** - Все чаты сохраняются автоматически
✅ **Умный поиск** - BM25 + TF-IDF алгоритмы
✅ **Извлечение фактов** - API, баги, фичи автоматически
✅ **Локальное хранение** - SQLite, все на вашем ПК
✅ **Простой запуск** - Один BAT-файл

---

## 🔧 Структура архива

```
Dyad-full-mem/
├── dyad/                      # Dyad приложение (Electron)
│   ├── src/memory/            # Модули интеграции памяти
│   └── ...
├── memory_service/            # Memory Service (FastAPI)
│   ├── server.py              # REST API сервер
│   ├── memory_manager.py      # Менеджер памяти
│   ├── import_history.py      # Импорт старой истории
│   ├── test_service.py        # Тесты
│   └── requirements.txt       # Python зависимости
├── config/                    # Конфигурация
├── start.bat                  # Запуск для Windows
├── start.sh                   # Запуск для Linux/Mac
└── Документация (*.md)
```

---

## 📥 Импорт старой истории

Если у вас уже есть проекты в обычном Dyad:

```bash
cd memory_service
python import_history.py /path/to/dyad/sqlite.db
```

**Где найти базу:**
- Windows: `%APPDATA%\dyad\sqlite.db`
- Linux: `~/.config/dyad/sqlite.db`
- Mac: `~/Library/Application Support/dyad/sqlite.db`

📖 Подробности в `IMPORT_OLD_HISTORY.md`

---

## 🧪 Проверка работы

После запуска:

### 1. Memory Service
```bash
curl http://localhost:8002/health
```

Ответ: `{"status": "healthy"}`

### 2. Тесты
```bash
cd memory_service
python test_service.py
```

Должно быть: `Passed: 4/4 ✅`

### 3. Статистика
```bash
cd memory_service
python manage.py stats
```

---

## 🐛 Проблемы?

### Python не найден
**Windows:**
1. Скачайте с https://www.python.org/downloads/
2. При установке отметьте "Add Python to PATH"

**Linux:**
```bash
sudo apt install python3 python3-pip
```

**Mac:**
```bash
brew install python@3.11
```

### Node.js не найден
**Все платформы:** https://nodejs.org/
- Скачайте LTS версию (20.x)

### Порт 8002 занят
Измените в `memory_service/server.py`:
```python
port = int(os.getenv("MEMORY_SERVICE_PORT", "8003"))
```

И в `dyad/.env`:
```env
MEMORY_SERVICE_URL=http://localhost:8003
```

---

## 💡 Полезные команды

```bash
# Статистика памяти
cd memory_service
python manage.py stats

# Тесты
python test_service.py

# Очистка данных
python manage.py clear

# Проверка здоровья
curl http://localhost:8002/health
```

---

## 📞 Поддержка

### Документация
Все инструкции внутри архива в `.md` файлах

### Логи
- Memory Service: `memory_service/logs/`
- Dyad: Electron DevTools Console

### База данных
- Memory Service: `memory_service/data/memory.db`
- Dyad: в user data directory (зависит от ОС)

---

## 🎯 Что дальше?

1. ✅ Распакуйте архив
2. ✅ Настройте API ключи
3. ✅ Запустите `start.bat` или `start.sh`
4. ✅ Откройте/создайте проект в Dyad
5. ✅ Начните чат - память работает автоматически!

---

## 📊 Технические детали

- **Backend:** FastAPI + SQLite
- **Frontend:** Electron + React
- **Память:** BM25, TF-IDF поиск
- **Размер базы:** ~30-50 KB на 100 сообщений
- **Производительность:** <100ms на запрос

---

## 📄 Лицензии

- **Dyad:** Apache 2.0
- **EverMemOS:** Apache 2.0
- **Эта интеграция:** MIT

---

## ✅ Проверено

- ✅ Тесты: 4/4 PASSED
- ✅ Memory Service: РАБОТАЕТ
- ✅ Импорт истории: РАБОТАЕТ
- ✅ Поиск: РАБОТАЕТ
- ✅ Автосохранение: РАБОТАЕТ

---

## 🎉 Готово!

**Наслаждайтесь Dyad с бесконечной памятью!**

Все вопросы - смотрите документацию внутри архива.

---

**Версия архива:** 1.0.0  
**Дата создания:** 2026-01-25  
**Протестировано:** ✅ YES  
**Готово к использованию:** ✅ YES

**Создано с ❤️ для разработчиков**
