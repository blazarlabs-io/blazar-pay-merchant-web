/**
 * Secure logging utility for APPSEC-008
 * Provides structured logging with sensitive data redaction
 */

type LogLevel = "info" | "warn" | "error";
type LogContext = Record<string, unknown> | undefined;

function getIsProd(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Redacts sensitive information from log data
 * @param value - Value to potentially redact
 * @returns Redacted value safe for logging
 */
function redactor(value: unknown): unknown {
  // Redact objects that may contain secrets; leave primitives as-is
  if (value instanceof Error) {
    // In production, do not expose stack or raw error to logs that might be forwarded to clients
    return getIsProd()
      ? { name: value.name, message: value.message }
      : { name: value.name, message: value.message, stack: value.stack };
  }

  if (typeof value === "object" && value !== null) {
    try {
      // Shallow clone + remove obvious secret-like keys
      const clone: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (
          /(password|secret|token|key|authorization|cookie|private|credential)/i.test(
            k,
          )
        ) {
          clone[k] = "[REDACTED]";
        } else {
          clone[k] = v;
        }
      }
      return clone;
    } catch {
      return "[Object]";
    }
  }

  return value;
}

/**
 * Internal logging function with structured output
 * @param level - Log level
 * @param message - Log message
 * @param context - Additional context data
 */
function log(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    context: context ? redactor(context) : undefined,
    timestamp: new Date().toISOString(),
    service: "merchant",
  };

  // Use console.* but with structured payload; can be swapped with pino/winston later
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}

/**
 * Securely log errors with redaction and context
 * @param err - Error to log
 * @param context - Additional context information
 * @returns Safe error message for potential client use
 */
export function secureLogError(err: unknown, context?: LogContext): string {
  const base = err instanceof Error ? err : new Error(String(err));
  const msg = getIsProd() ? base.message : `${base.message}`; // no stack in prod
  log("error", "App error", { error: redactor(base), ...context });
  return msg;
}

/**
 * Securely log informational messages
 * @param message - Message to log
 * @param context - Additional context data
 */
export function secureInfo(message: string, context?: LogContext): void {
  log("info", message, context);
}

/**
 * Securely log warning messages
 * @param message - Warning message
 * @param context - Additional context data
 */
export function secureWarn(message: string, context?: LogContext): void {
  log("warn", message, context);
}

/**
 * Check if we're in production mode
 * @returns true if in production
 */
export function isProduction(): boolean {
  return getIsProd();
}
