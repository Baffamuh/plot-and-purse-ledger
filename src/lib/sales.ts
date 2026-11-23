export const PROPERTY_TYPES = [
  "Residential Land",
  "Commercial Land",
  "House (Completed)",
  "House (Semi-completed)",
  "House (Incomplete)",
  "Shop",
  "Farm",
] as const;

export const PAYMENT_STATUSES = ["Fully Paid", "Installment / Easy Buy", "Deposit"] as const;
export const PAYMENT_METHODS = ["Bank Transfer", "Bank Draft", "Cash", "POS"] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export type SaleRecord = {
  id: string;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsApp: string;
  buyerAddress: string;
  buyerState: string;
  nextOfKin: string;
  nextOfKinPhone: string;
  agentName: string;
  agentPhone: string;
  agentCode: string;
  agentCommission: string;
  propertyRef: string;
  propertyTitle: string;
  propertyType: PropertyType;
  location: string;
  plotNumber: string;
  dimensions: string;
  propertyNotes: string;
  saleDate: string;
  agreedPrice: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  receiptNumber: string;
  /** Date the buyer promised to settle any remaining balance. */
  settlementDate?: string;
  /** Instalment/batch plan notes, e.g. "3 monthly batches of ₦1,000,000". */
  batchPlan?: string;
};

export type SaleFilters = {
  query: string;
  propertyType: string;
  paymentStatus: string;
  agent: string;
  location: string;
  startDate: string;
  endDate: string;
};

