/**
 * Structured Logger for Mantrakshata
 * Layer 13: Error Tracking & Logs
 *
 * Provides JSON structured logs in production with automatic PII sanitization
 * (masking phone numbers, secret tokens, and OTP codes).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'audit';

interface LogContext {
  [key: string]: unknown;
}

function sanitizeValue(key: string, val: unknown): unknown {
  if (typeof val !== 'string') return val;
  const lowerKey = key.toLowerCase();

  // Mask OTP codes
  if (lowerKey.includes('otp') || lowerKey.includes('code') || lowerKey.includes('challenge')) {
    return '***REDACTED***';
  }

  // Mask sensitive secrets and keys
  if (lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('signature') || lowerKey.includes('key')) {
    return '***REDACTED***';
  }

  // Mask phone numbers: 919876543210 -> 9198****3210
  if (lowerKey.includes('phone') || lowerKey.includes('recipient') || /^\+?91\d{10}$/.test(val)) {
    if (val.length >= 10) {
      return val.slice(0, 4) + '****' + val.slice(-4);
    }
  }

  return val;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = sanitizeObject(v as Record<string, unknown>);
    } else if (Array.isArray(v)) {
      result[k] = v.map((item) => (item && typeof item === 'object' ? sanitizeObject(item as Record<string, unknown>) : item));
    } else {
      result[k] = sanitizeValue(k, v);
    }
  }
  return result;
}

function log(level: LogLevel, message: string, context: LogContext = {}): void {
  const isProd = process.env.NODE_ENV === 'production';
  const timestamp = new Date().toISOString();
  const safeContext = sanitizeObject(context);

  const payload = {
    timestamp,
    level,
    message,
    ...safeContext,
  };

  if (isProd) {
    const jsonStr = JSON.stringify(payload);
    if (level === 'error') {
      console.error(jsonStr);
    } else if (level === 'warn') {
      console.warn(jsonStr);
    } else {
      console.log(jsonStr);
    }
  } else {
    const prefix = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    if (level === 'error') {
      console.error(prefix, safeContext);
    } else if (level === 'warn') {
      console.warn(prefix, safeContext);
    } else {
      console.log(prefix, safeContext);
    }
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
  audit: (action: string, context?: LogContext) => log('audit', `AUDIT: ${action}`, context),
};
