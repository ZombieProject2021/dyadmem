#!/bin/bash

# Dyad with Infinite Memory - Start Script for Linux/Mac

set -e

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "          DYAD WITH INFINITE MEMORY - STARTING                "
echo "                                                               "
echo "   Dyad AI App Builder + EverMemOS Memory System               "
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Python
echo "[1/4] Проверка Python..."
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python не найден! Установите Python 3.10+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python найден: $(python3 --version)${NC}"

# Check Node.js
echo ""
echo "[2/4] Проверка Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js не найден! Установите Node.js 20+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js найден: $(node --version)${NC}"

# Install Python dependencies
echo ""
echo "[3/4] Установка зависимостей Python..."
cd memory_service
mkdir -p data logs
echo "Установка Python packages..."
python3 -m pip install -q -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Ошибка установки Python зависимостей${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python зависимости установлены${NC}"
cd ..

# Check Dyad dependencies
echo ""
echo "[4/4] Проверка зависимостей Dyad..."
cd dyad
if [ ! -d "node_modules" ]; then
    echo "Установка Dyad зависимостей (это может занять несколько минут)..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ Ошибка установки Dyad зависимостей${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Dyad зависимости готовы${NC}"
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🚀 ЗАПУСК СЕРВИСОВ..."
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Start Memory Service in background
echo "[1/2] Запуск Memory Service на порту 8002..."
cd memory_service
python3 server.py > logs/service.log 2>&1 &
MEMORY_PID=$!
cd ..

echo -e "${YELLOW}Ожидание запуска Memory Service (5 секунд)...${NC}"
sleep 5

# Check if Memory Service is running
if curl -s http://localhost:8002/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Memory Service запущен (PID: $MEMORY_PID)${NC}"
else
    echo -e "${YELLOW}⚠ Memory Service может быть еще не запущен, проверьте логи${NC}"
fi

echo ""
echo "[2/2] Запуск Dyad..."
echo ""

# Start Dyad
cd dyad
npm start &
DYAD_PID=$!
cd ..

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✓ ВСЕ СЕРВИСЫ ЗАПУЩЕНЫ!${NC}"
echo ""
echo "📊 Статус:"
echo "   • Memory Service: http://localhost:8002 (PID: $MEMORY_PID)"
echo "   • Dyad: откроется автоматически (PID: $DYAD_PID)"
echo ""
echo "💡 Подсказки:"
echo "   • Все чаты автоматически сохраняются в долговременную память"
echo "   • Для остановки: kill $MEMORY_PID $DYAD_PID"
echo "   • Логи Memory Service: memory_service/logs/service.log"
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Wait for user input
echo "Нажмите Ctrl+C для остановки всех сервисов..."

# Trap Ctrl+C to cleanup
trap "echo '\nОстановка сервисов...'; kill $MEMORY_PID $DYAD_PID 2>/dev/null; exit" INT

# Wait indefinitely
wait