/**
 * Lynk Marketing Pixel
 * Replicates Shopify's pixel implementation for Google Ads and Meta (Facebook)
 *
 * Usage:
 * <script src="https://cdn.lynk.coach/pixel.js" data-academy-id="xxx" data-api-key="xxx"></script>
 *
 * Or programmatic:
 * LynkPixel.init({ academyId: 'xxx', apiKey: 'xxx', pixels: { google: 'AW-xxx', facebook: 'xxx' } });
 */
import { AcademyConfig } from '../shared/types';
export interface PixelConfig extends AcademyConfig {
    pixels: {
        google?: string;
        googleAnalytics?: string;
        facebook?: string;
    };
    consent?: {
        analytics?: boolean;
        marketing?: boolean;
    };
    autoPageView?: boolean;
}
export interface PixelEvent {
    name: string;
    data?: Record<string, any>;
    timestamp?: number;
}
export declare class LynkPixel {
    private config;
    private logger;
    private api;
    private initialized;
    private eventQueue;
    constructor(config: PixelConfig);
    /**
     * Initialize the pixel
     */
    init(): void;
    /**
     * Track a custom event
     */
    track(eventName: string, eventData?: Record<string, any>): void;
    /**
     * Track page view
     */
    trackPageView(pageData?: {
        path?: string;
        title?: string;
    }): void;
    /**
     * Track purchase/registration conversion
     */
    trackPurchase(data: {
        value: number;
        currency: string;
        transactionId: string;
        items?: Array<{
            id: string;
            name: string;
            quantity: number;
            price: number;
        }>;
    }): void;
    /**
     * Track booking initiation
     */
    trackBeginCheckout(data: {
        value?: number;
        currency?: string;
        batchId?: string;
        batchName?: string;
    }): void;
    /**
     * Track lead capture (form submission)
     */
    trackLead(data: {
        value?: number;
        currency?: string;
        formName?: string;
    }): void;
    /**
     * Track contact/appointment booking
     */
    trackContact(data: {
        method?: 'phone' | 'email' | 'whatsapp' | 'form';
        value?: number;
    }): void;
    private processEvent;
    private loadGooglePixel;
    private loadGoogleAnalytics;
    private loadFacebookPixel;
    private sendToGoogle;
    private sendToGA4;
    private sendToFacebook;
    private captureAttribution;
    private setupHistoryTracking;
    private flushEventQueue;
    /**
     * Update consent settings (for GDPR/CCPA compliance)
     */
    setConsent(consent: {
        analytics?: boolean;
        marketing?: boolean;
    }): void;
    destroy(): void;
}
export { LynkPixel as default };
//# sourceMappingURL=pixel.d.ts.map