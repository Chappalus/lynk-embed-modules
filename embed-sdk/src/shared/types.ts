/**
 * Shared types and utilities for Lynk Embed SDK
 */

export interface AcademyConfig {
  academyId: string;
  apiKey: string;
  apiBaseUrl?: string;
  debug?: boolean;
}

export interface EventData {
  event: string;
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  [key: string]: any;
}

export interface TrackingEvent {
  eventName: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private debugMode: boolean;
  private prefix: string;

  constructor(prefix: string, debug = false) {
    this.prefix = prefix;
    this.debugMode = debug;
  }

  log(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.debugMode && level === 'debug') return;
    
    const timestamp = new Date().toISOString();
    const formatted = `[${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
        console.error(formatted, ...args);
        break;
      case 'warn':
        console.warn(formatted, ...args);
        break;
      case 'info':
        console.info(formatted, ...args);
        break;
      default:
        console.log(formatted, ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.log('error', message, ...args);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function getUrlParams(): Record<string, string> {
  const params: Record<string, string> = {};
  const search = window.location.search;
  if (!search) return params;
  
  const urlParams = new URLSearchParams(search);
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function isBot(): boolean {
  const botPattern = /bot|crawler|spider|crawling/i;
  return botPattern.test(navigator.userAgent);
}

export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T;
  } catch {
    return fallback;
  }
}