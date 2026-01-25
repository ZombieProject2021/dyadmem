// MySQL Executor Handler - Handles direct SQL execution
// This handler allows Dyad to execute SQL queries directly against MySQL database

import mysql from 'mysql2/promise';

interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
}

let pool: mysql.Pool | null = null;
let currentConfig: MySQLConfig | null = null;

/**
 * Initialize MySQL connection pool
 */
export async function initializeMySQLPool(config: MySQLConfig): Promise<boolean> {
  try {
    pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    currentConfig = config;
    console.log(`✓ MySQL connected: ${config.host}:${config.port}/${config.database}`);
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error);
    pool = null;
    currentConfig = null;
    return false;
  }
}

/**
 * Execute SQL query directly
 */
export async function executeSQLQuery(sql: string, params: any[] = []): Promise<any> {
  if (!pool) {
    throw new Error('MySQL pool not initialized. Please configure MySQL connection first.');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(sql, params);
      return {
        success: true,
        data: results,
        rowsAffected: Array.isArray(results) ? results.length : 0,
      };
    } finally {
      connection.release();
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      code: error.code,
    };
  }
}

/**
 * Get current MySQL configuration status
 */
export function getMySQLStatus(): {
  connected: boolean;
  config?: MySQLConfig;
} {
  return {
    connected: !!pool && !!currentConfig,
    config: currentConfig || undefined,
  };
}

/**
 * Close MySQL connection pool
 */
export async function closeMySQLPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    currentConfig = null;
    console.log('✓ MySQL connection closed');
  }
}

/**
 * Format SQL error for user display
 */
export function formatSQLError(error: any): string {
  if (error.code === 'ER_ACCESS_DENIED_FOR_USER') {
    return 'Access denied. Please check your MySQL username and password.';
  }
  if (error.code === 'ER_BAD_DB_ERROR') {
    return 'Database not found. Please check the database name.';
  }
  if (error.code === 'PROTOCOL_CONNECTION_LOST') {
    return 'Connection lost. Please check if MySQL server is running.';
  }
  if (error.code === 'ECONNREFUSED') {
    return 'Connection refused. Please check the host and port.';
  }
  return error.message || 'Unknown error';
}

/**
 * Parse SQL query for validation
 */
export function validateSQLQuery(sql: string): {
  valid: boolean;
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'DROP' | 'ALTER' | 'OTHER';
  warning?: string;
} {
  const trimmed = sql.trim().toUpperCase();

  if (trimmed.startsWith('SELECT')) {
    return { valid: true, type: 'SELECT' };
  }
  if (trimmed.startsWith('INSERT')) {
    return { valid: true, type: 'INSERT' };
  }
  if (trimmed.startsWith('UPDATE')) {
    return { valid: true, type: 'UPDATE' };
  }
  if (trimmed.startsWith('DELETE')) {
    return { valid: true, type: 'DELETE' };
  }
  if (trimmed.startsWith('CREATE')) {
    return { valid: true, type: 'CREATE' };
  }
  if (trimmed.startsWith('DROP')) {
    return {
      valid: true,
      type: 'DROP',
      warning: '⚠️ DROP command will delete tables. Be careful!',
    };
  }
  if (trimmed.startsWith('ALTER')) {
    return { valid: true, type: 'ALTER' };
  }

  return { valid: false, type: 'OTHER' };
}

/**
 * Format query results for display
 */
export function formatQueryResults(results: any, limit: number = 100): string {
  if (!Array.isArray(results)) {
    return JSON.stringify(results, null, 2);
  }

  if (results.length === 0) {
    return '(No results)';
  }

  const displayResults = results.slice(0, limit);
  const rows = displayResults
    .map((row) => JSON.stringify(row))
    .join('\n');

  const message = `${displayResults.length} row(s)${results.length > limit ? ` (showing first ${limit})` : ''}:\n${rows}`;
  return message;
}
