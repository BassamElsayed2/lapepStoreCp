/**
 * Security Utility Functions for Dashboard
 * Additional security helpers for admin dashboard
 */

/**
 * Check if a URL is safe (same origin or whitelisted)
 * Prevents open redirect vulnerabilities
 */
export function isSafeUrl(url: string, allowedDomains: string[] = []): boolean {
  try {
    const parsedUrl = new URL(url, window.location.origin);
    
    // Allow same origin
    if (parsedUrl.origin === window.location.origin) {
      return true;
    }
    
    // Check against whitelist
    return allowedDomains.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );
  } catch {
    // If URL parsing fails, it's not safe
    return false;
  }
}

/**
 * Safely redirect to a URL (prevents open redirect)
 */
export function safeRedirect(url: string, fallbackUrl: string = '/', allowedDomains: string[] = []) {
  if (isSafeUrl(url, allowedDomains)) {
    window.location.href = url;
  } else {
    console.warn('Unsafe redirect blocked:', url);
    window.location.href = fallbackUrl;
  }
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate file uploads
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default for admin
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  } = options;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }

  return { isValid: true };
}

/**
 * Rate limiting for admin actions
 */
export class AdminRateLimiter {
  private actions: Map<string, number[]> = new Map();

  canPerform(actionId: string, maxAttempts: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.actions.get(actionId) || [];
    
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.actions.set(actionId, recentAttempts);
    
    return true;
  }

  reset(actionId: string) {
    this.actions.delete(actionId);
  }
}

/**
 * Audit log helper for admin actions
 */
export interface AuditLogEntry {
  action: string;
  timestamp: Date;
  userId?: string;
  details?: any;
}

export class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private maxLogs = 100;

  log(action: string, userId?: string, details?: any) {
    const entry: AuditLogEntry = {
      action,
      timestamp: new Date(),
      userId,
      details,
    };

    this.logs.unshift(entry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔒 Admin Action:', entry);
    }
  }

  getLogs(): AuditLogEntry[] {
    return [...this.logs];
  }

  clear() {
    this.logs = [];
  }
}

// Global audit logger instance
export const auditLogger = new AuditLogger();

/**
 * Check if the application is running in a secure context
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return true;
  return window.isSecureContext;
}

