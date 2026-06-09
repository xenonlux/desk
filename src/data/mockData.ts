/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Resource, Client, Booking, AddOnOption } from '../types';

export const INITIAL_RESOURCES: Resource[] = [
  {
    id: 'res-desk-1',
    name: 'مكتب عمل مشترك - المنطقة أ (بجوار النافذة)',
    type: 'desk',
    capacity: 1,
    hourlyRate: 8,
    amenities: ['كرسي مريح مخصص لدعم الظهر', 'مخارج طاقة مدمجة', 'إضاءة طبيعية دافئة', 'شاشة عرض ثنائية متكاملة'],
    status: 'available',
    location: 'الطابق الأول، الجناح الغربي'
  },
  {
    id: 'res-desk-2',
    name: 'مكتب عمل مخصص ومستقل رقم #٤٢',
    type: 'desk',
    capacity: 1,
    hourlyRate: 12,
    amenities: ['خزانة أمان مغناطيسية خاصة', 'كرسي مريح لدعم العمود الفقري', 'موزع منافذ Type-C متكامل', 'نباتات مكتبية طبيعية'],
    status: 'available',
    location: 'الطابق الأول، المنطقة الشرقية'
  },
  {
    id: 'res-room-1',
    name: 'قاعة اجتماعات البيت الزجاجي الرئيسي',
    type: 'room',
    capacity: 12,
    hourlyRate: 45,
    amenities: ['شاشة ذكية بدقة 4K فائقة الوضوح', 'نظام كاميرا زكي لعقد المؤتمرات عن بُعد', 'لوحة ذكية تفاعلية للكتابة', 'نظام تكييف مركزي متكامل', 'وصول مباشر لآلة صناعة القهوة'],
    status: 'available',
    location: 'الطابق الثاني، المركز الرئيسي للمبنى'
  },
  {
    id: 'res-room-2',
    name: 'ركن العصف الذهني والتعاون المشترك (متوسط)',
    type: 'room',
    capacity: 6,
    hourlyRate: 25,
    amenities: ['حائط زجاجي مخصص للكتابة ومسح المحتوى', 'شاشة عرض بمخرج USB-C متكامل', 'سماعات تفاعلية ذكية', 'ألواح للتخميد الصوتي وعزل الجدران'],
    status: 'available',
    location: 'الطابق الثاني، الجناح الشمالي'
  },
  {
    id: 'res-studio-1',
    name: 'استوديو حواري تفاعلي للبودكاست وعرض الوسائط',
    type: 'studio',
    capacity: 4,
    hourlyRate: 35,
    amenities: ['أحدث مكسر ومصفي صوتي Rødecaster Pro II', 'ميكروفونات Shure SM7B الاحترافية (عدد ٣)', 'إضاءة استوديو متعددة الدرجات لإنتاج الفيديو', 'كروما خضراء للتصوير والإنتاج', 'عزل صوتي كامل ومخمد لتردد الصوت للجدران'],
    status: 'available',
    location: 'طابق التسوية، الجناح الفني ب'
  },
  {
    id: 'res-booth-1',
    name: 'كابينة التركيز وعزل الصوت الفردية رقم #١',
    type: 'booth',
    capacity: 1,
    hourlyRate: 5,
    amenities: ['مروحة صامتة لسحب الهواء وتجديده', 'مخرج طاقة وجدار هاتف مدمج', 'كرسي مكتب قابل لتعديل الارتفاع', 'إضاءة قراءة LED موجهة خالية من الوهج'],
    status: 'available',
    location: 'الطابق الأول، منطقة الهدوء والتركيز'
  },
  {
    id: 'res-booth-2',
    name: 'كابينة التركيز وعزل الصوت الفردية رقم #٢',
    type: 'booth',
    capacity: 1,
    hourlyRate: 5,
    amenities: ['مروحة صامتة لسحب الهواء وتجديده', 'مخرج طاقة وجدار هاتف مدمج', 'كرسي مكتب قابل لتعديل الارتفاع', 'إضاءة قراءة LED موجهة خالية من الوهج'],
    status: 'available',
    location: 'الطابق الثاني، بجوار المصاعد'
  }
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c-1',
    name: 'الأستاذة صوفيا ستيرلينغ (رئيسة الإبداع)',
    email: 'sophia@sterlingcreative.co',
    phone: '+966 (50) 234-5678',
    notes: 'المديرة الإبداعية للمحتوى المرئي والمسموع. تقوم بحجز قاعات الإنتاج وبودكاست الصوت بشكل مستمر. تفضل قهوة اللاتيه مع حليب الشوفان البارد.',
    membership: 'enterprise',
    joinedDate: '2025-01-12'
  },
  {
    id: 'c-2',
    name: 'المهندس ماركوس فانس (مستشار السحابة)',
    email: 'marcus.vance@techpinnacle.io',
    phone: '+966 (51) 789-0123',
    notes: 'مستشار برمجيات وتطبيقات سحابية مستقل. يفضل حجز المكاتب المجهزة، ويقيم اجتماع تنسيقي لفريقه كل صباح جمعة بشكل مستقر.',
    membership: 'pro',
    joinedDate: '2025-03-05'
  },
  {
    id: 'c-3',
    name: 'المصممة إيلينا روستوفا (واجهات مستخدم)',
    email: 'elena@novadesign.agency',
    phone: '+966 (53) 456-7890',
    notes: 'مصممة واجهات وموقع مستخدم متخصصة في الخدمات المالية. حجز متكرر لكبائن التركيز الرقمية وأماكن العصف الذهني المشترك لأهداف التصميم.',
    membership: 'regular',
    joinedDate: '2025-04-19'
  },
  {
    id: 'c-4',
    name: 'الأستاذ ديفون باتيل (مؤسس المبادرات البيئية)',
    email: 'devon@greenforward.org',
    phone: '+966 (55) 890-1234',
    notes: 'مؤسس جمعيات تنموية مستدامة وحملات تشجير الغطاء النباتي. يفضل عقد جلسات مجلس الأمناء لمناقشة التحديثات في قاعة البيت الزجاجي بانتظام.',
    membership: 'regular',
    joinedDate: '2025-05-01'
  },
  {
    id: 'c-5',
    name: 'الدكتورة كلوي تاكاهاشي (شريكة استثمارية)',
    email: 'chloe.t@quantumventures.vc',
    phone: '+966 (59) 567-8901',
    notes: 'شريكة استشراف وتمويل تكنولوجي مغامر. جدول أعمال مكثف ومزدحم دائمًا. تفضل بيئة مكاتب مغلقة وتطلب باقات إنترنت ألياف فائقة السرعة للمؤتمرات.',
    membership: 'enterprise',
    joinedDate: '2025-02-14'
  }
];

