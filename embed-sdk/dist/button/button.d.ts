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
import { AcademyConfig } from '../shared/types';
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
export declare class LynkButton {
    private config;
    private logger;
    private api;
    private container;
    private modal;
    private overlay;
    private academyConfig;
    private batches;
    private appointmentSlots;
    private currentStep;
    private selectedItem;
    constructor(config: ButtonConfig);
    /**
     * Initialize the button
     */
    init(): Promise<void>;
    private renderButton;
    private applyButtonStyles;
    private injectStyles;
    private openModal;
    private closeModal;
    private loadData;
    private renderSelectionStep;
    private renderFormStep;
    private handleSubmit;
    private renderSuccessStep;
    private groupAppointmentsByDate;
    private formatDate;
    destroy(): void;
}
export { LynkButton as default };
//# sourceMappingURL=button.d.ts.map