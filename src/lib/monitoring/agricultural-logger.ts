/**
 * 🧠 DIVINE PATTERN: Agricultural Logger Stub
 * 📚 Reference: 01_DIVINE_CORE_PRINCIPLES.instructions.md
 * ⚡ Placeholder for agricultural logging functionality
 */

// Stub implementation for logger

import { logger as baseLogger } from "@/lib/monitoring/logger";

export const logger = {
  info: (...args: any[]) => baseLogger.info("[INFO]", ...args),
  error: (...args: any[]) => baseLogger.error("[ERROR]", ...args),
  warn: (...args: any[]) => baseLogger.warn("[WARN]", ...args),
  debug: (...args: any[]) => baseLogger.debug("[DEBUG]", ...args),
};

export default logger;
