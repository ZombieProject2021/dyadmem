# PHP Configuration Changes - Summary

## Дата: 2026-01-24

## Проблема

В проекте Dyad была неправильная конфигурация PHP:
- В `bin/php/php.ini` были абсолютные пути от старой установки Vertrigo
- `extension_dir="E:\vertrigo\php\ext"` - неверный путь
- `include_path=".;E:\vertrigo\Smarty"` - неверный путь
- `zend_extension="E:\vertrigo\php\ext\php_xdebug-2.6.1-7.1-vc14.dll"` - неверный путь

Это приводило к тому, что PHP не мог найти расширения MySQL и другие модули.

## Решение

### 1. Исправлен php.ini

**Файл:** `bin/php/php.ini`

**Изменения (строки 838-840):**

```ini
# Было:
include_path=".;E:\vertrigo\Smarty"
extension_dir="E:\vertrigo\php\ext"
zend_extension="E:\vertrigo\php\ext\php_xdebug-2.6.1-7.1-vc14.dll"

# Стало:
; Fixed paths for local PHP installation
extension_dir = "ext"
;zend_extension = "ext/php_xdebug-2.6.1-7.1-vc14.dll"
```

**Результат:** PHP теперь использует относительные пути и корректно находит расширения.

### 2. Создан скрипт автоматической настройки

**Файл:** `bin/php/setup-php.bat`

**Функции:**
- ✅ Автоматически проверяет php.ini на наличие старых путей
- ✅ Исправляет extension_dir на относительный путь
- ✅ Удаляет старые include_path
- ✅ Комментирует неверные zend_extension
- ✅ Тестирует PHP executable
- ✅ Проверяет загрузку MySQL расширений

**Использование:**
```batch
cd bin\php
setup-php.bat
```

### 3. Обновлен Autorebuild.bat

**Файл:** `Autorebuild.bat`

**Добавлено:**
- Автоматическая проверка PHP конфигурации при запуске
- Если найдены старые пути - автоматически запускается setup-php.bat
- Информирование пользователя о статусе PHP

**Теперь при запуске:**
```
✓ Settings.json обновлен
✓ API Key: AIzaSyARnabZJqNw-rYTqfIs2-Xg2GCYi_elsh0

Проверка PHP конфигурации...
✓ PHP конфигурация корректна

Запускаю приложение...
```

### 4. Созданы тестовые скрипты

#### test-config.php
**Файл:** `bin/php/test-config.php`

Проверяет:
- PHP версию и архитектуру
- Загрузку php.ini
- MySQL расширения (mysqli, pdo_mysql, mysql)
- Другие важные расширения
- Наличие проблем в конфигурации

**Использование:**
```batch
bin\php\php.exe bin\php\test-config.php
```

#### test-mysql.php
**Файл:** `bin/php/test-mysql.php`

Проверяет:
- Наличие mysqli расширения
- Подключение к MySQL серверу
- Информацию о сервере
- Выбор базы данных
- Список таблиц

**Использование:**
```batch
bin\php\php.exe bin\php\test-mysql.php localhost root password database 3306
```

#### test-all.bat
**Файл:** `bin/php/test-all.bat`

Интерактивный скрипт:
- Запускает test-config.php
- Предлагает протестировать MySQL
- Запрашивает параметры подключения
- Выводит результаты всех тестов

**Использование:**
```batch
bin\php\test-all.bat
```

### 5. Создана документация

#### bin/php/README.md
Подробная документация по:
- Быстрой настройке PHP
- Ручной конфигурации
- Тестированию
- Структуре директорий
- Troubleshooting
- Интеграции с Dyad

#### docs/PHP_MYSQL_SETUP.md
Полное руководство по:
- Настройке PHP и MySQL
- Интеграции с Dyad
- Использованию AI для работы с БД
- Системным промптам
- Workflow разработки
- Лучшим практикам

## Структура изменений

