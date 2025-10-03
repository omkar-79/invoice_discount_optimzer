export const APP_NAME = "Invoice Discount Optimizer"
export const APP_DESCRIPTION = "Pay Early or Hold Cash? Make the Right Call on Every Invoice."

export const SAMPLE_CSV = `vendor,invoice_number,amount,invoice_date,due_date,terms,notes
Acme Supplies,A-10023,10000,2025-09-05,2025-10-05,"2/10 net 30",Office stock
Zen Print,ZP-4478,3500,2025-09-10,2025-10-25,"1/10 net 45",""
Metro Freight,MF-2201,8200,2025-09-12,2025-10-12,"n/30","no discount"`

export const COLORS = {
  primary: "#2563eb",
  primaryHover: "#1d4ed8",
  accent: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
} as const

export const RECOMMENDATION_COLORS = {
  TAKE: "bg-emerald-100 text-emerald-800 border-emerald-200",
  HOLD: "bg-gray-100 text-gray-800 border-gray-200",
} as const

export const DEADLINE_STATUS = {
  urgent: "bg-red-100 text-red-800 border-red-200",
  warning: "bg-amber-100 text-amber-800 border-amber-200",
  normal: "bg-gray-100 text-gray-800 border-gray-200",
  "no-discount": "bg-gray-100 text-gray-500 border-gray-200",
  expired: "bg-red-100 text-red-600 border-red-300",
} as const

export const NAVIGATION_ITEMS = [
  { name: "Dashboard", href: "/app/dashboard", icon: "LayoutDashboard" },
  { name: "Invoices", href: "/app/invoices", icon: "FileText" },
  { name: "Upload", href: "/app/upload", icon: "Upload" },
  { name: "Audit", href: "/app/audit", icon: "History" },
  { name: "Settings", href: "/app/settings", icon: "Settings" },
] as const

export const FEATURES = [
  {
    title: "CSV Import",
    description: "Upload your invoices in seconds with our smart column mapping",
    icon: "Upload",
  },
  {
    title: "Ranked Actions",
    description: "See which discounts to take based on today's interest rates",
    icon: "TrendingUp",
  },
  {
    title: "Savings Tracker",
    description: "Track your monthly savings and ROI from early payments",
    icon: "DollarSign",
  },
  {
    title: "Audit Trail",
    description: "Complete history of all decisions with full transparency",
    icon: "History",
  },
  {
    title: "Chatbot Q&A",
    description: "Get instant explanations for any invoice or recommendation",
    icon: "MessageCircle",
  },
] as const

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Upload",
    description: "Drag and drop your CSV file with invoice data",
  },
  {
    step: 2,
    title: "Compare",
    description: "We analyze each discount against today's interest rates",
  },
  {
    step: 3,
    title: "Approve",
    description: "Review recommendations and approve the best opportunities",
  },
] as const

export const EXAMPLE_CALCULATION = {
  terms: "2/10 net 30",
  amount: 10000,
  discount: 200,
  impliedApr: 36.98,
  benchmark: 5.1,
  savings: 200,
} as const
