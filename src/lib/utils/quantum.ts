/**
 * QUANTUM ID GENERATOR
 * Divine identifier generation with agricultural consciousness
 */

import { createHash, randomBytes } from "crypto";

/**
 * GENERATE QUANTUM ID
 * Creates unique identifiers with agricultural awareness
 */
export function generateQuantumId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString("hex");
  const quantum = createHash("sha256")
    .update(`${timestamp}-${randomPart}-agricultural-consciousness`)
    .digest("hex")
    .substring(0, 8);

  return prefix
    ? `${prefix}_${timestamp}_${quantum}`
    : `${timestamp}_${quantum}`;
}

/**
 * GENERATE REQUEST ID
 * Creates request-specific identifiers
 */
export function generateRequestId(): string {
  return generateQuantumId("req");
}

/**
 * GENERATE SESSION ID
 * Creates session-specific identifiers
 */
export function generateSessionId(): string {
  return generateQuantumId("sess");
}

/**
 * VALIDATE QUANTUM ID
 * Validates quantum identifier format
 */
export function validateQuantumId(id: string): boolean {
  const pattern = /^[a-z0-9_]+$/i;
  return pattern.test(id) && id.length > 8;
}
