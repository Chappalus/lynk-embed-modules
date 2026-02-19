export interface Academy {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  timezone: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface PixelConfig {
  id: string;
  academyId: string;
  googleAdsId?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  tiktokPixelId?: string;
  linkedinInsightId?: string;
  customScripts?: string;
  consentRequired: boolean;
  consentMessage?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ButtonConfig {
  id: string;
  academyId: string;
  type: 'booking' | 'appointment' | 'both';
  buttonText: string;
  buttonStyle: 'default' | 'outline' | 'minimal';
  buttonSize: 'small' | 'medium' | 'large';
  primaryColor: string;
  textColor: string;
  backgroundColor: string;
  borderRadius: string;
  fontFamily: string;
  showShadow: boolean;
  modalTitle: string;
  successMessage: string;
  defaultTab: 'batches' | 'appointments';
  showPrices: boolean;
  showAvailability: boolean;
  requirePhone: boolean;
  requireEmail: boolean;
  customFields?: CustomField[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface Batch {
  id: string;
  academyId: string;
  name: string;
  description?: string;
  sport: string;
  ageGroup?: string;
  level?: string;
  schedule: string;
  startDate: string;
  endDate?: string;
  price: number;
  currency: string;
  capacity: number;
  enrolledCount: number;
  coachId?: string;
  coachName?: string;
  venueId?: string;
  venueName?: string;
  isActive: boolean;
  allowEmbedBooking: boolean;
}

export interface AppointmentSlot {
  id: string;
  academyId: string;
  coachId?: string;
  coachName?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isBooked: boolean;
  bookingId?: string;
}

export interface AppointmentSettings {
  id: string;
  academyId: string;
  enabled: boolean;
  slotDuration: number;
  bufferMinutes: number;
  maxAdvanceDays: number;
  minAdvanceHours: number;
  workingDays: number[]; // 0-6, 0 = Sunday
  workingHoursStart: string; // HH:mm
  workingHoursEnd: string; // HH:mm
  allowEmbedBooking: boolean;
}

export interface PixelEvent {
  id: string;
  academyId: string;
  eventName: string;
  eventData?: Record<string, any>;
  source: 'google' | 'facebook' | 'tiktok' | 'linkedin' | 'custom';
  url: string;
  referrer?: string;
  userAgent?: string;
  ipHash?: string;
  sessionId?: string;
  timestamp: string;
}

export interface ButtonAnalytics {
  date: string;
  impressions: number;
  clicks: number;
  bookings: number;
  conversionRate: number;
}

export interface PixelAnalytics {
  date: string;
  pageViews: number;
  events: Record<string, number>;
  sources: Record<string, number>;
}

export interface EmbedCode {
  pixel: string;
  button: string;
  react: string;
  vue: string;
  angular: string;
  wordpress: string;
  shopify: string;
}