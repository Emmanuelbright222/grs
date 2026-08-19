/**
 * Structured Logging & Error Tracking Wrapper
 */

type LogLevel = "info" | "warn" | "error" | "debug";

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, context ?? "");
    }
  },

  warn(message: string, context?: Record<string, unknown>) {
    console.warn(`[WARN] ${message}`, context ?? "");
  },

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, error ?? "", context ?? "");
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, context ?? "");
    }
  },
};
