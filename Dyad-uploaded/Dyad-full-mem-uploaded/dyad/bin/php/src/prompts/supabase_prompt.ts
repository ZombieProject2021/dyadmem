// Re-export MySQL prompts as Supabase for compatibility
// This allows the rest of the codebase to continue using SUPABASE_* names
// while actually using MySQL prompts
export { MYSQL_AVAILABLE_SYSTEM_PROMPT as SUPABASE_AVAILABLE_SYSTEM_PROMPT } from './mysql_prompt';
export { MYSQL_NOT_AVAILABLE_SYSTEM_PROMPT as SUPABASE_NOT_AVAILABLE_SYSTEM_PROMPT } from './mysql_prompt';
