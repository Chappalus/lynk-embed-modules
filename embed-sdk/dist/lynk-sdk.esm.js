/**
 * Shared types and utilities for Lynk Embed SDK
 */
class Logger {
    constructor(prefix, debug = false) {
        this.prefix = prefix;
        this.debugMode = debug;
    }
    log(level, message, ...args) {
        if (!this.debugMode && level === 'debug')
            return;
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
    debug(message, ...args) {
        this.log('debug', message, ...args);
    }
    info(message, ...args) {
        this.log('info', message, ...args);
    }
    warn(message, ...args) {
        this.log('warn', message, ...args);
    }
    error(message, ...args) {
        this.log('error', message, ...args);
    }
}
function setCookie(name, value, days = 365) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
function getUrlParams() {
    const params = {};
    const search = window.location.search;
    if (!search)
        return params;
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((value, key) => {
        params[key] = value;
    });
    return params;
}
function isBot() {
    const botPattern = /bot|crawler|spider|crawling/i;
    return botPattern.test(navigator.userAgent);
}

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

/**
 * Core API client for Lynk backend communication
 */
class LynkAPI {
    constructor(config) {
        this.queue = [];
        this.flushInterval = null;
        this.FLUSH_INTERVAL_MS = 5000;
        this.MAX_QUEUE_SIZE = 100;
        this.config = Object.assign({ apiBaseUrl: 'https://api.lynk.coach/v1' }, config);
        this.logger = new Logger('LynkAPI', config.debug);
        this.startFlushInterval();
    }
    startFlushInterval() {
        if (this.flushInterval)
            return;
        this.flushInterval = window.setInterval(() => {
            this.flush();
        }, this.FLUSH_INTERVAL_MS);
    }
    stopFlushInterval() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
    }
    /**
     * Track an event - queues for batch sending
     */
    track(event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.length >= this.MAX_QUEUE_SIZE) {
                this.logger.warn('Queue full, flushing immediately');
                yield this.flush();
            }
            const enrichedEvent = Object.assign(Object.assign({}, event), { timestamp: event.timestamp || Date.now(), academyId: this.config.academyId, sessionId: this.getSessionId(), url: window.location.href, referrer: document.referrer, userAgent: navigator.userAgent });
            this.queue.push(enrichedEvent);
            this.logger.debug('Event queued', enrichedEvent.eventName);
        });
    }
    /**
     * Flush queued events to API
     */
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.queue.length === 0)
                return;
            const events = [...this.queue];
            this.queue = [];
            try {
                const response = yield fetch(`${this.config.apiBaseUrl}/events`, {
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
            }
            catch (error) {
                this.logger.error('Failed to flush events', error);
                // Re-queue events on failure (with limit to prevent unbounded growth)
                this.queue = [...events.slice(0, 50), ...this.queue].slice(0, this.MAX_QUEUE_SIZE);
            }
        });
    }
    /**
     * Get academy configuration (batches, appointments, branding)
     */
    getAcademyConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.config.apiBaseUrl}/academies/${this.config.academyId}/embed-config`, {
                headers: {
                    'X-Lynk-API-Key': this.config.apiKey
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch academy config: ${response.status}`);
            }
            return response.json();
        });
    }
    /**
     * Get available batches for booking
     */
    getBatches() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.config.apiBaseUrl}/academies/${this.config.academyId}/batches?available=true`, {
                headers: {
                    'X-Lynk-API-Key': this.config.apiKey
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch batches: ${response.status}`);
            }
            return response.json();
        });
    }
    /**
     * Get available appointment slots
     */
    getAppointmentSlots(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = new URL(`${this.config.apiBaseUrl}/academies/${this.config.academyId}/appointments`);
            if (date)
                url.searchParams.set('date', date);
            const response = yield fetch(url.toString(), {
                headers: {
                    'X-Lynk-API-Key': this.config.apiKey
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch appointment slots: ${response.status}`);
            }
            return response.json();
        });
    }
    /**
     * Create a booking (batch or appointment)
     */
    createBooking(bookingData) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.config.apiBaseUrl}/bookings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Lynk-API-Key': this.config.apiKey
                },
                body: JSON.stringify(Object.assign(Object.assign({}, bookingData), { academyId: this.config.academyId }))
            });
            if (!response.ok) {
                throw new Error(`Failed to create booking: ${response.status}`);
            }
            return response.json();
        });
    }
    getSessionId() {
        var _a;
        const cookieName = `lynk_session_${this.config.academyId}`;
        let sessionId = (_a = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'))) === null || _a === void 0 ? void 0 : _a[2];
        if (!sessionId) {
            sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const expires = new Date(Date.now() + 30 * 60 * 1000).toUTCString(); // 30 min session
            document.cookie = `${cookieName}=${sessionId}; expires=${expires}; path=/; SameSite=Lax`;
        }
        return sessionId;
    }
    destroy() {
        this.stopFlushInterval();
        this.flush();
    }
}

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
class LynkPixel {
    constructor(config) {
        this.initialized = false;
        this.eventQueue = [];
        this.config = Object.assign({ apiBaseUrl: 'https://api.lynk.coach/v1', autoPageView: true }, config);
        this.logger = new Logger('LynkPixel', config.debug);
        this.api = new LynkAPI(config);
    }
    /**
     * Initialize the pixel
     */
    init() {
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
            pixels: Object.keys(this.config.pixels).filter(k => this.config.pixels[k])
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
        window.lynkPixel = this;
        this.logger.info('Pixel initialized successfully');
    }
    /**
     * Track a custom event
     */
    track(eventName, eventData) {
        const event = {
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
    trackPageView(pageData) {
        const data = {
            path: (pageData === null || pageData === void 0 ? void 0 : pageData.path) || window.location.pathname,
            title: (pageData === null || pageData === void 0 ? void 0 : pageData.title) || document.title,
            url: window.location.href,
            referrer: document.referrer
        };
        this.track('page_view', data);
    }
    /**
     * Track purchase/registration conversion
     */
    trackPurchase(data) {
        this.track('purchase', data);
    }
    /**
     * Track booking initiation
     */
    trackBeginCheckout(data) {
        this.track('begin_checkout', data);
    }
    /**
     * Track lead capture (form submission)
     */
    trackLead(data) {
        this.track('generate_lead', data);
    }
    /**
     * Track contact/appointment booking
     */
    trackContact(data) {
        this.track('contact', data);
    }
    processEvent(event) {
        var _a, _b, _c;
        this.logger.debug('Processing event', event);
        // Send to Lynk backend
        this.api.track({
            eventName: `pixel_${event.name}`,
            properties: event.data
        });
        // Send to Google Ads
        if (this.config.pixels.google && ((_a = this.config.consent) === null || _a === void 0 ? void 0 : _a.marketing) !== false) {
            this.sendToGoogle(event);
        }
        // Send to Facebook/Meta
        if (this.config.pixels.facebook && ((_b = this.config.consent) === null || _b === void 0 ? void 0 : _b.marketing) !== false) {
            this.sendToFacebook(event);
        }
        // Send to GA4
        if (this.config.pixels.googleAnalytics && ((_c = this.config.consent) === null || _c === void 0 ? void 0 : _c.analytics) !== false) {
            this.sendToGA4(event);
        }
    }
    loadGooglePixel() {
        if (!this.config.pixels.google)
            return;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.pixels.google}`;
        document.head.appendChild(script);
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', this.config.pixels.google);
        this.logger.debug('Google Ads pixel loaded', { id: this.config.pixels.google });
    }
    loadGoogleAnalytics() {
        if (!this.config.pixels.googleAnalytics)
            return;
        // GA4 uses the same gtag setup
        if (!window.gtag) {
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.pixels.googleAnalytics}`;
            document.head.appendChild(script);
            window.dataLayer = window.dataLayer || [];
            window.gtag = function () {
                window.dataLayer.push(arguments);
            };
            window.gtag('js', new Date());
        }
        window.gtag('config', this.config.pixels.googleAnalytics);
        this.logger.debug('GA4 loaded', { id: this.config.pixels.googleAnalytics });
    }
    loadFacebookPixel() {
        if (!this.config.pixels.facebook)
            return;
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
    sendToGoogle(event) {
        var _a, _b, _c, _d;
        const gtag = window.gtag;
        if (!gtag)
            return;
        const conversionLabels = {
            'purchase': 'purchase',
            'begin_checkout': 'begin_checkout',
            'generate_lead': 'generate_lead',
            'contact': 'contact',
            'page_view': 'page_view'
        };
        const eventName = conversionLabels[event.name] || 'custom';
        gtag('event', eventName, Object.assign({ send_to: this.config.pixels.google, value: (_a = event.data) === null || _a === void 0 ? void 0 : _a.value, currency: ((_b = event.data) === null || _b === void 0 ? void 0 : _b.currency) || 'USD', transaction_id: (_c = event.data) === null || _c === void 0 ? void 0 : _c.transactionId, items: (_d = event.data) === null || _d === void 0 ? void 0 : _d.items }, event.data));
        this.logger.debug('Sent to Google', { event: eventName });
    }
    sendToGA4(event) {
        const gtag = window.gtag;
        if (!gtag)
            return;
        // GA4 standard events
        const ga4Events = {
            'page_view': 'page_view',
            'purchase': 'purchase',
            'begin_checkout': 'begin_checkout',
            'generate_lead': 'generate_lead',
            'contact': 'contact'
        };
        const eventName = ga4Events[event.name] || `custom_${event.name}`;
        gtag('event', eventName, Object.assign(Object.assign({}, event.data), { academy_id: this.config.academyId }));
    }
    sendToFacebook(event) {
        var _a;
        const fbq = window.fbq;
        if (!fbq)
            return;
        // Facebook standard events
        const fbEvents = {
            'page_view': 'PageView',
            'purchase': 'Purchase',
            'begin_checkout': 'InitiateCheckout',
            'generate_lead': 'Lead',
            'contact': 'Contact'
        };
        const eventName = fbEvents[event.name] || 'CustomEvent';
        const params = Object.assign({ content_type: 'product' }, event.data);
        if ((_a = event.data) === null || _a === void 0 ? void 0 : _a.value) {
            params.value = event.data.value;
            params.currency = event.data.currency || 'USD';
        }
        fbq('track', eventName, params);
        this.logger.debug('Sent to Facebook', { event: eventName });
    }
    captureAttribution() {
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
    setupHistoryTracking() {
        // Track SPA navigation
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        const self = this;
        history.pushState = function (...args) {
            originalPushState.apply(this, args);
            self.trackPageView();
        };
        history.replaceState = function (...args) {
            originalReplaceState.apply(this, args);
            self.trackPageView();
        };
        window.addEventListener('popstate', () => {
            this.trackPageView();
        });
    }
    flushEventQueue() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            if (event)
                this.processEvent(event);
        }
    }
    /**
     * Update consent settings (for GDPR/CCPA compliance)
     */
    setConsent(consent) {
        this.config.consent = Object.assign(Object.assign({}, this.config.consent), consent);
        this.logger.info('Consent updated', this.config.consent);
    }
    destroy() {
        this.api.destroy();
        this.initialized = false;
    }
}
// Auto-initialize from data attributes
function autoInit$1() {
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
    document.addEventListener('DOMContentLoaded', autoInit$1);
}
else {
    autoInit$1();
}

/**
 * Lynk Get In Touch Button
 * Embeddable widget for academies to add booking functionality to their existing websites
 *
 * Usage:
 * <div id="lynk-button"></div>
 * <script src="https://cdn.lynk.coach/button.js" data-academy-id="xxx" data-api-key="xxx"></script>
 *
 * Or programmatic:
 * LynkButton.init({
 *   selector: '#lynk-button',
 *   academyId: 'xxx',
 *   apiKey: 'xxx',
 *   type: 'booking', // 'booking' | 'appointment'
 *   theme: { primaryColor: '#007bff', borderRadius: '8px' }
 * });
 */
class LynkButton {
    constructor(config) {
        this.container = null;
        this.modal = null;
        this.overlay = null;
        this.academyConfig = null;
        this.batches = [];
        this.appointmentSlots = [];
        this.currentStep = 'select';
        this.selectedItem = null;
        this.config = Object.assign({ apiBaseUrl: 'https://api.lynk.coach/v1', type: 'both', buttonText: 'Get in Touch', buttonStyle: 'default', buttonSize: 'medium', theme: {}, modalTitle: 'Book with Us', successMessage: 'Thank you! We will contact you shortly.' }, config);
        this.logger = new Logger('LynkButton', config.debug);
        this.api = new LynkAPI(this.config);
    }
    /**
     * Initialize the button
     */
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.info('Initializing Lynk Button');
            // Resolve container
            if (typeof this.config.selector === 'string') {
                this.container = document.querySelector(this.config.selector);
            }
            else {
                this.container = this.config.selector;
            }
            if (!this.container) {
                throw new Error(`Container not found: ${this.config.selector}`);
            }
            // Load academy config
            try {
                this.academyConfig = yield this.api.getAcademyConfig();
                this.logger.debug('Academy config loaded', this.academyConfig);
            }
            catch (error) {
                this.logger.error('Failed to load academy config', error);
                // Continue with defaults
            }
            // Render button
            this.renderButton();
            // Auto-open if configured
            if (this.config.autoOpen) {
                this.openModal();
            }
            this.logger.info('Button initialized');
        });
    }
    renderButton() {
        if (!this.container)
            return;
        const button = document.createElement('button');
        button.className = `lynk-btn lynk-btn--${this.config.buttonStyle} lynk-btn--${this.config.buttonSize}`;
        button.textContent = this.config.buttonText;
        button.onclick = () => this.openModal();
        // Apply custom styles
        this.applyButtonStyles(button);
        this.container.appendChild(button);
        // Inject styles if not already present
        this.injectStyles();
    }
    applyButtonStyles(button) {
        const theme = this.config.theme;
        const styles = {};
        if (theme.primaryColor) {
            if (this.config.buttonStyle === 'default') {
                styles.backgroundColor = theme.primaryColor;
                styles.borderColor = theme.primaryColor;
            }
            else {
                styles.color = theme.primaryColor;
                styles.borderColor = theme.primaryColor;
            }
        }
        if (theme.textColor && this.config.buttonStyle === 'default') {
            styles.color = theme.textColor;
        }
        if (theme.borderRadius) {
            styles.borderRadius = theme.borderRadius;
        }
        if (theme.fontFamily) {
            styles.fontFamily = theme.fontFamily;
        }
        if (theme.fontSize) {
            styles.fontSize = theme.fontSize;
        }
        if (theme.shadow) {
            styles.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        }
        Object.assign(button.style, styles);
    }
    injectStyles() {
        if (document.getElementById('lynk-button-styles'))
            return;
        const css = `
      .lynk-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 2px solid transparent;
        text-decoration: none;
        line-height: 1.5;
      }

      .lynk-btn--small { padding: 8px 16px; font-size: 14px; }
      .lynk-btn--medium { padding: 12px 24px; font-size: 16px; }
      .lynk-btn--large { padding: 16px 32px; font-size: 18px; }

      .lynk-btn--default {
        background: #007bff;
        color: white;
        border-radius: 8px;
      }
      .lynk-btn--default:hover {
        background: #0056b3;
        transform: translateY(-1px);
      }

      .lynk-btn--outline {
        background: transparent;
        color: #007bff;
        border-color: #007bff;
        border-radius: 8px;
      }
      .lynk-btn--outline:hover {
        background: #007bff;
        color: white;
      }

      .lynk-btn--minimal {
        background: transparent;
        color: #007bff;
        padding: 8px 0;
        text-decoration: underline;
      }

      .lynk-btn:active {
        transform: translateY(0);
      }

      /* Modal Styles */
      .lynk-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .lynk-overlay.active { opacity: 1; }

      .lynk-modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 9999;
        max-width: 480px;
        width: 90%;
        max-height: 85vh;
        opacity: 0;
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      .lynk-modal.active {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }

      .lynk-modal__header {
        padding: 20px 24px;
        border-bottom: 1px solid #e5e5e5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .lynk-modal__title {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
      }

      .lynk-modal__close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s;
      }
      .lynk-modal__close:hover { background: #f0f0f0; }

      .lynk-modal__content {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }

      .lynk-modal__footer {
        padding: 16px 24px;
        border-top: 1px solid #e5e5e5;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      /* Tabs */
      .lynk-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
        border-bottom: 2px solid #e5e5e5;
      }

      .lynk-tab {
        padding: 12px 16px;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 500;
        color: #666;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: all 0.2s;
      }
      .lynk-tab:hover { color: #333; }
      .lynk-tab.active {
        color: #007bff;
        border-bottom-color: #007bff;
      }

      /* Item Cards */
      .lynk-item {
        padding: 16px;
        border: 2px solid #e5e5e5;
        border-radius: 8px;
        margin-bottom: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lynk-item:hover {
        border-color: #007bff;
        background: #f8f9ff;
      }
      .lynk-item.selected {
        border-color: #007bff;
        background: #f0f5ff;
      }

      .lynk-item__name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .lynk-item__meta {
        font-size: 14px;
        color: #666;
      }

      .lynk-item__price {
        font-weight: 600;
        color: #007bff;
        margin-top: 8px;
      }

      /* Form */
      .lynk-form-group {
        margin-bottom: 16px;
      }

      .lynk-form-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        font-size: 14px;
      }

      .lynk-form-input,
      .lynk-form-select,
      .lynk-form-textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d0d0d0;
        border-radius: 6px;
        font-size: 16px;
        transition: border-color 0.2s;
      }
      .lynk-form-input:focus,
      .lynk-form-select:focus,
      .lynk-form-textarea:focus {
        outline: none;
        border-color: #007bff;
      }

      .lynk-form-textarea {
        min-height: 100px;
        resize: vertical;
      }

      /* Buttons */
      .lynk-btn-primary {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lynk-btn-primary:hover { background: #0056b3; }
      .lynk-btn-primary:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      .lynk-btn-secondary {
        background: transparent;
        color: #666;
        border: 1px solid #d0d0d0;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .lynk-btn-secondary:hover {
        background: #f0f0f0;
      }

      /* Success State */
      .lynk-success {
        text-align: center;
        padding: 40px 20px;
      }

      .lynk-success__icon {
        width: 64px;
        height: 64px;
        background: #28a745;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        color: white;
        font-size: 32px;
      }

      .lynk-success__title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 12px;
      }

      .lynk-success__message {
        color: #666;
        line-height: 1.6;
      }

      /* Loading */
      .lynk-loading {
        text-align: center;
        padding: 40px;
      }

      .lynk-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e5e5e5;
        border-top-color: #007bff;
        border-radius: 50%;
        animation: lynk-spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes lynk-spin {
        to { transform: rotate(360deg); }
      }

      /* Responsive */
      @media (max-width: 480px) {
        .lynk-modal {
          width: 95%;
          max-height: 90vh;
        }
      }
    `;
        const styleEl = document.createElement('style');
        styleEl.id = 'lynk-button-styles';
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    openModal() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.modal)
                return;
            // Create overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'lynk-overlay';
            this.overlay.onclick = () => this.closeModal();
            document.body.appendChild(this.overlay);
            // Create modal
            this.modal = document.createElement('div');
            this.modal.className = 'lynk-modal';
            this.modal.innerHTML = `
      <div class="lynk-modal__header">
        <h3 class="lynk-modal__title">${this.config.modalTitle}</h3>
        <button class="lynk-modal__close">&times;</button>
      </div>
      <div class="lynk-modal__content">
        <div class="lynk-loading">
          <div class="lynk-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    `;
            this.modal.querySelector('.lynk-modal__close').addEventListener('click', () => this.closeModal());
            document.body.appendChild(this.modal);
            // Animate in
            requestAnimationFrame(() => {
                var _a, _b;
                (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.classList.add('active');
                (_b = this.modal) === null || _b === void 0 ? void 0 : _b.classList.add('active');
            });
            // Load data
            yield this.loadData();
            this.renderSelectionStep();
        });
    }
    closeModal() {
        var _a, _b;
        (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.classList.remove('active');
        (_b = this.modal) === null || _b === void 0 ? void 0 : _b.classList.remove('active');
        setTimeout(() => {
            var _a, _b;
            (_a = this.overlay) === null || _a === void 0 ? void 0 : _a.remove();
            (_b = this.modal) === null || _b === void 0 ? void 0 : _b.remove();
            this.overlay = null;
            this.modal = null;
        }, 300);
    }
    loadData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.config.type === 'booking' || this.config.type === 'both') {
                    this.batches = yield this.api.getBatches();
                }
                if (this.config.type === 'appointment' || this.config.type === 'both') {
                    // Get slots for next 7 days
                    const today = new Date().toISOString().split('T')[0];
                    this.appointmentSlots = yield this.api.getAppointmentSlots(today);
                }
            }
            catch (error) {
                this.logger.error('Failed to load data', error);
            }
        });
    }
    renderSelectionStep() {
        if (!this.modal)
            return;
        const content = this.modal.querySelector('.lynk-modal__content');
        let html = '';
        // Show tabs if both types available
        if (this.config.type === 'both' && this.batches.length > 0 && this.appointmentSlots.length > 0) {
            html += `
        <div class="lynk-tabs">
          <button class="lynk-tab active" data-tab="batches">Join a Batch</button>
          <button class="lynk-tab" data-tab="appointments">Book Appointment</button>
        </div>
      `;
        }
        // Batches section
        if (this.batches.length > 0) {
            html += `<div class="lynk-section" id="lynk-batches">`;
            html += this.batches.map(batch => `
        <div class="lynk-item" data-type="batch" data-id="${batch.id}">
          <div class="lynk-item__name">${batch.name}</div>
          <div class="lynk-item__meta">${batch.schedule} • ${batch.coachName || 'TBD'}</div>
          ${batch.availableSpots < 10 ? `<div class="lynk-item__meta" style="color: #dc3545;">Only ${batch.availableSpots} spots left</div>` : ''}
          <div class="lynk-item__price">${batch.currency} ${batch.price}</div>
        </div>
      `).join('');
            html += `</div>`;
        }
        // Appointments section
        if (this.appointmentSlots.length > 0) {
            html += `<div class="lynk-section" id="lynk-appointments" style="display: none;">`;
            // Group by date
            const grouped = this.groupAppointmentsByDate(this.appointmentSlots);
            for (const [date, slots] of Object.entries(grouped)) {
                html += `<div style="margin-bottom: 16px;"><strong>${this.formatDate(date)}</strong></div>`;
                html += slots.map(slot => `
          <div class="lynk-item" data-type="appointment" data-id="${slot.id}">
            <div class="lynk-item__name">${slot.time} (${slot.duration} min)</div>
            ${slot.coachName ? `<div class="lynk-item__meta">with ${slot.coachName}</div>` : ''}
          </div>
        `).join('');
            }
            html += `</div>`;
        }
        // No data state
        if (this.batches.length === 0 && this.appointmentSlots.length === 0) {
            html = `
        <div style="text-align: center; padding: 40px;">
          <p>No bookings available at the moment.</p>
          <p>Please contact us directly.</p>
        </div>
      `;
        }
        content.innerHTML = html;
        // Bind tab switching
        content.querySelectorAll('.lynk-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const target = e.target;
                const tabName = target.dataset.tab;
                content.querySelectorAll('.lynk-tab').forEach(t => t.classList.remove('active'));
                target.classList.add('active');
                content.querySelector('#lynk-batches').style.display = tabName === 'batches' ? 'block' : 'none';
                content.querySelector('#lynk-appointments').style.display = tabName === 'appointments' ? 'block' : 'none';
            });
        });
        // Bind item selection
        content.querySelectorAll('.lynk-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.getAttribute('data-type');
                const id = item.getAttribute('data-id');
                content.querySelectorAll('.lynk-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                if (type === 'batch') {
                    this.selectedItem = this.batches.find(b => b.id === id) || null;
                }
                else {
                    this.selectedItem = this.appointmentSlots.find(a => a.id === id) || null;
                }
                this.renderFormStep();
            });
        });
    }
    renderFormStep() {
        if (!this.modal || !this.selectedItem)
            return;
        const content = this.modal.querySelector('.lynk-modal__content');
        const isBatch = 'price' in this.selectedItem;
        content.innerHTML = `
      <div style="margin-bottom: 20px; padding: 12px; background: #f8f9ff; border-radius: 8px;">
        <strong>${this.selectedItem.name || this.selectedItem.time}</strong>
        ${isBatch ? `<br><span style="color: #666;">${this.selectedItem.schedule}</span>` : ''}
      </div>

      <form id="lynk-booking-form">
        <div class="lynk-form-group">
          <label class="lynk-form-label">Full Name *</label>
          <input type="text" class="lynk-form-input" name="name" required placeholder="Enter your full name">
        </div>

        <div class="lynk-form-group">
          <label class="lynk-form-label">Phone Number *</label>
          <input type="tel" class="lynk-form-input" name="phone" required placeholder="Enter your phone number">
        </div>

        <div class="lynk-form-group">
          <label class="lynk-form-label">Email Address *</label>
          <input type="email" class="lynk-form-input" name="email" required placeholder="Enter your email">
        </div>

        ${isBatch ? `
        <div class="lynk-form-group">
          <label class="lynk-form-label">Student Name (if different)</label>
          <input type="text" class="lynk-form-input" name="studentName" placeholder="Enter student's name">
        </div>

        <div class="lynk-form-group">
          <label class="lynk-form-label">Student Age</label>
          <input type="number" class="lynk-form-input" name="studentAge" min="3" max="100" placeholder="Enter student's age">
        </div>
        ` : `
        <div class="lynk-form-group">
          <label class="lynk-form-label">What would you like to discuss?</label>
          <textarea class="lynk-form-textarea" name="notes" placeholder="Tell us briefly what you're looking for..."></textarea>
        </div>
        `}

        <button type="submit" class="lynk-btn-primary" style="width: 100%;">
          ${isBatch ? 'Request Enrollment' : 'Book Appointment'}
        </button>
      </form>
    `;
        const form = content.querySelector('#lynk-booking-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(new FormData(form));
        });
        // Add back button in footer
        const footer = this.modal.querySelector('.lynk-modal__footer') || document.createElement('div');
        footer.className = 'lynk-modal__footer';
        footer.innerHTML = `<button class="lynk-btn-secondary" id="lynk-back">← Back</button>`;
        this.modal.appendChild(footer);
        footer.querySelector('#lynk-back').addEventListener('click', () => {
            footer.remove();
            this.selectedItem = null;
            this.renderSelectionStep();
        });
    }
    handleSubmit(formData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const submitBtn = (_a = this.modal) === null || _a === void 0 ? void 0 : _a.querySelector('.lynk-btn-primary');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Processing...';
            }
            const data = {
                type: 'price' in this.selectedItem ? 'batch' : 'appointment',
                itemId: this.selectedItem.id,
                customer: {
                    name: formData.get('name'),
                    phone: formData.get('phone'),
                    email: formData.get('email'),
                },
                details: Object.fromEntries(formData.entries())
            };
            try {
                const result = yield this.api.createBooking(data);
                this.logger.info('Booking created', result);
                // Track conversion via pixel if available
                if (window.lynkPixel) {
                    (_c = (_b = window.lynkPixel).trackPurchase) === null || _c === void 0 ? void 0 : _c.call(_b, {
                        value: 'price' in this.selectedItem ? this.selectedItem.price : 0,
                        currency: 'price' in this.selectedItem ? this.selectedItem.currency : 'USD',
                        transactionId: result.id
                    });
                }
                this.renderSuccessStep();
                (_e = (_d = this.config).onBookingSuccess) === null || _e === void 0 ? void 0 : _e.call(_d, result);
            }
            catch (error) {
                this.logger.error('Booking failed', error);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'price' in this.selectedItem ? 'Request Enrollment' : 'Book Appointment';
                }
                alert('Something went wrong. Please try again or contact us directly.');
                (_g = (_f = this.config).onBookingError) === null || _g === void 0 ? void 0 : _g.call(_f, error);
            }
        });
    }
    renderSuccessStep() {
        var _a;
        if (!this.modal)
            return;
        // Remove footer
        (_a = this.modal.querySelector('.lynk-modal__footer')) === null || _a === void 0 ? void 0 : _a.remove();
        const content = this.modal.querySelector('.lynk-modal__content');
        content.innerHTML = `
      <div class="lynk-success">
        <div class="lynk-success__icon">✓</div>
        <div class="lynk-success__title">All Set!</div>
        <div class="lynk-success__message">${this.config.successMessage}</div>
      </div>
    `;
        // Auto-close after 5 seconds
        setTimeout(() => this.closeModal(), 5000);
    }
    groupAppointmentsByDate(slots) {
        return slots.reduce((acc, slot) => {
            if (!acc[slot.date])
                acc[slot.date] = [];
            acc[slot.date].push(slot);
            return acc;
        }, {});
    }
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (dateStr === today.toISOString().split('T')[0])
            return 'Today';
        if (dateStr === tomorrow.toISOString().split('T')[0])
            return 'Tomorrow';
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    destroy() {
        this.closeModal();
        this.api.destroy();
    }
}
// Auto-initialize
function autoInit() {
    const scripts = document.querySelectorAll('script[data-academy-id]');
    scripts.forEach(script => {
        const academyId = script.getAttribute('data-academy-id');
        const apiKey = script.getAttribute('data-api-key');
        const selector = script.getAttribute('data-selector') || '#lynk-button';
        const type = script.getAttribute('data-type') || 'both';
        const buttonText = script.getAttribute('data-button-text') || undefined;
        const debug = script.getAttribute('data-debug') === 'true';
        if (!academyId || !apiKey) {
            console.error('Lynk Button: academy-id and api-key are required');
            return;
        }
        const btn = new LynkButton({
            selector,
            academyId,
            apiKey,
            type,
            buttonText,
            debug
        });
        btn.init();
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
}
else {
    autoInit();
}

/**
 * Lynk Embed SDK
 *
 * Marketing Pixel + Get In Touch Button for Academy websites
 *
 * @example
 * // Full SDK
 * import { LynkPixel, LynkButton } from '@lynk/embed-sdk';
 *
 * // Standalone pixel
 * <script src="https://cdn.lynk.coach/lynk-pixel.min.js"
 *   data-academy-id="xxx"
 *   data-api-key="xxx"
 *   data-google-pixel="AW-xxx"
 *   data-facebook-pixel="xxx">
 * </script>
 *
 * // Standalone button
 * <div id="lynk-button"></div>
 * <script src="https://cdn.lynk.coach/lynk-button.min.js"
 *   data-academy-id="xxx"
 *   data-api-key="xxx">
 * </script>
 */
// Global SDK object
var index = {
    Pixel: LynkPixel,
    Button: LynkButton,
    version: '1.0.0'
};

export { LynkButton, LynkPixel, index as default };
//# sourceMappingURL=lynk-sdk.esm.js.map
