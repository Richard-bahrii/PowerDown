const LOCALES = {
  en: {
    tag: 'en-US',
    appTitle: 'Turn off the computer',
    tabTimer: 'In...',
    tabSchedule: 'Scheduled',
    hoursLabel: 'Hours',
    minutesLabel: 'Minutes',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: 'Schedule shutdown',
    dateLabel: 'Date',
    timeLabel: 'Time',
    statusWillShutdown: 'The computer will shut down:',
    cancelBtn: 'Cancel',
    hint: 'Closing the window does not cancel the scheduled shutdown — the app will minimize to the tray.',
    alertTimeZero: 'Please enter a time greater than zero.',
    alertPickDateTime: 'Please select a date and time.',
    alertFuture: 'The selected date and time must be in the future.',
    shuttingDown: 'Shutting down…',
    autoLaunch: 'Launch at system startup',
  },
  uk: {
    tag: 'uk-UA',
    appTitle: 'Вимкнення компʼютера',
    tabTimer: 'Через час',
    tabSchedule: 'За розкладом',
    hoursLabel: 'Годин',
    minutesLabel: 'Хвилин',
    quickButtons: ['15 хв', '30 хв', '1 год', '2 год'],
    startBtn: 'Запланувати вимкнення',
    dateLabel: 'Дата',
    timeLabel: 'Час',
    statusWillShutdown: 'Компʼютер вимкнеться:',
    cancelBtn: 'Скасувати',
    hint: 'Закриття вікна не скасовує заплановане вимкнення — застосунок згорнеться в трей.',
    alertTimeZero: 'Вкажіть час більший за нуль.',
    alertPickDateTime: 'Оберіть дату і час.',
    alertFuture: 'Обрані дата й час мають бути в майбутньому.',
    shuttingDown: 'Вимикається…',
    autoLaunch: 'Запускати разом із системою',
  },
  es: {
    tag: 'es-ES',
    appTitle: 'Apagar el ordenador',
    tabTimer: 'En...',
    tabSchedule: 'Programado',
    hoursLabel: 'Horas',
    minutesLabel: 'Minutos',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: 'Programar apagado',
    dateLabel: 'Fecha',
    timeLabel: 'Hora',
    statusWillShutdown: 'El ordenador se apagará:',
    cancelBtn: 'Cancelar',
    hint: 'Cerrar la ventana no cancela el apagado programado; la aplicación se minimizará a la bandeja.',
    alertTimeZero: 'Introduce un tiempo mayor que cero.',
    alertPickDateTime: 'Selecciona una fecha y una hora.',
    alertFuture: 'La fecha y hora seleccionadas deben ser futuras.',
    shuttingDown: 'Apagando…',
    autoLaunch: 'Iniciar al arrancar el sistema',
  },
  fr: {
    tag: 'fr-FR',
    appTitle: "Éteindre l'ordinateur",
    tabTimer: 'Dans...',
    tabSchedule: 'Programmé',
    hoursLabel: 'Heures',
    minutesLabel: 'Minutes',
    quickButtons: ['15 min', '30 min', '1 h', '2 h'],
    startBtn: "Programmer l'extinction",
    dateLabel: 'Date',
    timeLabel: 'Heure',
    statusWillShutdown: "L'ordinateur s'éteindra :",
    cancelBtn: 'Annuler',
    hint: "Fermer la fenêtre n'annule pas l'extinction programmée ; l'application se réduira dans la zone de notification.",
    alertTimeZero: 'Veuillez indiquer une durée supérieure à zéro.',
    alertPickDateTime: 'Veuillez choisir une date et une heure.',
    alertFuture: "La date et l'heure choisies doivent être dans le futur.",
    shuttingDown: 'Extinction…',
    autoLaunch: 'Lancer au démarrage du système',
  },
  de: {
    tag: 'de-DE',
    appTitle: 'Computer ausschalten',
    tabTimer: 'In...',
    tabSchedule: 'Geplant',
    hoursLabel: 'Stunden',
    minutesLabel: 'Minuten',
    quickButtons: ['15 Min', '30 Min', '1 Std', '2 Std'],
    startBtn: 'Ausschalten planen',
    dateLabel: 'Datum',
    timeLabel: 'Uhrzeit',
    statusWillShutdown: 'Der Computer wird ausgeschaltet:',
    cancelBtn: 'Abbrechen',
    hint: 'Das Schließen des Fensters bricht das geplante Herunterfahren nicht ab — die App wird in die Ablage minimiert.',
    alertTimeZero: 'Bitte eine Zeit größer als null angeben.',
    alertPickDateTime: 'Bitte Datum und Uhrzeit auswählen.',
    alertFuture: 'Das gewählte Datum und die Uhrzeit müssen in der Zukunft liegen.',
    shuttingDown: 'Wird heruntergefahren…',
    autoLaunch: 'Beim Systemstart starten',
  },
};

