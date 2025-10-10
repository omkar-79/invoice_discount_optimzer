import { z } from "zod"

// Auth types
export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const SignUpSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export const MagicLinkSchema = z.object({
  email: z.string().email(),
})

export type SignInData = z.infer<typeof SignInSchema>
export type SignUpData = z.infer<typeof SignUpSchema>
export type MagicLinkData = z.infer<typeof MagicLinkSchema>

// Settings types
export interface UserSettings {
  id: string
  userId: string
  safetyBuffer: number
  defaultCurrency: string
  defaultInvestmentRate?: number
  defaultBorrowingRate?: number
  defaultRateType?: 'INVESTMENT' | 'BORROWING'
  emailSummary: boolean
  urgentDeadlineAlerts: boolean
  rateChangeAlerts: boolean
  twoFactorEnabled: boolean
  sessionTimeout: number
  organizationName?: string
  organizationDomain?: string
  organizationSize?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileData {
  name: string
  email: string
  company?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}

// Rate types
export interface Rate {
  asOf: string
  benchmark: {
    name: string
    annualRatePct: number
    deltaBpsDay: number
  }
}

// Invoice types
export interface Invoice {
  id: string
  vendor: string
  invoiceNumber: string
  amount: number
  currency: string
  invoiceDate: string
  dueDate: string
  terms: string
  discountDeadline: string | null
  impliedAprPct: number
  recommendation: "TAKE" | "HOLD" | "BORROW"
  reason: string
  status: "PENDING" | "APPROVED" | "DISMISSED"
  notes?: string
  userRate: number | null
  rateType: 'INVESTMENT' | 'BORROWING' | null
  borrowingCost: number | null
  investmentReturn: number | null
}

export interface InvoiceResponse {
  items: Invoice[]
  nextCursor: string | null
}

// Decision types
export interface Decision {
  invoiceIds: string[]
  action: "APPROVE_TAKE" | "APPROVE_HOLD"
  note?: string
}

export interface DecisionResponse {
  saved: number
  estimatedSavings: number
}

// Audit types
export interface AuditItem {
  id: string
  timestamp: string
  user: string
  invoiceIds: string[]
  invoices: Array<{
    id: string
    invoiceNumber: string
    vendor: string
  }>
  action: "APPROVE_TAKE" | "APPROVE_HOLD"
  benchmarkPct: number
  impliedAprPct: number
  estimatedSavings: number
  note?: string
}

export interface AuditResponse {
  items: AuditItem[]
}

// Chat types
export interface ChatExplainResponse {
  insight: string
  steps: string[]
}

export interface ChatPickTopResponse {
  selection: Array<{
    invoiceId: string
    impliedAprPct: number
    takeAmount: number
    savings: number
  }>
  totalTake: number
  totalSavings: number
}

// CSV Upload types
export interface CSVColumn {
  header: string
  required: boolean
  mappedTo?: keyof Invoice
}

export interface CSVUploadData {
  file: File
  columns: CSVColumn[]
  preview: any[]
}

// UI State types
export interface DashboardFilters {
  vendor?: string
  status?: string
  recommendation?: string
  minApr?: number
  limit?: number
  cursor?: string
}

export interface AuditFilters {
  from?: string
  to?: string
  user?: string
  action?: string
}

// Theme types
export type Theme = "light" | "dark" | "system"