export const ADD_ONS: AddOnOption[] = [
  { id: 'wifi', name: 'باقة إنترنت ألياف ضوئية فائقة السرعة بقوة ١ جيجابت', price: 10, description: 'عنوان IP مستقل بدون أي قيود على سرعة الرفع أو التنزيل لسهولة البث التلفزيوني والاجتماعات.' },
  { id: 'catering', name: 'توفير الضيافة الغذائية والقهوة العضوية مع باريستا مخصص', price: 25, description: 'مشروبات ساخنة غير محدودة مع باريستا مميز لتقديم القهوة والشاي والمأكولات الخفيفة طوال ورشة العمل.' },
  { id: 'projector', name: 'جهاز عرض بروجيكتور بدقة 4K عالي السطوع وسماعات مجسمة', price: 15, description: 'شاشة عرض بروجيكتور فائقة السطوع وسماعات ساوند بار لتقديم عروض توضيحية تفاعلية.' },
  { id: 'flipchart', name: 'لوحة سبورة ذكية رقمية قابلة للحفظ الفوري بصيغة PDF', price: 8, description: 'قماش تفاعلي للكتابة مع إمكانية التصدير الفوري وسحب العمل عبر مسح كود الاستجابة السريعة (QR).' }
];

// Seed detailed historic, current, and future bookings
export const getInitialBookings = (): Booking[] => {
  return [
    {
      id: 'bk-1',
      resourceId: 'res-room-1',
      clientId: 'c-1',
      date: '2026-05-31',
      startTime: '09:00',
      endTime: '11:00',
      totalHours: 2,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 115,
      notes: 'ورشة العمل الربع سنوية لانطلاق الاستوديو الإبداعي وتخطيط قنوات المحتوى للعام الجديد.',
      addOns: ['catering']
    },
    {
      id: 'bk-2',
      resourceId: 'res-studio-1',
      clientId: 'c-1',
      date: '2026-05-31',
      startTime: '13:00',
      endTime: '16:00',
      totalHours: 3,
      status: 'checked-in',
      paymentStatus: 'paid',
      totalPrice: 115,
      notes: 'تسجيل وبث حلقة إذاعية للبودكاست الأسبوعي مع أحد المؤسسين التقنيين المرموقين، يُرجى تقليل الضوضاء بالخارج.',
      addOns: ['wifi']
    },
    {
      id: 'bk-3',
      resourceId: 'res-desk-2',
      clientId: 'c-2',
      date: '2026-05-31',
      startTime: '08:00',
      endTime: '17:00',
      totalHours: 9,
      status: 'checked-in',
      paymentStatus: 'paid',
      totalPrice: 118,
      notes: 'جلسة برمجة مكثفة للعمل على هجرة وترقية البنية السحابية وإصلاح الثغرات الأمنية ذات الأولوية الطارئة.',
      addOns: ['wifi']
    },
    {
      id: 'bk-4',
      resourceId: 'res-booth-1',
      clientId: 'c-3',
      date: '2026-05-31',
      startTime: '11:30',
      endTime: '12:30',
      totalHours: 1,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 5,
      notes: 'جلسة لمناقشة واجهات وتصاميم النماذج الأولية مع ممثلي الإدارة المالية لتقييم تجربة المستخدم.',
      addOns: []
    },
    {
      id: 'bk-5',
      resourceId: 'res-room-2',
      clientId: 'c-4',
      date: '2026-05-31',
      startTime: '16:00',
      endTime: '18:00',
      totalHours: 2,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      totalPrice: 50,
      notes: 'جلسة عصف ذهني للتخطيط لحملة تشجير وتجهيز المسودات والخرائط البيئية للمقر الإقليمي الجديد.',
      addOns: []
    },
    {
      id: 'bk-6',
      resourceId: 'res-room-1',
      clientId: 'c-5',
      date: '2026-06-01',
      startTime: '10:00',
      endTime: '13:00',
      totalHours: 3,
      status: 'confirmed',
      paymentStatus: 'paid',
      totalPrice: 185,
      notes: 'استعراض وعرض الخطة التمويلية لجولة الاستثمار الأولي مع المستثمرين والشركاء الأجانب، تطلب بورتفوليو ورقي وضيافة ممتازة.',
      addOns: ['catering', 'projector', 'wifi']
    },
    {
      id: 'bk-7',
      resourceId: 'res-desk-1',
      clientId: 'c-3',
      date: '2026-06-01',
      startTime: '09:00',
      endTime: '13:00',
      totalHours: 4,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      totalPrice: 32,
      notes: 'فترة تركيز وهدوء لتحديث وتصحيح الأخطاء لبروتوكول تحصيل وتتبع فواتير الاشتراك الشهري للعملاء المؤسسين.',
      addOns: []
    },
    {
      id: 'bk-8',
      resourceId: 'res-booth-2',
      clientId: 'c-2',
      date: '2026-06-01',
      startTime: '14:00',
      endTime: '15:30',
      totalHours: 1.5,
      status: 'confirmed',
      paymentStatus: 'unpaid',
      totalPrice: 7.5,
      notes: 'اجتماع تنسيقي وتقني سريع مع فريق العمل الموزع في مكاتب طوكيو والرياض لمراجعة المخرجات البرمجية.',
      addOns: []
    },
    {
      id: 'bk-historic-1',
      resourceId: 'res-room-1',
      clientId: 'c-5',
      date: '2026-05-26',
      startTime: '10:00',
      endTime: '12:00',
      totalHours: 2,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 115,
      notes: 'اجتماع مراجعة المخرجات والاستشارات السنوية مع كبار مسؤولي الاستثمار.',
      addOns: ['catering']
    },
    {
      id: 'bk-historic-2',
      resourceId: 'res-studio-1',
      clientId: 'c-1',
      date: '2026-05-27',
      startTime: '14:00',
      endTime: '18:00',
      totalHours: 4,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 150,
      notes: 'تسجيل الصوت عالي الجودة واللقاء الصوتي المفتوح للحلقة الإذاعية رقم ١٢ للبودكاست الخاص بنا.',
      addOns: ['wifi']
    },
    {
      id: 'bk-historic-3',
      resourceId: 'res-room-2',
      clientId: 'c-3',
      date: '2026-05-28',
      startTime: '09:00',
      endTime: '11:00',
      totalHours: 2,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 50,
      notes: 'مراجعة شاملة لتقرير تقييم تجربة الاستخدام وتدقيق التصاميم مع فريق واجهات المستخدم الهندسي.',
      addOns: []
    },
    {
      id: 'bk-historic-4',
      resourceId: 'res-desk-1',
      clientId: 'c-2',
      date: '2026-05-29',
      startTime: '09:00',
      endTime: '17:00',
      totalHours: 8,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 74,
      notes: 'يوم كامل من التركيز والعمل العميق لتتبع وتطهير الأخطاء في أبحاث قاعدة البيانات المتناظرة وتنسيق السجلات.',
      addOns: ['wifi']
    },
    {
      id: 'bk-historic-5',
      resourceId: 'res-booth-1',
      clientId: 'c-4',
      date: '2026-05-30',
      startTime: '10:00',
      endTime: '11:00',
      totalHours: 1,
      status: 'completed',
      paymentStatus: 'paid',
      totalPrice: 5,
      notes: 'مكالمة مراجعة التقدم ونسب النجاح السنوية مع الجهات والشركاء المانحين والممولين للجمعية الاستشارية العامة.',
      addOns: []
    }
  ];
};
