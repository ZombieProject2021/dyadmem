# 🔧 Dyad Dependencies Not Installed

## ❌ Проблема

```
"electron-forge" не является внутренней или внешней командой
```

Это значит что **node_modules** для Dyad не установлены.

---

## ✅ РЕШЕНИЕ

### Запустите установщик:

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem
install_dyad.bat
```

Это займет **5-10 минут** - нужно скачать и установить ~500 MB npm пакетов.

**Дождитесь:**
```
[SUCCESS] Dyad dependencies installed!
```

### Затем запустите:

```cmd
start.bat
```

---

## 🎯 Альтернатива: Ручная установка

Если install_dyad.bat не работает:

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
npm install
```

Это займет время, ждите до конца.

---

## 📋 Полная последовательность

### 1. Memory Service

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\memory_service
python server.py
```

Оставьте это окно открытым.

### 2. Dyad (в новом окне CMD)

```cmd
cd C:\Users\Mikolas\Desktop\Dyad-full-mem\dyad
npm install
npm start
```

---

## 💡 Почему это происходит

Dyad - это Electron приложение с ~500 MB зависимостей:
- electron
- electron-forge  
- react
- typescript
- и еще ~1000 пакетов

Их нужно скачать и установить один раз.

---

## ⏱️ Сколько ждать?

- **Быстрый интернет:** 5 минут
- **Средний интернет:** 10 минут  
- **Медленный интернет:** 20+ минут

**Не закрывайте окно пока идет установка!**

---

## 🧪 Проверка

После установки:

```cmd
cd dyad
dir node_modules
```

Должна быть куча папок (electron, react, etc.)

```cmd
npm start
```

Должно запуститься Dyad приложение.

---

**Версия:** 1.0.5  
**Статус:** ✅ НУЖНА УСТАНОВКА NPM ПАКЕТОВ
