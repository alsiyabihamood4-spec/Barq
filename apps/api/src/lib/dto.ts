// Maps Prisma's UPPER_SNAKE enums onto the lowercase literal unions the
// frontends share via @BARQ/types. Every route the mobile app calls
// through a `@BARQ/types` import (orders, bids-accept) MUST send its
// response through one of these — a raw Prisma object's enum casing
// ("DELIVERED") will silently fail every `=== "delivered"` comparison on
// the client. Routes apps/admin reads directly (routes/admin.ts, kyc.ts,
// disputes.ts) intentionally return raw Prisma shapes instead — the admin
// pages compare against the real uppercase casing on purpose, so don't
// "fix" those into DTOs without updating every admin page that reads them.
import type {
  User as PrismaUser,
  ProviderType as PrismaProviderType,
  Role as PrismaRole,
  Order as PrismaOrder,
  ServiceType as PrismaServiceType,
  OrderStage as PrismaOrderStage,
} from "@prisma/client";
import type { User, Role, ProviderType, Order, ServiceType, OrderStage } from "@BARQ/types";

const roleMap: Record<PrismaRole, Role> = {
  CLIENT: "client",
  BROKER: "broker",
  CARRIER: "carrier",
  DRIVER: "driver",
  ADMIN: "admin",
};
const providerTypeMap: Record<PrismaProviderType, ProviderType> = {
  BROKER: "broker",
  CARRIER: "carrier",
  DRIVER: "driver",
};
const kycStatusMap: Record<string, User["kycStatus"]> = {
  PENDING: "pending",
  MISSING_DOCS: "missing_docs",
  IN_REVIEW: "in_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export function toUserDto(u: PrismaUser): User {
  return {
    id: u.id,
    role: roleMap[u.role],
    mobile: u.mobile,
    nameAr: u.nameAr,
    nameEn: u.nameEn,
    companyId: u.companyId ?? undefined,
    providerType: u.providerType ? providerTypeMap[u.providerType] : undefined,
    kycStatus: kycStatusMap[u.kycStatus] ?? "pending",
    ratingAvg: u.ratingAvg,
    ratingCount: u.ratingCount,
    createdAt: u.createdAt.toISOString(),
  };
}

export const toRolePrisma = (r: Role): PrismaRole => r.toUpperCase() as PrismaRole;
export const toProviderTypePrisma = (p: ProviderType): PrismaProviderType => p.toUpperCase() as PrismaProviderType;

const serviceMap: Record<PrismaServiceType, ServiceType> = {
  CLEARANCE: "clearance",
  INSPECTION: "inspection",
  GOV: "gov",
  FREIGHT: "freight",
};
const stageMap: Record<PrismaOrderStage, OrderStage> = {
  ASSIGNED: "assigned",
  DECLARATION: "declaration",
  INSPECTION: "inspection",
  RELEASED: "released",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
};

/** The real-world stage sequence per service — clearance/inspection/gov
 * orders go through Bayan declaration and physical inspection before
 * release; freight orders skip customs and go straight to the road. Single
 * source of truth for both `POST /orders/:id/advance` and the stageIndex/
 * stageCount this module reports, so they can't drift apart. */
export const STAGE_SEQUENCE: Record<PrismaServiceType, readonly PrismaOrderStage[]> = {
  CLEARANCE: ["ASSIGNED", "DECLARATION", "INSPECTION", "RELEASED", "DELIVERED"],
  INSPECTION: ["ASSIGNED", "DECLARATION", "INSPECTION", "RELEASED", "DELIVERED"],
  GOV: ["ASSIGNED", "DECLARATION", "INSPECTION", "RELEASED", "DELIVERED"],
  FREIGHT: ["ASSIGNED", "IN_TRANSIT", "DELIVERED"],
};

export function toOrderDto(o: PrismaOrder): Order {
  const sequence = STAGE_SEQUENCE[o.service];
  return {
    id: o.id,
    code: o.code,
    tenderId: o.tenderId,
    clientId: o.clientId,
    providerId: o.providerId,
    service: serviceMap[o.service],
    portCode: o.portCode,
    stage: stageMap[o.stage],
    stageIndex: Math.max(0, sequence.indexOf(o.stage)),
    stageCount: sequence.length,
    escrowOmr: o.escrowOmr,
    deliveryOtp: o.deliveryOtp,
    deliveredAt: o.deliveredAt?.toISOString(),
    rating: o.rating ?? undefined,
    ratingTraits: o.ratingTraits,
    createdAt: o.createdAt.toISOString(),
  };
}
