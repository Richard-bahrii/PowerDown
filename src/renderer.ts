interface UiLocale {
  tag: string;
  appTitle: string;
  tabTimer: string;
  tabSchedule: string;
  quickButtons: string[];
  startBtn: string;
  statusWillShutdown: string;
  cancelBtn: string;
  hint: string;
  alertTimeZero: string;
  alertPickDateTime: string;
  alertFuture: string;
  shuttingDown: string;
  autoLaunch: string;
  durationLabel: string;
  dateTimeLabel: string;
}

const LOCALES: Record<Lang, UiLocale> = {
  en: {
    tag: 'en-US',
    appTitle: 'Turn off the computer',
    tabTimer: 'In...',
    tabSchedule: 'Scheduled',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: 'Schedule shutdown',
    statusWillShutdown: 'The computer will shut down:',
    cancelBtn: 'Cancel',
    hint: 'Closing the window does not cancel the scheduled shutdown — the app will minimize to the tray.',
    alertTimeZero: 'Please enter a time greater than zero.',
    alertPickDateTime: 'Please select a date and time.',
    alertFuture: 'The selected date and time must be in the future.',
    shuttingDown: 'Shutting down…',
    autoLaunch: 'Launch at system startup',
    durationLabel: 'Time until shutdown (h : mm)',
    dateTimeLabel: 'Date and time',
  },
  uk: {
    tag: 'uk-UA',
    appTitle: 'Вимкнення компʼютера',
    tabTimer: 'Через час',
    tabSchedule: 'За розкладом',
    quickButtons: ['15 хв', '30 хв', '1 год', '2 год'],
    startBtn: 'Запланувати вимкнення',
    statusWillShutdown: 'Компʼютер вимкнеться:',
    cancelBtn: 'Скасувати',
    hint: 'Закриття вікна не скасовує заплановане вимкнення — застосунок згорнеться в трей.',
    alertTimeZero: 'Вкажіть час більший за нуль.',
    alertPickDateTime: 'Оберіть дату і час.',
    alertFuture: 'Обрані дата й час мають бути в майбутньому.',
    shuttingDown: 'Вимикається…',
    autoLaunch: 'Запускати разом із системою',
    durationLabel: 'Час до вимкнення (год : хв)',
    dateTimeLabel: 'Дата й час',
  },
  es: {
    tag: 'es-ES',
    appTitle: 'Apagar el ordenador',
    tabTimer: 'En...',
    tabSchedule: 'Programado',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: 'Programar apagado',
    statusWillShutdown: 'El ordenador se apagará:',
    cancelBtn: 'Cancelar',
    hint: 'Cerrar la ventana no cancela el apagado programado; la aplicación se minimizará a la bandeja.',
    alertTimeZero: 'Introduce un tiempo mayor que cero.',
    alertPickDateTime: 'Selecciona una fecha y una hora.',
    alertFuture: 'La fecha y hora seleccionadas deben ser futuras.',
    shuttingDown: 'Apagando…',
    autoLaunch: 'Iniciar al arrancar el sistema',
    durationLabel: 'Tiempo hasta el apagado (h : mm)',
    dateTimeLabel: 'Fecha y hora',
  },
  fr: {
    tag: 'fr-FR',
    appTitle: "Éteindre l'ordinateur",
    tabTimer: 'Dans...',
    tabSchedule: 'Programmé',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: "Programmer l'extinction",
    statusWillShutdown: "L'ordinateur s'éteindra :",
    cancelBtn: 'Annuler',
    hint: "Fermer la fenêtre n'annule pas l'extinction programmée ; l'application se réduira dans la zone de notification.",
    alertTimeZero: 'Veuillez indiquer une durée supérieure à zéro.',
    alertPickDateTime: 'Veuillez choisir une date et une heure.',
    alertFuture: "La date et l'heure choisies doivent être dans le futur.",
    shuttingDown: 'Extinction…',
    autoLaunch: 'Lancer au démarrage du système',
    durationLabel: "Temps avant l'extinction (h : mm)",
    dateTimeLabel: 'Date et heure',
  },
  de: {
    tag: 'de-DE',
    appTitle: 'Computer ausschalten',
    tabTimer: 'In...',
    tabSchedule: 'Geplant',
    quickButtons: ['15 Min', '30 Min', '1 Std', '2 Std'],
    startBtn: 'Ausschalten planen',
    statusWillShutdown: 'Der Computer wird ausgeschaltet:',
    cancelBtn: 'Abbrechen',
    hint: 'Das Schließen des Fensters bricht das geplante Herunterfahren nicht ab — die App wird in die Ablage minimiert.',
    alertTimeZero: 'Bitte eine Zeit größer als null angeben.',
    alertPickDateTime: 'Bitte Datum und Uhrzeit auswählen.',
    alertFuture: 'Das gewählte Datum und die Uhrzeit müssen in der Zukunft liegen.',
    shuttingDown: 'Wird heruntergefahren…',
    autoLaunch: 'Beim Systemstart starten',
    durationLabel: 'Zeit bis zum Ausschalten (Std : Min)',
    dateTimeLabel: 'Datum und Uhrzeit',
  },
};

