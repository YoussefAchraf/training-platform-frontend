import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enSessions from './locales/en/sessions.json';
import enTrainings from './locales/en/trainings.json';
import enClients from './locales/en/clients.json';
import enInstructors from './locales/en/instructors.json';
import enProviders from './locales/en/providers.json';
import enCalendar from './locales/en/calendar.json';
import enAdmin from './locales/en/admin.json';
import enReports from './locales/en/reports.json';
import enSurvey from './locales/en/survey.json';
import enChatbot from './locales/en/chatbot.json';
import enPwa from './locales/en/pwa.json';
import enTour from './locales/en/tour.json';
import enFeedback from './locales/en/feedback.json';
import enDeveloper from './locales/en/developer.json';

import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frSessions from './locales/fr/sessions.json';
import frTrainings from './locales/fr/trainings.json';
import frClients from './locales/fr/clients.json';
import frInstructors from './locales/fr/instructors.json';
import frProviders from './locales/fr/providers.json';
import frCalendar from './locales/fr/calendar.json';
import frAdmin from './locales/fr/admin.json';
import frReports from './locales/fr/reports.json';
import frSurvey from './locales/fr/survey.json';
import frChatbot from './locales/fr/chatbot.json';
import frPwa from './locales/fr/pwa.json';
import frTour from './locales/fr/tour.json';
import frFeedback from './locales/fr/feedback.json';
import frDeveloper from './locales/fr/developer.json';

export const defaultNS = 'common';

export const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    sessions: enSessions,
    trainings: enTrainings,
    clients: enClients,
    instructors: enInstructors,
    providers: enProviders,
    calendar: enCalendar,
    admin: enAdmin,
    reports: enReports,
    survey: enSurvey,
    chatbot: enChatbot,
    pwa: enPwa,
    tour: enTour,
    feedback: enFeedback,
    developer: enDeveloper,
  },
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    sessions: frSessions,
    trainings: frTrainings,
    clients: frClients,
    instructors: frInstructors,
    providers: frProviders,
    calendar: frCalendar,
    admin: frAdmin,
    reports: frReports,
    survey: frSurvey,
    chatbot: frChatbot,
    pwa: frPwa,
    tour: frTour,
    feedback: frFeedback,
    developer: frDeveloper,
  },
} as const;

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    defaultNS,
    ns: Object.keys(resources.en),
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'training-platform-language',
    },
  });

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;
