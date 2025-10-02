import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  Rate, 
  Invoice, 
  InvoiceResponse, 
  Decision, 
  DecisionResponse, 
  AuditItem, 
  AuditResponse,
  ChatExplainResponse,
  ChatPickTopResponse,
  DashboardFilters,
  AuditFilters
} from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Mock API functions (replace with real API calls)
const mockApi = {
  // Rates
  getTodayRate: async (): Promise<Rate> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      asOf: "2025-01-02",
      benchmark: {
        name: "1-3M short-term",
        annualRatePct: 5.10,
        deltaBpsDay: 4,
      },
    }
  },

  // Invoices
  getInvoices: async (filters?: DashboardFilters): Promise<InvoiceResponse> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const { mockInvoices } = await import("@/lib/mock-data")
    
    let filteredInvoices = mockInvoices
    
    if (filters?.vendor) {
      filteredInvoices = filteredInvoices.filter(inv => 
        inv.vendor.toLowerCase().includes(filters.vendor!.toLowerCase())
      )
    }
    
    if (filters?.status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === filters.status)
    }
    
    if (filters?.recommendation) {
      filteredInvoices = filteredInvoices.filter(inv => inv.recommendation === filters.recommendation)
    }
    
    if (filters?.minApr) {
      filteredInvoices = filteredInvoices.filter(inv => inv.impliedAprPct >= filters.minApr!)
    }
    
    return {
      items: filteredInvoices,
      nextCursor: null,
    }
  },

  importInvoices: async (formData: FormData): Promise<{ imported: number; skipped: number }> => {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { imported: 142, skipped: 3 }
  },

  // Decisions
  createDecision: async (decision: Decision): Promise<DecisionResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      saved: decision.invoiceIds.length,
      estimatedSavings: decision.invoiceIds.length * 200, // Mock calculation
    }
  },

  // Audit
  getAuditItems: async (filters?: AuditFilters): Promise<AuditResponse> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    const { mockAuditItems } = await import("@/lib/mock-data")
    
    let filteredItems = mockAuditItems
    
    if (filters?.from) {
      const fromDate = new Date(filters.from)
      filteredItems = filteredItems.filter(item => new Date(item.timestamp) >= fromDate)
    }
    
    if (filters?.to) {
      const toDate = new Date(filters.to)
      filteredItems = filteredItems.filter(item => new Date(item.timestamp) <= toDate)
    }
    
    if (filters?.action) {
      filteredItems = filteredItems.filter(item => item.action === filters.action)
    }
    
    return { items: filteredItems }
  },

  // Chat
  explainInvoice: async (invoiceId: string): Promise<ChatExplainResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      insight: "2% in 20 days ≈ 36.98%/yr > 5.1% benchmark",
      steps: [
        "Pay by 2025-09-15 to save $200",
        "Cash impact: $9,800 this week"
      ]
    }
  },

  pickTopDiscounts: async (budget: number): Promise<ChatPickTopResponse> => {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return {
      selection: [
        { invoiceId: "inv_123", impliedAprPct: 36.98, takeAmount: 9800, savings: 200 },
        { invoiceId: "inv_456", impliedAprPct: 22.10, takeAmount: 4900, savings: 100 }
      ],
      totalTake: 14700,
      totalSavings: 300
    }
  },
}

// React Query hooks
export const useTodayRate = () => {
  return useQuery({
    queryKey: ["rates", "today"],
    queryFn: mockApi.getTodayRate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useInvoices = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => mockApi.getInvoices(filters),
  })
}

export const useImportInvoices = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: mockApi.importInvoices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
    },
  })
}

export const useCreateDecision = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: mockApi.createDecision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
    },
  })
}

export const useAuditItems = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => mockApi.getAuditItems(filters),
  })
}

export const useExplainInvoice = () => {
  return useMutation({
    mutationFn: mockApi.explainInvoice,
  })
}

export const usePickTopDiscounts = () => {
  return useMutation({
    mutationFn: mockApi.pickTopDiscounts,
  })
}