const DEFAULT_LANG: Lang = 'en';

// First run picks the OS language when it's one we support, otherwise English.
// An explicit choice is saved and always wins on later launches.
function detectDefaultLang(): Lang {
  const sys = navigator.language.slice(0, 2).toLowerCase();
  return sys in LOCALES ? (sys as Lang) : DEFAULT_LANG;
}

const savedLang = localStorage.getItem('lang');
let currentLang: Lang =
  savedLang && savedLang in LOCALES ? (savedLang as Lang) : detectDefaultLang();

function t<K extends keyof UiLocale>(key: K): UiLocale[K] {
  return LOCALES[currentLang][key];
}

function applyTranslations(): void {
  document.documentElement.lang = currentLang;
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n as keyof UiLocale) as string;
  });
  document.querySelectorAll<HTMLElement>('[data-quick-index]').forEach((el) => {
    el.textContent = t('quickButtons')[Number(el.dataset.quickIndex)];
  });
  if (currentTarget !== null) {
    statusTarget.textContent = formatDateTime(currentTarget);
  }
}

// Match the window to the currently visible content, so switching tabs or
// entering the countdown view doesn't leave empty space. flatpickr popups are
// absolutely positioned and don't affect body.offsetHeight, so it stays stable.
function resizeToContent(): void {
  if (window.api && window.api.resizeWindow) {
    window.api.resizeWindow(document.body.offsetHeight);
  }
}

function setLanguage(lang: string): void {
  currentLang = lang in LOCALES ? (lang as Lang) : DEFAULT_LANG;
  localStorage.setItem('lang', currentLang);
  applyTranslations();
  initPickers();
  resizeToContent();
  window.api.setLocale(currentLang);
}

// --- Custom language dropdown (native <select> can't render flag images) ---
const langSelect = document.getElementById('lang-select')!;
const langTrigger = document.getElementById('lang-trigger')!;
const langMenu = document.getElementById('lang-menu')!;
const langCurrentFlag = document.getElementById('lang-current-flag') as HTMLImageElement;
const langCurrentName = document.getElementById('lang-current-name')!;
const langOptions = Array.from(langMenu.querySelectorAll<HTMLElement>('[data-lang]'));

function updateLangTrigger(lang: string): void {
  const option = langOptions.find((li) => li.dataset.lang === lang) || langOptions[0];
  langCurrentFlag.src = (option.querySelector('.flag') as HTMLImageElement).src;
  langCurrentName.textContent = option.querySelector('span')!.textContent;
  langOptions.forEach((li) => li.classList.toggle('selected', li === option));
}

function openLangMenu(): void {
  langSelect.classList.add('open');
  langTrigger.setAttribute('aria-expanded', 'true');
}

