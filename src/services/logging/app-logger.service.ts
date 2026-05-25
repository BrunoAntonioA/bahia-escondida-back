import { Injectable, Logger } from '@nestjs/common';

const SENSITIVE_KEYS = new Set([
  'password',
  'accessToken',
  'refreshToken',
  'authorization',
]);

@Injectable()
export class AppLoggerService {
  log(context: string, message: string, meta?: Record<string, unknown>): void {
    this.write('log', context, message, meta);
  }

  warn(context: string, message: string, meta?: Record<string, unknown>): void {
    this.write('warn', context, message, meta);
  }

  error(
    context: string,
    message: string,
    error?: unknown,
    meta?: Record<string, unknown>,
  ): void {
    const errorMeta =
      error instanceof Error
        ? { ...meta, error: error.message, stack: error.stack }
        : { ...meta, error };

    this.write('error', context, message, errorMeta);
  }

  debug(context: string, message: string, meta?: Record<string, unknown>): void {
    this.write('debug', context, message, meta);
  }

  sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    if (typeof data === 'object') {
      return Object.fromEntries(
        Object.entries(data as Record<string, unknown>).map(([key, value]) => {
          if (SENSITIVE_KEYS.has(key.toLowerCase())) {
            return [key, '[REDACTED]'];
          }

          return [key, this.sanitize(value)];
        }),
      );
    }

    return data;
  }

  private write(
    level: 'log' | 'warn' | 'error' | 'debug',
    context: string,
    message: string,
    meta?: Record<string, unknown>,
  ): void {
    const logger = new Logger(context);
    const suffix =
      meta && Object.keys(meta).length > 0
        ? ` | ${JSON.stringify(meta)}`
        : '';

    logger[level](`${message}${suffix}`);
  }
}