const DEFAULT_LANG = 'en';
let currentLang = localStorage.getItem('lang') || DEFAULT_LANG;
if (!LOCALES[currentLang]) currentLang = DEFAULT_LANG;

function t(key) {
  return LOCALES[currentLang][key];
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-quick-index]').forEach((el) => {
    el.textContent = t('quickButtons')[parseInt(el.dataset.quickIndex, 10)];
  });
  if (currentTarget !== null) {
    statusTarget.textContent = formatDateTime(currentTarget);
  }
}

function setLanguage(lang) {
  if (!LOCALES[lang]) lang = DEFAULT_LANG;
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
  window.api.setLocale(lang);
}

const languageSelect = document.getElementById('language-select');
languageSelect.value = currentLang;
languageSelect.addEventListener('change', () => {
  setLanguage(languageSelect.value);
});

const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabButtons.forEach((b) => b.classList.remove('active'));
    tabPanels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

document.querySelectorAll('.quick-buttons button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const minutes = parseInt(btn.dataset.minutes, 10);
    document.getElementById('timer-hours').value = Math.floor(minutes / 60);
    document.getElementById('timer-minutes').value = minutes % 60;
  });
});

const statusBox = document.getElementById('status');
const statusTarget = document.getElementById('status-target');
const statusCountdown = document.getElementById('status-countdown');
let countdownIntervalId = null;
let currentTarget = null;

function formatDateTime(ts) {
  return new Date(ts).toLocaleString(t('tag'));
}

function formatDuration(ms) {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function startCountdownDisplay(targetTimestamp) {
  currentTarget = targetTimestamp;
  statusBox.classList.remove('hidden');
  statusTarget.textContent = formatDateTime(targetTimestamp);

  if (countdownIntervalId) clearInterval(countdownIntervalId);
  const tick = () => {
    const remaining = currentTarget - Date.now();
    statusCountdown.textContent = formatDuration(remaining);
    if (remaining <= 0) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
      statusCountdown.textContent = t('shuttingDown');
    }
  };
  tick();
  countdownIntervalId = setInterval(tick, 1000);
}

function stopCountdownDisplay() {
  if (countdownIntervalId) {
    clearInterval(countdownIntervalId);
    countdownIntervalId = null;
  }
  currentTarget = null;
  statusBox.classList.add('hidden');
}

document.getElementById('start-timer').addEventListener('click', () => {
  const hours = parseInt(document.getElementById('timer-hours').value, 10) || 0;
  const minutes = parseInt(document.getElementById('timer-minutes').value, 10) || 0;
  const totalMs = (hours * 3600 + minutes * 60) * 1000;
  if (totalMs <= 0) {
    alert(t('alertTimeZero'));
    return;
  }
  const target = Date.now() + totalMs;
  window.api.scheduleShutdown(target);
  startCountdownDisplay(target);
});

document.getElementById('start-schedule').addEventListener('click', () => {
  const dateVal = document.getElementById('schedule-date').value;
  const timeVal = document.getElementById('schedule-time').value;
  if (!dateVal || !timeVal) {
    alert(t('alertPickDateTime'));
    return;
  }
  const target = new Date(`${dateVal}T${timeVal}`).getTime();
  if (Number.isNaN(target) || target <= Date.now()) {
    alert(t('alertFuture'));
    return;
  }
  window.api.scheduleShutdown(target);
  startCountdownDisplay(target);
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  window.api.cancelShutdown();
  stopCountdownDisplay();
});

window.api.onStatusChanged((status) => {
  if (status.active) {
    startCountdownDisplay(status.targetTime);
  } else {
    stopCountdownDisplay();
  }
});

const autoLaunchCheckbox = document.getElementById('auto-launch');
autoLaunchCheckbox.addEventListener('change', async () => {
  const applied = await window.api.setAutoLaunch(autoLaunchCheckbox.checked);
  autoLaunchCheckbox.checked = applied;
});

(async () => {
  applyTranslations();
  window.api.setLocale(currentLang);

  const status = await window.api.getStatus();
  if (status.active) {
    startCountdownDisplay(status.targetTime);
  }

  autoLaunchCheckbox.checked = await window.api.getAutoLaunch();

  const now = new Date();
  document.getElementById('schedule-date').value = now.toISOString().slice(0, 10);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('schedule-time').value = `${hh}:${mm}`;
})();
