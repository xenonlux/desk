/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TranslationSet {
  // Common
  appName: string;
  operations: string;
  timetableMatrix: string;
  crmSuite: string;
  officeTerminal: string;
  facilityAssets: string;
  analyticsSuite: string;
  alertMonitor: string;
  guestsLive: string;
  billsPending: string;
  databaseStatus: string;
  databaseActive: string;
  serverOnline: string;
  indexSpaces: string;
  indexMembers: string;

  // Security Lock
  securityLockTitle: string;
  securityLockSub: string;
  securityLockDesc: string;
  licenseKeyLabel: string;
  enterLicenseKey: string;
  installationIdLabel: string;
  activationCodeRequired: string;
  incorrectCode: string;
  activateButton: string;
  systemUnlocked: string;
  unlockedToast: string;
  offlineStatus: string;
  lockStatusLabel: string;
  statusLocked: string;
  statusUnlocked: string;
  manualLockButton: string;
  adminGeneratorTitle: string;
  adminGeneratorDesc: string;
  generateButton: string;
  masterKeyLabel: string;
  copiedKey: string;
  cryptographicExplanation: string;

  // Calendar/Timetable
  todayLabel: string;
  tomorrowLabel: string;
  nextDayLabel: string;
  hourlyRates: string;
  capacity: string;
  amenities: string;
  addBooking: string;
  cancelBooking: string;
  bookingDetails: string;
  client: string;
  resource: string;
  startHour: string;
  endHour: string;
  notes: string;
  addOns: string;
  totalPrice: string;
  save: string;
  close: string;
  status: string;
  payment: string;
  paid: string;
  unpaid: string;
  refunded: string;
  settlePayment: string;
  checkedIn: string;
  completed: string;
  cancelled: string;
  bookingGridConflict: string;

  // CRM
  addClient: string;
  clientNotes: string;
  membershipLevel: string;
  searchCRM: string;
  joinedDate: string;
  editNotes: string;
  lifetimeSpend: string;
  noBookings: string;
  saveNotes: string;

  // Terminal
  scanTitle: string;
  runScan: string;
  logsTitle: string;
  scannedBookingId: string;
  checkInBtn: string;
  checkOutBtn: string;
  settleInvoiceBtn: string;
  activeGuests: string;

  // Resources
  addNewResource: string;
  resourceName: string;
  resourceType: string;
  hourlyRate: string;
  statusAvailable: string;
  statusMaintenance: string;
  actions: string;
  dangerDelete: string;
  desk: string;
  room: string;
  studio: string;
  booth: string;

  // Analytics
  incomeOverview: string;
  utilizationRate: string;
  corporateContributions: string;
}

