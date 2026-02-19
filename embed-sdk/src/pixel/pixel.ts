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

import { Logger, AcademyConfig, getUrlParams, setCookie, getCookie, isBot } from '../shared/types';
import { LynkAPI } from '../shared/api';

export interface PixelConfig extends AcademyConfig {
  pixels: {
    google?: string;      // Google Ads conversion ID (AW-xxxxxxxx)
    googleAnalytics?: string; // GA4 measurement ID (G-xxxxxxxx)
    facebook?: string;    // Meta Pixel ID
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

export class LynkPixel {
  private config: PixelConfig;
  private logger: Logger;
  private api: LynkAPI;
  private initialized = false;
  private eventQueue: PixelEvent[] = [];

  constructor(config: PixelConfig) {
    this.config = {
      apiBaseUrl: 'https://api.lynk.coach/v1',
      autoPageView: true,
      ...config
    };
    this.logger = new Logger('LynkPixel', config.debug);
    this.api = new LynkAPI(config);
  }

  /**
   * Initialize the pixel
   */
  init(): void {
    if (this.initialized) {
      this.logger.warn('Pixel already initialized');
      return;
    }

    if (isBot()) {
      this.logger.info('Bot detected, skipping pixel initialization');
      return;
    }

    this.logger.info('Initializing Lynk Pixel', { 
      academyId: this.config.academyId,
      pixels: Object.keys(this.config.pixels).filter(k => this.config.pixels[k as keyof typeof this.config.pixels])
    });

    // Load third-party pixels
    this.loadGooglePixel();
    this.loadFacebookPixel();
    this.loadGoogleAnalytics();

    // Track attribution
    this.captureAttribution();

    // Set up auto page view tracking
    if (this.config.autoPageView) {
      this.trackPageView();
      this.setupHistoryTracking();
    }

    // Process queued events
    this.initialized = true;
    this.flushEventQueue();

    // Expose global for inline event tracking
    (window as any).lynkPixel = this;

    this.logger.info('Pixel initialized successfully');
  }

  /**
   * Track a custom event
   */
  track(eventName: string, eventData?: Record<string, any>): void {
    const event: PixelEvent = {
      name: eventName,
      data: eventData,
      timestamp: Date.now()
    };

    if (!this.initialized) {
      this.eventQueue.push(event);
      return;
    }

    this.processEvent(event);
  }

  /**
   * Track page view
   */
  trackPageView(pageData?: { path?: string; title?: string }): void {
    const data = {
      path: pageData?.path || window.location.pathname,
      title: pageData?.title || document.title,
      url: window.location.href,
      referrer: document.referrer
    };

    this.track('page_view', data);
  }

  /**
   * Track purchase/registration conversion
   */
  trackPurchase(data: {
    value: number;
    currency: string;
    transactionId: string;
    items?: Array<{ id: string; name: string; quantity: number; price: number }>;
  }): void {
    this.track('purchase', data);
  }

  /**
   * Track booking initiation
   */
  trackBeginCheckout(data: {
    value?: number;
    currency?: string;
    batchId?: string;
    batchName?: string;
  }): void {
    this.track('begin_checkout', data);
  }

  /**
   * Track lead capture (form submission)
   */
  trackLead(data: {
    value?: number;
    currency?: string;
    formName?: string;
  }): void {
    this.track('generate_lead', data);
  }

  /**
   * Track contact/appointment booking
   */
  trackContact(data: {
    method?: 'phone' | 'email' | 'whatsapp' | 'form';
    value?: number;
  }): void {
    this.track('contact', data);
  }

  private processEvent(event: PixelEvent): void {
    this.logger.debug('Processing event', event);

    // Send to Lynk backend
    this.api.track({
      eventName: `pixel_${event.name}`,
      properties: event.data
    });

    // Send to Google Ads
    if (this.config.pixels.google && this.config.consent?.marketing !== false) {
      this.sendToGoogle(event);
    }

    // Send to Facebook/Meta
    if (this.config.pixels.facebook && this.config.consent?.marketing !== false) {
      this.sendToFacebook(event);
    }

    // Send to GA4
    if (this.config.pixels.googleAnalytics && this.config.consent?.analytics !== false) {
      this.sendToGA4(event);
    }
  }

  private loadGooglePixel(): void {
    if (!this.config.pixels.google) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.pixels.google}`;
    document.head.appendChild(script);

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).gtag = function() {
      (window as any).dataLayer.push(arguments);
    };
    (window as any).gtag('js', new Date());
    (window as any).gtag('config', this.config.pixels.google);

    this.logger.debug('Google Ads pixel loaded', { id: this.config.pixels.google });
  }

  private loadGoogleAnalytics(): void {
    if (!this.config.pixels.googleAnalytics) return;

    // GA4 uses the same gtag setup
    if (!(window as any).gtag) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.pixels.googleAnalytics}`;
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      (window as any).gtag = function() {
        (window as any).dataLayer.push(arguments);
      };
      (window as any).gtag('js', new Date());
    }

    (window as any).gtag('config', this.config.pixels.googleAnalytics);
    this.logger.debug('GA4 loaded', { id: this.config.pixels.googleAnalytics });
  }

