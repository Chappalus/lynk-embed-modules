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

import { Logger, AcademyConfig } from '../shared/types';
import { LynkAPI } from '../shared/api';

export type ButtonType = 'booking' | 'appointment' | 'both';
export type ButtonStyle = 'default' | 'outline' | 'minimal';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonTheme {
  primaryColor?: string;
  textColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
  shadow?: boolean;
}

export interface ButtonConfig extends AcademyConfig {
  selector: string | HTMLElement;
  type?: ButtonType;
  buttonText?: string;
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
  theme?: ButtonTheme;
  preselectedBatchId?: string;
  modalTitle?: string;
  successMessage?: string;
  autoOpen?: boolean;
  onBookingSuccess?: (booking: any) => void;
  onBookingError?: (error: Error) => void;
}

export interface Batch {
  id: string;
  name: string;
  description?: string;
  schedule: string;
  price: number;
  currency: string;
  availableSpots: number;
  coachName?: string;
  venueName?: string;
}

export interface AppointmentSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  coachId?: string;
  coachName?: string;
}

export class LynkButton {
  private config: ButtonConfig;
  private logger: Logger;
  private api: LynkAPI;
  private container: HTMLElement | null = null;
  private modal: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private academyConfig: any = null;
  private batches: Batch[] = [];
  private appointmentSlots: AppointmentSlot[] = [];
  private currentStep: 'select' | 'form' | 'success' = 'select';
  private selectedItem: Batch | AppointmentSlot | null = null;

  constructor(config: ButtonConfig) {
    this.config = {
      apiBaseUrl: 'https://api.lynk.coach/v1',
      type: 'both',
      buttonText: 'Get in Touch',
      buttonStyle: 'default',
      buttonSize: 'medium',
      theme: {},
      modalTitle: 'Book with Us',
      successMessage: 'Thank you! We will contact you shortly.',
      ...config
    };
    this.logger = new Logger('LynkButton', config.debug);
    this.api = new LynkAPI(this.config);
  }

