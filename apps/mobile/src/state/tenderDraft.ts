import { create } from "zustand";
import type { ServiceType } from "@tanafus/types";

/** Accumulates the request-creation flow's four screens (service+port →
 * shipment → freight details → duration/publish) before the single
 * POST /tenders call the last screen makes. */
interface TenderDraftState {
  service: ServiceType;
  portCode: string;
  billOfLading: string;
  invoiceNo: string;
  grossWeightKg: string;
  declaredValueOmr: string;
  taxExempt: boolean;
  truckType: string;
  deliveryLocation: string;
  durationMinutes: number;
  set: (patch: Partial<Omit<TenderDraftState, "set" | "reset">>) => void;
  reset: () => void;
}

const initial = {
  service: "clearance" as ServiceType,
  portCode: "SOH-01",
  billOfLading: "MSCU 447 1902",
  invoiceNo: "INV-2026-0884",
  grossWeightKg: "18400",
  declaredValueOmr: "31200",
  taxExempt: true,
  truckType: "flatbed",
  deliveryLocation: "Rusayl Industrial Estate",
  durationMinutes: 120,
};

export const useTenderDraft = create<TenderDraftState>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => set(initial),
}));