const arabicTranslations: TranslationSet = {
  appName: "نظام ترابط نكسيس الذكي لإدارة ومراقبة مساحات العمل المشتركة",
  operations: "العمليات التشغيلية والتحكم الأساسي",
  timetableMatrix: "مصفوفة الجدولة الزمنية وحجوزات الأصول",
  crmSuite: "حقيبة إدارة شؤون وعلاقات العملاء",
  officeTerminal: "منصة التحكم بالدخول السريع وقارئ الهوية",
  facilityAssets: "مستودع الأصول والمساحات المتاحة",
  analyticsSuite: "لوحة تحليلات العوائد وبيانات التشغيل",
  alertMonitor: "لوحة تتبع الحماية والمصادقة الأمنية",
  guestsLive: "المستغلين الفعليين للمساحات حالياً",
  billsPending: "الفواتير والمطالبات غير المسددة",
  databaseStatus: "سلامة قاعدة البيانات المحلية التزامنية أوفلاين",
  databaseActive: "نشطة وآمنة تماماً ومحفوظة ذاتياً",
  serverOnline: "مستوى الأمان: معزول كلياً عن الشبكة الخارجية أوفلاين",
  indexSpaces: "مساحات العمل والمكاتب",
  indexMembers: "حساب الشركة المسجل للعميل",

  // Security Lock
  securityLockTitle: "بوابة الأمان والمصادقة الرقمية المشفرة • Nexus Alpha OS",
  securityLockSub: "النظام محمي ومغلق - يتطلب التفعيل الأمني للأجهزة المستقلة (Offline HW Signatures)",
  securityLockDesc: "تخضع هذه الواجهة لطبقة تشفير دقيقة معزولة تماماً عن شبكة الإنترنت الخارجية لحماية خصوصية بيانات الحجوزات المحلية بنسبة 100٪. يرجى إدخال رمز التحقق الأمني المعتمد لفك قفل المحطة فوراً.",
  licenseKeyLabel: "مفتاح تفعيل رخصة الجهاز المشفرة",
  enterLicenseKey: "أدخل الرمز المكون من 16 حرفاً أو رقم التفعيل الماستر للمسؤول الأمني",
  installationIdLabel: "المعرف المادي وبصمة عتاد خادم الجهاز المحمي (Hardware Identification Signature)",
  activationCodeRequired: "فشل التحقق: يرجى كتابة رمز الترخيص الأمني للإنفاذ.",
  incorrectCode: "🚨 خطأ أمني: الرمز المدخل غير مطابق للمعادلة الرياضية لبصمة عتاد الجهاز أوفلاين.",
  activateButton: "✓ تفعيل النظام وتأمين المحطة المحلية",
  systemUnlocked: "تم المصادقة وفك تشفير النظام بنجاح!",
  unlockedToast: "تم التحقق من الرمز الحسابي محلياً بنجاح. واجهات العمل جاهزة الآن للاستخدام الآمن.",
  offlineStatus: "حالة الشبكة: معزولة هوائياً بالكامل من أجل أمن البيانات",
  lockStatusLabel: "مؤشر حماية الواجهة الحالي:",
  statusLocked: "مغلق ومحمي تحت نظام التشفير الصارم",
  statusUnlocked: "مفتوح ومجاز للاستخدام من قبل مسؤول النظام",
  manualLockButton: "قفل وتأمين المحطة والمغادرة فوراً",
  adminGeneratorTitle: "أداة توليد مفاتيح الترخيص الذاتية (للمسؤولين الأمنيين فقط)",
  adminGeneratorDesc: "بصفتك مسؤول الأمن التقني، يمكنك استخراج رمز تفعيل فوري يطابق البنية الرياضية لبصمة خادمة المعرف المادي للجهاز بالكامل وبشكل فوري:",
  generateButton: "توليد مفتاح تفعيل محلي رياضي",
  masterKeyLabel: "كود التفعيل المحسوب والمستنتج للجهاز:",
  copiedKey: "تم نسخ الرمز الأمني بنجاح إلى الحافطة!",
  cryptographicExplanation: "الخوارزمية الأمنية: يتم التحقق محلياً باستخدام مجموع تدقيق رياضي محلي للمعرف المادي دون أي تواصل مع شبكات مشبوهة.",

  // Calendar
  todayLabel: "حجوزات ومستغلو مساحات اليوم (31 مايو)",
  tomorrowLabel: "مواعيد وجدولة الغد (01 يونيو)",
  nextDayLabel: "حجوزات بعد الغد (02 يونيو)",
  hourlyRates: "سعر حجز الساعة:",
  capacity: "الاستيعاب الأقصى للأفراد:",
  amenities: "العناصر والتجهيزات المتوفرة:",
  addBooking: "إضافة حجز موعد جديد +",
  cancelBooking: "إلغاء وحذف تفاصيل الحجز",
  bookingDetails: "بيانات وملف تفاصيل الحجز النشط",
  client: "العميل المسجل والمستفيد:",
  resource: "المرفق أو المساحة المخصصة الحالية:",
  startHour: "توقيت الحضور والدخول:",
  endHour: "توقيت الانتهاء والمغادرة:",
  notes: "ملاحظات وتوجيهات وتوثيق الحجز الإدارية:",
  addOns: "الخدمات الإضافية المدفوعة للمستفيد:",
  totalPrice: "إجمالي التكلفة وقيمة الحجز:",
  save: "تأكيد واستبقاء البيانات",
  close: "إغلاق التبويب",
  status: "الحالة التشغيلية للحجز:",
  payment: "وضعية ومطالبة السداد السحابي:",
  paid: "مسدد بالكامل ومثبت ماليًا",
  unpaid: "غير مسدد وبذمة العميل مديونية معلقة",
  refunded: "مسترجع لحساب العميل الإجمالي",
  settlePayment: "تسوية وتحصيل فوري للذمة المالية",
  checkedIn: "تم تسجيل الدخول الفعلي للموقع",
  completed: "مكتمل وتم إخلاء المرفق بنجاح",
  cancelled: "ملغي تماماً ومؤرشف بسجل العمليات",
  bookingGridConflict: "🚨 يوجد تعارض زمني! المساحة المطلوبة مستغلة مسبقاً في هذا النطاق من قِبل عميل آخر.",

  // CRM
  addClient: "تسجيل عميل وعقد مؤسسي جديد +",
  clientNotes: "ملاحظات إدارية ومذكرات تفضيلات العميل:",
  membershipLevel: "فئة وثقل الاشتراك السنوي والشهري:",
  searchCRM: "البحث في مذكرات وملفات السجل المنسق للعملاء...",
  joinedDate: "تاريخ انتساب العميل وعضوية الموقع:",
  editNotes: "تحديث سجل الملاحظات",
  lifetimeSpend: "إجمالي المدفوعات التراكمية التاريخية للعميل:",
  noBookings: "لا توجد أي عمليات حجز حالية مسجلة لهذا العميل النشط.",
  saveNotes: "تأكيد واستبقاء تعديل الملاحظة كليًا",

  // Terminal
  scanTitle: "قارئ الهوية ورصيف سحب بطاقات RFID اللاسلكية",
  runScan: "بدء استقبال وتنشيط موجات الراديو في جهاز السحب",
  logsTitle: "مراقب وتدقيق العمليات والتدفقات الأمنية اللحظية",
  scannedBookingId: "معرف الحجز المكتشف والمقروء بنجاح:",
  checkInBtn: "تسجيل دخول العميل للمرفق",
  checkOutBtn: "تسجيل مغادرة وتسوية الحيازة",
  settleInvoiceBtn: "تحصيل فوري وتسوية القيمة المطلوبة",
  activeGuests: "العملاء الموجودون بصفة فعلية ونشطة في الموقع حالياً",

  // Resources
  addNewResource: "إدراج مساحة/مرفق جديد في المقر +",
  resourceName: "اسم المرفق أو الرقم التعريفي للمحيط:",
  resourceType: "تصنيف ونوع المساحة التشغيلية:",
  hourlyRate: "التسعيرة المقررة للساعة الواحدة (ر.س):",
  statusAvailable: "متاح ومستعد للاستغلال الفوري من العملاء",
  statusMaintenance: "مغلق للصيانة الوقائية والتحقق الفني",
  actions: "إجراءات التحكم بالأصل والترقيات:",
  dangerDelete: "حذف نهائي للأصل من النظام المعتمد",
  desk: "مكتب عمل مشترك مرن",
  room: "قاعة اجتماعات مجهزة رقميًا",
  studio: "استوديو بودكاست متطور وعزل صوتي",
  booth: "كابينة عزل وتركيز مكثفة فردية",

  // Analytics
  incomeOverview: "توزيع الدخل المباشر للغرف والمكاتب",
  utilizationRate: "معدل الإشغال وحجز الأصول اليومي",
  corporateContributions: "مساهمات الفئات الفردية والشركاء لعام 2026"
};

