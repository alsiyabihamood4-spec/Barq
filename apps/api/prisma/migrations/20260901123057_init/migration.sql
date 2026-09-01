-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'BROKER', 'CARRIER', 'DRIVER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('BROKER', 'CARRIER', 'DRIVER');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'MISSING_DOCS', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('CLEARANCE', 'INSPECTION', 'GOV', 'FREIGHT');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('OPEN', 'AWARDED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('SUBMITTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "OrderStage" AS ENUM ('ASSIGNED', 'DECLARATION', 'INSPECTION', 'RELEASED', 'IN_TRANSIT', 'DELIVERED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('HELD', 'RELEASED', 'REFUNDED', 'SPLIT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "mobile" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "passwordHash" TEXT,
    "companyId" TEXT,
    "providerType" "ProviderType",
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "tradeNameAr" TEXT NOT NULL,
    "tradeNameEn" TEXT NOT NULL,
    "commercialReg" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
    "signatoryName" TEXT NOT NULL,
    "signatoryMobile" TEXT NOT NULL,
    "payoutIban" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_accounts" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "sub_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ports" (
    "code" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "brokers" INTEGER NOT NULL DEFAULT 0,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ports_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "kyc_applications" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "providerType" "ProviderType" NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'IN_REVIEW',
    "reviewerNote" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "kyc_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "uploaded" BOOLEAN NOT NULL DEFAULT false,
    "fileUrl" TEXT,
    "uploadedAt" TIMESTAMP(3),

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "service" "ServiceType" NOT NULL,
    "portCode" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "descAr" TEXT NOT NULL,
    "descEn" TEXT NOT NULL,
    "billOfLading" TEXT,
    "invoiceNo" TEXT,
    "grossWeightKg" DOUBLE PRECISION,
    "pieceCount" INTEGER,
    "declaredValueOmr" DOUBLE PRECISION,
    "taxExempt" BOOLEAN NOT NULL DEFAULT false,
    "deliveryLocation" TEXT,
    "truckType" TEXT,
    "clientNotes" TEXT,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "status" "TenderStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_documents" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "tender_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "priceOmr" DOUBLE PRECISION NOT NULL,
    "etaHours" INTEGER NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'SUBMITTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tenderId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "service" "ServiceType" NOT NULL,
    "portCode" TEXT NOT NULL,
    "stage" "OrderStage" NOT NULL DEFAULT 'ASSIGNED',
    "escrowOmr" DOUBLE PRECISION NOT NULL,
    "deliveryOtp" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "rating" INTEGER,
    "ratingTraits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_ledger" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amountOmr" DOUBLE PRECISION NOT NULL,
    "commissionPct" DOUBLE PRECISION NOT NULL,
    "commissionOmr" DOUBLE PRECISION NOT NULL,
    "netOmr" DOUBLE PRECISION NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'HELD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "orderId" TEXT,
    "withdrawalId" TEXT,
    "labelAr" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "amountOmr" DOUBLE PRECISION NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "amountOmr" DOUBLE PRECISION NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolder" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'OMR',
    "status" TEXT NOT NULL DEFAULT 'requested',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "subjectAr" TEXT NOT NULL,
    "subjectEn" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "frozenOmr" DOUBLE PRECISION NOT NULL,
    "clientClaimAr" TEXT NOT NULL,
    "clientClaimEn" TEXT NOT NULL,
    "providerResponseAr" TEXT NOT NULL,
    "providerResponseEn" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RequestedPorts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_mobile_key" ON "users"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "companies_commercialReg_key" ON "companies"("commercialReg");

-- CreateIndex
CREATE UNIQUE INDEX "tenders_code_key" ON "tenders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE UNIQUE INDEX "orders_tenderId_key" ON "orders"("tenderId");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_code_key" ON "disputes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_orderId_key" ON "disputes"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "_RequestedPorts_AB_unique" ON "_RequestedPorts"("A", "B");

-- CreateIndex
CREATE INDEX "_RequestedPorts_B_index" ON "_RequestedPorts"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_accounts" ADD CONSTRAINT "sub_accounts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_applications" ADD CONSTRAINT "kyc_applications_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "kyc_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenders" ADD CONSTRAINT "tenders_portCode_fkey" FOREIGN KEY ("portCode") REFERENCES "ports"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_documents" ADD CONSTRAINT "tender_documents_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenderId_fkey" FOREIGN KEY ("tenderId") REFERENCES "tenders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_portCode_fkey" FOREIGN KEY ("portCode") REFERENCES "ports"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_ledger" ADD CONSTRAINT "escrow_ledger_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestedPorts" ADD CONSTRAINT "_RequestedPorts_A_fkey" FOREIGN KEY ("A") REFERENCES "kyc_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RequestedPorts" ADD CONSTRAINT "_RequestedPorts_B_fkey" FOREIGN KEY ("B") REFERENCES "ports"("code") ON DELETE CASCADE ON UPDATE CASCADE;