```
/
├── Autorebuild.bat                    [ИЗМЕНЕН] - добавлена проверка PHP
├── bin/php/
│   ├── php.ini                        [ИСПРАВЛЕН] - убраны старые пути
│   ├── setup-php.bat                  [СОЗДАН] - автонастройка
│   ├── test-config.php                [СОЗДАН] - тест конфигурации
│   ├── test-mysql.php                 [СОЗДАН] - тест MySQL
│   ├── test-all.bat                   [СОЗДАН] - комплексный тест
│   └── README.md                      [СОЗДАН] - документация PHP
├── docs/
│   └── PHP_MYSQL_SETUP.md             [СОЗДАН] - полное руководство
└── PHP_CONFIGURATION_CHANGES.md       [СОЗДАН] - этот файл
```

## Как использовать

### Вариант 1: Автоматический (рекомендуется)

Просто запустите проект как обычно:
```batch
Autorebuild.bat
```

Скрипт автоматически проверит и исправит PHP конфигурацию.

### Вариант 2: Ручная настройка

Если нужно настроить PHP отдельно:
```batch
cd bin\php
setup-php.bat
```

### Вариант 3: Тестирование

Проверить, что всё работает:
```batch
cd bin\php
test-all.bat
```

## Проверка результата

После настройки проверьте:

1. **PHP работает:**
   ```batch
   bin\php\php.exe -v
   ```
   Должно показать: `PHP 7.1.26`

2. **MySQL расширения загружены:**
   ```batch
   bin\php\php.exe -m | findstr mysql
   ```
   Должно показать:
   ```
   mysqli
   mysql
   pdo_mysql
   ```

3. **Конфигурация корректна:**
   ```batch
   bin\php\php.exe bin\php\test-config.php
   ```
   Должно показать: `✓ No configuration issues found!`

## Что было исправлено

### ✅ Исправлено
- ✅ extension_dir теперь использует относительный путь
- ✅ Удалены старые пути Vertrigo
- ✅ PHP корректно находит расширения
- ✅ MySQL расширения работают
- ✅ Автоматическая проверка при запуске
- ✅ Полная документация
- ✅ **Встроенный PHP сервер** - теперь PHP скрипты выполняются автоматически

### 📝 Создано
- 📝 run-php-server.bat - запуск встроенного сервера
- 📝 setup-php.bat - автонастройка
- 📝 test-config.php - тест конфигурации
- 📝 test-mysql.php - тест MySQL
- 📝 test-all.bat - комплексный тест
- 📝 bin/php/README.md - документация PHP
- 📝 docs/PHP_MYSQL_SETUP.md - полное руководство

### 🔧 Обновлено
- 🔧 Autorebuild.bat - добавлена проверка PHP
- 🔧 php.ini - исправлены пути

## Технические детали

### PHP версия
- **Версия:** PHP 7.1.26
- **Архитектура:** x64 (Windows)
- **Thread Safety:** Enabled
- **Компилятор:** MSVC14

### MySQL расширения
- **mysqli** - MySQL Improved Extension
- **pdo_mysql** - PDO Driver for MySQL
- **mysql** - MySQL Extension (legacy)

### Важные файлы
- `php.exe` - PHP исполняемый файл
- `php.ini` - Конфигурация PHP
- `php7ts.dll` - PHP core library
- `libmysql.dll` - MySQL client library
- `ext/*.dll` - PHP расширения

## Troubleshooting

### Проблема: "mysqli extension not loaded"
**Решение:** Запустите `bin\php\setup-php.bat`

### Проблема: "extension_dir not found"
**Решение:** Запустите `bin\php\setup-php.bat`

### Проблема: Старые пути в php.ini
**Решение:** Запустите `Autorebuild.bat` или `bin\php\setup-php.bat`

## Дополнительная информация

Для подробной информации см.:
- `bin/php/README.md` - Документация PHP
- `docs/PHP_MYSQL_SETUP.md` - Полное руководство по PHP и MySQL

## Автор изменений

**Manus AI Agent**  
**Дата:** 2026-01-24  
**Версия Dyad:** 0.33.0
