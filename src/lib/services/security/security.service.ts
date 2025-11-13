/**
 * 🔒 SECURITY SERVICE
 * Handles input validation, sanitization, and security checks
 */

export class SecurityService {
  /**
   * Sanitize user input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check password strength
   */
  static isStrongPassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain number");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Password must contain special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(
    _identifier: string,
    _maxRequests: number,
    _windowMs: number
  ): boolean {
    // In production, use Redis for distributed rate limiting
    return true; // Placeholder
  }

  /**
   * Validate file upload
   */
  static validateFileUpload(
    file: { size: number; type: string },
    options: {
      maxSize: number;
      allowedTypes: string[];
    }
  ): { valid: boolean; error?: string } {
    if (file.size > options.maxSize) {
      return {
        valid: false,
        error: `File too large. Max size: ${options.maxSize / 1024 / 1024}MB`,
      };
    }

    if (!options.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${options.allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }
}
