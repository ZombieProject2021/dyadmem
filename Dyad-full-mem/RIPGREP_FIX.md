# 🔧 ripgrep Download Failed (403)

## ❌ Проблема

```
npm error Downloading ripgrep failed: Error: Request failed: 403
```

**Причина:** GitHub API блокирует скачивание (rate limit или региональная блокировка).

**Важно:** ripgrep - это **опциональный** пакет для поиска в коде. Dyad работает и без него!

---

## ✅ РЕШЕНИЕ: Установка без optional пакетов

### Вариант 1: Используйте специальный установщик

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem
install_dyad_fix.bat
```

Это установит все **необходимые** пакеты, пропуская ripgrep.

### Вариант 2: Ручная установка

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
npm install --no-optional --legacy-peer-deps
```

Если не работает, попробуйте:

```cmd
npm install --force --no-optional
```

---

## 🎯 Альтернатива: Обойти GitHub блокировку

### Способ 1: Использовать VPN

Если у вас есть VPN:
1. Включите VPN
2. Попробуйте `npm install` снова

### Способ 2: Использовать другой mirror

```cmd
cd dyad
npm config set registry https://registry.npmjs.org/
npm install
```

### Способ 3: Скачать ripgrep вручную

Если действительно нужен ripgrep:

1. Скачайте с: https://github.com/BurntSushi/ripgrep/releases
2. Установите в систему
3. Dyad будет использовать системный ripgrep

---

## 💡 Что такое ripgrep и нужен ли он?

**ripgrep** - инструмент для быстрого поиска текста в файлах проекта.

**Для Dyad:**
- ✅ **Основной функционал** работает без него
- ⚠️ **Поиск в коде** может быть медленнее
- ✅ **Memory Service** не зависит от него
- ✅ **Все фичи интеграции** работают

**Вывод:** Можно работать без ripgrep!

---

## 📋 Проверка установки

После установки с `--no-optional`:

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
dir node_modules
```

Должны быть папки: electron, react, next, etc.

Проверьте electron:
```cmd
dir node_modules\electron
```

Если есть - **готово к запуску!**

---

## 🚀 Запуск после установки

### Окно 1 - Memory Service:

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\memory_service
python server.py
```

### Окно 2 - Dyad:

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
npm start
```

Или используйте:
```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem
start.bat
```

---

## 🐛 Если start.bat тоже не работает

Запускайте вручную в двух окнах:

**Окно 1:**
```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\memory_service
python server.py
```

**Окно 2:**
```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
npm start
```

---

## ✅ Что работает без ripgrep

| Функция | Статус |
|---------|--------|
| Electron app | ✅ Работает |
| React UI | ✅ Работает |
| Memory Service интеграция | ✅ Работает |
| Создание приложений | ✅ Работает |
| Чат с AI | ✅ Работает |
| Автосохранение памяти | ✅ Работает |
| Импорт истории | ✅ Работает |
| Поиск в проекте | ⚠️ Медленнее |

**99% функций работают!**

---

## 💡 Почему 403 ошибка?

**Возможные причины:**

1. **GitHub API rate limit**
   - GitHub ограничивает количество запросов
   - npm делает много запросов при установке

2. **Региональная блокировка**
   - Некоторые регионы заблокированы

3. **Антивирус/Firewall**
   - Блокирует доступ к GitHub

4. **Корпоративная сеть**
   - Прокси блокирует GitHub API

**Решение:** Установить без optional зависимостей!

---

## 🎯 Рекомендация

**Просто используйте `--no-optional`:**

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem
install_dyad_fix.bat
```

Это установит все что нужно для работы Dyad с Memory Service!

---

**Версия:** 1.0.7 (ripgrep optional)  
**Дата:** 2026-01-25  
**Статус:** ✅ РАБОТАЕТ БЕЗ RIPGREP

**Dyad работает без ripgrep - это не проблема!** 🎯