function closeLangMenu(): void {
  langSelect.classList.remove('open');
  langTrigger.setAttribute('aria-expanded', 'false');
}

langTrigger.addEventListener('click', () => {
  langSelect.classList.contains('open') ? closeLangMenu() : openLangMenu();
});

langOptions.forEach((li) => {
  li.addEventListener('click', () => {
    const lang = li.dataset.lang!;
    setLanguage(lang);
    updateLangTrigger(lang);
    closeLangMenu();
  });
});

document.addEventListener('click', (event) => {
  if (!langSelect.contains(event.target as Node)) closeLangMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLangMenu();
});

const tabButtons = document.querySelectorAll<HTMLElement>('.tab-btn');
const tabPanels = document.querySelectorAll<HTMLElement>('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    tabPanels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab)!.classList.add('active');
    resizeToContent();
  });
});

// --- flatpickr date/time pickers ---
// Timer tab: a calendar-less 24h time field acts as an H:MM duration, which
// inherently constrains input to 0–23 h and 0–59 min. Scheduled tab: a full
// date+time field that can't be set earlier than today.
let timerPicker: FlatpickrInstance | null = null;
let schedulePicker: FlatpickrInstance | null = null;

function fpLocale(): string {
  // uk/es/fr/de are registered on flatpickr.l10ns by the vendored l10n scripts;
  // 'default' is flatpickr's built-in English.
  return currentLang === 'en' ? 'default' : currentLang;
}

// Whether the given locale expresses clock times as 12-hour with AM/PM
// (e.g. en-US) rather than 24-hour (e.g. uk-UA, de-DE).
function localeUses12h(tag: string): boolean {
  return new Intl.DateTimeFormat(tag, { hour: 'numeric' }).resolvedOptions().hour12 === true;
}

// The window is sized tightly to its content, so an open calendar (which is
// taller than the window) would overflow and show a scrollbar. Grow the window
// to fit the open picker, then shrink back to the content on close.
function fitWindowToOpenPicker(instance: FlatpickrInstance): void {
  // Compute the needed height from stable quantities — the input's fixed layout
  // position plus the calendar's own height — rather than the calendar's live
  // positioned bottom, which flatpickr derives from the current window size and
  // so varied between the first and later opens. Plus a gap so the calendar
  // isn't flush against the window edge (which left a tiny scrollbar).
  const bottomGap = 38;
  const inputBottom = Math.ceil(instance.input.getBoundingClientRect().bottom);
  const needed = inputBottom + instance.calendarContainer.offsetHeight + bottomGap;
  if (window.api && window.api.resizeWindow) {
    window.api.resizeWindow(Math.max(document.body.offsetHeight, needed));
  }
}

function initPickers(): void {
  const timerDefault: Date | string =
    timerPicker && timerPicker.selectedDates[0] ? timerPicker.selectedDates[0] : '00:30';
  const scheduleDefault: Date | string =
    schedulePicker && schedulePicker.selectedDates[0]
      ? schedulePicker.selectedDates[0]
      : new Date(Date.now() + 60 * 60 * 1000);

  if (timerPicker) timerPicker.destroy();
  if (schedulePicker) schedulePicker.destroy();

  // The scheduled value is a clock time, so follow the locale's 12h/24h
  // convention and offer an AM/PM toggle where that's expected. The timer tab
  // is a duration (no AM/PM), so it always stays 24-hour.
  const use12h = localeUses12h(LOCALES[currentLang].tag);

  // flatpickr finalizes the calendar's position after the onOpen hook, so defer
  // the measurement a tick to read its settled bottom rather than a mid-open one.
  const onOpen: FlatpickrHook = (_dates, _str, instance) =>
    setTimeout(() => fitWindowToOpenPicker(instance), 0);
  const onClose: FlatpickrHook = () => resizeToContent();

  timerPicker = flatpickr('#timer-duration', {
    enableTime: true,
    noCalendar: true,
    dateFormat: 'H:i',
    time_24hr: true,
    minuteIncrement: 1,
    defaultDate: timerDefault,
    locale: fpLocale(),
    position: 'below',
    onOpen,
    onClose,
  });

  schedulePicker = flatpickr('#schedule-datetime', {
    enableTime: true,
    dateFormat: use12h ? 'Y-m-d h:i K' : 'Y-m-d H:i',
    time_24hr: !use12h,
    minDate: 'today',
    defaultDate: scheduleDefault,
    locale: fpLocale(),
    position: 'below',
    onOpen,
    onClose,
  });
}

