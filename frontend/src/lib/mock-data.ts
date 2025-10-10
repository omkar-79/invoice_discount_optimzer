import { Invoice, Rate, AuditItem } from "./types"

export const mockRate: Rate = {
  asOf: "2025-01-02",
  benchmark: {
    name: "1-3M short-term",
    annualRatePct: 5.10,
    deltaBpsDay: 4,
  },
}

export const mockInvoices: Invoice[] = [
  {
    id: "inv_123",
    vendor: "Acme Supplies",
    invoiceNumber: "A-10023",
    amount: 10000,
    currency: "USD",
    invoiceDate: "2025-09-05",
    dueDate: "2025-10-05",
    terms: "2/10 net 30",
    discountDeadline: "2025-09-15",
    impliedAprPct: 36.98,
    recommendation: "TAKE",
    reason: "Implied APR exceeds benchmark by 3198 bps",
    status: "PENDING",
    notes: "Office stock",
    userRate: 5.0,
    rateType: "INVESTMENT",
    borrowingCost: null,
    investmentReturn: null,
  },
  {
    id: "inv_456",
    vendor: "Zen Print",
    invoiceNumber: "ZP-4478",
    amount: 3500,
    currency: "USD",
    invoiceDate: "2025-09-10",
    dueDate: "2025-10-25",
    terms: "1/10 net 45",
    discountDeadline: "2025-09-20",
    impliedAprPct: 22.10,
    recommendation: "TAKE",
    reason: "Implied APR exceeds benchmark by 1700 bps",
    status: "PENDING",
    userRate: 5.0,
    rateType: "INVESTMENT",
    borrowingCost: null,
    investmentReturn: null,
  },
  {
    id: "inv_789",
    vendor: "Metro Freight",
    invoiceNumber: "MF-2201",
    amount: 8200,
    currency: "USD",
    invoiceDate: "2025-09-12",
    dueDate: "2025-10-12",
    terms: "n/30",
    discountDeadline: "2025-10-12",
    impliedAprPct: 0,
    recommendation: "HOLD",
    reason: "No discount available",
    status: "PENDING",
    userRate: 5.0,
    rateType: "INVESTMENT",
    borrowingCost: null,
    investmentReturn: 100.0,
  },
  {
    id: "inv_101",
    vendor: "Tech Solutions",
    invoiceNumber: "TS-5001",
    amount: 15000,
    currency: "USD",
    invoiceDate: "2025-09-15",
    dueDate: "2025-10-15",
    terms: "3/15 net 45",
    discountDeadline: "2025-09-30",
    impliedAprPct: 24.49,
    recommendation: "TAKE",
    reason: "Implied APR exceeds benchmark by 1939 bps",
    status: "APPROVED",
    userRate: 5.0,
    rateType: "INVESTMENT",
    borrowingCost: null,
    investmentReturn: null,
  },
  {
    id: "inv_202",
    vendor: "Office Depot",
    invoiceNumber: "OD-7890",
    amount: 2500,
    currency: "USD",
    invoiceDate: "2025-09-18",
    dueDate: "2025-10-18",
    terms: "1/15 net 30",
    discountDeadline: "2025-10-03",
    impliedAprPct: 12.17,
    recommendation: "HOLD",
    reason: "Implied APR only 707 bps above benchmark",
    status: "DISMISSED",
    userRate: 5.0,
    rateType: "INVESTMENT",
    borrowingCost: null,
    investmentReturn: 30.0,
  },
]

export const mockAuditItems: AuditItem[] = [
  {
    id: "dec_001",
    timestamp: "2025-01-02T14:11:00Z",
    user: "demo@example.com",
    invoiceIds: ["inv_101"],
    invoices: [
      {
        id: "inv_101",
        invoiceNumber: "INV-2025-001",
        vendor: "Acme Corp"
      }
    ],
    action: "APPROVE_TAKE",
    benchmarkPct: 5.1,
    impliedAprPct: 24.49,
    estimatedSavings: 450.00,
    note: "3/15 net 45 discount captured",
  },
  {
    id: "dec_002",
    timestamp: "2025-01-01T16:30:00Z",
    user: "demo@example.com",
    invoiceIds: ["inv_202"],
    invoices: [
      {
        id: "inv_202",
        invoiceNumber: "INV-2025-002",
        vendor: "Beta LLC"
      }
    ],
    action: "APPROVE_HOLD",
    benchmarkPct: 5.1,
    impliedAprPct: 12.17,
    estimatedSavings: 0,
    note: "Low ROI compared to benchmark",
  },
]

export const mockSavingsData = [
  { month: "Sep", savings: 1200 },
  { month: "Oct", savings: 1800 },
  { month: "Nov", savings: 2100 },
  { month: "Dec", savings: 1950 },
  { month: "Jan", savings: 2250 },
]

export const mockCashPlanData = [
  { week: "Week 1", take: 10000, hold: 5000 },
  { week: "Week 2", take: 8000, hold: 3000 },
  { week: "Week 3", take: 12000, hold: 2000 },
  { week: "Week 4", take: 6000, hold: 4000 },
]
