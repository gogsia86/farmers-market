/**
 * 🧠 DIVINE PATTERN: Agricultural Logger Stub
 * 📚 Reference: 01_DIVINE_CORE_PRINCIPLES.instructions.md
 * ⚡ Placeholder for agricultural logging functionality
 */

// Stub implementation for logger

import { logger } from '@/lib/monitoring/logger';

export const logger = {
  info: (...args: any[]) => logger.info("[INFO]", ...args),
  error: (...args: any[]) => logger.error("[ERROR]", ...args),
  warn: (...args: any[]) => logger.warn("[WARN]", ...args),
  debug: (...args: any[]) => logger.debug("[DEBUG]", ...args),
};

export default logger;
