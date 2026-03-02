// Utility functions

import { ConnectionSpeed } from './types';

/**
 * Detect connection speed using Network Information API
 */
export function detectConnectionSpeed(): ConnectionSpeed {
  if (typeof window === 'undefined') {
    return { type: 'fast' };
  }

  if (!navigator.onLine) {
    return { type: 'offline' };
  }

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return { type: 'slow', effectiveType };
    }
    
    if (effectiveType === '3g') {
      return { type: 'slow', effectiveType };
    }
    
    return { type: 'fast', effectiveType };
  }

  return { type: 'fast' };
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Validate code input
 */
export function validateCode(code: string): { valid: boolean; error?: string } {
  const lines = code.trim().split('\n');
  
  if (lines.length < 10) {
    return { valid: false, error: 'codeTooShort' };
  }
  
  if (lines.length > 500) {
    return { valid: false, error: 'codeTooLong' };
  }
  
  if (code.trim().length === 0) {
    return { valid: false, error: 'invalidCode' };
  }
  
  return { valid: true };
}

/**
 * Detect programming language from code
 */
export function detectLanguage(code: string): string {
  // Simple heuristics for language detection
  if (code.includes('def ') || code.includes('import ') && code.includes(':')) {
    return 'python';
  }
  
  if (code.includes('public class ') || code.includes('public static void main')) {
    return 'java';
  }
  
  if (code.includes('func ') || code.includes('package main')) {
    return 'go';
  }
  
  if (code.includes('const ') || code.includes('let ') || code.includes('interface ') || code.includes(': ')) {
    return 'typescript';
  }
  
  return 'javascript';
}

/**
 * Format timestamp to readable string
 */
export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely get item from localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safely set item in localStorage
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
