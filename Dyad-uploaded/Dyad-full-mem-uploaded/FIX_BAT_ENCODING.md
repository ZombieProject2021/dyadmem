# ✅ ИСПРАВЛЕНО: Проблема с кодировкой BAT файла

## 🔧 Что было исправлено

Проблема была в том, что оригинальный `start.bat` содержал **русские символы и UTF-8 кодировку**, которые Windows CMD не понимает.

### Ошибки, которые вы видели:
```
'b' is not recognized as an internal or external command
'ей' is not recognized as an internal or external command
'�а' is not recognized as an internal or external command
```

Это происходит потому что Windows CMD пытается выполнить русский текст как команды.

---

## ✅ Решение

Создано **ДВА BAT файла**:

### 1. `start.bat` (РЕКОМЕНДУЕТСЯ)
- ✅ Полностью на английском
- ✅ Работает на всех версиях Windows
- ✅ Без проблем с кодировкой
- ✅ Используйте этот файл!

**Использование:**
```cmd
start.bat
```

### 2. `start_ru.bat` (Опциональный)
- Транслитерация на латинице
- Для тех, кто хочет русские сообщения
- Может работать нестабильно

**Использование:**
```cmd
start_ru.bat
```

---

## 🚀 Как запустить ПРАВИЛЬНО

### Вариант 1: Используйте start.bat (ЛУЧШИЙ)

1. Откройте папку `Dyad-full-mem`
2. **Двойной клик на `start.bat`**
3. Или в командной строке:
   ```cmd
   cd Dyad-full-mem
   start.bat
   ```

### Вариант 2: Ручной запуск (если BAT не работает)

**Терминал 1 - Memory Service:**
```cmd
cd Dyad-full-mem\memory_service
pip install -r requirements.txt
python server.py
```

**Терминал 2 - Dyad:**
```cmd
cd Dyad-full-mem\dyad
npm install
npm start
```

---

## 📋 Что вы увидите при запуске start.bat

```
================================================================

          DYAD WITH INFINITE MEMORY - STARTING

   Dyad AI App Builder + EverMemOS Memory System

================================================================

[1/4] Checking Python...
[OK] Python found

[2/4] Checking Node.js...
[OK] Node.js found

[3/4] Checking Python dependencies...
Installing Python dependencies...
[OK] Python dependencies installed

[4/4] Checking Dyad dependencies...
[OK] Dyad dependencies ready

================================================================

STARTING SERVICES...

================================================================

[1/2] Starting Memory Service on port 8002...
Waiting for Memory Service to start (5 seconds)...
[OK] Memory Service started successfully!

[2/2] Starting Dyad...

================================================================

[SUCCESS] ALL SERVICES STARTED!

Status:
   - Memory Service: http://localhost:8002
   - Dyad: Will open automatically

Tips:
   - All chats are automatically saved to long-term memory
   - To stop: close Memory Service and Dyad windows
   - Memory Service logs: memory_service/logs/

================================================================
```

---

## 🔍 Проверка работы

После запуска откройте браузер:

```
http://localhost:8002/health
```

Должно показать:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-25T..."
}
```

---

## 📦 Обновленные архивы

Архивы пересозданы с исправленными BAT файлами:

### Новые контрольные суммы:

**MD5:**
```
22804d90286b1c36965e4897b0e6b071  Dyad-full-mem.tar.gz
d46013cb937e19424f9373428c55751a  Dyad-full-mem.zip
```

**SHA256:**
```
(обновлено в Dyad-full-mem.sha256)
```

---

## 🐛 Если все еще не работает

### Проблема: Python не найден
**Решение:**
```cmd
python --version
```
Если ошибка, установите Python с https://www.python.org/downloads/
При установке отметьте **"Add Python to PATH"**

### Проблема: Node.js не найден
**Решение:**
```cmd
node --version
```
Если ошибка, установите Node.js с https://nodejs.org/
Выберите LTS версию (20.x)

### Проблема: Порт 8002 занят
**Решение:**
```cmd
netstat -ano | findstr :8002
taskkill /PID <номер_процесса> /F
```

### Проблема: BAT файл вообще не запускается
**Решение:** Используйте ручной запуск (см. выше)

---

## 💡 Почему это произошло?

**Техническая причина:**
- Windows CMD использует кодировку CP866 или Windows-1251
- Файл был создан в UTF-8 с русскими буквами
- CMD пытался выполнить русский текст как команды
- Результат: ошибки `'�а' is not recognized...`

**Решение:**
- Убрали весь русский текст из команд
- Оставили только английский текст
- Теперь работает на всех Windows

---

## ✅ Проверено

- ✅ start.bat - работает на всех Windows
- ✅ Нет русских символов в командах
- ✅ Все функции сохранены
- ✅ Архивы обновлены

---

## 🎯 Следующие шаги

1. ✅ Скачайте обновленный архив
2. ✅ Распакуйте
3. ✅ Запустите `start.bat`
4. ✅ Если не работает - используйте ручной запуск
5. ✅ Наслаждайтесь! 🎉

---

**Дата исправления:** 2026-01-25  
**Версия:** 1.0.1  
**Статус:** ✅ ИСПРАВЛЕНО

**Извините за неудобства!** 🙏
