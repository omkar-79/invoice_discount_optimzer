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
  AuditFilters,
  UserSettings,
  ProfileData,
  PasswordChangeData
} from "@/lib/types"

// API base URL configuration - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api"

/**
 * Helper function to get authentication headers for API requests
 * Retrieves JWT token from localStorage and formats Authorization header
 * @returns Object with Authorization header or empty object if no token
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

/**
 * API functions for communicating with the backend
 * All functions include proper error handling and type safety
 */
const api = {
  // ===== RATES API =====
  /**
   * Fetches today's benchmark interest rate
   * Used for comparison with invoice discount rates
   */
  getTodayRate: async (): Promise<Rate> => {
    const response = await fetch(`${API_BASE_URL}/rates/today`)
    if (!response.ok) throw new Error('Failed to fetch rate')
    return response.json()
  },

  // ===== INVOICES API =====
  /**
   * Fetches paginated list of invoices with optional filtering
   * Supports status filtering, pagination, and search
   */
  getInvoices: async (filters?: DashboardFilters): Promise<InvoiceResponse> => {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.cursor) params.append('cursor', filters.cursor)
    
    const response = await fetch(`${API_BASE_URL}/invoices?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch invoices')
    return response.json()
  },

  importInvoices: async (formData: FormData): Promise<{ imported: number; skipped: number }> => {
    // Note: Do NOT set Content-Type for FormData; browser will set multipart boundary
    const response = await fetch(`${API_BASE_URL}/invoices/import`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      // Surface status and server message to help debug 500s in prod
      throw new Error(`Failed to import invoices (status ${response.status}): ${errorText}`)
    }
    return response.json()
  },

  // Decisions
  createDecision: async (decision: Decision): Promise<DecisionResponse> => {
    const response = await fetch(`${API_BASE_URL}/decisions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(decision),
    })
    if (!response.ok) throw new Error('Failed to create decision')
    return response.json()
  },

  // Audit
  getAuditItems: async (filters?: AuditFilters): Promise<AuditResponse> => {
    const params = new URLSearchParams()
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)

    const response = await fetch(`${API_BASE_URL}/decisions/audit?${params}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch audit items')
    return response.json()
  },

  // Chat
  explainInvoice: async (invoiceId: string): Promise<ChatExplainResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat/explain-invoice`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ invoiceId }),
    })
    if (!response.ok) throw new Error('Failed to explain invoice')
    return response.json()
  },

          pickTopDiscounts: async (budget: number): Promise<ChatPickTopResponse> => {
            const response = await fetch(`${API_BASE_URL}/chat/pick-top-discounts`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
              },
              body: JSON.stringify({ budget }),
            })
            if (!response.ok) throw new Error('Failed to pick top discounts')
            return response.json()
          },

          // Update recommendations based on today's date
          updateRecommendations: async (): Promise<{ updated: number }> => {
            const response = await fetch(`${API_BASE_URL}/invoices/update-recommendations`, {
              method: 'POST',
              headers: getAuthHeaders(),
            })
            if (!response.ok) throw new Error('Failed to update recommendations')
            return response.json()
          },

          // Update invoice rate
          updateInvoiceRate: async (invoiceId: string, data: { 
            userRate: number; 
            rateType: 'INVESTMENT' | 'BORROWING' 
          }): Promise<Invoice> => {
            const response = await fetch(`${API_BASE_URL}/invoices/${invoiceId}/rate`, {
              method: 'PATCH',
              headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            })
            if (!response.ok) throw new Error('Failed to update invoice rate')
            return response.json()
          },

  // Settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch settings')
    return response.json()
  },

  updateSettings: async (data: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update settings')
    return response.json()
  },

  updateProfile: async (data: ProfileData): Promise<ProfileData> => {
    const response = await fetch(`${API_BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to update profile')
    return response.json()
  },

  changePassword: async (data: PasswordChangeData): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/settings/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to change password')
  },

  // Analytics
  getSavingsTracker: async (): Promise<Array<{ month: string; savings: number }>> => {
    const response = await fetch(`${API_BASE_URL}/analytics/savings-tracker`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch savings tracker data')
    return response.json()
  },

  getCashPlan: async (): Promise<Array<{ week: string; take: number; hold: number }>> => {
    const response = await fetch(`${API_BASE_URL}/analytics/cash-plan`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch cash plan data')
    return response.json()
  },

  getDashboardStats: async (): Promise<{ totalSavings: number; totalDecisions: number; thisMonthSavings: number }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard-stats`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error('Failed to fetch dashboard stats')
    return response.json()
  },
}

// React Query hooks
export const useTodayRate = () => {
  return useQuery({
    queryKey: ["rates", "today"],
    queryFn: api.getTodayRate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useInvoices = (filters?: DashboardFilters) => {
  return useQuery({
    queryKey: ["invoices", filters],
    queryFn: () => api.getInvoices(filters),
  })
}

export const useImportInvoices = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.importInvoices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      // Also refresh analytics that depend on invoices/decisions
      queryClient.invalidateQueries({ queryKey: ["analytics", "savings-tracker"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "cash-plan"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard-stats"] })
    },
  })
}

export const useCreateDecision = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createDecision,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      queryClient.invalidateQueries({ queryKey: ["audit"] })
      // Refresh analytics after a decision changes savings and cash plan
      queryClient.invalidateQueries({ queryKey: ["analytics", "savings-tracker"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "cash-plan"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard-stats"] })
    },
  })
}

export const useAuditItems = (filters?: AuditFilters) => {
  return useQuery({
    queryKey: ["audit", filters],
    queryFn: () => api.getAuditItems(filters),
  })
}

export const useExplainInvoice = () => {
  return useMutation({
    mutationFn: api.explainInvoice,
  })
}

export const usePickTopDiscounts = () => {
  return useMutation({
    mutationFn: api.pickTopDiscounts,
  })
}

export const useUpdateRecommendations = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateRecommendations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      // Updating recommendations may affect analytics aggregates
      queryClient.invalidateQueries({ queryKey: ["analytics", "savings-tracker"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "cash-plan"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard-stats"] })
    },
  })
}

export const useUpdateInvoiceRate = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { userRate: number; rateType: 'INVESTMENT' | 'BORROWING' } 
    }) => api.updateInvoiceRate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] })
      // Updating rates may affect analytics aggregates
      queryClient.invalidateQueries({ queryKey: ["analytics", "savings-tracker"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "cash-plan"] })
      queryClient.invalidateQueries({ queryKey: ["analytics", "dashboard-stats"] })
    },
  })
}

// Settings hooks
export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: api.getSettings,
  })
}

export const useUpdateSettings = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
  })
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: api.changePassword,
  })
}

// Analytics hooks
export const useSavingsTracker = () => {
  return useQuery({
    queryKey: ["analytics", "savings-tracker"],
    queryFn: api.getSavingsTracker,
  })
}

export const useCashPlan = () => {
  return useQuery({
    queryKey: ["analytics", "cash-plan"],
    queryFn: api.getCashPlan,
  })
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["analytics", "dashboard-stats"],
    queryFn: api.getDashboardStats,
  })
}
