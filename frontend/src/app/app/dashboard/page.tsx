"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle,
  Upload,
  Filter,
  Download,
  ArrowUpDown,
  Search
} from "lucide-react";
import { useInvoices, useTodayRate, useUpdateRecommendations, useSavingsTracker, useCashPlan, useDashboardStats } from "@/hooks/use-api";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { RECOMMENDATION_COLORS } from "@/lib/constants";
import { copy } from "@/lib/i18n";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

/**
 * Helper function to parse discount percentage from invoice terms
 * Handles formats like "2/10 net 30" and extracts the discount percentage
 * @param terms - Invoice terms string (e.g., "2/10 net 30")
 * @returns Discount percentage as number
 */
const parseDiscountPercentage = (terms: string): number => {
  // Handle formats like "2/10 net 30" - extract the first number as discount percentage
  const match = terms.match(/(\d+)\/\d+/);
  return match ? parseInt(match[1]) : 0;
};

/**
 * Dashboard Page Component
 * 
 * Main dashboard displaying:
 * - Action queue with invoice recommendations
 * - Savings tracker with historical data
 * - Cash plan with weekly projections
 * - Analytics charts and statistics
 * 
 * Features:
 * - Real-time data fetching with React Query
 * - Interactive invoice selection and actions
 * - Search and filtering capabilities
 * - Responsive design for all screen sizes
 */