  private loadFacebookPixel(): void {
    if (!this.config.pixels.facebook) return;

    const pixelId = this.config.pixels.facebook;

    // Facebook Pixel base code
    const fbScript = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `;

    const script = document.createElement('script');
    script.textContent = fbScript;
    document.head.appendChild(script);

    this.logger.debug('Facebook pixel loaded', { id: pixelId });
  }

  private sendToGoogle(event: PixelEvent): void {
    const gtag = (window as any).gtag;
    if (!gtag) return;

    const conversionLabels: Record<string, string> = {
      'purchase': 'purchase',
      'begin_checkout': 'begin_checkout',
      'generate_lead': 'generate_lead',
      'contact': 'contact',
      'page_view': 'page_view'
    };

    const eventName = conversionLabels[event.name] || 'custom';
    
    gtag('event', eventName, {
      send_to: this.config.pixels.google,
      value: event.data?.value,
      currency: event.data?.currency || 'USD',
      transaction_id: event.data?.transactionId,
      items: event.data?.items,
      ...event.data
    });

    this.logger.debug('Sent to Google', { event: eventName });
  }

  private sendToGA4(event: PixelEvent): void {
    const gtag = (window as any).gtag;
    if (!gtag) return;

    // GA4 standard events
    const ga4Events: Record<string, string> = {
      'page_view': 'page_view',
      'purchase': 'purchase',
      'begin_checkout': 'begin_checkout',
      'generate_lead': 'generate_lead',
      'contact': 'contact'
    };

    const eventName = ga4Events[event.name] || `custom_${event.name}`;
    
    gtag('event', eventName, {
      ...event.data,
      academy_id: this.config.academyId
    });
  }

  private sendToFacebook(event: PixelEvent): void {
    const fbq = (window as any).fbq;
    if (!fbq) return;

    // Facebook standard events
    const fbEvents: Record<string, string> = {
      'page_view': 'PageView',
      'purchase': 'Purchase',
      'begin_checkout': 'InitiateCheckout',
      'generate_lead': 'Lead',
      'contact': 'Contact'
    };

    const eventName = fbEvents[event.name] || 'CustomEvent';
    const params: Record<string, any> = {
      content_type: 'product',
      ...event.data
    };

    if (event.data?.value) {
      params.value = event.data.value;
      params.currency = event.data.currency || 'USD';
    }

    fbq('track', eventName, params);
    this.logger.debug('Sent to Facebook', { event: eventName });
  }

  private captureAttribution(): void {
    const params = getUrlParams();
    const now = new Date().toISOString();

    // UTM parameters
    if (params.utm_source || params.utm_medium || params.utm_campaign) {
      const attribution = {
        source: params.utm_source || 'direct',
        medium: params.utm_medium || 'none',
        campaign: params.utm_campaign,
        content: params.utm_content,
        term: params.utm_term,
        timestamp: now
      };

      // Store for 30 days
      setCookie('lynk_attribution', JSON.stringify(attribution), 30);
      
      this.api.track({
        eventName: 'attribution_captured',
        properties: attribution
      });
    }

    // Click ID tracking (Google gclid, Facebook fbclid)
    if (params.gclid) {
      setCookie('lynk_gclid', params.gclid, 30);
    }
    if (params.fbclid) {
      setCookie('lynk_fbclid', params.fbclid, 30);
    }
  }

  private setupHistoryTracking(): void {
    // Track SPA navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    const self = this;

    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      self.trackPageView();
    };

    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      self.trackPageView();
    };

    window.addEventListener('popstate', () => {
      this.trackPageView();
    });
  }

  private flushEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) this.processEvent(event);
    }
  }

  /**
   * Update consent settings (for GDPR/CCPA compliance)
   */
  setConsent(consent: { analytics?: boolean; marketing?: boolean }): void {
    this.config.consent = { ...this.config.consent, ...consent };
    this.logger.info('Consent updated', this.config.consent);
  }

  destroy(): void {
    this.api.destroy();
    this.initialized = false;
  }
}

// Auto-initialize from data attributes
function autoInit(): void {
  const scripts = document.querySelectorAll('script[data-academy-id]');
  scripts.forEach(script => {
    const academyId = script.getAttribute('data-academy-id');
    const apiKey = script.getAttribute('data-api-key');
    const googlePixel = script.getAttribute('data-google-pixel');
    const facebookPixel = script.getAttribute('data-facebook-pixel');
    const googleAnalytics = script.getAttribute('data-ga4-id');
    const debug = script.getAttribute('data-debug') === 'true';

    if (!academyId || !apiKey) {
      console.error('Lynk Pixel: academy-id and api-key are required');
      return;
    }

    const pixel = new LynkPixel({
      academyId,
      apiKey,
      debug,
      pixels: {
        google: googlePixel || undefined,
        facebook: facebookPixel || undefined,
        googleAnalytics: googleAnalytics || undefined
      }
    });

    pixel.init();
  });
}

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', autoInit);
} else {
  autoInit();
}

export { LynkPixel as default };