export const SAMPLE_SALES: SaleRecord[] = [
  {
    id: "azare-sale-1",
    buyerName: "Amina Yusuf",
    buyerPhone: "+234 803 412 8071",
    buyerWhatsApp: "+234 803 412 8071",
    buyerAddress: "Unguwar Jauro, Azare",
    buyerState: "Bauchi / Katagum",
    nextOfKin: "Sani Yusuf",
    nextOfKinPhone: "+234 806 229 1400",
    agentName: "Musa Adamu",
    agentPhone: "+234 802 110 4620",
    agentCode: "AGT-001",
    agentCommission: "5%",
    propertyRef: "RHM-S-RL-001",
    propertyTitle: "Corner residential plot",
    propertyType: "Residential Land",
    location: "Azare Central",
    plotNumber: "Plot 14, Block B",
    dimensions: "50 ft × 100 ft · 464.5 m²",
    propertyNotes: "Road-facing corner plot; beacons confirmed on site.",
    saleDate: "2026-11-20",
    agreedPrice: 7800000,
    amountPaid: 7800000,
    paymentStatus: "Fully Paid",
    paymentMethod: "Bank Transfer",
    paymentReference: "GTB / TRF-09184",
    receiptNumber: "SLS-2026-0001",
  },
  {
    id: "azare-sale-2",
    buyerName: "Bello Ibrahim",
    buyerPhone: "+234 809 641 2290",
    buyerWhatsApp: "+234 809 641 2290",
    buyerAddress: "Fadama, Azare",
    buyerState: "Bauchi / Katagum",
    nextOfKin: "Hauwa Bello",
    nextOfKinPhone: "+234 703 125 6400",
    agentName: "Fatima Bala",
    agentPhone: "+234 813 702 1154",
    agentCode: "AGT-004",
    agentCommission: "₦180,000",
    propertyRef: "G10-S-RL-002",
    propertyTitle: "Residential plot — Phase 2",
    propertyType: "Residential Land",
    location: "Fatara",
    plotNumber: "Plot 08, Block D",
    dimensions: "50 ft × 100 ft · 464.5 m²",
    propertyNotes: "Installment plan agreed; balance due in 90 days.",
    saleDate: "2026-11-19",
    agreedPrice: 6200000,
    amountPaid: 3000000,
    paymentStatus: "Installment / Easy Buy",
    paymentMethod: "Bank Draft",
    paymentReference: "BD-BAU-450823",
    receiptNumber: "SLS-2026-0002",
  },
  {
    id: "azare-sale-3",
    buyerName: "Maryam Mohammed",
    buyerPhone: "+234 706 441 9032",
    buyerWhatsApp: "+234 706 441 9032",
    buyerAddress: "Sabon Gari, Azare",
    buyerState: "Bauchi / Katagum",
    nextOfKin: "Usman Mohammed",
    nextOfKinPhone: "+234 803 351 2067",
    agentName: "Musa Adamu",
    agentPhone: "+234 802 110 4620",
    agentCode: "AGT-001",
    agentCommission: "5%",
    propertyRef: "CHR-C-CL-003",
    propertyTitle: "Commercial frontage parcel",
    propertyType: "Commercial Land",
    location: "Chara-Chara",
    plotNumber: "Plot 03, Section A",
    dimensions: "60 ft × 120 ft · 668.9 m²",
    propertyNotes: "Main-road frontage with access to existing utilities.",
    saleDate: "2026-11-14",
    agreedPrice: 11500000,
    amountPaid: 5000000,
    paymentStatus: "Deposit",
    paymentMethod: "POS",
    paymentReference: "POS-833014",
    receiptNumber: "SLS-2026-0003",
  },
  {
    id: "azare-sale-4",
    buyerName: "Abdulrahman Ali",
    buyerPhone: "+234 805 228 4716",
    buyerWhatsApp: "+234 805 228 4716",
    buyerAddress: "Azare Road, Bauchi",
    buyerState: "Bauchi / Katagum",
    nextOfKin: "Zainab Ali",
    nextOfKinPhone: "+234 812 997 5020",
    agentName: "Hassan Ibrahim",
    agentPhone: "+234 807 600 1192",
    agentCode: "AGT-006",
    agentCommission: "₦250,000",
    propertyRef: "AZR-S-HC-004",
    propertyTitle: "Three-bedroom family home",
    propertyType: "House (Completed)",
    location: "Azare Central",
    plotNumber: "House 22, Street 4",
    dimensions: "3 bedrooms · 1,180 m² plot",
    propertyNotes: "Completed home; keys handed over after final inspection.",
    saleDate: "2026-11-08",
    agreedPrice: 28500000,
    amountPaid: 28500000,
    paymentStatus: "Fully Paid",
    paymentMethod: "Cash",
    paymentReference: "CASH-REC-0246",
    receiptNumber: "SLS-2026-0004",
  },
  {
    id: "azare-sale-5",
    buyerName: "Bilkisu Umar",
    buyerPhone: "+234 814 225 6618",
    buyerWhatsApp: "+234 814 225 6618",
    buyerAddress: "Madatai, Azare",
    buyerState: "Bauchi / Katagum",
    nextOfKin: "Adamu Umar",
    nextOfKinPhone: "+234 809 280 7132",
    agentName: "Fatima Bala",
    agentPhone: "+234 813 702 1154",
    agentCode: "AGT-004",
    agentCommission: "5%",
    propertyRef: "FTR-S-RL-005",
    propertyTitle: "Residential plot — Fatara extension",
    propertyType: "Residential Land",
    location: "Fatara",
    plotNumber: "Plot 31, Block A",
    dimensions: "50 ft × 100 ft · 464.5 m²",
    propertyNotes: "Deposit received; survey plan to be issued after balance.",
    saleDate: "2026-10-29",
    agreedPrice: 5400000,
    amountPaid: 1500000,
    paymentStatus: "Deposit",
    paymentMethod: "Bank Transfer",
    paymentReference: "FBN-TRF-120994",
    receiptNumber: "SLS-2026-0005",
  },
];

export function calculateBalance(agreedPrice: number, amountPaid: number): number {
  return Math.max(0, agreedPrice - amountPaid);
}

export function filterSales(sales: SaleRecord[], filters: SaleFilters): SaleRecord[] {
  const search = filters.query.trim().toLowerCase();

  return sales.filter((sale) => {
    const searchable = [
      sale.buyerName,
      sale.buyerPhone,
      sale.agentName,
      sale.agentPhone,
      sale.propertyRef,
      sale.plotNumber,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!search || searchable.includes(search)) &&
      (!filters.propertyType || sale.propertyType === filters.propertyType) &&
      (!filters.paymentStatus || sale.paymentStatus === filters.paymentStatus) &&
      (!filters.agent || sale.agentName === filters.agent) &&
      (!filters.location || sale.location === filters.location) &&
      (!filters.startDate || sale.saleDate >= filters.startDate) &&
      (!filters.endDate || sale.saleDate <= filters.endDate)
    );
  });
}