document.querySelectorAll<HTMLElement>('.quick-buttons button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const minutes = Number(btn.dataset.minutes);
    const h = String(Math.floor(minutes / 60)).padStart(2, '0');
    const m = String(minutes % 60).padStart(2, '0');
    if (timerPicker) timerPicker.setDate(`${h}:${m}`, false);
  });
});

const statusBox = document.getElementById('status')!;
const statusTarget = document.getElementById('status-target')!;
const statusCountdown = document.getElementById('status-countdown')!;
let countdownIntervalId: ReturnType<typeof setInterval> | null = null;
let currentTarget: number | null = null;

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString(t('tag'));
}

function formatDuration(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function startCountdownDisplay(targetTimestamp: number): void {
  currentTarget = targetTimestamp;
  document.body.classList.add('shutdown-active');
  statusBox.classList.remove('hidden');
  statusTarget.textContent = formatDateTime(targetTimestamp);
  resizeToContent();

  if (countdownIntervalId) clearInterval(countdownIntervalId);
  const tick = () => {
    const remaining = targetTimestamp - Date.now();
    statusCountdown.textContent = formatDuration(remaining);
    if (remaining <= 0 && countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      statusCountdown.textContent = t('shuttingDown');
    }
  };
  tick();
  countdownIntervalId = setInterval(tick, 1000);
}

function stopCountdownDisplay(): void {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  currentTarget = null;
  document.body.classList.remove('shutdown-active');
  statusBox.classList.add('hidden');
  resizeToContent();
}

document.getElementById('start-timer')!.addEventListener('click', () => {
  const picked = timerPicker?.selectedDates[0];
  const hours = picked ? picked.getHours() : 0;
  const minutes = picked ? picked.getMinutes() : 0;
  const totalMs = (hours * 3600 + minutes * 60) * 1000;
  if (totalMs <= 0) {
    alert(t('alertTimeZero'));
    return;
  }
  const target = Date.now() + totalMs;
  window.api.scheduleShutdown(target);
  startCountdownDisplay(target);
});

document.getElementById('start-schedule')!.addEventListener('click', () => {
  const picked = schedulePicker?.selectedDates[0];
  if (!picked) {
    alert(t('alertPickDateTime'));
    return;
  }
  const target = picked.getTime();
  if (Number.isNaN(target) || target <= Date.now()) {
    alert(t('alertFuture'));
    return;
  }
  window.api.scheduleShutdown(target);
  startCountdownDisplay(target);
});

document.getElementById('cancel-btn')!.addEventListener('click', () => {
  window.api.cancelShutdown();
  stopCountdownDisplay();
});

window.api.onStatusChanged((status) => {
  if (status.active && status.targetTime !== null) {
    startCountdownDisplay(status.targetTime);
  } else {
    stopCountdownDisplay();
  }
});

const autoLaunchCheckbox = document.getElementById('auto-launch') as HTMLInputElement;
autoLaunchCheckbox.addEventListener('change', async () => {
  autoLaunchCheckbox.checked = await window.api.setAutoLaunch(autoLaunchCheckbox.checked);
});

(async () => {
  applyTranslations();
  updateLangTrigger(currentLang);
  initPickers();
  resizeToContent();
  window.api.setLocale(currentLang);

  const status = await window.api.getStatus();
  if (status.active && status.targetTime !== null) {
    startCountdownDisplay(status.targetTime);
  }

  autoLaunchCheckbox.checked = await window.api.getAutoLaunch();
})();
