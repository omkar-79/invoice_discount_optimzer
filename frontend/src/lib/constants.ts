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
  BORROW: "bg-orange-100 text-orange-800 border-orange-200",
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
    title: "Smart Financial Analysis",
    description: "Three-scenario analysis: Pay Early, Hold Cash, or Borrow to Pay Early",
    icon: "Calculator",
  },
  {
    title: "Custom Rate Input",
    description: "Input your own investment or borrowing rates for accurate recommendations",
    icon: "TrendingUp",
  },
  {
    title: "CSV & Manual Entry",
    description: "Upload CSV files or manually enter invoice data with rate configuration",
    icon: "Upload",
  },
  {
    title: "Real-Time Analytics",
    description: "Track potential savings, cash flow, and ROI with interactive charts",
    icon: "DollarSign",
  },
  {
    title: "User Authentication",
    description: "Secure JWT-based authentication with complete data isolation",
    icon: "Shield",
  },
  {
    title: "Audit Trail",
    description: "Complete history of all decisions with detailed reasoning",
    icon: "History",
  },
] as const

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Add Invoices",
    description: "Upload CSV files or manually enter invoice data with your rates",
  },
  {
    step: 2,
    title: "Smart Analysis",
    description: "Get three-scenario recommendations: Pay Early, Hold Cash, or Borrow",
  },
  {
    step: 3,
    title: "Take Action",
    description: "Review recommendations and track your savings with real-time analytics",
  },
] as const

export const EXAMPLE_CALCULATION = {
  terms: "2/10 net 30",
  amount: 10000,
  discount: 200,
  impliedApr: 36.98,
  benchmark: 5.1,
  savings: 200,
  scenarios: {
    payEarly: 200,
    holdCash: 50,
    borrowToPay: 150
  }
} as const
