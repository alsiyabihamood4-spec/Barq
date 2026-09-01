// Maps Prisma's UPPER_SNAKE enums onto the lowercase literal unions the
// frontends share via @tanafus/types.
import type { User as PrismaUser, ProviderType as PrismaProviderType, Role as PrismaRole } from "@prisma/client";
import type { User, Role, ProviderType } from "@tanafus/types";

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
