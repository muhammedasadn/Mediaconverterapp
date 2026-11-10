export type SupportedLanguage = 'en' | 'hi' | 'ml' | 'ar' | 'es';

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  isRtl?: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRtl: true },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    hero_title: 'Convert, Compress & Edit at the Speed of Light',
    hero_subtitle: 'Instant on-device processing powered by WebAssembly. Your files never leave your browser unless you choose cloud turbo.',
    drop_title: 'Drop any video or audio here',
    drop_subtitle: 'Or click to browse from device. Converted instantly on-device whenever possible.',
    convert_now: 'Convert Now',
    history: 'History',
    settings: 'Settings',
    account: 'Account',
    offline_ready: 'Offline Ready',
    private_badge: '100% Private on device',
  },
  hi: {
    hero_title: 'बिजली की गति से कनवर्ट, कंप्रेस और एडिट करें',
    hero_subtitle: 'वेबअसेंबली द्वारा संचालित त्वरित ऑन-डिवाइस प्रोसेसिंग। जब तक आप क्लाउड टर्बो नहीं चुनते, आपकी फ़ाइलें ब्राउज़र में सुरक्षित रहती हैं।',
    drop_title: 'कोई भी वीडियो या ऑडियो यहाँ छोड़ें',
    drop_subtitle: 'या अपने डिवाइस से फ़ाइल चुनें।',
    convert_now: 'अभी कनवर्ट करें',
    history: 'इतिहास',
    settings: 'सेटिंग्स',
    account: 'खाता',
    offline_ready: 'ऑफ़लाइन तैयार',
    private_badge: '100% डिवाइस पर निजी',
  },
  ml: {
    hero_title: 'മിന്നൽ വേഗത്തിൽ കൺവേർട്ട് ചെയ്യുക, കംപ്രസ് ചെയ്യുക',
    hero_subtitle: 'നിങ്ങളുടെ ഉപകരണത്തിൽ നേരിട്ട് നടക്കുന്ന പ്രോസസ്സിംഗ്. നിങ്ങളുടെ ഫയലുകൾ സുരക്ഷിതമാണ്.',
    drop_title: 'ഏതെങ്കിലും വീഡിയോ അല്ലെങ്കിൽ ഓഡിയോ ഇവിടെ ഡ്രോപ്പ് ചെയ്യുക',
    drop_subtitle: 'അല്ലെങ്കിൽ ഫയൽ തിരഞ്ഞെടുക്കുക.',
    convert_now: 'ഇപ്പോൾ കൺവേർട്ട് ചെയ്യുക',
    history: 'ഹിസ്റ്ററി',
    settings: 'സെറ്റിങ്സ്',
    account: 'അക്കൗണ്ട്',
    offline_ready: 'ഓഫ്‌ലൈൻ റെഡി',
    private_badge: '100% പ്രൈവറ്റ്',
  },
  ar: {
    hero_title: 'تحويل وضغط وتعديل بسرعة البرق',
    hero_subtitle: 'معالجة فورية على جهازك عبر WebAssembly. ملفاتك لا تغادر متصفحك أبداً.',
    drop_title: 'أفلت أي فيديو أو ملف صوتي هنا',
    drop_subtitle: 'أو انقر للاختيار من جهازك.',
    convert_now: 'تحويل الآن',
    history: 'السجل',
    settings: 'الإعدادات',
    account: 'الحساب',
    offline_ready: 'جاهز دون اتصال',
    private_badge: 'خصوصية 100% على الجهاز',
  },
  es: {
    hero_title: 'Convierte, comprime y edita a la velocidad de la luz',
    hero_subtitle: 'Procesamiento instantáneo en tu dispositivo con WebAssembly. Tus archivos nunca salen de tu navegador.',
    drop_title: 'Arrastra cualquier video o audio aquí',
    drop_subtitle: 'O haz clic para explorar en tu dispositivo.',
    convert_now: 'Convertir ahora',
    history: 'Historial',
    settings: 'Ajustes',
    account: 'Cuenta',
    offline_ready: 'Listo sin conexión',
    private_badge: '100% privado en el dispositivo',
  },
};
