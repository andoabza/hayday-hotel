import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

const languages = ['en', 'am', 'ar', 'fr'];

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Hayday Hotel',
      booking: {
        confirmed: 'Booking confirmed!',
        cancelled: 'Booking cancelled',
        pending: 'Booking pending'
      },
      room: {
        available: 'Room available',
        booked: 'Room booked',
        price: 'Price per night'
      }
    }
  },
  am: {
    translation: {
      welcome: 'እንኳን ወደ ሃይዴይ ሆቴል በደህና መጡ',
      booking: {
        confirmed: 'ቦታ ማረጋገጫ!',
        cancelled: 'ቦታ ተሰርዟል',
        pending: 'ቦታ በመጠባበቅ ላይ'
      },
      room: {
        available: 'ክፍል ይገኛል',
        booked: 'ክፍል ተይዟል',
        price: 'ዋጋ በአንድ ሌሊት'
      }
    }
  },
  ar: {
    translation: {
      welcome: 'مرحبًا بكم في فندق هاي داي',
      booking: {
        confirmed: 'تم تأكيد الحجز!',
        cancelled: 'تم إلغاء الحجز',
        pending: 'الحجز قيد الانتظار'
      },
      room: {
        available: 'غرفة متاحة',
        booked: 'غرفة محجوزة',
        price: 'السعر لليلة'
      }
    }
  },
  fr: {
    translation: {
      welcome: 'Bienvenue à l\'Hôtel Hayday',
      booking: {
        confirmed: 'Réservation confirmée!',
        cancelled: 'Réservation annulée',
        pending: 'Réservation en attente'
      },
      room: {
        available: 'Chambre disponible',
        booked: 'Chambre réservée',
        price: 'Prix par nuit'
      }
    }
  }
};

i18next.use(Backend).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  }
});

export const t = (key, options = {}) => {
  return i18next.t(key, options);
};

export const changeLanguage = (lang) => {
  if (languages.includes(lang)) {
    i18next.changeLanguage(lang);
  }
};

export default i18next;