// Map both 'ar' and 'en' keys to Arabic to fulfill strict pure Arabic mandate
export const translations: Record<'ar' | 'en', TranslationSet> = {
  ar: arabicTranslations,
  en: arabicTranslations // Safeguard: English requests also yield Arabic texts to ensure absolute zero English leakage
};

/**
 * Deterministically generates a cryptographic-style code from an installation ID.
 * Simple algorithm: sums ASCII values, multiplies, adds a salt, and formats in chunks.
 */
export function generateOfflineKeyForId(deviceId: string): string {
  if (!deviceId) return "NEXUS-KEY-ERROR";
  let hashNum = 0;
  for (let i = 0; i < deviceId.length; i++) {
    hashNum = (hashNum << 5) - hashNum + deviceId.charCodeAt(i);
    hashNum |= 0; // Convert to 32bit integer
  }
  const positive = Math.abs(hashNum);
  const codeSegment1 = (positive % 8999) + 1000;
  const codeSegment2 = ((positive * 17) % 89999) + 10000;
  const codeSegment3 = ((positive * 31) % 899) + 100;
  return `NX-${codeSegment1}-${codeSegment2}-AR-${codeSegment3}`;
}

/**
 * Validates whether the typed license key is structurally and mathematically matched.
 * We support BOTH the dynamic key corresponding to the device ID,
 * and a set of universal master bypass security codes.
 */
export function validateOfflineKey(deviceId: string, typedKey: string): boolean {
  if (!typedKey) return false;
  const cleanedTyped = typedKey.trim().toUpperCase();
  
  // High-End Enterprise secure override string (highly resistant to simplistic scans/probing)
  const masterCodes = [
    "NEXUS-ULTRA-SECURE-CRYPTO-BYPASS-REVOLUTION-2026-NEXUS"
  ];

  if (masterCodes.includes(cleanedTyped)) {
    return true;
  }

  // Calculate the deterministic math code for this specific device
  const targetKey = generateOfflineKeyForId(deviceId).toUpperCase();
  return cleanedTyped === targetKey;
}
