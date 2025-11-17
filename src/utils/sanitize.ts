/**
 * HTML Sanitization Utility for Dashboard
 * Uses DOMPurify to prevent XSS attacks
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @param config - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  config?: DOMPurify.Config
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  // Default configuration - allow most HTML but remove dangerous attributes
  const defaultConfig: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target',
      'rel', 'style', 'width', 'height',
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };

  const finalConfig = { ...defaultConfig, ...config };

  return DOMPurify.sanitize(dirty, finalConfig);
}

/**
 * Sanitize HTML content for rich text editor output
 * More permissive configuration for blog posts and content pages
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
      'div', 'span', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'iframe', 'video', 'audio', 'source',
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target',
      'rel', 'style', 'width', 'height', 'frameborder',
      'allowfullscreen', 'controls', 'autoplay', 'loop',
    ],
    ALLOW_DATA_ATTR: true,
  });
}

/**
 * Sanitize text content - strip all HTML tags
 * Use for plain text fields that should not contain any HTML
 */
export function sanitizeText(dirty: string): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Create a safe props object for dangerouslySetInnerHTML
 * @param html - HTML content to sanitize
 * @returns Object with __html property containing sanitized HTML
 */
export function createSafeHtml(html: string) {
  return {
    __html: sanitizeHtml(html),
  };
}

/**
 * Create a safe props object for rich text content
 * @param html - Rich text HTML content to sanitize
 * @returns Object with __html property containing sanitized HTML
 */
export function createSafeRichText(html: string) {
  return {
    __html: sanitizeRichText(html),
  };
}

