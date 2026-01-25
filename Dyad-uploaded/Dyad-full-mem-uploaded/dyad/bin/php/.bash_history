export PS1="[CMD_BEGIN]\n\u@\h:\w\n[CMD_END]"; export PS2=""
export TERM=xterm-256color
export OPENAI_API_KEY="sk-eXtszdUzYDDf6mT7U6HdeD"
export OPENAI_API_BASE="https://api.manus.im/api/llm-proxy/v1"
export OPENAI_BASE_URL="https://api.manus.im/api/llm-proxy/v1"
ps() { /bin/ps "$@" | grep -v -E '(start_server\.py|upgrade\.py|supervisor)' || true; }
pgrep() { /usr/bin/pgrep "$@" | while read pid; do [ -n "$pid" ] && cmdline=$(/bin/ps -p $pid -o command= 2>/dev/null) && ! echo "$cmdline" | grep -q -E '(start_server\.py|upgrade\.py|supervisor)' && echo "$pid"; done; }
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && unzip -q upload/dyad-mysql-ready.zip && ls -la
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && cp src/ipc/handlers/chat_stream_handlers.ts src/ipc/handlers/chat_stream_handlers.ts.backup && echo "Backup created"
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && zip -r dyad-mysql-fixed.zip . -x "*.git/*" "node_modules/*" ".browser_data_dir/*" ".cache/*" ".local/*" ".npm/*" ".nvm/*" "upload/*" "Downloads/*" "*.log" 2>&1 | tail -20
source /home/ubuntu/.user_env && cd . && cd /home/ubuntu && zip -u dyad-mysql-fixed.zip AI_RULES.md AI_BEHAVIOR_ANALYSIS.md FIX_SUMMARY.md problem_analysis.md
