# Lynk Embed Modules

## What is this?

This repository contains two modules for the Lynk Control Tower:

### 1. Marketing Pixel (`embed-sdk/`)
**For:** Academy owners who have their own website  
**What it does:** Tracks visitors and conversions (like Google Analytics + Facebook Pixel combined)

### 2. Get In Touch Button (`embed-sdk/`)
**For:** Academy owners who have their own website  
**What it does:** Adds a "Book Now" button that opens a popup for batch enrollment or appointment booking

### 3. Control Tower Dashboard (`control-tower/`)
**For:** You (Lynk team) and Academy admins  
**What it does:** Lets them configure the pixel and button, see analytics

---

## Quick Start (Local Development)

### Step 1: Build the Embed SDK
```bash
cd embed-sdk
npm install
npm run build
```

This creates the JavaScript files that academies will embed on their sites.

### Step 2: Run the Dashboard
```bash
cd control-tower
npm install
npm run dev
```

This opens a local development server where you can see and test the dashboard.

---

## How It Works (Simple Flow)

```
1. Academy owner logs into Lynk Control Tower
2. They configure their button (colors, text, which batches to show)
3. They copy a simple code snippet
4. They paste it on their website (Wix, WordPress, custom HTML)
5. Parents visiting their site see the "Book Now" button
6. When clicked, it shows Lynk's booking popup
7. Data flows back to Lynk + their marketing pixels (Google/Facebook)
```

---

## Project Structure

```
lynk-embed-modules/
├── embed-sdk/              # JavaScript for external websites
│   ├── src/
│   │   ├── pixel/         # Google/Facebook tracking code
│   │   ├── button/        # "Book Now" button code
│   │   └── shared/        # Common utilities
│   ├── examples/          # Demo HTML pages
│   └── README.md
│
└── control-tower/          # React dashboard for configuration
    ├── src/
    │   ├── components/
    │   │   ├── pixel/     # Pixel settings UI
    │   │   └── button/    # Button builder UI
    │   ├── api/           # Backend API calls
    │   └── hooks/         # Data fetching logic
    └── README.md
```

---

## Backend API Needed

For this to work, your backend needs these endpoints:

```
GET  /academies/{id}/embed-config
GET  /academies/{id}/batches?available=true
GET  /academies/{id}/appointments?date=YYYY-MM-DD
POST /bookings
POST /events
```

---

## Status

- [x] Code structure created
- [x] Pixel module (Google + Facebook + GA4)
- [x] Button module (Batch + Appointment booking)
- [x] Dashboard UI (React)
- [ ] Backend API endpoints
- [ ] Unit tests
- [ ] Integration tests
- [ ] Production deployment