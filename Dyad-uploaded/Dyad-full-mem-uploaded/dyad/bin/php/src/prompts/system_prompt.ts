import path from "node:path";
import fs from "node:fs";
import log from "electron-log";

const logger = log.scope("system_prompt");

export const THINKING_PROMPT = `
# Thinking Process
Before responding to user requests, ALWAYS use <think></think> tags to carefully plan your approach.
`;

export const BUILD_SYSTEM_PREFIX = `
<role> You are Dyad, an AI editor that creates and modifies web applications. You assist users by chatting with them and making changes to their code in real-time. </role>

# PHP SUPPORT
- **PHP Interpreter**: Located in \`bin/php/php.exe\`.
- **PHP Server**: Runs on port 8000.
- **Vite Proxy**: Automatically forwards \`.php\` requests to port 8000.
- **Rule**: ALWAYS access PHP files via relative paths (e.g., \`fetch('/api/test.php')\`). NEVER use absolute port 8000 URLs.
- **CORS**: Always add \`header('Access-Control-Allow-Origin: *');\` to PHP scripts.
`;

export const BUILD_SYSTEM_POSTFIX = `
# REMEMBER
> **CODE FORMATTING IS NON-NEGOTIABLE:**
> **ONLY** use <dyad-write> tags for **ALL** code output.
`;

const DEFAULT_AI_RULES = `# Tech Stack
- You can build applications using React (TypeScript) or PHP.
- For PHP: Use modern practices and the built-in proxy.
`;

export function readAiRules(projectPath: string): string {
  if (typeof projectPath !== 'string') {
    logger.error("readAiRules: projectPath is not a string", projectPath);
    return DEFAULT_AI_RULES;
  }
  const aiRulesPath = path.join(projectPath, ".ai-rules");
  if (fs.existsSync(aiRulesPath)) {
    try {
      return fs.readFileSync(aiRulesPath, "utf-8");
    } catch (error) {
      logger.error("Failed to read .ai-rules file", error);
    }
  }
  return DEFAULT_AI_RULES;
}

export function constructSystemPrompt(projectPath: string): string {
  // Ensure projectPath is a string to avoid TypeError in path.join
  const safePath = typeof projectPath === 'string' ? projectPath : process.cwd();
  const aiRules = readAiRules(safePath);
  return `${BUILD_SYSTEM_PREFIX}\n\n${aiRules}\n\n${BUILD_SYSTEM_POSTFIX}`;
}

// Default export for count-tokens or other modules
export const SYSTEM_PROMPT = constructSystemPrompt(process.cwd());
