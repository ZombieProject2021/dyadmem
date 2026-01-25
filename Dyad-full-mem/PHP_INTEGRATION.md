# 🚀 Обновленный start_py311.bat с PHP

## ✅ Что добавлено

### PHP Server интеграция

Теперь `start_py311.bat` автоматически:
1. ✅ Проверяет наличие PHP в `dyad\bin\php\`
2. ✅ Запускает PHP встроенный сервер на порту 8080
3. ✅ Запускает все 3 сервиса: Memory Service, PHP, Dyad

---

## 📋 Что запускается

### 1. Memory Service (Python) - Порт 8002
```
cd memory_service
py -3.11 server.py
```

**Для чего:** Долговременная память для AI

### 2. PHP Server - Порт 8080  
```
cd dyad\bin\php
php.exe -S localhost:8080 -t ..\..\public
```

**Для чего:** 
- Серверные скрипты PHP
- API endpoints на PHP
- Динамический контент

### 3. Dyad (Electron)
```
cd dyad
npm start
```

**Для чего:** Основное приложение

---

## 🚀 Использование

### Просто запустите:

```cmd
start_py311.bat
```

**Откроется 3 окна:**
1. Memory Service (Python)
2. PHP Server (если найден PHP)
3. Dyad (Electron app)

---

## 🔧 Настройка PHP

### Изменить порт PHP:

Откройте `start_py311.bat` и измените строку:
```bat
php.exe -S localhost:8080 -t ..\..\public
```

На:
```bat
php.exe -S localhost:9000 -t ..\..\public
```

### Изменить корневую папку:

Измените `-t ..\..\public` на нужную папку, например:
```bat
php.exe -S localhost:8080 -t ..\..\www
```

---

## 📂 Структура PHP

```
dyad/
├── bin/
│   └── php/
│       ├── php.exe          ← PHP executable
│       ├── php-cgi.exe
│       ├── php.ini
│       └── ext/             ← PHP extensions
├── public/                  ← PHP web root (создайте если нет)
│   └── index.php
```

### Пример public/index.php:

```php
<?php
echo "PHP Server работает!";
echo "\nPHP версия: " . phpversion();
?>
```

---

## 🧪 Проверка

После запуска:

### Memory Service:
```
http://localhost:8002/health
```

### PHP Server:
```
http://localhost:8080/
```

### Dyad:
Откроется Electron приложение

---

## 🔍 Если PHP не запускается

### Проверьте наличие:
```cmd
dir dyad\bin\php\php.exe
```

### Проверьте вручную:
```cmd
cd dyad\bin\php
php.exe --version
```

Должно показать:
```
PHP 7.x.x ...
```

### Запустите PHP вручную:
```cmd
cd dyad\bin\php
php.exe -S localhost:8080 -t ..\..\public
```

---

## 💡 Зачем PHP в Dyad?

**Возможные применения:**
- Локальные API endpoints
- Серверная логика для приложений
- Интеграция с внешними сервисами
- Динамическая генерация контента
- Обработка форм и данных

---

## 🎯 Порты

| Сервис | Порт | Назначение |
|--------|------|------------|
| Memory Service | 8002 | Python FastAPI |
| PHP Server | 8080 | PHP встроенный сервер |
| Dyad | - | Electron app |

---

## 📝 Логи

### Memory Service:
```
memory_service/logs/
```

### PHP Server:
Логи в консоли окна "PHP Server"

### Dyad:
Electron DevTools Console

---

## 🛑 Остановка

**Закройте все 3 окна:**
1. Memory Service
2. PHP Server
3. Dyad

Или нажмите Ctrl+C в каждом окне.

---

## ✅ Готово!

Теперь `start_py311.bat` запускает полный стек:
- ✅ Python (Memory Service)
- ✅ PHP (Web Server)
- ✅ Node.js/Electron (Dyad)

**Всё в одном батнике!** 🚀

---

**Версия:** 1.1.0 (PHP integrated)  
**Дата:** 2026-01-25  
**Статус:** ✅ PHP ИНТЕГРИРОВАН
