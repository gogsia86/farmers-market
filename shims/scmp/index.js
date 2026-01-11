/**
 * scmp shim - Safe, constant-time comparison using Node.js crypto
 *
 * This is a modern replacement for the deprecated scmp@2.1.0 package.
 * Uses Node.js's built-in crypto.timingSafeEqual() for timing-safe comparisons.
 *
 * @see https://nodejs.org/api/crypto.html#cryptotimingsafeequala-b
 */

const crypto = require("crypto");

/**
 * Constant-time comparison of two buffers/strings
 *
 * @param {Buffer|string} a - First value to compare
 * @param {Buffer|string} b - Second value to compare
 * @returns {boolean} true if equal, false otherwise
 */
function scmp(a, b) {
  // Convert strings to buffers
  const bufA = Buffer.isBuffer(a) ? a : Buffer.from(String(a));
  const bufB = Buffer.isBuffer(b) ? b : Buffer.from(String(b));

  // If lengths differ, return false (but still use timing-safe comparison)
  // We compare against a dummy buffer of the same length to maintain constant time
  if (bufA.length !== bufB.length) {
    // Create dummy buffers of same length for timing-safe comparison
    const dummyA = Buffer.alloc(bufA.length);
    const dummyB = Buffer.alloc(bufA.length);

    try {
      crypto.timingSafeEqual(dummyA, dummyB);
    } catch (e) {
      // Ignore error, we just want to waste the same amount of time
    }

    return false;
  }

  // Use Node.js's built-in timing-safe comparison
  try {
    return crypto.timingSafeEqual(bufA, bufB);
  } catch (error) {
    // Should not happen if lengths are equal, but handle gracefully
    return false;
  }
}

module.exports = scmp;
module.exports.default = scmp;
