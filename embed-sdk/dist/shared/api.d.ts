import { AcademyConfig, TrackingEvent } from './types';
/**
 * Core API client for Lynk backend communication
 */
export declare class LynkAPI {
    private config;
    private logger;
    private queue;
    private flushInterval;
    private readonly FLUSH_INTERVAL_MS;
    private readonly MAX_QUEUE_SIZE;
    constructor(config: AcademyConfig);
    private startFlushInterval;
    private stopFlushInterval;
    /**
     * Track an event - queues for batch sending
     */
    track(event: TrackingEvent): Promise<void>;
    /**
     * Flush queued events to API
     */
    flush(): Promise<void>;
    /**
     * Get academy configuration (batches, appointments, branding)
     */
    getAcademyConfig(): Promise<any>;
    /**
     * Get available batches for booking
     */
    getBatches(): Promise<any[]>;
    /**
     * Get available appointment slots
     */
    getAppointmentSlots(date?: string): Promise<any[]>;
    /**
     * Create a booking (batch or appointment)
     */
    createBooking(bookingData: any): Promise<any>;
    private getSessionId;
    destroy(): void;
}
//# sourceMappingURL=api.d.ts.map