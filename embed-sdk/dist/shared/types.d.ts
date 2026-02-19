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
export declare class Logger {
    private debugMode;
    private prefix;
    constructor(prefix: string, debug?: boolean);
    log(level: LogLevel, message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
}
export declare function generateId(): string;
export declare function getCookie(name: string): string | null;
export declare function setCookie(name: string, value: string, days?: number): void;
export declare function getUrlParams(): Record<string, string>;
export declare function isBot(): boolean;
export declare function safeJsonParse<T>(str: string, fallback: T): T;
//# sourceMappingURL=types.d.ts.map