import { Logger, AcademyConfig, EventData, TrackingEvent } from './types';

/**
 * Core API client for Lynk backend communication
 */
export class LynkAPI {
  private config: AcademyConfig;
  private logger: Logger;
  private queue: TrackingEvent[] = [];
  private flushInterval: number | null = null;
  private readonly FLUSH_INTERVAL_MS = 5000;
  private readonly MAX_QUEUE_SIZE = 100;

  constructor(config: AcademyConfig) {
    this.config = {
      apiBaseUrl: 'https://api.lynk.coach/v1',
      ...config
    };
    this.logger = new Logger('LynkAPI', config.debug);
    this.startFlushInterval();
  }

  private startFlushInterval(): void {
    if (this.flushInterval) return;
    this.flushInterval = window.setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL_MS);
  }

  private stopFlushInterval(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Track an event - queues for batch sending
   */
  async track(event: TrackingEvent): Promise<void> {
    if (this.queue.length >= this.MAX_QUEUE_SIZE) {
      this.logger.warn('Queue full, flushing immediately');
      await this.flush();
    }

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      academyId: this.config.academyId,
      sessionId: this.getSessionId(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    this.queue.push(enrichedEvent);
    this.logger.debug('Event queued', enrichedEvent.eventName);
  }

  /**
   * Flush queued events to API
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch(`${this.config.apiBaseUrl}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Lynk-API-Key': this.config.apiKey
        },
        body: JSON.stringify({ events }),
        keepalive: true
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      this.logger.debug(`Flushed ${events.length} events`);
    } catch (error) {
      this.logger.error('Failed to flush events', error);
      // Re-queue events on failure (with limit to prevent unbounded growth)
      this.queue = [...events.slice(0, 50), ...this.queue].slice(0, this.MAX_QUEUE_SIZE);
    }
  }

  /**
   * Get academy configuration (batches, appointments, branding)
   */
  async getAcademyConfig(): Promise<any> {
    const response = await fetch(
      `${this.config.apiBaseUrl}/academies/${this.config.academyId}/embed-config`,
      {
        headers: {
          'X-Lynk-API-Key': this.config.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch academy config: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get available batches for booking
   */
  async getBatches(): Promise<any[]> {
    const response = await fetch(
      `${this.config.apiBaseUrl}/academies/${this.config.academyId}/batches?available=true`,
      {
        headers: {
          'X-Lynk-API-Key': this.config.apiKey
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch batches: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get available appointment slots
   */
  async getAppointmentSlots(date?: string): Promise<any[]> {
    const url = new URL(`${this.config.apiBaseUrl}/academies/${this.config.academyId}/appointments`);
    if (date) url.searchParams.set('date', date);

    const response = await fetch(url.toString(), {
      headers: {
        'X-Lynk-API-Key': this.config.apiKey
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch appointment slots: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a booking (batch or appointment)
   */
  async createBooking(bookingData: any): Promise<any> {
    const response = await fetch(`${this.config.apiBaseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lynk-API-Key': this.config.apiKey
      },
      body: JSON.stringify({
        ...bookingData,
        academyId: this.config.academyId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create booking: ${response.status}`);
    }

    return response.json();
  }

  private getSessionId(): string {
    const cookieName = `lynk_session_${this.config.academyId}`;
    let sessionId = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'))?.[2];
    
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString(); // 30 min session
      document.cookie = `${cookieName}=${sessionId}; expires=${expires}; path=/; SameSite=Lax`;
    }
    
    return sessionId;
  }

  destroy(): void {
    this.stopFlushInterval();
    this.flush();
  }
}