  /**
   * Initialize the button
   */
  async init(): Promise<void> {
    this.logger.info('Initializing Lynk Button');

    // Resolve container
    if (typeof this.config.selector === 'string') {
      this.container = document.querySelector(this.config.selector);
    } else {
      this.container = this.config.selector;
    }

    if (!this.container) {
      throw new Error(`Container not found: ${this.config.selector}`);
    }

    // Load academy config
    try {
      this.academyConfig = await this.api.getAcademyConfig();
      this.logger.debug('Academy config loaded', this.academyConfig);
    } catch (error) {
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
  }

  private renderButton(): void {
    if (!this.container) return;

    const button = document.createElement('button');
    button.className = `lynk-btn lynk-btn--${this.config.buttonStyle} lynk-btn--${this.config.buttonSize}`;
    button.textContent = this.config.buttonText!;
    button.onclick = () => this.openModal();

    // Apply custom styles
    this.applyButtonStyles(button);

    this.container.appendChild(button);

    // Inject styles if not already present
    this.injectStyles();
  }

  private applyButtonStyles(button: HTMLButtonElement): void {
    const theme = this.config.theme;
    const styles: Record<string, string> = {};

    if (theme.primaryColor) {
      if (this.config.buttonStyle === 'default') {
        styles.backgroundColor = theme.primaryColor;
        styles.borderColor = theme.primaryColor;
      } else {
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

  private injectStyles(): void {
    if (document.getElementById('lynk-button-styles')) return;

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

  private async openModal(): Promise<void> {
    if (this.modal) return;

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

    this.modal.querySelector('.lynk-modal__close')!.addEventListener('click', () => this.closeModal());
    document.body.appendChild(this.modal);

    // Animate in
    requestAnimationFrame(() => {
      this.overlay?.classList.add('active');
      this.modal?.classList.add('active');
    });

    // Load data
    await this.loadData();
    this.renderSelectionStep();
  }

  private closeModal(): void {
    this.overlay?.classList.remove('active');
    this.modal?.classList.remove('active');

    setTimeout(() => {
      this.overlay?.remove();
      this.modal?.remove();
      this.overlay = null;
      this.modal = null;
    }, 300);
  }

  private async loadData(): Promise<void> {
    try {
      if (this.config.type === 'booking' || this.config.type === 'both') {
        this.batches = await this.api.getBatches();
      }
      if (this.config.type === 'appointment' || this.config.type === 'both') {
        // Get slots for next 7 days
        const today = new Date().toISOString().split('T')[0];
        this.appointmentSlots = await this.api.getAppointmentSlots(today);
      }
    } catch (error) {
      this.logger.error('Failed to load data', error);
    }
  }

  private renderSelectionStep(): void {
    if (!this.modal) return;

    const content = this.modal.querySelector('.lynk-modal__content')!;

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
        const target = e.target as HTMLElement;
        const tabName = target.dataset.tab;
        
        content.querySelectorAll('.lynk-tab').forEach(t => t.classList.remove('active'));
        target.classList.add('active');
        
        (content.querySelector('#lynk-batches') as HTMLElement)!.style.display = tabName === 'batches' ? 'block' : 'none';
        (content.querySelector('#lynk-appointments') as HTMLElement)!.style.display = tabName === 'appointments' ? 'block' : 'none';
      });
    });

    // Bind item selection
    content.querySelectorAll('.lynk-item').forEach(item => {
      item.addEventListener('click', () => {
        const type = item.getAttribute('data-type') as 'batch' | 'appointment';
        const id = item.getAttribute('data-id')!;
        
        content.querySelectorAll('.lynk-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        if (type === 'batch') {
          this.selectedItem = this.batches.find(b => b.id === id) || null;
        } else {
          this.selectedItem = this.appointmentSlots.find(a => a.id === id) || null;
        }

        this.renderFormStep();
      });
    });
  }

  private renderFormStep(): void {
    if (!this.modal || !this.selectedItem) return;

    const content = this.modal.querySelector('.lynk-modal__content')!;
    const isBatch = 'price' in this.selectedItem;

    content.innerHTML = `
      <div style="margin-bottom: 20px; padding: 12px; background: #f8f9ff; border-radius: 8px;">
        <strong>${this.selectedItem.name || (this.selectedItem as AppointmentSlot).time}</strong>
        ${isBatch ? `<br><span style="color: #666;">${(this.selectedItem as Batch).schedule}</span>` : ''}
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

    const form = content.querySelector('#lynk-booking-form') as HTMLFormElement;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(new FormData(form));
    });

    // Add back button in footer
    const footer = this.modal.querySelector('.lynk-modal__footer') || document.createElement('div');
    footer.className = 'lynk-modal__footer';
    footer.innerHTML = `<button class="lynk-btn-secondary" id="lynk-back">← Back</button>`;
    this.modal.appendChild(footer);

    footer.querySelector('#lynk-back')!.addEventListener('click', () => {
      footer.remove();
      this.selectedItem = null;
      this.renderSelectionStep();
    });
  }

  private async handleSubmit(formData: FormData): Promise<void> {
    const submitBtn = this.modal?.querySelector('.lynk-btn-primary') as HTMLButtonElement;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing...';
    }

    const data = {
      type: 'price' in this.selectedItem! ? 'batch' : 'appointment',
      itemId: this.selectedItem!.id,
      customer: {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
        email: formData.get('email') as string,
      },
      details: Object.fromEntries(formData.entries())
    };

    try {
      const result = await this.api.createBooking(data);
      
      this.logger.info('Booking created', result);
      
      // Track conversion via pixel if available
      if ((window as any).lynkPixel) {
        (window as any).lynkPixel.trackPurchase?.({
          value: 'price' in this.selectedItem! ? (this.selectedItem as Batch).price : 0,
          currency: 'price' in this.selectedItem! ? (this.selectedItem as Batch).currency : 'USD',
          transactionId: result.id
        });
      }

      this.renderSuccessStep();
      this.config.onBookingSuccess?.(result);
    } catch (error) {
      this.logger.error('Booking failed', error);
      
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'price' in this.selectedItem! ? 'Request Enrollment' : 'Book Appointment';
      }

      alert('Something went wrong. Please try again or contact us directly.');
      this.config.onBookingError?.(error as Error);
    }
  }

  private renderSuccessStep(): void {
    if (!this.modal) return;

    // Remove footer
    this.modal.querySelector('.lynk-modal__footer')?.remove();

    const content = this.modal.querySelector('.lynk-modal__content')!;
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

  private groupAppointmentsByDate(slots: AppointmentSlot[]): Record<string, AppointmentSlot[]> {
    return slots.reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {} as Record<string, AppointmentSlot[]>);
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  destroy(): void {
    this.closeModal();
    this.api.destroy();
  }
}

// Auto-initialize
function autoInit(): void {
  const scripts = document.querySelectorAll('script[data-academy-id]');
  scripts.forEach(script => {
    const academyId = script.getAttribute('data-academy-id');
    const apiKey = script.getAttribute('data-api-key');
    const selector = script.getAttribute('data-selector') || '#lynk-button';
    const type = (script.getAttribute('data-type') as ButtonType) || 'both';
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
} else {
  autoInit();
}

export { LynkButton as default };