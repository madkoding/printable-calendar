import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from '@/i18n/locales/es/translation.json'
import en from '@/i18n/locales/en/translation.json'
import pt from '@/i18n/locales/pt/translation.json'
import fr from '@/i18n/locales/fr/translation.json'
import de from '@/i18n/locales/de/translation.json'

i18n.use(initReactI18next).init({
  resources: { es: { translation: es }, en: { translation: en }, pt: { translation: pt }, fr: { translation: fr }, de: { translation: de } },
  lng: 'es',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
