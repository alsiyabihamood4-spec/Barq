// Seeds the exact Oman fixtures from the prototype's Component state (PORTS,
// BIDS→providers, TENDERS, KYC queue, OPS rows, TICKETS, payouts) so the
// admin console and mobile app show the same data as the design on first run.
import { PrismaClient } from "@prisma/client";
import { generateDeliveryOtp } from "../src/lib/codes.js";

const prisma = new PrismaClient();

async function main() {
  const ports = await Promise.all(
    [
      { code: "SOH-01", nameAr: "ميناء صحار الصناعي", nameEn: "Port of Sohar", brokers: 37, lat: 24.3644, lng: 56.6216 },
      { code: "SLL-02", nameAr: "ميناء صلالة", nameEn: "Port of Salalah", brokers: 24, lat: 16.9391, lng: 54.0106 },
      { code: "MCT-03", nameAr: "ميناء السلطان قابوس", nameEn: "Sultan Qaboos Port", brokers: 12, lat: 23.6238, lng: 58.5658 },
      { code: "WJJ-04", nameAr: "منفذ الوجاجة البري", nameEn: "Al Wajajah Land Border", brokers: 19, lat: 19.9959, lng: 54.0086 },
    ].map((p) => prisma.port.upsert({ where: { code: p.code }, update: p, create: p }))
  );

  const admin = await prisma.user.upsert({
    where: { mobile: "+968900000" },
    update: {},
    create: { mobile: "+968900000", role: "ADMIN", nameAr: "أحمد الساعدي", nameEn: "Ahmed Al Saadi", kycStatus: "APPROVED" },
  });

  const client = await prisma.user.upsert({
    where: { mobile: "+96891428830" },
    update: {},
    create: {
      mobile: "+96891428830",
      role: "CLIENT",
      nameAr: "خالد بن سعيد البوسعيدي",
      nameEn: "Khalid bin Said Al Busaidi",
      kycStatus: "APPROVED",
      company: {
        create: {
          tradeNameAr: "شركة الباطنة للتجارة ش.م.م",
          tradeNameEn: "Al Batinah Trading LLC",
          commercialReg: "1234567",
          vatNumber: "OM100234567",
          signatoryName: "خالد بن سعيد البوسعيدي",
          signatoryMobile: "+96891428830",
          payoutIban: "OM.. 0018 4417",
        },
      },
    },
  });

  const providersData = [
    { mobile: "+96899000001", type: "BROKER" as const, ar: "مكتب الوجاجة للتخليص الجمركي", en: "Al Wajajah Clearance Bureau", rating: 4.9, count: 212 },
    { mobile: "+96899000002", type: "BROKER" as const, ar: "شركة صحار لوجستيك", en: "Sohar Logistics Co.", rating: 4.6, count: 94 },
    { mobile: "+96899000003", type: "BROKER" as const, ar: "الخليج للخدمات الجمركية", en: "Gulf Customs Services", rating: 4.8, count: 341 },
    { mobile: "+96899000004", type: "CARRIER" as const, ar: "مؤسسة بندر المزروعي", en: "Bandar Al Mazrouei Est.", rating: 4.2, count: 38 },
  ];
  const providers = await Promise.all(
    providersData.map((p) =>
      prisma.user.upsert({
        where: { mobile: p.mobile },
        update: {},
        create: {
          mobile: p.mobile,
          role: p.type,
          providerType: p.type,
          nameAr: p.ar,
          nameEn: p.en,
          kycStatus: "APPROVED",
          ratingAvg: p.rating,
          ratingCount: p.count,
        },
      })
    )
  );
  const [wajajah, soharLogistics, gulfCustoms, bandar] = providers;

  // Tenders — matches TENDERS in the prototype.
  const tenderDefs = [
    { code: "TND-4471", port: "SOH-01", ar: "تخليص جمركي — قطع غيار صناعية", en: "Clearance — industrial spare parts", descAr: "حاوية 40 قدم · مسار أخضر متوقع", descEn: "40 ft container · green channel expected", weight: 18400, secs: 2760 },
    { code: "TND-4468", port: "WJJ-04", ar: "نقل بري — صحار إلى الرسيل", en: "Road freight — Sohar to Rusayl", descAr: "مسطحة 40 قدم · تحميل غداً 06:00", descEn: "40 ft flatbed · loading tomorrow 06:00", weight: 22000, secs: 640 },
    { code: "TND-4465", port: "SOH-01", ar: "جهات حكومية — موافقة المواصفات", en: "Government — standards approval", descAr: "أجهزة كهربائية · وزارة التجارة", descEn: "Electrical goods · Ministry of Commerce", weight: 4200, secs: 15400 },
  ];
  const tenders = await Promise.all(
    tenderDefs.map((t) =>
      prisma.tender.upsert({
        where: { code: t.code },
        update: {},
        create: {
          code: t.code,
          clientId: client.id,
          service: t.code === "TND-4468" ? "FREIGHT" : t.code === "TND-4465" ? "GOV" : "CLEARANCE",
          portCode: t.port,
          titleAr: t.ar,
          titleEn: t.en,
          descAr: t.descAr,
          descEn: t.descEn,
          billOfLading: "MSCU 447 1902",
          invoiceNo: "INV-2026-0884",
          grossWeightKg: t.weight,
          declaredValueOmr: 31200,
          taxExempt: true,
          closesAt: new Date(Date.now() + t.secs * 1000),
          status: "OPEN",
        },
      })
    )
  );

  // Bids on TND-4471 — matches BIDS in the prototype.
  const bidDefs = [
    { provider: wajajah!, price: 168, eta: 6 },
    { provider: soharLogistics!, price: 142, eta: 12 },
    { provider: gulfCustoms!, price: 195, eta: 4 },
    { provider: bandar!, price: 128, eta: 18 },
  ];
  for (const b of bidDefs) {
    await prisma.bid.create({
      data: { tenderId: tenders[0]!.id, providerId: b.provider.id, priceOmr: b.price, etaHours: b.eta },
    });
  }

  // Active + completed orders — matches activeShipments / HISTORY / OPS.
  const orderDefs = [
    { code: "ORD-0884", port: "SOH-01", stage: "INSPECTION" as const, escrow: 506.7, provider: wajajah! },
    { code: "ORD-0879", port: "WJJ-04", stage: "IN_TRANSIT" as const, escrow: 288.0, provider: soharLogistics! },
    { code: "ORD-0871", port: "SOH-01", stage: "DELIVERED" as const, escrow: 182.0, provider: gulfCustoms! },
    { code: "ORD-0812", port: "SOH-01", stage: "DECLARATION" as const, escrow: 418.2, provider: bandar! },
  ];
  for (const o of orderDefs) {
    const existing = await prisma.order.findUnique({ where: { code: o.code } });
    if (existing) continue;
    const tender = await prisma.tender.create({
      data: {
        code: `TND-SEED-${o.code}`,
        clientId: client.id,
        service: "CLEARANCE",
        portCode: o.port,
        titleAr: "معاملة مؤرشفة", titleEn: "Archived transaction",
        descAr: "", descEn: "",
        closesAt: new Date(),
        status: "AWARDED",
      },
    });
    const order = await prisma.order.create({
      data: {
        code: o.code,
        tenderId: tender.id,
        clientId: client.id,
        providerId: o.provider.id,
        service: "CLEARANCE",
        portCode: o.port,
        stage: o.stage,
        escrowOmr: o.escrow,
        deliveryOtp: generateDeliveryOtp(),
        deliveredAt: o.stage === "DELIVERED" ? new Date() : undefined,
      },
    });
    await prisma.escrowLedgerEntry.create({
      data: {
        orderId: order.id,
        amountOmr: o.escrow,
        commissionPct: 15,
        commissionOmr: Math.round(o.escrow * 0.15 * 1000) / 1000,
        netOmr: Math.round(o.escrow * 0.85 * 1000) / 1000,
        status: o.stage === "DELIVERED" ? "RELEASED" : "HELD",
      },
    });
  }

  // KYC queue — matches the KYC array in the prototype.
  const kycApplicants = [
    { mobile: "+96899100001", ar: "مؤسسة نزوى للتخليص", en: "Nizwa Clearance Est.", type: "BROKER" as const, docsDone: 4, status: "IN_REVIEW" as const, ports: ["SOH-01", "WJJ-04"] },
    { mobile: "+96899100002", ar: "شركة الشرقية للنقل", en: "Sharqiyah Transport Co.", type: "CARRIER" as const, docsDone: 4, status: "IN_REVIEW" as const, ports: [] },
    { mobile: "+96899100003", ar: "سعيد بن حمد الحارثي", en: "Said bin Hamad Al Harthi", type: "DRIVER" as const, docsDone: 3, status: "MISSING_DOCS" as const, ports: [] },
  ];
  for (const k of kycApplicants) {
    const applicant = await prisma.user.upsert({
      where: { mobile: k.mobile },
      update: {},
      create: { mobile: k.mobile, role: k.type, providerType: k.type, nameAr: k.ar, nameEn: k.en, kycStatus: k.status === "IN_REVIEW" ? "IN_REVIEW" : "MISSING_DOCS" },
    });
    const docLabels = [
      { key: "d1", labelAr: "البطاقة الشخصية", labelEn: "National ID card" },
      { key: "d2", labelAr: "السجل التجاري", labelEn: "Commercial registration" },
      { key: "d3", labelAr: "البطاقة المهنية", labelEn: "Professional licence" },
      { key: "d4", labelAr: "تصريح الميناء", labelEn: "Port access permit" },
    ];
    const existing = await prisma.kycApplication.findFirst({ where: { applicantId: applicant.id } });
    if (existing) continue;
    await prisma.kycApplication.create({
      data: {
        applicantId: applicant.id,
        providerType: k.type,
        status: k.status,
        requestedPorts: { connect: k.ports.map((code) => ({ code })) },
        documents: { create: docLabels.map((d, i) => ({ ...d, uploaded: i < k.docsDone })) },
      },
    });
  }

  // Withdrawal requests — matches `payouts` in the prototype's financial centre.
  const payoutDefs = [
    { provider: wajajah!, amount: 1842.35 },
    { provider: soharLogistics!, amount: 3106.0 },
    { provider: gulfCustoms!, amount: 922.4 },
    { provider: bandar!, amount: 408.0 },
  ];
  for (const p of payoutDefs) {
    const existing = await prisma.withdrawalRequest.findFirst({ where: { providerId: p.provider.id, amountOmr: p.amount } });
    if (existing) continue;
    await prisma.withdrawalRequest.create({
      data: {
        providerId: p.provider.id,
        amountOmr: p.amount,
        bankName: "BANK MUSCAT",
        accountHolder: p.provider.nameEn,
        iban: "OM.. 0018 4417",
      },
    });
  }

  // Dispute — matches DSP-1142 (clearance three days late) on ORD-0812.
  const lateOrder = await prisma.order.findUnique({ where: { code: "ORD-0812" } });
  if (lateOrder) {
    const existingDispute = await prisma.dispute.findFirst({ where: { orderId: lateOrder.id } });
    if (!existingDispute) {
      await prisma.dispute.create({
        data: {
          code: "DSP-1142",
          orderId: lateOrder.id,
          subjectAr: "تأخر الفسح ثلاثة أيام",
          subjectEn: "Clearance three days late",
          meta: `${lateOrder.code} · SOH-01 · CLIENT CLAIM`,
          priority: "HIGH",
          frozenOmr: 418.2,
          clientClaimAr: "استرداد كامل",
          clientClaimEn: "FULL REFUND",
          providerResponseAr: "تفتيش إلزامي",
          providerResponseEn: "MANDATED INSPECTION",
        },
      });
    }
  }

  console.log(`Seeded ${ports.length} ports, ${providers.length} providers, ${tenders.length} tenders, admin=${admin.mobile}, client=${client.mobile}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
