import type { Bi } from "./types";

/**
 * Bilingual copy, pulled from `project/Tanafus App.dc.html`'s markup and its
 * embedded `Component` state model (PORTS, BIDS, STEPS, TENDERS, KYC, OPS,
 * TICKETS, …). Keep the Arabic and English lines paired exactly as the
 * prototype has them — nothing here is invented.
 */

export const brand = {
  name: "TANAFUS · تنافُس",
  tagline: { ar: "مناقصات التخليص والنقل في مكان واحد", en: "Clearance and freight tenders in one place" } satisfies Bi,
  pitch: {
    ar: "اطرح شحنتك، قارن العروض من مخلّصين وناقلين مرخّصين في منافذ السلطنة، وادفع عبر ضمان لا يُفرج عنه إلا بعد التسليم.",
    en: "Post your shipment, compare bids from licensed brokers and carriers across Oman's ports, and pay through escrow that only releases on delivery.",
  } satisfies Bi,
};

export const common = {
  continue: { ar: "المتابعة", en: "Continue" } satisfies Bi,
  back: { ar: "رجوع", en: "Back" } satisfies Bi,
  or: { ar: "أو", en: "OR" } satisfies Bi,
  signIn: { ar: "تسجيل الدخول", en: "Sign in" } satisfies Bi,
  cancel: { ar: "إلغاء", en: "Cancel" } satisfies Bi,
  save: { ar: "حفظ", en: "Save" } satisfies Bi,
  contactSupport: { ar: "التواصل مع الدعم الفني", en: "Contact support" } satisfies Bi,
};

export const roles = {
  client: { key: "client", code: "R-01", ar: "عميل أو شركة", en: "Client or company", noteAr: "أطرح شحنات وأستقبل عروضاً", noteEn: "Post shipments and receive bids", labelAr: "عميل", labelEn: "CLIENT" },
  partner: { key: "partner", code: "R-02", ar: "مخلّص أو ناقل", en: "Broker or carrier", noteAr: "أقدّم عروضاً وأنفّذ المعاملات", noteEn: "Bid on tenders and execute jobs", labelAr: "مزوّد", labelEn: "PARTNER" },
} as const;

export const altSignins: { code: string; ar: string; en: string }[] = [
  { code: "OMAN-ID", ar: "الدخول عبر الهوية الرقمية", en: "Sign in with National Digital ID" },
  { code: "SMS-OTP", ar: "الدخول برمز يُرسل عبر رسالة", en: "Sign in with an SMS code" },
];

export const ports = [
  { code: "SOH-01", ar: "ميناء صحار الصناعي", en: "Port of Sohar", brokers: 37 },
  { code: "SLL-02", ar: "ميناء صلالة", en: "Port of Salalah", brokers: 24 },
  { code: "MCT-03", ar: "ميناء السلطان قابوس", en: "Sultan Qaboos Port", brokers: 12 },
  { code: "WJJ-04", ar: "منفذ الوجاجة البري", en: "Al Wajajah Land Border", brokers: 19 },
];

export const services = [
  { key: "clearance", code: "SVC-01", ar: "تخليص جمركي", en: "Customs clearance" },
  { key: "inspection", code: "SVC-02", ar: "كشف ومعاينة", en: "Inspection & survey" },
  { key: "gov", code: "SVC-03", ar: "جهات حكومية", en: "Government agencies" },
  { key: "freight", code: "SVC-04", ar: "نقل بري", en: "Road freight" },
] as const;

/** Known delivery hubs for the freight request flow — real coordinates so
 * the live-tracking distance (PostGIS/Redis GEO-backed) is meaningful
 * instead of a placeholder number. */
export const deliveryHubs = [
  { key: "rusayl", ar: "الرسيل الصناعية", en: "Rusayl Industrial Estate", lat: 23.6493, lng: 58.1364 },
  { key: "barka", ar: "بركاء", en: "Barka", lat: 23.6667, lng: 57.8833 },
  { key: "thumrait", ar: "ثمريت", en: "Thumrait", lat: 17.6333, lng: 54.0333 },
  { key: "soharfz", ar: "المنطقة الحرة صحار", en: "Sohar Free Zone", lat: 24.4667, lng: 56.6167 },
] as const;

export const trucks = [
  { key: "flatbed", code: "TR-01", ar: "مسطحة 40 قدم", en: "40 ft flatbed", cap: "≤ 24 t" },
  { key: "box", code: "TR-02", ar: "صندوق مغلق", en: "Closed box", cap: "≤ 12 t" },
  { key: "reefer", code: "TR-03", ar: "مبرّدة", en: "Refrigerated", cap: "≤ 18 t" },
  { key: "lowbed", code: "TR-04", ar: "منخفضة (لوبد)", en: "Lowbed", cap: "≤ 60 t" },
] as const;

export const clearanceSteps = [
  { key: "s1", ar: "تم التعيين", en: "Broker assigned", noteAr: "قبول العرض وحجز مبلغ الضمان", noteEn: "Bid accepted, escrow funded" },
  { key: "s2", ar: "إعداد البيان الجمركي", en: "Bayan declaration", noteAr: "إدخال البنود والتعريفة في نظام بيان", noteEn: "HS lines and tariff filed in Bayan" },
  { key: "s3", ar: "انتظار التفتيش", en: "Awaiting inspection", noteAr: "المسار الأحمر — فحص بالأشعة في الساحة 4", noteEn: "Red channel — scanner yard 4" },
  { key: "s4", ar: "تم الفسح", en: "Released", noteAr: "إشعار الفسح صادر وجاهز للتحميل", noteEn: "Release note issued, ready to load" },
] as const;

