"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, defaultText?: string, params?: Record<string, any>) => string;
}

const translations = {
  am: {
    // Navigation
    'navigation.dashboard': 'ዳሽቦርድ',
    'navigation.cases': 'ጉዳዮች',
    'navigation.appointments': 'ቀጠሮዎች',
    'navigation.documents': 'ሰነዶች',
    'navigation.messages': 'መልዕክቶች',
    'navigation.logout': 'ውጣ',
    'navigation.registration': 'ምዝገባ',
    'navigation.communications': 'ግንኙነቶች',
    
    // Notifications
    'notifications.title': 'ማሳወቂያዎች',
    'notifications.noNotifications': 'ምንም ማሳወቂያዎች የሉም',
    
    // Profile
    'profile.viewProfile': 'መገለጫ ይመልከቱ',
    'profile.settings': 'ቅንብሮች',
    'profile.helpSupport': 'እገዛ እና ድጋፍ',
    
    // Sidebar Items
    'sidebar.dashboard': 'ዳሽቦርድ',
    'sidebar.registration': 'ምዝገባ',
    'sidebar.serviceSelection': 'አገልግሎት ምርጫ',
    'sidebar.personalInformation': 'የግል መረጃ',
    'sidebar.payment': 'ክፍያ',
    'sidebar.paymentHistory': 'የክፍያ ታሪክ',
    'sidebar.documentUpload': 'ሰነድ መጫን',
    'sidebar.cases': 'የእኔ ጉዳዮች',
    'sidebar.newCase': 'አዲስ ጉዳይ',
    'sidebar.caseProgress': 'የጉዳይ ሂደት',
    'sidebar.myCases': 'የእኔ ጉዳዮች',
    'sidebar.waitingCases': 'በመጠበቅ ላይ ያሉ ጉዳዮች',
    'sidebar.caseActivity': 'የእኔ ጉዳይ እንቅስቃሴዎች',
    'sidebar.communications': 'ግንኙነቶች',
    'sidebar.messageLawyer': 'ለጠበቃ መልዕክት ይላኩ',
    'sidebar.documents': 'ሰነዶች',
    'sidebar.documentList': 'የሰነድ ዝርዝር',
    'sidebar.eSignatures': 'ኢ-ፊርማዎች',
    'sidebar.appointments': 'ቀጠሮዎች',
    'sidebar.myAppointments': 'የእኔ ቀጠሮዎች',
    'sidebar.bookAppointment': 'ቀጠሮ ይያዙ',
    'sidebar.appointmentHistory': 'የቀጠሮ ታሪክ',
    
    // Mobile Footer
    'mobile.home': 'መነሻ',
    'mobile.cases': 'ጉዳዮች',
    'mobile.chat': 'ውይይት',
    'mobile.schedule': 'መርሃግብር',
    'mobile.profile': 'መገለጫ',
    'mobile.call': 'ጥሪ',
    'mobile.video': 'ቪዲዮ',
    'mobile.newCase': 'አዲስ ጉዳይ',
    'mobile.book': 'ይያዙ',

    // Registration
    'registration.title': 'የደንበኛ ምዝገባ',
    'registration.subtitle': 'የህግ እርዳታ አገልግሎቶችን ለማግኘት ቅጹን ይሙሉ',
    'registration.steps.personal.title': 'የግል መረጃ',
    'registration.steps.personal.description': 'መሰረታዊ የግል ዝርዝሮች',
    'registration.steps.location.title': 'አድራሻ',
    'registration.steps.location.description': 'የአሁኑ አድራሻዎ',
    'registration.steps.case.title': 'የጉዳይ ዝርዝሮች',
    'registration.steps.case.description': 'ስለ ጉዳይዎ መረጃ',
    'registration.steps.office.title': 'ቢሮ ምርጫ',
    'registration.steps.office.description': 'የህግ እርዳታ ቢሮ ይምረጡ',
    'registration.steps.documents.title': 'ሰነዶች',
    'registration.steps.documents.description': 'የሚያስፈልጉ ሰነዶችን ይጫኑ',
    'registration.navigation.back': 'ተመለስ',
    'registration.navigation.next': 'ቀጥል',
    'registration.navigation.submit': 'አስገባ',
    'registration.navigation.submitting': 'በማስገባት ላይ...',
    'registration.activeCase.title': 'ንቁ ጉዳይ ተገኝቷል',
    'registration.activeCase.description': 'አንድ ንቁ ጉዳይ አለዎት። የአሁኑ ጉዳይ እስኪዘጋ ድረስ አዲስ ጉዳይ መመዝገብ አይችሉም።',
    'registration.activeCase.viewButton': 'ንቁ ጉዳይ ይመልከቱ',
    'registration.validation.nameMin': 'ስም ቢያንስ 2 ቁምፊዎች መሆን አለበት',
    'registration.validation.phoneMin': 'የስልክ ቁጥር ቢያንስ 10 ቁምፊዎች መሆን አለበት',
    'registration.validation.emailInvalid': 'ልክ ያልሆነ የኢሜይል አድራሻ',
    'registration.validation.ageMin': 'ዕድሜ ቢያንስ 18 ዓመት መሆን አለበት',
    'registration.validation.familyMembersMin': '0 ወይም ከዚያ በላይ መሆን አለበት',
    'registration.validation.regionRequired': 'ክልል ያስፈልጋል',
    'registration.validation.zoneRequired': 'ዞን ያስፈልጋል',
    'registration.validation.weredaRequired': 'ወረዳ ያስፈልጋል',
    'registration.validation.kebeleRequired': 'ቀበሌ ያስፈልጋል',
    'registration.validation.caseTypeRequired': 'የጉዳይ ዓይነት ያስፈልጋል',
    'registration.validation.caseDescriptionMin': 'የጉዳይ መግለጫ ቢያንስ 10 ቁምፊዎች መሆን አለበት',
    'registration.validation.officeRequired': 'የቢሮ ምርጫ ያስፈልጋል',
    'registration.gender.male': 'ወንድ',
    'registration.gender.female': 'ሴት',
    'registration.gender.other': 'ሌላ',
    'registration.healthStatus.healthy': 'ጤናማ',
    'registration.healthStatus.disabled': 'አካል ጉዳተኛ',
    'registration.healthStatus.chronicIllness': 'ዘላቂ ህመም',
    'registration.healthStatus.other': 'ሌላ',
    'registration.caseTypes.civil': 'የፍትሐብሔር ጉዳይ',
    'registration.caseTypes.criminal': 'የወንጀል ጉዳይ',
    'registration.caseTypes.family': 'የቤተሰብ ህግ',
    'registration.caseTypes.property': 'የንብረት ክርክር',
    'registration.caseTypes.labor': 'የሰራተኛ ህግ',
    'registration.caseTypes.divorce': 'ፍቺ',
    'registration.caseTypes.inheritance': 'ውርስ',
    'registration.caseTypes.domesticViolence': 'የቤት ውስጥ ጥቃት',
    'registration.caseTypes.landDispute': 'የመሬት ክርክር',
    'registration.caseTypes.contract': 'ከውል ጋር የተያያዘ',
    'registration.caseTypes.humanRights': 'የሰብአዊ መብቶች',
    'registration.caseTypes.constitutional': 'የህገ-መንግስት ህግ',
    'registration.caseTypes.other': 'ሌላ',
    'registration.documents.uploadInstructions': 'ለመጫን ጠቅ ያድርጉ ወይም ይጎትቱ እና ይጣሉ',
    'registration.documents.allowedTypes': 'PDF, DOC, DOCX, JPG, JPEG, PNG',
    
    // Messages
    'messages.contacts.searchPlaceholder': 'ግንኙነቶችን ይፈልጉ...',
    'messages.contacts.filterAll': 'ሁሉም',
    'messages.contacts.filterLawyer': 'ጠበቃ',
    'messages.contacts.filterCoordinator': 'አስተባባሪ',
    'messages.contacts.noContactsFound': 'ምንም ግንኙነቶች አልተገኙም',
    'messages.contacts.statusOnline': 'መስመር ላይ',
    'messages.contacts.statusOffline': 'ከመስመር ውጪ',
    'messages.chat.selectContact': 'መልዕክት ለመጀመር ግንኙነት ይምረጡ',
    'messages.chat.chooseContact': 'ከንቁ ጉዳይ ግንኙነቶችዎ ይምረጡ',
    'messages.chat.statusOnline': 'መስመር ላይ',
    'messages.chat.lastSeen': 'መጨረሻ የታየው {{date}}',
    'messages.chat.statusOffline': 'ከመስመር ውጪ',
    'messages.chat.messagePlaceholder': 'መልዕክት ይጻፉ...',
    
    // Dashboard
    'dashboard.welcome': 'እንኳን ደህና መጡ',
    'dashboard.help.welcome': '👋 እንኳን ደህና መጡ! እገዛ ይፈልጋሉ?',
    'dashboard.help.quickAssistance': '📱 ለፈጣን እገዛ እዚህ ጠቅ ያድርጉ!',
    'dashboard.help.discoverFeatures': '💡 ሁሉንም ባህሪያት ይግለጹ',
    'dashboard.helpHints.navigation.category': 'ዳሰሳ',
    'dashboard.helpHints.navigation.message1': '👋 መንገድዎን ለማግኘት እገዛ ይፈልጋሉ?',
    'dashboard.helpHints.navigation.message2': '🎯 የተወሰኑ ባህሪያትን እየፈለጉ ነው?',
    'dashboard.helpHints.navigation.message3': '🗺️ ሁሉንም ችሎታዎች ማሰስ ይፈልጋሉ?',
    'dashboard.helpHints.caseManagement.category': 'የጉዳይ አስተዳደር',
    'dashboard.helpHints.caseManagement.message1': '📊 የጉዳይዎን ሂደት መከታተል ይፈልጋሉ?',
    'dashboard.helpHints.caseManagement.message2': '📁 ሰነዶችን ማስተዳደር ያስፈልግዎታል?',
    'dashboard.helpHints.caseManagement.message3': '⚖️ የጉዳይ ዝመናዎችን እየፈለጉ ነው?',
    'dashboard.helpHints.support.category': 'ድጋፍ',
    'dashboard.helpHints.support.message1': '🤝 ለማንኛውም ነገር እገዛ ይፈልጋሉ?',
    'dashboard.helpHints.support.message2': '💬 ከድጋፍ ጋር መወያየት ይፈልጋሉ?',
    'dashboard.helpHints.support.message3': '❓ ስለ አገልግሎቶች ጥያቄዎች አሉዎት?',
    'dashboard.helpMenu.title': 'እንዴት ልንረዳዎ እንችላለን?',
    'dashboard.helpMenu.tutorial.title': 'ቱር ይውሰዱ',
    'dashboard.helpMenu.tutorial.description': 'በሚመራ ቱር ይጀምሩ',
    'dashboard.helpMenu.faq.title': 'ተደጋግመው የሚጠየቁ ጥያቄዎች',
    'dashboard.helpMenu.faq.description': 'ለተለመዱ ጥያቄዎች መልሶችን ያግኙ',
    'dashboard.helpMenu.support.title': 'ከድጋፍ ጋር ይገናኙ',
    'dashboard.helpMenu.support.description': 'ከቡድናችን እገዛ ያግኙ',
    'dashboard.helpMenu.documentation.title': 'ሰነዶች',
    'dashboard.helpMenu.documentation.description': 'ዝርዝር መመሪያዎችን ይመልከቱ',
    'dashboard.caseInsights.newCases.title': 'አዲስ ጉዳዮች',
    'dashboard.caseInsights.resolutionRate.title': 'የመፍትሄ ምጣኔ',
    'dashboard.caseInsights.avgTimeToResolve.title': 'አማካይ የመፍትሄ ጊዜ',
    'dashboard.caseInsights.clientSatisfaction.title': 'የደንበኛ እርካታ',
    'dashboard.stats.activeCases.title': 'ንቁ ጉዳዮች',
    'dashboard.stats.appointments.title': 'ቀጠሮዎች',
    'dashboard.stats.pendingPayments.title': 'በመጠበቅ ላይ ያሉ ክፍያዎች',
    'dashboard.stats.messages.title': 'መልዕክቶች',
    'dashboard.quickActions.bookAppointment.title': 'ቀጠሮ ይያዙ',
    'dashboard.quickActions.bookAppointment.description': 'ከጠበቃዎ ጋር ስብሰባ ይያዙ',
    'dashboard.quickActions.makePayment.title': 'ክፍያ ይፈጽሙ',
    'dashboard.quickActions.makePayment.description': 'በመጠበቅ ላይ ያሉ ደረሰኞችን ይመልከቱ እና ይክፈሉ',
    'dashboard.quickActions.messageLawyer.title': 'ለጠበቃ መልዕክት ይላኩ',
    'dashboard.quickActions.messageLawyer.description': 'ለጠበቃዎ መልዕክት ይላኩ',
    'dashboard.quickActions.submitDocument.title': 'ሰነድ ያስገቡ',
    'dashboard.quickActions.submitDocument.description': 'ለጉዳይዎ ሰነዶችን ይጫኑ',
    'dashboard.nextAppointment.title': 'ቀጣይ ቀጠሮ',
    'dashboard.nextAppointment.description': 'ከ {{lawyerName}} ጋር',
    'dashboard.error.title': 'ስህተት',
    'dashboard.error.description': 'የዳሽቦርድ ውሂብን መጫን አልተሳካም። እባክዎ ቆይተው እንደገና ይሞክሩ።',
    'dashboard.caseProgress.initial.title': 'የመጀመሪያ ምክክር',
    'dashboard.caseProgress.initial.description': 'የመጀመሪያ ስብሰባ እና የጉዳይ ግምገማ',
    'dashboard.caseProgress.review.title': 'የጉዳይ ግምገማ',
    'dashboard.caseProgress.review.description': 'የህግ ቡድን የጉዳይዎን ዝርዝሮች ይገመግማል',
    'dashboard.caseProgress.strategy.title': 'የስትራቴጂ ልማት',
    'dashboard.caseProgress.strategy.description': 'የህግ ስትራቴጂ እና የድርጊት እቅድ ማዘጋጀት',
    'dashboard.caseProgress.execution.title': 'የጉዳይ አፈጻጸም',
    'dashboard.caseProgress.execution.description': 'የህግ ስትራቴጂ እና ውክልና መተግበር',
    'dashboard.caseProgress.resolution.title': 'የጉዳይ መፍትሄ',
    'dashboard.caseProgress.resolution.description': 'የመጨረሻ ደረጃዎች እና የጉዳይ መዘጋት',
    
    // Payment
    'payment.title': 'ክፍያ',
    'payment.subtitle': 'የክፍያ ዘዴዎን ይምረጡ',
    'payment.plans.recommended': 'የሚመከር',
    'payment.plans.basic': {
      title: 'መሰረታዊ እቅድ',
      description: 'መሰረታዊ የሕግ ምክር እና የሰነድ ስክሪን',
      price: '25,000 ብር',
      duration: '/ወር',
      features: {
        1: 'መደበኛ ጉዳይ ማስተናገድ',
        2: 'ኢሜይል ድጋፍ',
        3: 'መሰረታዊ የሰነድ ስክሪን',
        4: 'ነጠላ የሕግ ባለሙያ ምክር',
        5: 'መሰረታዊ የጉዳይ መከታተል'
      }
    },
    'payment.plans.standard': {
      title: 'መደበኛ እቅድ',
      description: 'የተሟላ የሰነድ ዝግጅት እና የሕግ ድጋፍ',
      price: '35,000 ብር',
      duration: '/ወር',
      features: {
        1: 'ቅድመ ተልእኮ የጉዳይ ማስተናገድ',
        2: 'ስልክ እና ኢሜይል ድጋፍ',
        3: 'የተሟላ የሰነድ ስክሪን',
        4: 'ብዙ የሕግ ባለሙያዎች ምክር',
        5: 'የጉዳይ ስትራቴጂ እቅድ'
      }
    },
    'payment.plans.premium': {
      title: 'ፕሪሚየም እቅድ',
      description: 'ሙሉ የሕግ ውክልና እና የቤተ ፍርድ ቤት አገልግሎቶች',
      price: '50,000 ብር',
      duration: '/ወር',
      features: {
        1: 'VIP የጉዳይ ማስተናገድ',
        2: '24/7 ድጋፍ አገልግሎት',
        3: 'ሙሉ የሰነድ አስተዳደር',
        4: 'ከፍተኛ የሕግ ባለሙያ ተመድቦ',
        5: 'ስትራቴጂ እና የእቅድ ክፍለ ጊዜያት'
      }
    },
    'payment.methods.title': 'የክፍያ ዘዴዎች',
    'payment.methods.chapa': 'ቻፓ',
    'payment.methods.cbe': 'CBE ብር',
    'payment.methods.telebirr': 'ተሌብር',
    'payment.success.title': 'ክፍያ ተሳክቷል!',
    'payment.success.description': 'የክፍያዎ ተቀባይነት አግኝቷል',
    'payment.error.title': 'ክፍያ አልተሳካም',
    'payment.error.description': 'ክፍያዎን ለማስኬድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።',
    'payment.history.title': 'የክፍያ ታሪክ',
    'payment.history.description': 'የቀድሞ ክፍያዎችዎን ይመልከቱ',
    'payment.history.noPayments': 'ምንም የክፍያ ታሪክ አልተገኘም',
    'payment.history.date': 'ቀን',
    'payment.history.amount': 'መጠን',
    'payment.history.method': 'ዘዴ',
    'payment.history.status': 'ሁኔታ',
    'payment.history.invoice': 'ደረሰኝ',
    'payment.history.download': 'አውርድ',
    'payment.status.completed': 'ተጠናቋል',
    'payment.status.pending': 'በመጠበቅ ላይ',
    'payment.status.failed': 'አልተሳካም',
    'payment.form.cardNumber': 'የካርድ ቁጥር',
    'payment.form.cardHolder': 'የካርድ ባለቤት ስም',
    'payment.form.expiryDate': 'የመጨረሻ ቀን',
    'payment.form.cvv': 'CVV',
    'payment.form.saveCard': 'ለወደፊት ክፍያዎች ካርድን አስቀምጥ',
    'payment.form.pay': 'ክፍያ ፈጽም',
    'payment.form.processing': 'በማስኬድ ላይ...',
    'payment.confirm.title': 'ክፍያ ያረጋግጡ',
    'payment.confirm.subscription': 'የደንበኝነት ዝርዝሮች',
    'payment.confirm.plan': 'የእቅድ አይነት',
    'payment.confirm.price': 'ዋጋ',
    'payment.confirm.duration': 'ቆይታ',
    'payment.confirm.method': 'የክፍያ ዘዴ',
    'payment.confirm.confirm': 'ክፍያ ያረጋግጡ',
    'payment.confirm.cancel': 'ይቅር',
    'payment.confirm.processing': 'ክፍያው በማስኬድ ላይ...',
    'payment.confirm.success': 'ክፍያው በተሳካ ሁኔታ ተጠናቋል',
    'payment.confirm.error': 'ክፍያው አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
    'payment.confirm.redirecting': 'ወደ ዳሽቦርድ በመዘዋወር ላይ...',
    'payment.loading.title': 'ክፍያውን በመጀመር ላይ',
    'payment.loading.description': 'ወደ የተጠበቀ የክፍያ በር እያስገቡዎት እንደሚሄዱ ይጠብቁ'
  },
  en: {
    // Navigation
    'navigation.dashboard': 'Dashboard',
    'navigation.cases': 'Cases',
    'navigation.appointments': 'Appointments',
    'navigation.documents': 'Documents',
    'navigation.messages': 'Messages',
    'navigation.logout': 'Logout',
    'navigation.registration': 'Registration',
    'navigation.communications': 'Communications',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.noNotifications': 'No notifications',
    
    // Profile
    'profile.viewProfile': 'View Profile',
    'profile.settings': 'Settings',
    'profile.helpSupport': 'Help & Support',
    
    // Sidebar Items
    'sidebar.dashboard': 'Dashboard',
    'sidebar.registration': 'Registration',
    'sidebar.serviceSelection': 'Service Selection',
    'sidebar.personalInformation': 'Personal Information',
    'sidebar.payment': 'Payment',
    'sidebar.paymentHistory': 'Payment History',
    'sidebar.documentUpload': 'Document Upload',
    'sidebar.cases': 'My Cases',
    'sidebar.newCase': 'New Case',
    'sidebar.caseProgress': 'Case Progress',
    'sidebar.myCases': 'My Cases',
    'sidebar.waitingCases': 'Waiting Cases',
    'sidebar.caseActivity': 'My Cases Activities',
    'sidebar.communications': 'Communications',
    'sidebar.messageLawyer': 'Message Lawyer',
    'sidebar.documents': 'Documents',
    'sidebar.documentList': 'Document List',
    'sidebar.eSignatures': 'E-Signatures',
    'sidebar.appointments': 'Appointments',
    'sidebar.myAppointments': 'My Appointments',
    'sidebar.bookAppointment': 'Book Appointment',
    'sidebar.appointmentHistory': 'Appointment History',
    
    // Mobile Footer
    'mobile.home': 'Home',
    'mobile.cases': 'Cases',
    'mobile.chat': 'Chat',
    'mobile.schedule': 'Schedule',
    'mobile.profile': 'Profile',
    'mobile.call': 'Call',
    'mobile.video': 'Video',
    'mobile.newCase': 'New Case',
    'mobile.book': 'Book',
    
    // Communication Panel
    'communication.title': 'Communication',
    'communication.connect': 'Connect with your legal team',
    'communication.messageLawyer': 'Message Lawyer',
    'communication.messageLawyerDesc': 'Send messages to your legal team',
    'communication.submitDocuments': 'Submit Documents',
    'communication.submitDocumentsDesc': 'Upload and share case documents',
    'communication.requestAppointment': 'Request Appointment',
    'communication.requestAppointmentDesc': 'Schedule meetings with your lawyer',
    'communication.voiceCall': 'Voice Call',
    'communication.voiceCallDesc': 'Start a voice call',
    'communication.videoCall': 'Video Call',
    'communication.videoCallDesc': 'Start a video conference',
    'communication.cancel': 'Cancel',
    'communication.startChat': 'Start Chat',
    
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
    'appointments.actions.next': 'Next',
    
    // Tutorial
    'tutorial.welcome': 'Welcome to your Dashboard',
    'tutorial.guide': 'This sidebar helps you navigate through different sections of the application. Here\'s a quick guide:',
    'tutorial.clickMenu': 'Click on any menu item to navigate to that section',
    'tutorial.expandItems': 'Items with arrows can be expanded to show sub-items',
    'tutorial.collapseSidebar': 'You can collapse the sidebar using the arrow button at the bottom',
    'tutorial.gotIt': 'Got it',
    
    // Welcome Page
    'welcome.title': 'Welcome to Dilla University Legal Aid Service',
    'welcome.subtitle': 'Complete your registration to access our services',
    'welcome.completeProfile': 'Complete Your Profile',
    'welcome.freeCases.title': 'Free Legal Services',
    'welcome.freeCases.features': 'Basic legal consultation,Document review assistance,Legal information and guidance,Access to legal resources',
    'welcome.premiumCases.title': 'Premium Legal Services',
    'welcome.premiumCases.features': 'Priority case handling,Dedicated legal representation,Comprehensive case management,Regular case updates and consultations',
    'welcome.services.consultation.title': 'Legal Consultation',
    'welcome.services.consultation.description': 'Get expert advice from qualified lawyers',
    'welcome.services.documentation.title': 'Document Preparation',
    'welcome.services.documentation.description': 'Professional assistance with legal documents',
    'welcome.services.representation.title': 'Court Representation',
    'welcome.services.representation.description': 'Expert representation in legal proceedings',
    'welcome.services.support.title': 'Ongoing Support',
    'welcome.services.support.description': '24/7 access to legal resources and guidance',
    'welcome.nextSteps.title': 'Next Steps',
    'welcome.nextSteps.description': 'Complete these steps to access our services:',
    'welcome.nextSteps.steps': 'Select your preferred service type,Provide required documentation,Schedule initial consultation,Begin your legal journey',
    
    // Service Selection Page
    'serviceSelection.title': 'Choose Your Legal Service',
    'serviceSelection.subtitle': 'Select the type of legal service that best fits your needs',
    'serviceSelection.description': 'Select between our premium paid legal services or free legal aid assistance. Your selection will determine the type of support and resources available for your case.',
    'serviceSelection.feature1': 'Professional Legal Support',
    'serviceSelection.feature2': 'University-Backed Services',
    'serviceSelection.feature3': 'Secure Case Management',
    'serviceSelection.premium.title': 'Premium Legal Service',
    'serviceSelection.premium.description': 'Professional legal services with dedicated support from our top-performing lawyers',
    'serviceSelection.premium.feature1': 'Best-performing lawyers assigned to your case',
    'serviceSelection.premium.feature2': 'Direct communication with your lawyer',
    'serviceSelection.premium.feature3': 'Priority scheduling for appointments',
    'serviceSelection.premium.feature4': 'Faster case processing and resolution',
    'serviceSelection.free.title': 'Free Legal Aid Service',
    'serviceSelection.free.description': 'Quality legal assistance at no cost for eligible clients through Dilla University Law School',
    'serviceSelection.free.feature1': 'Supervised by experienced law professors',
    'serviceSelection.free.feature2': 'Access to university legal offices',
    'serviceSelection.free.feature3': 'Complete documentation assistance',
    'serviceSelection.free.feature4': 'Regular communication with coordinators',
    'serviceSelection.helpDeciding': 'Need Help Deciding?',
    'serviceSelection.supportTeam': 'Our Support Team is Ready to Assist You',
    'serviceSelection.phoneNumber': '+251 123 456 789',
    'serviceSelection.liveChat': 'Live Chat Support',
    'serviceSelection.visitOffice': 'Visit Our Office',
    'serviceSelection.officeHours': 'Our team is available Monday to Friday, 9:00 AM to 5:00 PM',
    'serviceSelection.guide.title': 'Service Selection Guide',
    'serviceSelection.guide.description': 'This is where you choose between paid legal services or free legal aid. Your selection will determine the next steps in your legal journey.',
    'serviceSelection.guide.gotIt': 'Got it',
    'serviceSelection.comparison.title': 'Service Comparison',
    'serviceSelection.comparison.description': 'Compare our services to find the right option for your needs',
    'serviceSelection.comparison.features': 'Features',
    'serviceSelection.comparison.free': 'Free Legal Aid',
    'serviceSelection.comparison.premium': 'Premium Legal Service',
    'serviceSelection.comparison.cost': 'Cost',
    'serviceSelection.comparison.freeCost': 'Free',
    'serviceSelection.comparison.premiumCost': 'Paid packages',
    'serviceSelection.comparison.legalRepresentation': 'Legal Representation',
    'serviceSelection.comparison.freeRepresentation': 'Student lawyers',
    'serviceSelection.comparison.premiumRepresentation': 'Top-performing lawyers',
    'serviceSelection.comparison.casePriority': 'Case Priority',
    'serviceSelection.comparison.freePriority': 'Standard',
    'serviceSelection.comparison.premiumPriority': 'High priority',
    'serviceSelection.comparison.communication': 'Communication',
    'serviceSelection.comparison.freeCommunication': 'Through coordinator',
    'serviceSelection.comparison.premiumCommunication': 'Direct with lawyer',
    'serviceSelection.comparison.documentationSupport': 'Documentation Support',
    'serviceSelection.comparison.appointmentScheduling': 'Appointment Scheduling',
    'serviceSelection.comparison.emergencySupport': 'Emergency Support',
    'serviceSelection.faq.title': 'Frequently Asked Questions',
    'serviceSelection.faq.description': 'Common questions about our legal services',
    'serviceSelection.faq.question1': 'What is the difference between free and paid services?',
    'serviceSelection.faq.answer1': 'Free legal aid is provided by student lawyers under supervision, while paid services give you access to experienced lawyers with priority handling and direct communication.',
    'serviceSelection.faq.question2': 'How do I qualify for free legal aid?',
    'serviceSelection.faq.answer2': 'Free legal aid is available to all clients who register through our system. Your case will be evaluated by coordinators and assigned to qualified student lawyers.',
    'serviceSelection.faq.question3': 'What types of cases do you handle?',
    'serviceSelection.faq.answer3': 'We handle a wide range of legal matters including civil cases, family law, property disputes, contract issues, and more. Specific specializations depend on available lawyers.',
    'serviceSelection.faq.question4': 'How do I track my case progress?',
    'serviceSelection.faq.answer4': 'Both service types provide case tracking through our online portal. You\'ll receive regular updates on your case status, upcoming appointments, and important documents.',
    'serviceSelection.toast.title': 'Service Selected',
    'serviceSelection.toast.description': 'You\'ve selected {service}',
    'serviceSelection.loading.title': 'Processing Your Selection',
    'serviceSelection.loading.description': 'Preparing your {service} service experience...',
    'serviceSelection.selectService': 'Select {service}',
    
    // OTP Verification
    'otp.title': 'ሰልክ ቁጥር ማረጋገጫ',
    'otp.instruction': 'ወደ ሰልክዎ የተላከውን የማረጋገጫ ኮድ ያስገቡ',
    'otp.verify': 'ሰልክ ያረጋግጡ',
    'otp.verifying': 'በማረጋገጥ ላይ...',
    'otp.success': 'ሰልክ ቁጥር በተሳካ ሁኔታ ተረጋግጧል!',
    'otp.sending': 'ኮድ ወደ ሰልክዎ በመላክ ላይ...',
    'otp.resent': 'የማረጋገጫ ኮድ ወደ ሰልክዎ ተልኳል',
    'otp.resend': 'ኮዱን እንደገና ይላኩ',
    'otp.resendCountdown': 'ኮድ በድጋሚ ይላኩ በ {time}',
    'otp.backToLogin': 'ወደ መግቢያ ተመለስ',
    'otp.error.restart': 'እባክዎ የማረጋገጫ ሂደቱን እንደገና ይጀምሩ',
    'otp.error.resend': 'ኮድ ወደ ሰልክዎ መላክ አልተሳካም',
    'otp.error.incomplete': 'እባክዎ ሁሉንም 6 ዲጂቶችን ያስገቡ',
    'otp.error.verification': 'ማረጋገጥ አልተሳካም',
    'otp.secure': 'ግንኙነትዎ ደህንነቱ የተጠበቀ ነው',
    
    // Payment
    'payment.title': 'Payment',
    'payment.subtitle': 'Choose your payment method',
    'payment.plans.recommended': 'Recommended',
    'payment.plans.basic': {
      title: 'Basic Plan',
      description: 'Basic legal consultation and document review services',
      price: '25,000 Birr',
      duration: '/month',
      features: {
        1: 'Standard case handling',
        2: 'Email support',
        3: 'Basic document review',
        4: 'Single lawyer consultation',
        5: 'Basic case tracking'
      }
    },
    'payment.plans.standard': {
      title: 'Standard Plan',
      description: 'Comprehensive document preparation and legal assistance',
      price: '35,000 Birr',
      duration: '/month',
      features: {
        1: 'Priority case handling',
        2: 'Phone & email support',
        3: 'Comprehensive document review',
        4: 'Multiple lawyer consultations',
        5: 'Case strategy planning'
      }
    },
    'payment.plans.premium': {
      title: 'Premium Plan',
      description: 'Full legal representation and court appearance services',
      price: '50,000 Birr',
      duration: '/month',
      features: {
        1: 'VIP case handling',
        2: '24/7 support access',
        3: 'Full document management',
        4: 'Senior lawyer assignment',
        5: 'Strategy & planning sessions'
      }
    },
    'payment.methods.title': 'Payment Methods',
    'payment.methods.chapa': 'Chapa',
    'payment.methods.cbe': 'CBE Birr',
    'payment.methods.telebirr': 'Telebirr',
    'payment.success.title': 'Payment Successful!',
    'payment.success.description': 'Your payment has been processed successfully',
    'payment.error.title': 'Payment Failed',
    'payment.error.description': 'Unable to process your payment. Please try again.',
    'payment.history.title': 'Payment History',
    'payment.history.description': 'View and manage your payment transactions',
    'payment.history.loading': 'Loading payment history...',
    'payment.history.noPayments': 'No Payment History',
    'payment.history.noPaymentsDescription': 'You haven\'t made any payments yet',
    'payment.history.makePayment': 'Make a Payment',
    'payment.history.viewDetails': 'View Details',
    'payment.history.export': 'Export',
    'payment.history.filters': {
      search: 'Search transactions...',
      status: 'Payment Status',
      startDate: 'Start Date',
      endDate: 'End Date',
      clear: 'Clear Filters'
    },
    'payment.status.success': {
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully'
    },
    'payment.status.failed': {
      title: 'Payment Failed',
      description: 'Your payment could not be processed. Please try again'
    },
    'payment.status.pending': {
      title: 'Payment Pending',
      description: 'Your payment is being processed'
    },
    'payment.confirm.title': 'Confirm Payment',
    'payment.confirm.description': 'Please review your subscription details before proceeding with the payment',
    'payment.confirm.subscription': 'Subscription Details',
    'payment.confirm.plan': 'Plan Type',
    'payment.confirm.price': 'Price',
    'payment.confirm.duration': 'Duration',
    'payment.confirm.cancel': 'Cancel',
    'payment.confirm.processing': 'Processing...',
    'payment.confirm.pay': 'Pay Now'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState('am');
  const router = useRouter();

  useEffect(() => {
    // Always default to Amharic first, then check localStorage or browser
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && Object.keys(translations).includes(savedLocale)) {
      setLocaleState(savedLocale);
      document.documentElement.lang = savedLocale;
    } else {
      // Default to Amharic
      setLocaleState('am');
      localStorage.setItem('locale', 'am');
      document.documentElement.lang = 'am';
    }
  }, []);

  const setLocale = (newLocale: string) => {
    if (Object.keys(translations).includes(newLocale)) {
      setLocaleState(newLocale);
      localStorage.setItem('locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  };

  const t = (key: string, defaultText?: string, params?: Record<string, any>): string => {
    let translatedText = translations[locale]?.[key] || translations.am[key] || defaultText || key;
    
    // Handle parameter substitution if params are provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translatedText = translatedText.replace(`{${paramKey}}`, paramValue);
      });
    }
    
    return translatedText;
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