export default function DashboardPage() {
  // State management for UI interactions
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"apr" | "deadline">("apr");
  const router = useRouter();
  
  const { data: rateData, isLoading: rateLoading } = useTodayRate();
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices();
  const { data: savingsData, isLoading: savingsLoading } = useSavingsTracker();
  const { data: cashPlanData, isLoading: cashPlanLoading } = useCashPlan();
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats();
  const updateRecommendationsMutation = useUpdateRecommendations();

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const selectAllInvoices = () => {
    if (invoicesData?.items) {
      setSelectedInvoices(invoicesData.items.map(inv => inv.id));
    }
  };

  const handleUploadClick = () => {
    router.push('/app/upload');
  };

  const clearSelection = () => {
    setSelectedInvoices([]);
  };

  const handleUpdateRecommendations = async () => {
    try {
      await updateRecommendationsMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to update recommendations:', error);
    }
  };

  const filteredInvoices = invoicesData?.items?.filter(invoice => {
    // Only show pending invoices
    if (invoice.status !== 'PENDING') return false;
    
    // Apply search filter
    if (searchTerm) {
      return invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
             invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  }) || [];

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === "apr") {
      return b.impliedAprPct - a.impliedAprPct;
    } else {
      // Handle null discountDeadline values
      const aDate = a.discountDeadline ? new Date(a.discountDeadline).getTime() : 0;
      const bDate = b.discountDeadline ? new Date(b.discountDeadline).getTime() : 0;
      return aDate - bDate;
    }
  });

  const totalSavings = selectedInvoices.reduce((sum, id) => {
    const invoice = invoicesData?.items?.find(inv => inv.id === id);
    return sum + ((invoice?.amount || 0) * 0.02); // 2% discount
  }, 0);

  // Use real data from API, fallback to empty arrays if loading
  const displaySavingsData = savingsData || [];
  const displayCashPlanData = cashPlanData || [];

  if (invoicesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
            <div className="space-y-6">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{copy.dashboard.title}</h1>
          <p className="text-muted-foreground">
            Review and approve invoice discount opportunities
          </p>
          <p className="text-sm text-muted-foreground">
            Today: {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleUpdateRecommendations}
            disabled={updateRecommendationsMutation.isPending}
            variant="outline"
          >
            <Clock className="mr-2 h-4 w-4" />
            {updateRecommendationsMutation.isPending ? "Updating..." : "Update for Today"}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Action Queue */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{copy.dashboard.actionQueue.title}</CardTitle>
                  <CardDescription>
                    {filteredInvoices.length} pending invoice{filteredInvoices.length !== 1 ? 's' : ''} requiring action
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortBy(sortBy === "apr" ? "deadline" : "apr")}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Sort by {sortBy === "apr" ? "APR" : "Deadline"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No pending invoices</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try adjusting your search terms" : "All invoices have been processed or upload a CSV to get started"}
                  </p>
                  <Button onClick={handleUploadClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload CSV
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selection controls */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllInvoices}
                      >
                        Select All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Clear Selection
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {selectedInvoices.length} selected
                      </span>
                    </div>
                    {selectedInvoices.length > 0 && (
                      <Button>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Selected ({formatCurrency(totalSavings)})
                      </Button>
                    )}
                  </div>

                  {/* Invoice list */}
                  {sortedInvoices.map((invoice) => {
                    const isSelected = selectedInvoices.includes(invoice.id);
                    
                    return (
                      <div
                        key={invoice.id}
                        className={`
                          border rounded-lg transition-colors
                          ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'}
                        `}
                      >
                        {/* Invoice Header */}
                        <div className="flex items-center space-x-4 p-4 border-b">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleInvoiceSelection(invoice.id)}
                            className="h-4 w-4"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{invoice.vendor}</div>
                              <div className="text-lg font-bold">{formatCurrency(invoice.amount)}</div>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                              <span>{invoice.terms}</span>
                              <span>•</span>
                              <span>Due {formatDate(invoice.dueDate)}</span>
                              {invoice.userRate && (
                                <>
                                  <span>•</span>
                                  <span>{invoice.rateType} @ {formatPercentage(invoice.userRate)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{formatPercentage(invoice.impliedAprPct)}</div>
                            <Badge 
                              variant="outline" 
                              className={RECOMMENDATION_COLORS[invoice.recommendation]}
                            >
                              {invoice.recommendation}
                            </Badge>
                          </div>
                        </div>

                        {/* Recommended Action - Show only what user should do */}
                        <div className="p-4">
                          {invoice.recommendation === 'TAKE' && (
                            <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">💰</span>
                                <div className="font-medium text-lg text-green-800">Pay Early</div>
                              </div>
                              <div className="text-xl font-bold text-green-600 mb-2">
                                Save: {formatCurrency(invoice.amount * (parseDiscountPercentage(invoice.terms) / 100))}
                              </div>
                              <div className="text-sm text-green-700">
                                Use your own cash to get the discount
                              </div>
                            </div>
                          )}

                          {invoice.recommendation === 'BORROW' && (
                            <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">💳</span>
                                <div className="font-medium text-lg text-orange-800">Borrow to Pay Early</div>
                              </div>
                              <div className="text-xl font-bold text-orange-600 mb-2">
                                Net Benefit: {formatCurrency((invoice.amount * (parseDiscountPercentage(invoice.terms) / 100)) - (invoice.borrowingCost || 0))}
                              </div>
                              <div className="text-sm text-orange-700">
                                Borrow money to get the discount
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                Cost: {formatCurrency(invoice.borrowingCost || 0)} | Save: {formatCurrency(invoice.amount * (parseDiscountPercentage(invoice.terms) / 100))}
                              </div>
                            </div>
                          )}

                          {invoice.recommendation === 'HOLD' && (
                            <div className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50">
                              <div className="flex items-center mb-2">
                                <span className="text-2xl mr-2">📈</span>
                                <div className="font-medium text-lg text-blue-800">Hold Cash</div>
                              </div>
                              {invoice.rateType === 'INVESTMENT' && invoice.investmentReturn ? (
                                <>
                                  <div className="text-xl font-bold text-blue-600 mb-2">
                                    Earn: {formatCurrency(invoice.investmentReturn)}
                                  </div>
                                  <div className="text-sm text-blue-700">
                                    Invest your cash elsewhere for better returns
                                  </div>
                                  <div className="text-xs text-gray-600 mt-1">
                                    Rate: {formatPercentage(invoice.userRate || 0)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-xl font-bold text-blue-600 mb-2">
                                    Pay on Due Date
                                  </div>
                                  <div className="text-sm text-blue-700">
                                    No discount available or not worth taking
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          {/* Recommendation Highlight */}
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">Recommendation: {invoice.recommendation}</div>
                              <div className="text-sm text-gray-600 mt-1">{invoice.reason}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Savings Tracker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                {copy.dashboard.savings.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-emerald-600">
                  {savingsLoading ? (
                    <div className="animate-pulse bg-muted h-8 w-24 mx-auto rounded"></div>
                  ) : (
                    formatCurrency(dashboardStats?.thisMonthSavings || 0)
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {copy.dashboard.savings.thisMonth}
                </div>
              </div>
              <div className="h-32">
                {savingsLoading ? (
                  <div className="animate-pulse bg-muted h-full rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={displaySavingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Savings']} />
                      <Line 
                        type="monotone" 
                        dataKey="savings" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={{ fill: '#10b981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cash Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {copy.dashboard.cashPlan.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                {cashPlanLoading ? (
                  <div className="animate-pulse bg-muted h-full rounded"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={displayCashPlanData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
                      <Bar dataKey="take" stackId="a" fill="#10b981" name="Take Discount" />
                      <Bar dataKey="hold" stackId="a" fill="#6b7280" name="Hold Cash" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
