(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.LynkPixel = {}));
})(this, (function (exports) { 'use strict';

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
    function autoInit() {
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
    }
    else {
        autoInit();
    }

    exports.LynkPixel = LynkPixel;
    exports.default = LynkPixel;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=lynk-pixel.js.map
