# Cross-Platform Deployment Guide

## Windows

### Запуск

```cmd
start.bat
```

### Требования
- Python 3.10+
- Node.js 20+
- Windows 10+

### Автоматическая установка
BAT-файл автоматически:
- Проверяет зависимости
- Устанавливает packages
- Запускает оба сервиса

## Linux

### Запуск

```bash
chmod +x start.sh
./start.sh
```

### Требования
- Python 3.10+
- Node.js 20+
- curl (для проверки здоровья)

### Установка зависимостей (Ubuntu/Debian)

```bash
# Python
sudo apt update
sudo apt install python3 python3-pip

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Systemd Service (опционально)

Создайте `/etc/systemd/system/dyad-memory.service`:

```ini
[Unit]
Description=Dyad Memory Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/Dyad-full-mem/memory_service
ExecStart=/usr/bin/python3 server.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Запуск:
```bash
sudo systemctl enable dyad-memory
sudo systemctl start dyad-memory
sudo systemctl status dyad-memory
```

## macOS

### Запуск

```bash
chmod +x start.sh
./start.sh
```

### Требования
- Python 3.10+ (через Homebrew)
- Node.js 20+ (через Homebrew)
- Xcode Command Line Tools

### Установка зависимостей

```bash
# Homebrew (если не установлен)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Python
brew install python@3.11

# Node.js
brew install node@20

# Xcode Command Line Tools
xcode-select --install
```

### LaunchAgent (опционально)

Создайте `~/Library/LaunchAgents/com.dyad.memory.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.dyad.memory</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/python3</string>
        <string>/path/to/Dyad-full-mem/memory_service/server.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/path/to/Dyad-full-mem/memory_service</string>
</dict>
</plist>
```

Запуск:
```bash
launchctl load ~/Library/LaunchAgents/com.dyad.memory.plist
launchctl start com.dyad.memory
```

## Docker

### Memory Service Dockerfile

Создайте `memory_service/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p data logs

EXPOSE 8002

CMD ["python", "server.py"]
```

### Docker Compose

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  memory-service:
    build: ./memory_service
    ports:
      - "8002:8002"
    volumes:
      - ./memory_service/data:/app/data
      - ./memory_service/logs:/app/logs
    environment:
      - MEMORY_SERVICE_PORT=8002
      - MEMORY_SERVICE_HOST=0.0.0.0
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Запуск через Docker

```bash
# Build и запуск
docker-compose up -d

# Проверка логов
docker-compose logs -f memory-service

# Остановка
docker-compose down
```

## Общие проблемы

### Порт 8002 занят

**Linux/Mac:**
```bash
lsof -i :8002
kill -9 <PID>
```

**Windows:**
```cmd
netstat -ano | findstr :8002
taskkill /PID <PID> /F
```

### Python не найден

**Linux:**
```bash
sudo apt install python3 python3-pip
```

**Mac:**
```bash
brew install python@3.11
```

**Windows:**
Скачайте с https://www.python.org/downloads/

### Node.js не найден

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

**Mac:**
```bash
brew install node@20
```

**Windows:**
Скачайте с https://nodejs.org/

## Мониторинг

### Проверка здоровья

```bash
curl http://localhost:8002/health
```

### Логи

**Linux/Mac:**
```bash
tail -f memory_service/logs/service.log
```

**Windows:**
```cmd
type memory_service\logs\service.log
```

### Статистика

```bash
cd memory_service
python3 manage.py stats
```

## Production Deployment

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name memory.example.com;

    location / {
        proxy_pass http://localhost:8002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/HTTPS

```bash
# Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d memory.example.com
```

### Firewall

**Linux (UFW):**
```bash
sudo ufw allow 8002/tcp
```

**Firewalld:**
```bash
sudo firewall-cmd --add-port=8002/tcp --permanent
sudo firewall-cmd --reload
```

## Backup

### Автоматический backup (Linux/Mac)

Создайте cron job:

```bash
crontab -e
```

Добавьте:
```
0 2 * * * cp /path/to/Dyad-full-mem/memory_service/data/memory.db /backups/memory-$(date +\%Y\%m\%d).db
```

### Ручной backup

```bash
cp memory_service/data/memory.db backups/memory-$(date +%Y%m%d).db
```

## Performance Tuning

### SQLite оптимизация

В `memory_manager.py`:

```python
# При инициализации
await self.db.execute("PRAGMA journal_mode=WAL")
await self.db.execute("PRAGMA synchronous=NORMAL")
await self.db.execute("PRAGMA cache_size=10000")
await self.db.execute("PRAGMA temp_store=MEMORY")
```

### Увеличение лимитов

**Linux:**
```bash
# В /etc/security/limits.conf
* soft nofile 65536
* hard nofile 65536
```

## Security

### Firewall rules

Ограничить доступ только к localhost:

```bash
# Linux (iptables)
sudo iptables -A INPUT -p tcp --dport 8002 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 8002 -j DROP
```

### Environment Variables

Никогда не коммитьте `.env` файлы в git!

Добавьте в `.gitignore`:
```
*.env
.env.*
!.env.template
```

## Troubleshooting

### Логи не создаются

```bash
mkdir -p memory_service/logs
chmod 755 memory_service/logs
```

### База данных заблокирована

```bash
# Проверьте процессы
fuser memory_service/data/memory.db

# Убейте зависшие процессы
fuser -k memory_service/data/memory.db
```

### High CPU usage

Проверьте индексы в SQLite:

```sql
SELECT * FROM sqlite_master WHERE type='index';
```

## Мониторинг и алерты

### Health check script

Создайте `monitor.sh`:

```bash
#!/bin/bash

if ! curl -f http://localhost:8002/health > /dev/null 2>&1; then
    echo "Memory Service down! Restarting..."
    cd /path/to/Dyad-full-mem/memory_service
    python3 server.py &
fi
```

Добавьте в cron (каждые 5 минут):
```
*/5 * * * * /path/to/monitor.sh
```

---

**Версия**: 1.0.0  
**Последнее обновление**: 2026-01-25
