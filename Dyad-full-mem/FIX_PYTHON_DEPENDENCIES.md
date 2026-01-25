# 🔧 Исправление проблемы с установкой Python зависимостей

## ❌ Проблема

При запуске `start.bat` вы видели ошибку:

```
error: metadata-generation-failed
╰─> pydantic-core
Cargo, the Rust package manager, is not installed or is not on PATH.
```

**Причина:** Некоторые Python пакеты (pydantic, cryptography) требуют компиляции с Rust, которого нет на вашей системе.

---

## ✅ Решение 1: Упрощенная установка (РЕКОМЕНДУЕТСЯ)

Используйте **минимальные зависимости** без компиляции:

```cmd
cd Dyad-full-mem
install_minimal.bat
```

Этот скрипт установит только необходимые пакеты, которые не требуют Rust.

После установки запустите:
```cmd
start.bat
```

---

## ✅ Решение 2: Обновите pip и используйте wheels

```cmd
cd Dyad-full-mem\memory_service

REM Обновите pip
python -m pip install --upgrade pip wheel setuptools

REM Установите зависимости
pip install --only-binary :all: -r requirements.txt
```

Флаг `--only-binary` заставит pip использовать предкомпилированные версии.

---

## ✅ Решение 3: Установите Rust (если нужны все функции)

Если вам нужны все функции (включая OpenAI интеграцию):

### Windows:

1. **Скачайте Visual Studio Build Tools:**
   https://visualstudio.microsoft.com/downloads/
   
2. **Установите "Desktop development with C++"**

3. **Или установите Rust:**
   ```cmd
   winget install --id Rustlang.Rustup
   ```
   
4. **Перезапустите терминал** и попробуйте снова:
   ```cmd
   cd Dyad-full-mem
   start.bat
   ```

---

## ✅ Решение 4: Ручная установка по одному пакету

Если ничего не помогло:

```cmd
cd Dyad-full-mem\memory_service

python -m pip install --upgrade pip

pip install fastapi==0.110.1
pip install uvicorn==0.25.0
pip install pydantic==2.4.2
pip install python-dotenv==1.0.1
pip install aiosqlite==0.19.0
pip install rank-bm25==0.2.2
pip install python-multipart==0.0.9
```

---

## 📋 Минимальные vs Полные зависимости

### Минимальные (requirements_minimal.txt):
- ✅ Работает без компиляции
- ✅ Все основные функции Memory Service
- ✅ Поиск BM25
- ✅ Автосохранение
- ❌ Нет OpenAI интеграции (не нужно для памяти)
- ❌ Нет scikit-learn (не критично)

### Полные (requirements.txt):
- ✅ Все функции
- ✅ OpenAI интеграция
- ✅ Продвинутый поиск
- ❌ Требует Rust или Visual Studio Build Tools

**Рекомендация:** Используйте минимальные зависимости - их достаточно!

---

## 🧪 Проверка установки

После установки проверьте:

```cmd
cd Dyad-full-mem\memory_service
python -c "import fastapi, uvicorn, pydantic, aiosqlite; print('All packages OK!')"
```

Ожидаемо: `All packages OK!`

---

## 🚀 Запуск после исправления

```cmd
cd Dyad-full-mem
start.bat
```

Memory Service должен запуститься на http://localhost:8002

Проверка:
```cmd
curl http://localhost:8002/health
```

Ожидаемо:
```json
{"status": "healthy"}
```

---

## 🐛 Другие возможные проблемы

### Python версия слишком новая (3.14)

Python 3.14 очень новый, некоторые пакеты могут не иметь wheels.

**Решение:** Используйте Python 3.11 или 3.10:
```cmd
python --version
```

Если 3.14, установите Python 3.11: https://www.python.org/downloads/release/python-3119/

### pip не обновляется

```cmd
python -m pip install --upgrade pip --force-reinstall
```

### Проблемы с правами доступа

Запустите CMD **от имени администратора**:
1. Найдите cmd.exe
2. Правый клик → "Запуск от имени администратора"
3. Попробуйте снова

---

## ✅ Быстрое решение (TL;DR)

**Если лень читать, просто сделайте:**

```cmd
cd Dyad-full-mem
install_minimal.bat
```

Дождитесь установки, затем:

```cmd
start.bat
```

Готово! 🎉

---

**Создано:** 2026-01-25  
**Версия:** 1.0.2  
**Статус:** ✅ РАБОТАЕТ С МИНИМАЛЬНЫМИ ЗАВИСИМОСТЯМИ
