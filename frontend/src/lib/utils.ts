import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "N/A"
  
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "Invalid Date"
  
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "N/A"
  
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "Invalid Date"
  
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function calculateDaysUntil(date: string | Date | null | undefined): number {
  if (!date) return 0
  
  const target = typeof date === "string" ? new Date(date) : date
  if (isNaN(target.getTime())) return 0
  
  // Get today's date in local timezone
  const today = new Date()
  const todayYear = today.getFullYear()
  const todayMonth = today.getMonth()
  const todayDate = today.getDate()
  const todayStart = new Date(todayYear, todayMonth, todayDate)
  
  // Get deadline date in local timezone
  const deadlineYear = target.getFullYear()
  const deadlineMonth = target.getMonth()
  const deadlineDate = target.getDate()
  const deadlineStart = new Date(deadlineYear, deadlineMonth, deadlineDate)
  
  const diffTime = deadlineStart.getTime() - todayStart.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function getDeadlineStatus(daysUntil: number): "urgent" | "warning" | "normal" | "no-discount" | "expired" {
  if (daysUntil < 0) return "expired"
  if (daysUntil === 0) return "no-discount"
  if (daysUntil <= 3) return "urgent"
  if (daysUntil <= 7) return "warning"
  return "normal"
}
