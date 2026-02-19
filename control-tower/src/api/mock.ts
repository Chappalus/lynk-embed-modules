import type { 
  Academy, PixelConfig, ButtonConfig, Batch, AppointmentSettings,
  AppointmentSlot, PixelEvent, ButtonAnalytics, PixelAnalytics, EmbedCode 
} from '@/types';

// Mock Academy
const mockAcademy: Academy = {
  id: 'demo-academy-123',
  name: 'Elite Tennis Academy',
  slug: 'elite-tennis',
  logo: 'https://via.placeholder.com/100',
  primaryColor: '#3b6eff',
  contactEmail: 'contact@elitetennis.com',
  contactPhone: '+91 98765 43210',
  website: 'https://elitetennis.com',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

// Mock Pixel Config
const mockPixelConfig: PixelConfig = {
  id: 'pixel-123',
  academyId: 'demo-academy-123',
  googleAdsId: 'AW-123456789',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  facebookPixelId: '1234567890',
  tiktokPixelId: '',
  linkedinInsightId: '',
  customScripts: '',
  consentRequired: true,
  consentMessage: 'We use cookies to improve your experience and track conversions.',
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

// Mock Button Config
const mockButtonConfig: ButtonConfig = {
  id: 'button-123',
  academyId: 'demo-academy-123',
  type: 'both',
  buttonText: 'Get in Touch',
  buttonStyle: 'default',
  buttonSize: 'large',
  primaryColor: '#3b6eff',
  textColor: '#ffffff',
  backgroundColor: '#3b6eff',
  borderRadius: '8',
  fontFamily: 'system-ui',
  showShadow: true,
  modalTitle: 'Book with Us',
  successMessage: 'Thank you! We will contact you shortly.',
  defaultTab: 'batches',
  showPrices: true,
  showAvailability: true,
  requirePhone: true,
  requireEmail: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z',
};

// Mock Batches
const mockBatches: Batch[] = [
  {
    id: 'batch-1',
    academyId: 'demo-academy-123',
    name: 'Beginner Tennis (Age 6-10)',
    description: 'Perfect for kids starting their tennis journey',
    sport: 'Tennis',
    ageGroup: '6-10',
    level: 'Beginner',
    schedule: 'Mon, Wed, Fri • 4:00 PM - 5:30 PM',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    price: 2999,
    currency: 'INR',
    capacity: 12,
    enrolledCount: 8,
    coachId: 'coach-1',
    coachName: 'Coach Rahul',
    venueId: 'venue-1',
    venueName: 'Court A - Indoor',
    isActive: true,
    allowEmbedBooking: true,
  },
  {
    id: 'batch-2',
    academyId: 'demo-academy-123',
    name: 'Intermediate Tennis (Age 10-14)',
    description: 'For players with basic skills looking to improve',
    sport: 'Tennis',
    ageGroup: '10-14',
    level: 'Intermediate',
    schedule: 'Tue, Thu, Sat • 5:00 PM - 6:30 PM',
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    price: 3499,
    currency: 'INR',
    capacity: 10,
    enrolledCount: 9,
    coachId: 'coach-2',
    coachName: 'Coach Priya',
    venueId: 'venue-2',
    venueName: 'Court B - Outdoor',
    isActive: true,
    allowEmbedBooking: true,
  },
  {
    id: 'batch-3',
    academyId: 'demo-academy-123',
    name: 'Weekend Intensive Camp',
    description: 'Intensive training over weekends',
    sport: 'Tennis',
    ageGroup: 'All Ages',
    level: 'All Levels',
    schedule: 'Sat, Sun • 9:00 AM - 12:00 PM',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    price: 4999,
    currency: 'INR',
    capacity: 15,
    enrolledCount: 12,
    coachId: 'coach-1',
    coachName: 'Coach Rahul & Priya',
    venueId: 'venue-3',
    venueName: 'Main Court',
    isActive: true,
    allowEmbedBooking: false,
  },
  {
    id: 'batch-4',
    academyId: 'demo-academy-123',
    name: 'Advanced Competition Training',
    description: 'For tournament players',
    sport: 'Tennis',
    ageGroup: '14-18',
    level: 'Advanced',
    schedule: 'Mon-Fri • 6:00 AM - 8:00 AM',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    price: 5999,
    currency: 'INR',
    capacity: 6,
    enrolledCount: 6,
    coachId: 'coach-2',
    coachName: 'Coach Priya',
    venueId: 'venue-1',
    venueName: 'Court A - Indoor',
    isActive: true,
    allowEmbedBooking: false,
  },
];

// Mock Appointment Settings
const mockAppointmentSettings: AppointmentSettings = {
  id: 'apt-settings-123',
  academyId: 'demo-academy-123',
  enabled: true,
  slotDuration: 30,
  bufferMinutes: 15,
  maxAdvanceDays: 30,
  minAdvanceHours: 24,
  workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  allowEmbedBooking: true,
};

// Mock Appointment Slots
const mockAppointmentSlots: AppointmentSlot[] = [
  { id: 'apt-1', academyId: 'demo-academy-123', coachId: 'coach-1', coachName: 'Coach Rahul', date: '2024-02-20', startTime: '10:00', endTime: '10:30', duration: 30, isBooked: false },
  { id: 'apt-2', academyId: 'demo-academy-123', coachId: 'coach-1', coachName: 'Coach Rahul', date: '2024-02-20', startTime: '11:00', endTime: '11:30', duration: 30, isBooked: true, bookingId: 'book-1' },
  { id: 'apt-3', academyId: 'demo-academy-123', coachId: 'coach-2', coachName: 'Coach Priya', date: '2024-02-20', startTime: '14:00', endTime: '14:30', duration: 30, isBooked: false },
  { id: 'apt-4', academyId: 'demo-academy-123', coachId: 'coach-1', coachName: 'Coach Rahul', date: '2024-02-21', startTime: '09:00', endTime: '09:30', duration: 30, isBooked: false },
  { id: 'apt-5', academyId: 'demo-academy-123', coachId: 'coach-2', coachName: 'Coach Priya', date: '2024-02-21', startTime: '15:00', endTime: '15:30', duration: 30, isBooked: false },
];

// Mock Analytics
const generateMockAnalytics = (days: number): ButtonAnalytics[] => {
  const data: ButtonAnalytics[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      date: date.toISOString().split('T')[0],
      impressions: Math.floor(Math.random() * 500) + 100,
      clicks: Math.floor(Math.random() * 80) + 20,
      bookings: Math.floor(Math.random() * 15) + 2,
      conversionRate: Math.random() * 5 + 1,
    });
  }
  return data;
};

