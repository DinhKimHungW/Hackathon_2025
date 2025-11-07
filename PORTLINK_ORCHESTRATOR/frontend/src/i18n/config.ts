import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import commonEN from './locales/en/common.json';
import commonVI from './locales/vi/common.json';
import authEN from './locales/en/auth.json';
import authVI from './locales/vi/auth.json';
import dashboardEN from './locales/en/dashboard.json';
import dashboardVI from './locales/vi/dashboard.json';
import shipVisitsEN from './locales/en/shipVisits.json';
import shipVisitsVI from './locales/vi/shipVisits.json';
import schedulesEN from './locales/en/schedules.json';
import schedulesVI from './locales/vi/schedules.json';
import tasksEN from './locales/en/tasks.json';
import tasksVI from './locales/vi/tasks.json';
import assetsEN from './locales/en/assets.json';
import assetsVI from './locales/vi/assets.json';
import conflictsEN from './locales/en/conflicts.json';
import conflictsVI from './locales/vi/conflicts.json';
import eventLogsEN from './locales/en/eventLogs.json';
import eventLogsVI from './locales/vi/eventLogs.json';
import simulationEN from './locales/en/simulation.json';
import simulationVI from './locales/vi/simulation.json';
import settingsEN from './locales/en/settings.json';
import settingsVI from './locales/vi/settings.json';
import profileEN from './locales/en/profile.json';
import profileVI from './locales/vi/profile.json';

// Translation resources
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    dashboard: dashboardEN,
    shipVisits: shipVisitsEN,
    schedules: schedulesEN,
    tasks: tasksEN,
    assets: assetsEN,
    conflicts: conflictsEN,
    eventLogs: eventLogsEN,
    simulation: simulationEN,
    settings: settingsEN,
    profile: profileEN,
  },
  vi: {
    common: commonVI,
    auth: authVI,
    dashboard: dashboardVI,
    shipVisits: shipVisitsVI,
    schedules: schedulesVI,
    tasks: tasksVI,
    assets: assetsVI,
    conflicts: conflictsVI,
    eventLogs: eventLogsVI,
    simulation: simulationVI,
    settings: settingsVI,
    profile: profileVI,
  },
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'vi', // Default to Vietnamese for PortLink Vietnam
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'dashboard',
      'shipVisits',
      'schedules',
      'tasks',
      'assets',
      'conflicts',
      'eventLogs',
      'simulation',
      'settings',
      'profile',
    ],
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag'],
      // Keys to use for localStorage
      lookupLocalStorage: 'i18nextLng',
      // Cache user language
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false, // Disable suspense for simplicity
    },
  });

export default i18n;
