// Shared domain DTOs — the contract between apps/api and the two frontends.
// Kept intentionally plain (no class instances, no Prisma types) so they are
// safe to import from apps/mobile's Metro bundle and apps/admin's Next build.

export type Role = "client" | "broker" | "carrier" | "driver" | "admin";
export type ProviderType = "broker" | "carrier" | "driver";
export type ServiceType = "clearance" | "inspection" | "gov" | "freight";
export type Locale = "ar" | "en";

export interface Port {
  code: string;
  nameAr: string;
  nameEn: string;
  brokers: number;
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  role: Role;
  mobile: string;
  nameAr: string;
  nameEn: string;
  companyId?: string;
  providerType?: ProviderType;
  kycStatus: KycStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
}

export interface Company {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  commercialReg: string;
  vatNumber: string;
  signatoryName: string;
  signatoryMobile: string;
}

export type KycStatus = "pending" | "missing_docs" | "in_review" | "approved" | "rejected";

export interface KycDocument {
  key: string;
  labelAr: string;
  labelEn: string;
  uploaded: boolean;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface KycApplication {
  id: string;
  applicantId: string;
  nameAr: string;
  nameEn: string;
  meta: string;
  providerType: ProviderType;
  documents: KycDocument[];
  requestedPorts: string[];
  status: KycStatus;
  submittedAt: string;
}

export type TenderStatus = "open" | "awarded" | "expired" | "cancelled";

export interface ShipmentDetails {
  billOfLading: string;
  invoiceNo: string;
  grossWeightKg: number;
  pieceCount?: number;
  declaredValueOmr: number;
  taxExempt: boolean;
  exemptionCertUrl?: string;
  deliveryLocation?: string;
  truckType?: string;
}

export interface Tender {
  id: string;
  code: string;
  clientId: string;
  service: ServiceType;
  portCode: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  shipment: ShipmentDetails;
  documents: { nameAr: string; nameEn: string; meta: string; url?: string }[];
  clientNotes?: string;
  closesAt: string;
  status: TenderStatus;
  bidCount: number;
  createdAt: string;
}

export interface Bid {
  id: string;
  tenderId: string;
  providerId: string;
  providerNameAr: string;
  providerNameEn: string;
  providerTagAr?: string;
  providerTagEn?: string;
  rating: number;
  reviewCount: number;
  priceOmr: number;
  etaHours: number;
  jobsCompleted: number;
  onTimePct: number;
  status: "submitted" | "accepted" | "rejected" | "withdrawn";
  createdAt: string;
}

export type OrderStage = "assigned" | "declaration" | "inspection" | "released" | "in_transit" | "delivered";

export interface Order {
  id: string;
  code: string;
  tenderId: string;
  clientId: string;
  providerId: string;
  service: ServiceType;
  portCode: string;
  stage: OrderStage;
  stageIndex: number;
  stageCount: number;
  escrowOmr: number;
  deliveryOtp: string;
  deliveredAt?: string;
  rating?: number;
  ratingTraits?: string[];
  createdAt: string;
}

export type EscrowStatus = "held" | "released" | "refunded" | "split";

export interface EscrowLedgerEntry {
  id: string;
  orderId: string;
  amountOmr: number;
  commissionPct: number;
  commissionOmr: number;
  netOmr: number;
  status: EscrowStatus;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  providerId: string;
  orderId?: string;
  withdrawalId?: string;
  labelAr: string;
  labelEn: string;
  meta: string;
  amountOmr: number;
  pending: boolean;
  status: "IN ESCROW" | "RELEASED" | "PAID OUT";
  createdAt: string;
}

export interface WithdrawalRequest {
  id: string;
  providerId: string;
  providerNameAr: string;
  providerNameEn: string;
  amountOmr: number;
  bank: { name: string; accountHolder: string; iban: string; currency: string };
  status: "requested" | "paid" | "held";
  createdAt: string;
}

export interface Dispute {
  id: string;
  code: string;
  orderId: string;
  subjectAr: string;
  subjectEn: string;
  meta: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  frozenOmr: number;
  clientClaimAr: string;
  clientClaimEn: string;
  providerResponseAr: string;
  providerResponseEn: string;
  status: "open" | "released_provider" | "refunded_client" | "split";
  openedAt: string;
}

export interface AdminOverviewStats {
  activeOperations: number;
  heldInEscrowOmr: number;
  commissionMonthToDateOmr: number;
  pendingKyc: number;
  volumeByDay: { date: string; clearance: number; freight: number }[];
  splitByPort: { portCode: string; pct: number }[];
  flags: { code: string; ar: string; en: string }[];
}

// ── API request/response envelopes ──────────────────────────────

export interface RequestOtpBody {
  mobile: string;
}
export interface VerifyOtpBody {
  mobile: string;
  code: string;
}
export interface AuthSession {
  token: string;
  user: User;
}

export interface CreateTenderBody {
  service: ServiceType;
  portCode: string;
  shipment: ShipmentDetails;
  clientNotes?: string;
  durationMinutes: number;
}

export interface SubmitBidBody {
  priceOmr: number;
  etaHours: number;
}

export interface ApiError {
  error: string;
  message: string;
}
