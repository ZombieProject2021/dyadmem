# PHP и MySQL настройка для Dyad

## Обзор

Dyad поддерживает интеграцию с PHP и MySQL для создания полнофункциональных веб-приложений. Этот документ описывает настройку и использование PHP/MySQL в проекте.

## Быстрый старт

### 1. Автоматическая настройка

Просто запустите проект через `Autorebuild.bat` - он автоматически проверит и исправит конфигурацию PHP:

```batch
Autorebuild.bat
```

Скрипт автоматически:
- ✅ Проверит наличие PHP
- ✅ Исправит неверные пути в php.ini
- ✅ Настроит расширения MySQL
- ✅ Запустит приложение

### 2. Ручная настройка PHP

Если нужна ручная настройка:

```batch
cd bin\php
setup-php.bat
```

## Структура PHP

```
bin/php/
├── php.exe              # PHP 7.1 исполняемый файл
├── php.ini              # Конфигурация PHP
├── setup-php.bat        # Скрипт автонастройки
├── README.md            # Документация PHP
├── ext/                 # Расширения PHP
│   ├── php_mysqli.dll   # MySQL Improved
│   ├── php_pdo_mysql.dll # PDO MySQL
│   └── php_mysql.dll    # MySQL (legacy)
└── *.dll                # Системные библиотеки
```

## Конфигурация php.ini

### Критические настройки

```ini
; Путь к расширениям (относительный!)
extension_dir = "ext"

; MySQL расширения (обязательно включены)
extension=php_mysqli.dll
extension=php_pdo_mysql.dll
extension=php_mysql.dll

; Другие полезные расширения
extension=php_curl.dll
extension=php_mbstring.dll
extension=php_openssl.dll
```

### ⚠️ Частые ошибки

❌ **Неправильно:**
```ini
extension_dir = "E:\vertrigo\php\ext"  # Абсолютный путь
```

✅ **Правильно:**
```ini
extension_dir = "ext"  # Относительный путь
```

## Работа с PHP сервером

Чтобы PHP-скрипты выполнялись, а не отображались как текст, Dyad теперь запускает **встроенный веб-сервер PHP** на порту `8000`.

### Как обращаться к PHP скриптам

Теперь вы должны обращаться к PHP файлам не через файловую систему, а через локальный URL:

- **Файл в корне:** `hello.php` → `http://localhost:8000/hello.php`
- **Файл в папке:** `api/test.php` → `http://localhost:8000/api/test.php`

### Пример запроса из React (fetch)

```typescript
const response = await fetch('http://localhost:8000/hello.php');
const data = await response.text();
console.log(data); // "Привет, мир из PHP!"
```

## Интеграция с MySQL

### Настройка подключения

В Dyad настройте MySQL через интерфейс или `.env`:

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

### Использование в коде

Dyad автоматически использует MySQL через `src/integrations/mysql/executor.ts`:

```typescript
import { executeSQLQuery } from '@/integrations/mysql/executor';

// Выполнить SQL запрос
const result = await executeSQLQuery(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);
```

### Создание таблиц через AI

Dyad может создавать таблицы через AI-команды:

```
Создай таблицу users с полями:
- id (автоинкремент)
- username (уникальный)
- email
- created_at
```

AI автоматически сгенерирует и выполнит SQL:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Системные промпты

### MySQL System Prompt

Dyad использует специальный промпт для работы с MySQL (`src/prompts/mysql_prompt.ts`):

- 📝 Читает `PROJECT_HISTORY.md` для понимания существующих таблиц
- 🔒 Никогда не удаляет существующие таблицы
- ➕ Создает только новые таблицы
- 📊 Автоматически создает API endpoints
- 🔄 Обновляет PROJECT_HISTORY.md после изменений

### Пример работы с памятью

```
1. AI читает PROJECT_HISTORY.md
   → Видит: users, posts таблицы существуют

2. Пользователь: "Добавь комментарии к постам"

3. AI создает ТОЛЬКО новую таблицу:
   CREATE TABLE comments (
     id INT AUTO_INCREMENT PRIMARY KEY,
     post_id INT NOT NULL,
     user_id INT NOT NULL,
     content TEXT,
     FOREIGN KEY (post_id) REFERENCES posts(id),
     FOREIGN KEY (user_id) REFERENCES users(id)
   );

4. AI обновляет PROJECT_HISTORY.md
   → Добавляет: comments таблица

5. Существующие таблицы НЕ ТРОГАЮТСЯ!
```