/** Freight's own step line — no customs stages, matches the FREIGHT entry
 * in apps/api's STAGE_SEQUENCE (assigned → in_transit → delivered). */
export const freightSteps = [
  { key: "f1", ar: "تم تعيين الناقل", en: "Carrier assigned", noteAr: "قبول العرض وحجز مبلغ الضمان", noteEn: "Bid accepted, escrow funded" },
  { key: "f2", ar: "في الطريق", en: "In transit", noteAr: "الشاحنة في طريقها إلى موقع التسليم", noteEn: "Truck en route to the delivery location" },
  { key: "f3", ar: "تم التسليم", en: "Delivered", noteAr: "تم تأكيد الاستلام برمز التسليم", noteEn: "Delivery confirmed by OTP" },
] as const;

export const deliveryChecks = [
  { key: "c1", ar: "مطابقة عدد الطرود للبوليصة", en: "Package count matches the B/L" },
  { key: "c2", ar: "لا يوجد تلف ظاهري على الشحنة", en: "No visible damage to the cargo" },
  { key: "c3", ar: "استلام إشعار الفسح والمستندات", en: "Release note and documents received" },
] as const;

export const ratingTraits = [
  { key: "t1", ar: "التزام بالوقت", en: "On time" },
  { key: "t2", ar: "تواصل ممتاز", en: "Great comms" },
  { key: "t3", ar: "مستندات دقيقة", en: "Accurate docs" },
  { key: "t4", ar: "سعر عادل", en: "Fair price" },
  { key: "t5", ar: "تعامل مهني", en: "Professional" },
] as const;

export const kycDocSets = {
  broker: [
    { key: "d1", ar: "البطاقة الشخصية", en: "National ID card" },
    { key: "d2", ar: "السجل التجاري", en: "Commercial registration" },
    { key: "d3", ar: "البطاقة المهنية للتخليص", en: "Customs broker licence" },
    { key: "d4", ar: "تصريح دخول الميناء", en: "Port access permit" },
  ],
  carrier: [
    { key: "d1", ar: "البطاقة الشخصية للمالك", en: "Owner national ID" },
    { key: "d2", ar: "السجل التجاري", en: "Commercial registration" },
    { key: "d3", ar: "ترخيص النقل البري", en: "Road transport licence" },
    { key: "d4", ar: "وثائق ملكية المركبات", en: "Vehicle ownership papers" },
  ],
  driver: [
    { key: "d1", ar: "البطاقة الشخصية", en: "National ID card" },
    { key: "d2", ar: "رخصة القيادة (ثقيل)", en: "Heavy vehicle licence" },
    { key: "d3", ar: "بطاقة مرور الميناء", en: "Port access pass" },
    { key: "d4", ar: "الفحص الطبي", en: "Medical fitness report" },
  ],
} as const;

export const providerTypes = [
  { key: "broker", code: "P-01", ar: "مخلّص جمركي", en: "Customs broker", noteAr: "يعمل داخل منافذ محدّدة بترخيصه", noteEn: "Works only inside its licensed ports" },
  { key: "carrier", code: "P-02", ar: "شركة نقل", en: "Transport company", noteAr: "أسطول ومجموعة سائقين تحت السجل", noteEn: "Fleet and drivers under one registration" },
  { key: "driver", code: "P-03", ar: "سائق مستقل", en: "Independent driver", noteAr: "مركبة واحدة باسم السائق", noteEn: "A single truck in the driver's name" },
] as const;

export const adminSections = {
  overview: { ar: "الرئيسية والإحصائيات", en: "Overview & statistics", crumb: "HOME / OVERVIEW" },
  kyc: { ar: "إدارة التحقق والتراخيص", en: "KYC verification", crumb: "HOME / KYC QUEUE" },
  ops: { ar: "مراقبة المعاملات", en: "Operations monitor", crumb: "HOME / OPERATIONS" },
  fin: { ar: "الإدارة المالية", en: "Financial centre", crumb: "HOME / FINANCE" },
  disp: { ar: "إدارة النزاعات والدعم", en: "Disputes & tickets", crumb: "HOME / DISPUTES" },
} as const;

export const adminNavItems = [
  { key: "overview", code: "A-01", ar: "الرئيسية", en: "Overview" },
  { key: "kyc", code: "A-02", ar: "التحقق والتراخيص", en: "KYC queue" },
  { key: "ops", code: "A-03", ar: "مراقبة المعاملات", en: "Operations" },
  { key: "fin", code: "A-04", ar: "الإدارة المالية", en: "Finance" },
  { key: "disp", code: "A-05", ar: "النزاعات والدعم", en: "Disputes" },
] as const;

/** Demo OTP used throughout the prototype (delivery confirmation + sign-up verification). */
export const DEMO_OTP = "482715";
/** Default platform commission, tunable 5–25% in the prototype's tweak panel. */
export const DEFAULT_COMMISSION_PCT = 15;
