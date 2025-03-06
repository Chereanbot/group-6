"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'navigation.dashboard': 'Dashboard',
    'navigation.cases': 'Cases',
    'navigation.appointments': 'Appointments',
    'navigation.documents': 'Documents',
    'navigation.messages': 'Messages',
    'navigation.logout': 'Logout',
    'notifications.title': 'Notifications',
    'notifications.noNotifications': 'No notifications',
    'profile.viewProfile': 'View Profile',
    'profile.settings': 'Settings',
    'profile.helpSupport': 'Help & Support',
    // Appointment History Translations
    'appointments.history.title': 'Appointment History',
    'appointments.history.description': 'View and manage your past and upcoming appointments',
    'appointments.history.filters': 'Filter Appointments',
    'appointments.history.search': 'Search appointments...',
    'appointments.history.status': 'Filter by status',
    'appointments.history.date': 'Filter by date',
    'appointments.history.noAppointments': 'No appointments found',
    'appointments.history.loading': 'Loading appointments...',
    'appointments.history.error': 'Failed to load appointments',
    'appointments.details.title': 'Appointment Details',
    'appointments.details.coordinator': 'Coordinator Details',
    'appointments.details.notifications': 'Appointment Notifications',
    'appointments.details.purpose': 'Purpose',
    'appointments.details.caseType': 'Case Type',
    'appointments.details.duration': 'Duration',
    'appointments.details.priority': 'Priority',
    'appointments.details.venue': 'Venue',
    'appointments.details.documents': 'Required Documents',
    'appointments.details.notes': 'Notes',
    'appointments.details.office': 'Office Details',
    'appointments.status.scheduled': 'Scheduled',
    'appointments.status.completed': 'Completed',
    'appointments.status.cancelled': 'Cancelled',
    'appointments.status.rescheduled': 'Rescheduled',
    'appointments.status.pending': 'Pending',
    'appointments.actions.viewDetails': 'View Details',
    'appointments.actions.previous': 'Previous',
    'appointments.actions.next': 'Next'
  },
  am: {
    'navigation.dashboard': 'ዳሽቦርድ',
    'navigation.cases': 'ጉዳዮች',
    'navigation.appointments': 'ቀጠሮዎች',
    'navigation.documents': 'ሰነዶች',
    'navigation.messages': 'መልዕክቶች',
    'navigation.logout': 'ውጣ',
    'notifications.title': 'ማሳወቂያዎች',
    'notifications.noNotifications': 'ምንም ማሳወቂያዎች የሉም',
    'profile.viewProfile': 'መገለጫ ይመልከቱ',
    'profile.settings': 'ቅንብሮች',
    'profile.helpSupport': 'እገዛ እና ድጋፍ',
    // Appointment History Translations
    'appointments.history.title': 'የቀጠሮ ታሪክ',
    'appointments.history.description': 'ያለፉ እና የሚመጡ ቀጠሮዎችን ይመልከቱ እና ያስተዳድሩ',
    'appointments.history.filters': 'ቀጠሮዎችን አጣራ',
    'appointments.history.search': 'ቀጠሮዎችን ፈልግ...',
    'appointments.history.status': 'በሁኔታ አጣራ',
    'appointments.history.date': 'በቀን አጣራ',
    'appointments.history.noAppointments': 'ምንም ቀጠሮዎች አልተገኙም',
    'appointments.history.loading': 'ቀጠሮዎችን በመጫን ላይ...',
    'appointments.history.error': 'ቀጠሮዎችን መጫን አልተሳካም',
    'appointments.details.title': 'የቀጠሮ ዝርዝሮች',
    'appointments.details.coordinator': 'የአስተባባሪ ዝርዝሮች',
    'appointments.details.notifications': 'የቀጠሮ ማሳወቂያዎች',
    'appointments.details.purpose': 'ዓላማ',
    'appointments.details.caseType': 'የጉዳይ ዓይነት',
    'appointments.details.duration': 'የጊዜ ርዝመት',
    'appointments.details.priority': 'ቅድሚያ',
    'appointments.details.venue': 'ቦታ',
    'appointments.details.documents': 'የሚያስፈልጉ ሰነዶች',
    'appointments.details.notes': 'ማስታወሻዎች',
    'appointments.details.office': 'የቢሮ ዝርዝሮች',
    'appointments.status.scheduled': 'የተያዘ',
    'appointments.status.completed': 'የተጠናቀቀ',
    'appointments.status.cancelled': 'የተሰረዘ',
    'appointments.status.rescheduled': 'እንደገና የተያዘ',
    'appointments.status.pending': 'በመጠባበቅ ላይ',
    'appointments.actions.viewDetails': 'ዝርዝሮችን ይመልከቱ',
    'appointments.actions.previous': 'ቀዳሚ',
    'appointments.actions.next': 'ቀጣይ'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState('en');
  const router = useRouter();

  useEffect(() => {
    // Get initial locale from localStorage or browser
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      const browserLocale = navigator.language.split('-')[0];
      setLocaleState(Object.keys(translations).includes(browserLocale) ? browserLocale : 'en');
    }
  }, []);

  const setLocale = (newLocale: string) => {
    if (Object.keys(translations).includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 