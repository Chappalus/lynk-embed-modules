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
export { LynkPixel, PixelConfig, PixelEvent } from './pixel';
export { LynkButton, ButtonConfig, ButtonType, ButtonTheme, Batch, AppointmentSlot } from './button';
export { AcademyConfig, TrackingEvent } from './shared/types';
import { LynkPixel as Pixel } from './pixel';
import { LynkButton as Button } from './button';
declare const _default: {
    Pixel: typeof Pixel;
    Button: typeof Button;
    version: string;
};
export default _default;
//# sourceMappingURL=index.d.ts.map