const generateMockPixelAnalytics = (days: number): PixelAnalytics[] => {
  const data: PixelAnalytics[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    data.push({
      date: date.toISOString().split('T')[0],
      pageViews: Math.floor(Math.random() * 1000) + 200,
      events: {
        page_view: Math.floor(Math.random() * 800) + 150,
        begin_checkout: Math.floor(Math.random() * 50) + 10,
        purchase: Math.floor(Math.random() * 20) + 2,
        generate_lead: Math.floor(Math.random() * 30) + 5,
      },
      sources: {
        google: Math.floor(Math.random() * 400) + 100,
        facebook: Math.floor(Math.random() * 300) + 50,
        direct: Math.floor(Math.random() * 200) + 30,
        organic: Math.floor(Math.random() * 100) + 20,
      },
    });
  }
  return data;
};

const mockButtonAnalytics = generateMockAnalytics(30);
const mockPixelAnalytics = generateMockPixelAnalytics(30);

// Mock Embed Code
const mockEmbedCode: EmbedCode = {
  pixel: '<!-- Lynk Pixel -->\n<script src="https://cdn.lynk.coach/lynk-pixel.min.js" data-academy-id="demo-academy-123"></script>',
  button: '<!-- Lynk Button -->\n<div id="lynk-button"></div>\n<script src="https://cdn.lynk.coach/lynk-button.min.js" data-academy-id="demo-academy-123"></script>',
  react: "import { LynkButton } from '@lynk/embed-sdk';",
  vue: '<LynkButton academy-id="demo-academy-123" />',
  angular: '<lynk-button [academyId]="demo-academy-123"></lynk-button>',
  wordpress: '[lynk_button academy_id="demo-academy-123"]',
  shopify: '{% render \'lynk-button\', academy_id: \'demo-academy-123\' %}',
};

// Mock API Class
class MockAPI {
  async getAcademy(id: string): Promise<Academy> {
    await this.delay(300);
    return { ...mockAcademy, id };
  }

  async updateAcademy(id: string, updates: Partial<Academy>): Promise<Academy> {
    await this.delay(300);
    return { ...mockAcademy, ...updates, id };
  }

  async getPixelConfig(academyId: string): Promise<PixelConfig> {
    await this.delay(400);
    return { ...mockPixelConfig, academyId };
  }

  async updatePixelConfig(academyId: string, config: Partial<PixelConfig>): Promise<PixelConfig> {
    await this.delay(400);
    return { ...mockPixelConfig, ...config, academyId };
  }

  async getPixelEvents(academyId: string): Promise<{ events: PixelEvent[]; total: number }> {
    await this.delay(500);
    return { events: [], total: 0 };
  }

  async getPixelAnalytics(academyId: string): Promise<PixelAnalytics[]> {
    await this.delay(600);
    return mockPixelAnalytics;
  }

  async getButtonConfig(academyId: string): Promise<ButtonConfig> {
    await this.delay(400);
    return { ...mockButtonConfig, academyId };
  }

  async updateButtonConfig(academyId: string, config: Partial<ButtonConfig>): Promise<ButtonConfig> {
    await this.delay(400);
    return { ...mockButtonConfig, ...config, academyId };
  }

  async getButtonAnalytics(academyId: string): Promise<ButtonAnalytics[]> {
    await this.delay(600);
    return mockButtonAnalytics;
  }

  async getBatches(academyId: string): Promise<Batch[]> {
    await this.delay(500);
    return mockBatches.map(b => ({ ...b, academyId }));
  }

  async updateBatch(academyId: string, batchId: string, updates: Partial<Batch>): Promise<Batch> {
    await this.delay(400);
    const batch = mockBatches.find(b => b.id === batchId);
    return { ...batch!, ...updates, academyId };
  }

  async getAppointmentSettings(academyId: string): Promise<AppointmentSettings> {
    await this.delay(400);
    return { ...mockAppointmentSettings, academyId };
  }

  async updateAppointmentSettings(academyId: string, settings: Partial<AppointmentSettings>): Promise<AppointmentSettings> {
    await this.delay(400);
    return { ...mockAppointmentSettings, ...settings, academyId };
  }

  async getAppointmentSlots(academyId: string): Promise<AppointmentSlot[]> {
    await this.delay(500);
    return mockAppointmentSlots.map(s => ({ ...s, academyId }));
  }

  async getEmbedCode(academyId: string): Promise<EmbedCode> {
    await this.delay(300);
    return mockEmbedCode;
  }

  async sendTestPixelEvent(academyId: string, event: any): Promise<void> {
    await this.delay(500);
    console.log('Test event sent:', event);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockApi = new MockAPI();
export default mockApi;