## Тестирование

### Проверка PHP

```batch
# Версия PHP
bin\php\php.exe -v

# Список расширений
bin\php\php.exe -m

# Проверка MySQL расширений
bin\php\php.exe -m | findstr mysql
```

Ожидаемый вывод:
```
mysqli
mysql
pdo_mysql
```

### Проверка MySQL подключения

```batch
# Через PHP CLI
bin\php\php.exe -r "echo mysqli_connect('localhost', 'root', 'password') ? 'OK' : 'FAIL';"
```

### Проверка через Dyad

1. Запустите Dyad
2. Откройте настройки MySQL
3. Введите данные подключения
4. Нажмите "Test Connection"

## Troubleshooting

### Проблема: "mysqli extension not loaded"

**Причина:** Расширение не включено в php.ini

**Решение:**
1. Откройте `bin\php\php.ini`
2. Найдите строку `;extension=php_mysqli.dll`
3. Уберите `;` в начале: `extension=php_mysqli.dll`
4. Перезапустите Dyad

### Проблема: "extension_dir not found"

**Причина:** Неверный путь к расширениям

**Решение:**
```batch
cd bin\php
setup-php.bat
```

Скрипт автоматически исправит пути.

### Проблема: "libmysql.dll not found"

**Причина:** Отсутствует MySQL клиентская библиотека

**Решение:**
- `libmysql.dll` должна быть в `bin\php\`
- Если отсутствует, скачайте MySQL Connector/C
- Или скопируйте из установки MySQL

### Проблема: Старые пути Vertrigo

**Причина:** php.ini содержит пути от старой установки

**Решение:**
```batch
# Автоматическое исправление
bin\php\setup-php.bat

# Или через Autorebuild.bat
Autorebuild.bat
```

## Архитектура интеграции

```
┌─────────────────────────────────────────┐
│           Dyad Application              │
│  (Electron + React + TypeScript)        │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    MySQL Integration Layer              │
│  src/integrations/mysql/executor.ts     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         PHP Runtime                     │
│      bin/php/php.exe                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       MySQL Server                      │
│    (localhost:3306 или удаленный)       │
└─────────────────────────────────────────┘
```

## Workflow разработки

### 1. Создание новой фичи с БД

```
Пользователь → Dyad AI:
"Создай систему блога с постами и комментариями"

AI:
1. Читает PROJECT_HISTORY.md
2. Создает таблицы: posts, comments
3. Создает API: /api/posts, /api/comments
4. Создает компоненты: PostList, CommentForm
5. Обновляет PROJECT_HISTORY.md
```

### 2. Расширение существующей фичи

```
Пользователь → Dyad AI:
"Добавь лайки к постам"

AI:
1. Читает PROJECT_HISTORY.md
2. Видит: posts таблица существует ✓
3. Создает ТОЛЬКО: likes таблица
4. Создает API: /api/posts/[id]/like
5. Обновляет PROJECT_HISTORY.md
6. НЕ ТРОГАЕТ posts таблицу!
```

## Лучшие практики

### ✅ DO

- ✅ Используйте `Autorebuild.bat` для запуска
- ✅ Проверяйте php.ini после обновления PHP
- ✅ Создавайте PROJECT_HISTORY.md для отслеживания схемы БД
- ✅ Используйте относительные пути в php.ini
- ✅ Тестируйте MySQL подключение перед началом работы

### ❌ DON'T

- ❌ Не используйте абсолютные пути в php.ini
- ❌ Не удаляйте libmysql.dll
- ❌ Не отключайте mysqli расширение
- ❌ Не забывайте обновлять PROJECT_HISTORY.md
- ❌ Не модифицируйте существующие таблицы без резервной копии

## Дополнительные ресурсы

- [PHP Documentation](https://www.php.net/docs.php)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Dyad GitHub](https://github.com/dyad-sh/dyad)
- `bin/php/README.md` - Детальная документация PHP
- `src/prompts/mysql_prompt.ts` - AI промпт для MySQL

## Поддержка

Если возникли проблемы:

1. Запустите `bin\php\setup-php.bat`
2. Проверьте `bin\php\README.md`
3. Проверьте этот документ
4. Создайте issue на GitHub

---

**Версия документа:** 1.0  
**Последнее обновление:** 2026-01-24  
**PHP версия:** 7.1.26  
**Dyad версия:** 0.33.0
