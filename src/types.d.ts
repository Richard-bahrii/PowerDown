// Shared ambient types for PowerDown. This file has no imports/exports, so its
// declarations are global and visible to main, preload, and renderer alike.

type Lang = 'en' | 'uk' | 'es' | 'fr' | 'de';

interface ShutdownStatus {
  active: boolean;
  targetTime: number | null;
}

// The surface exposed on window.api by the preload script.
interface PowerDownApi {
  scheduleShutdown(timestamp: number): void;
  cancelShutdown(): void;
  getStatus(): Promise<ShutdownStatus>;
  getPlatform(): Promise<NodeJS.Platform>;
  setLocale(lang: string): void;
  getAutoLaunch(): Promise<boolean>;
  setAutoLaunch(enabled: boolean): Promise<boolean>;
  resizeWindow(height: number): void;
  onStatusChanged(callback: (status: ShutdownStatus) => void): void;
}

interface Window {
  api: PowerDownApi;
}

// Minimal typing for the vendored flatpickr global (loaded via a <script> tag).
interface FlatpickrInstance {
  selectedDates: Date[];
  calendarContainer: HTMLElement;
  setDate(date: Date | string, triggerChange?: boolean): void;
  destroy(): void;
}

type FlatpickrHook = (selectedDates: Date[], dateStr: string, instance: FlatpickrInstance) => void;

interface FlatpickrOptions {
  enableTime?: boolean;
  noCalendar?: boolean;
  dateFormat?: string;
  time_24hr?: boolean;
  minuteIncrement?: number;
  minDate?: string | Date;
  defaultDate?: string | Date;
  locale?: string;
  position?: string;
  onOpen?: FlatpickrHook;
  onClose?: FlatpickrHook;
}

declare const flatpickr: (selector: string, options: FlatpickrOptions) => FlatpickrInstance;
