export const copy = {
  // Landing page
  hero: {
    title: "Smart Invoice Decisions: Pay Early, Hold Cash, or Borrow?",
    subtitle: "Get three-scenario financial analysis for every invoice. Input your rates and let our AI show you the optimal decision with real-time calculations.",
    cta: {
      tryDemo: "Try Demo",
      signUp: "Sign Up",
    },
  },
  
  // Navigation
  nav: {
    features: "Features",
    pricing: "Pricing",
    faq: "FAQ",
    signIn: "Sign In",
    signUp: "Sign Up",
  },
  
  // Dashboard
  dashboard: {
    title: "Dashboard",
    benchmark: {
      title: "Today's Benchmark",
      rate: "1-3M Rate",
      delta: "vs yesterday",
    },
    actionQueue: {
      title: "Action Queue",
      vendor: "Vendor",
      amount: "Amount",
      terms: "Terms",
      deadline: "Deadline",
      apr: "Implied APR",
      recommendation: "Recommendation",
      select: "Select",
    },
    savings: {
      title: "Savings Tracker",
      thisMonth: "Saved this month",
    },
  },
  
  // Upload
  upload: {
    title: "Upload Invoices",
    step1: {
      title: "Upload CSV",
      description: "Drag and drop your CSV file or click to browse",
      acceptedFormats: "Accepted formats: CSV",
      sampleCsv: "Download sample CSV",
    },
    step2: {
      title: "Map Columns",
      description: "Map your CSV columns to our required fields",
      required: "Required",
      optional: "Optional",
    },
    step3: {
      title: "Preview & Validate",
      description: "Review your data before importing",
    },
    step4: {
      title: "Import Complete",
      description: "Your invoices have been imported successfully",
    },
  },
  
  // Invoices
  invoices: {
    title: "Invoices",
    filters: {
      vendor: "Vendor",
      status: "Status",
      recommendation: "Recommendation",
      minApr: "Min APR",
    },
    drawer: {
      title: "Invoice Details",
      calculation: "Calculation Details",
      rationale: "Why this recommendation?",
      approve: "Approve",
      dismiss: "Dismiss",
    },
  },
  
  // Audit
  audit: {
    title: "Audit & History",
    timestamp: "Timestamp",
    user: "User",
    invoices: "Invoice(s)",
    action: "Action",
    benchmark: "Benchmark",
    savings: "Savings",
    notes: "Notes",
  },
  
  // Settings
  settings: {
    title: "Settings",
    profile: "Profile",
    organization: "Organization",
    preferences: "Preferences",
    safetyBuffer: "Safety Buffer (bps)",
    emailSummary: "Daily Email Summary",
    currency: "Currency Format",
  },
  
  // Auth
  auth: {
    signIn: {
      title: "Sign In",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot password?",
    },
    signUp: {
      title: "Sign Up",
      name: "Full Name",
      company: "Company",
      email: "Email",
      password: "Password",
    },
    forgotPassword: {
      title: "Reset Password",
      email: "Email",
      sendReset: "Send Reset Link",
    },
  },
  
  // Chat
  chat: {
    title: "AI Assistant",
    placeholder: "Ask about your invoices...",
    prompts: {
      topDiscounts: "Which discounts should I take this week with limited cash?",
      explainInvoice: "Explain why invoice #123 is Hold.",
    },
    guardrails: "Explanations are based on math; no financial advice.",
  },
  
  // Common
  common: {
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    submit: "Submit",
    approve: "Approve",
    dismiss: "Dismiss",
    bulkApprove: "Bulk Approve",
    selectAll: "Select All",
    clearSelection: "Clear Selection",
  },
  
  // Terms explanation
  terms: {
    "2/10 net 30": "2% discount if paid within 10 days; full amount due by day 30",
    "1/10 net 45": "1% discount if paid within 10 days; full amount due by day 45",
    "n/30": "No discount; full amount due by day 30",
  },
  
  // Empty states
  empty: {
    dashboard: "No invoices yet. Upload a CSV to get recommendations.",
    upload: "No file selected. Drag and drop a CSV file to get started.",
    invoices: "No invoices found. Upload some invoices to get started.",
    audit: "No audit history yet. Approve some invoices to see your history.",
  },
} as const
