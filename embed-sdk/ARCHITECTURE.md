# Lynk Embed SDK Architecture

## Overview

This SDK provides two embeddable modules for Lynk academies:

1. **Marketing Pixel** - Google Ads, Facebook Pixel, GA4 integration
2. **Get In Touch Button** - Embeddable booking widget

Both follow Shopify's embed pattern: drop-in scripts that work on any website.

---

## Module Design

### 1. Marketing Pixel (`src/pixel/`)

**Purpose:** Track conversions and attribution across academy websites.

**Key Features:**
- Auto-loads Google Ads, Facebook Pixel, GA4
- Captures UTM parameters, gclid, fbclid
- SPA navigation tracking (History API)
- GDPR/CCPA consent management
- Event queuing before initialization

**Integration Points:**
```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Academy Site   │────▶│  Lynk Pixel  │────▶│  Google/Facebook│
│  (any platform) │     │  (this SDK)  │     │  (third-party)  │
└─────────────────┘     └──────┬───────┘     └─────────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Lynk Backend │
                        │  (events)    │
                        └──────────────┘
```

**Events:**
- `page_view` - Auto
- `begin_checkout` - Manual (booking initiated)
- `purchase` - Manual (registration complete)
- `generate_lead` - Manual (form submission)
- `contact` - Manual (phone/email)

---

### 2. Get In Touch Button (`src/button/`)

**Purpose:** Let academies add booking functionality to existing websites.

**Key Features:**
- Three modes: batch booking, appointments, or both
- Customizable themes (colors, fonts, radius)
- Three styles: default, outline, minimal
- Responsive modal with multi-step flow
- Auto-integration with Marketing Pixel

**User Flow:**
```
┌──────────┐    ┌────────────┐    ┌──────────┐    ┌──────────┐
│  Button  │───▶│  Selection │───▶│   Form   │───▶│ Success  │
│  Click   │    │(Batch/Apt) │    │ (Details)│    │ (Done!)  │
└──────────┘    └────────────┘    └──────────┘    └──────────┘
```

**Integration Points:**
- Fetches batches/appointments from Lynk API
- Creates bookings via Lynk API
- Tracks conversions via Lynk Pixel (if present)

---

## Store Builder Integration

The button module is designed to plug into the Store Builder module:

```typescript
// Store Builder will provide these components:
interface StoreBuilderModule {
  // Batch management
  batches: {
    listAvailable(): Promise<Batch[]>;
    getById(id: string): Promise<Batch>;
  };
  
  // Appointment management  
  appointments: {
    getSlots(date?: string): Promise<AppointmentSlot[]>;
    book(slotId: string, customer: Customer): Promise<Booking>;
  };
  
  // Academy configuration
  config: {
    getEmbedConfig(): Promise<EmbedConfig>;
  };
}

// The button SDK will call:
const batches = await storeBuilder.batches.listAvailable();
const slots = await storeBuilder.appointments.getSlots();
const booking = await storeBuilder.appointments.book(slotId, customer);
```

**Plug-and-play approach:**
1. Store Builder exposes standardized API endpoints
2. Button SDK consumes those endpoints
3. No direct code dependency - contract-based integration

---

## API Contract

The SDK expects these backend endpoints:

```
GET  /v1/academies/{id}/embed-config
     → { name, logo, colors, contactInfo, features }

GET  /v1/academies/{id}/batches?available=true
     → Batch[]

GET  /v1/academies/{id}/appointments?date=YYYY-MM-DD
     → AppointmentSlot[]

POST /v1/bookings
     body: { type, itemId, customer, details }
     → Booking

POST /v1/events
     body: { events: TrackingEvent[] }
     → { success }
```

---

## Distribution Strategy

| Format | Use Case | Size |
|--------|----------|------|
| `lynk-sdk.min.js` | Full SDK (NPM/CDN) | ~15KB |
| `lynk-pixel.min.js` | Pixel only | ~8KB |
| `lynk-button.min.js` | Button only | ~12KB |
| `lynk-sdk.esm.js` | ES modules (bundlers) | ~15KB |

**CDN Paths:**
```
https://cdn.lynk.coach/lynk-sdk.min.js
https://cdn.lynk.coach/lynk-pixel.min.js
https://cdn.lynk.coach/lynk-button.min.js
```

---

## Security Considerations

1. **API Key:** Read-only key for public embeds
2. **CORS:** CDN scripts served with proper headers
3. **XSS:** All DOM insertion uses textContent, not innerHTML
4. **CSRF:** API calls use Origin validation
5. **PII:** Customer data only sent on form submission

---

## Future Enhancements

1. **Pixel:** TikTok Pixel, LinkedIn Insight Tag
2. **Button:** Multi-language support, payment integration
3. **Both:** Web Components for framework-agnostic usage
4. **Analytics:** Academy dashboard for conversion metrics