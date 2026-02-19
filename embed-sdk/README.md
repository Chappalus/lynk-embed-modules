# Lynk Embed SDK

Marketing Pixel and Get In Touch Button for Lynk academies. Replicates Shopify's embed approach.

## Quick Start

### 1. Marketing Pixel (Google + Facebook)

Drop this in your `<head>`:

```html
<script 
  src="https://cdn.lynk.coach/lynk-pixel.min.js"
  data-academy-id="YOUR_ACADEMY_ID"
  data-api-key="YOUR_API_KEY"
  data-google-pixel="AW-XXXXXXXXX"
  data-facebook-pixel="XXXXXXXXXX"
  data-ga4-id="G-XXXXXXXXXX">
</script>
```

**Track custom events:**

```javascript
// Page views (auto-tracked)
lynkPixel.trackPageView();

// Booking initiated
lynkPixel.trackBeginCheckout({
  batchId: 'batch-123',
  batchName: 'Beginner Tennis',
  value: 2999,
  currency: 'INR'
});

// Purchase/Registration complete
lynkPixel.trackPurchase({
  value: 2999,
  currency: 'INR',
  transactionId: 'txn-abc123',
  items: [{
    id: 'batch-123',
    name: 'Beginner Tennis',
    quantity: 1,
    price: 2999
  }]
});

// Lead captured
lynkPixel.trackLead({
  formName: 'Contact Form',
  value: 100
});
```

**GDPR/CCPA Consent:**

```javascript
// User accepted cookies
lynkPixel.setConsent({
  analytics: true,
  marketing: true
});

// User declined marketing
lynkPixel.setConsent({
  analytics: true,
  marketing: false
});
```

---

### 2. Get In Touch Button

Add to any page:

```html
<!-- Placeholder where button appears -->
<div id="lynk-button"></div>

<!-- Initialize -->
<script 
  src="https://cdn.lynk.coach/lynk-button.min.js"
  data-academy-id="YOUR_ACADEMY_ID"
  data-api-key="YOUR_API_KEY"
  data-type="both"
  data-button-text="Book Now">
</script>
```

**Programmatic control:**

```javascript
const button = new LynkButton({
  selector: '#lynk-button',
  academyId: 'YOUR_ACADEMY_ID',
  apiKey: 'YOUR_API_KEY',
  type: 'booking', // 'booking' | 'appointment' | 'both'
  buttonText: 'Get Started',
  buttonStyle: 'default', // 'default' | 'outline' | 'minimal'
  buttonSize: 'large', // 'small' | 'medium' | 'large'
  theme: {
    primaryColor: '#FF6B35',
    borderRadius: '12px',
    fontFamily: 'Inter, sans-serif',
    shadow: true
  },
  onBookingSuccess: (booking) => {
    console.log('Booking created:', booking);
  },
  onBookingError: (error) => {
    console.error('Booking failed:', error);
  }
});

button.init();
```

---

## Installation

### CDN (Recommended)

```html
<!-- Full SDK -->
<script src="https://cdn.lynk.coach/lynk-sdk.min.js"></script>

<!-- Pixel only -->
<script src="https://cdn.lynk.coach/lynk-pixel.min.js"></script>

<!-- Button only -->
<script src="https://cdn.lynk.coach/lynk-button.min.js"></script>
```

### NPM

```bash
npm install @lynk/embed-sdk
```

```javascript
import { LynkPixel, LynkButton } from '@lynk/embed-sdk';

// Initialize pixel
const pixel = new LynkPixel({
  academyId: 'xxx',
  apiKey: 'xxx',
  pixels: {
    google: 'AW-xxx',
    facebook: 'xxx'
  }
});
pixel.init();

// Initialize button
const button = new LynkButton({
  selector: '#button',
  academyId: 'xxx',
  apiKey: 'xxx'
});
button.init();
```

---

## Events Tracked

| Event | Description | Auto-fired |
|-------|-------------|------------|
| `page_view` | Page viewed | ✅ Yes |
| `begin_checkout` | User starts booking flow | Manual |
| `purchase` | Booking completed | Manual |
| `generate_lead` | Form submission | Manual |
| `contact` | Phone/email click | Manual |

---

## API Endpoints Required

The SDK expects these backend endpoints:

```
GET  /v1/academies/{id}/embed-config
GET  /v1/academies/{id}/batches?available=true
GET  /v1/academies/{id}/appointments?date=YYYY-MM-DD
POST /v1/bookings
POST /v1/events
```

---

## Build

```bash
npm install
npm run build
```

Outputs:
- `dist/lynk-sdk.js` - Full SDK
- `dist/lynk-pixel.js` - Pixel only
- `dist/lynk-button.js` - Button only

---

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

---

## License

MIT