export function generatePropertyReference(sales: SaleRecord[], propertyType: PropertyType): string {
  const typeCode: Record<PropertyType, string> = {
    "Residential Land": "RL",
    "Commercial Land": "CL",
    "House (Completed)": "HC",
    "House (Semi-completed)": "HS",
    "House (Incomplete)": "HI",
    Shop: "SH",
    Farm: "FM",
  };
  const highest = sales.reduce((current, sale) => {
    const match = sale.propertyRef.match(/(\d+)$/);
    const suffix = match?.[1] ? Number(match[1]) : 0;
    return Math.max(current, suffix);
  }, 0);

  return `AZR-S-${typeCode[propertyType]}-${String(highest + 1).padStart(3, "0")}`;
}

export function generateReceiptNumber(sales: SaleRecord[], year: number): string {
  const prefix = `SLS-${year}-`;
  const highest = sales.reduce((current, sale) => {
    if (!sale.receiptNumber.startsWith(prefix)) return current;
    const suffix = Number(sale.receiptNumber.slice(prefix.length));
    return Number.isFinite(suffix) ? Math.max(current, suffix) : current;
  }, 0);

  return `${prefix}${String(highest + 1).padStart(4, "0")}`;
}

export function isSaleRecord(value: unknown): value is SaleRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const stringFields = [
    "id",
    "buyerName",
    "buyerPhone",
    "agentName",
    "agentPhone",
    "propertyRef",
    "propertyType",
    "location",
    "saleDate",
    "receiptNumber",
  ];

  return (
    stringFields.every((field) => typeof record[field] === "string") &&
    typeof record["agreedPrice"] === "number" &&
    typeof record["amountPaid"] === "number"
  );
}
export type PaymentPlan = "Full payment" | "Batch payment";

/** Any sale with money still owed is treated as a batch (instalment) payment. */
export function getPaymentPlan(sale: Pick<SaleRecord, "agreedPrice" | "amountPaid">): PaymentPlan {
  return calculateBalance(sale.agreedPrice, sale.amountPaid) > 0 ? "Batch payment" : "Full payment";
}

export const BACKUP_FORMAT = "rahama-sales-backup";

export type SalesBackup = {
  format: typeof BACKUP_FORMAT;
  version: 1;
  company: string;
  createdAt: string;
  recordCount: number;
  checksum: string;
  records: SaleRecord[];
};

/** Simple integrity fingerprint (FNV-1a) so tampered or damaged backups are rejected. */
export function checksumRecords(records: SaleRecord[]): string {
  const text = JSON.stringify(records);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export function createBackup(records: SaleRecord[], createdAt: string): SalesBackup {
  return {
    format: BACKUP_FORMAT,
    version: 1,
    company: "Rahama Land & Property Development Ltd.",
    createdAt,
    recordCount: records.length,
    checksum: checksumRecords(records),
    records,
  };
}

export function parseBackup(text: string): { ok: true; records: SaleRecord[]; createdAt: string } | { ok: false; error: string } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "This file is not a readable backup." };
  }
  const backup = data as Partial<SalesBackup> | null;
  if (!backup || backup.format !== BACKUP_FORMAT || !Array.isArray(backup.records)) {
    return { ok: false, error: "This is not a Rahama sales backup file." };
  }
  if (!backup.records.every(isSaleRecord)) return { ok: false, error: "Some records in this backup are damaged." };
  if (backup.recordCount !== backup.records.length || backup.checksum !== checksumRecords(backup.records)) {
    return { ok: false, error: "This backup failed its safety check and may have been changed." };
  }
  return { ok: true, records: backup.records, createdAt: String(backup.createdAt ?? "") };
}
