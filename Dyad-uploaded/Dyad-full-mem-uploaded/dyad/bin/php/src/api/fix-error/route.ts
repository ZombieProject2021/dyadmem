/**
 * API Route: /api/fix-error
 * Applies automatic fixes to files
 */

import fs from 'fs';
import path from 'path';

interface FixRequest {
  file: string;
  code: string;
  issue: string;
  solution: string;
}

/**
 * POST /api/fix-error
 * Apply fix to file
 */
export async function POST(req: Request) {
  try {
    const body: FixRequest = await req.json();

    // Validate request
    if (!body.file || !body.code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file, code' }),
        { status: 400 }
      );
    }

    // Sanitize file path to prevent directory traversal
    const sanitizedFile = sanitizeFilePath(body.file);
    const filePath = path.join(process.cwd(), 'src', sanitizedFile);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return new Response(
        JSON.stringify({ error: `File not found: ${body.file}` }),
        { status: 404 }
      );
    }

    // Read current file content
    const currentContent = fs.readFileSync(filePath, 'utf-8');

    // Apply fix
    const newContent = applyFix(currentContent, body.code, body.issue);

    // Write fixed content back to file
    fs.writeFileSync(filePath, newContent, 'utf-8');

    console.log(`[FixError] Applied fix to ${body.file}`);
    console.log(`[FixError] Issue: ${body.issue}`);
    console.log(`[FixError] Solution: ${body.solution}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fix applied to ${body.file}`,
        issue: body.issue,
        solution: body.solution,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[FixError] Error applying fix:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}

/**
 * Sanitize file path to prevent directory traversal
 */
function sanitizeFilePath(filePath: string): string {
  // Remove leading slashes and dots
  let sanitized = filePath.replace(/^\/+/, '').replace(/\.\.\//g, '');

  // Ensure it's within src directory
  if (!sanitized.startsWith('src/')) {
    sanitized = 'src/' + sanitized;
  }

  return sanitized;
}

/**
 * Apply fix to content
 */
function applyFix(currentContent: string, fixCode: string, issue: string): string {
  try {
    // Try to find and replace the problematic code
    // This is a simple approach - more sophisticated matching might be needed

    // If fix code contains a function or class definition, replace the whole thing
    if (fixCode.includes('function') || fixCode.includes('class') || fixCode.includes('const')) {
      // Try to find the function/class name from fix code
      const nameMatch = fixCode.match(/(?:function|class|const)\s+(\w+)/);
      if (nameMatch) {
        const name = nameMatch[1];
        // Find and replace the function/class in current content
        const regex = new RegExp(
          `(?:function|class|const)\\s+${name}[\\s\\S]*?(?=\\n(?:function|class|const|export|$))`,
          'g'
        );
        if (regex.test(currentContent)) {
          return currentContent.replace(regex, fixCode);
        }
      }
    }

    // If fix code is a simple statement, append it
    if (fixCode.length < 200 && !fixCode.includes('\n\n')) {
      // Try to find the line with the issue and replace it
      const lines = currentContent.split('\n');
      const issueLineIndex = lines.findIndex((line) =>
        line.toLowerCase().includes(issue.toLowerCase().split(' ')[0])
      );

      if (issueLineIndex !== -1) {
        lines[issueLineIndex] = fixCode;
        return lines.join('\n');
      }
    }

    // If nothing matched, append the fix at the end
    return currentContent + '\n\n' + fixCode;
  } catch (err) {
    console.error('[FixError] Error applying fix:', err);
    return currentContent;
  }
}

/**
 * GET /api/fix-error
 * Get list of recent fixes
 */
export async function GET(req: Request) {
  try {
    // This could return a list of recent fixes from a database
    // For now, just return success
    return new Response(
      JSON.stringify({
        message: 'Fix error endpoint is active',
      }),
      { status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
}
