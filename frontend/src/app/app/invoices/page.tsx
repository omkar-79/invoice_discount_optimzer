"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowUpDown
} from "lucide-react";
import { useInvoices, useCreateDecision } from "@/hooks/use-api";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { RECOMMENDATION_COLORS } from "@/lib/constants";
import { copy } from "@/lib/i18n";
import { useAuth } from "@/contexts/auth-context";

// Helper function to parse discount percentage from terms
const parseDiscountPercentage = (terms: string): number => {
  // Handle formats like "2/10 net 30" - extract the first number as discount percentage
  const match = terms.match(/(\d+)\/\d+/);
  return match ? parseInt(match[1]) : 0;
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"vendor" | "amount" | "deadline">("deadline");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const { user, token } = useAuth();
  const { data: invoicesData, isLoading, error } = useInvoices({
    status: statusFilter !== "all" ? statusFilter : undefined,
  });
  const createDecisionMutation = useCreateDecision();

  const invoices = invoicesData?.items || [];

  // Debug logging
  console.log('InvoicesPage - user:', user);
  console.log('InvoicesPage - token:', token);
  console.log('InvoicesPage - invoicesData:', invoicesData);
  console.log('InvoicesPage - isLoading:', isLoading);
  console.log('InvoicesPage - error:', error);
  console.log('InvoicesPage - invoices:', invoices);

  // Apply frontend-side filtering
  const filteredInvoices = [...invoices]
    .filter(invoice => {
      // Vendor search
      if (searchTerm && !invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Recommendation filter
      if (recommendationFilter !== "all" && invoice.recommendation !== recommendationFilter) {
        return false;
      }
      
      
      return true;
    })
    .sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "vendor":
        comparison = a.vendor.localeCompare(b.vendor);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "deadline":
        const aDate = a.discountDeadline ? new Date(a.discountDeadline).getTime() : 0;
        const bDate = b.discountDeadline ? new Date(b.discountDeadline).getTime() : 0;
        comparison = aDate - bDate;
        break;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "DISMISSED":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "DISMISSED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  const handleApprove = async () => {
    if (!selectedInvoice) return;
    
    try {
      const invoice = invoices.find(inv => inv.id === selectedInvoice);
      if (!invoice) return;

      const action = invoice.recommendation === "TAKE" ? "APPROVE_TAKE" : "APPROVE_HOLD";
      
      await createDecisionMutation.mutateAsync({
        invoiceIds: [selectedInvoice],
        action: action as any,
        note: `Approved ${invoice.recommendation} recommendation for ${invoice.vendor}`
      });
      
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Failed to approve invoice:', error);
    }
  };

  const handleDismiss = async () => {
    if (!selectedInvoice) return;
    
    try {
      await createDecisionMutation.mutateAsync({
        invoiceIds: [selectedInvoice],
        action: "DISMISS" as any,
        note: `Dismissed invoice from ${invoices.find(inv => inv.id === selectedInvoice)?.vendor}`
      });
      
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Failed to dismiss invoice:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-yellow-500 mb-4">
            <Clock className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground mb-4">
            Please log in to view your invoices.
          </p>
          <Button onClick={() => window.location.href = '/auth/sign-in'} variant="default">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <XCircle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium mb-2">Error loading invoices</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || 'Failed to fetch invoices'}
          </p>
          <Button onClick={() => window.location.reload()} variant="destructive">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{copy.invoices.title}</h1>
          <p className="text-muted-foreground">
            View and manage all your invoices
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DISMISSED">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recommendation</label>
              <Select value={recommendationFilter} onValueChange={setRecommendationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="TAKE">Take Discount</SelectItem>
                  <SelectItem value="HOLD">Hold Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Sort by:</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="deadline">Discount Deadline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="btn-outline-gray"
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                {sortOrder === "asc" ? "Ascending" : "Descending"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-muted-foreground">
                Try adjusting your filters or upload some invoices to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4 font-medium">Vendor</th>
                    <th className="text-left p-4 font-medium">Invoice #</th>
                    <th className="text-right p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Terms</th>
                    <th className="text-left p-4 font-medium">Deadline</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Recommendation</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    
                    return (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{invoice.vendor}</div>
                          {invoice.notes && (
                            <div className="text-sm text-muted-foreground">{invoice.notes}</div>
                          )}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="p-4 text-right font-medium">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{invoice.terms}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{formatDate(invoice.discountDeadline)}</span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <Badge 
                              variant="outline" 
                              className={getStatusColor(invoice.status)}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4">
                          {invoice.recommendation === 'TAKE' && (
                            <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                              <div className="flex items-center mb-1">
                                <span className="text-lg mr-2">💰</span>
                                <div className="font-medium text-sm text-green-800">Pay Early</div>
                              </div>
                              <div className="text-sm font-bold text-green-600">
                                Save: {formatCurrency(invoice.amount * (parseDiscountPercentage(invoice.terms) / 100))}
                              </div>
                            </div>
                          )}

                          {invoice.recommendation === 'BORROW' && (
                            <div className="p-3 rounded-lg border border-orange-200 bg-orange-50">
                              <div className="flex items-center mb-1">
                                <span className="text-lg mr-2">💳</span>
                                <div className="font-medium text-sm text-orange-800">Borrow to Pay Early</div>
                              </div>
                              <div className="text-sm font-bold text-orange-600">
                                Net: {formatCurrency((invoice.amount * (parseDiscountPercentage(invoice.terms) / 100)) - (invoice.borrowingCost || 0))}
                              </div>
                            </div>
                          )}

                          {invoice.recommendation === 'HOLD' && (
                            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                              <div className="flex items-center mb-1">
                                <span className="text-lg mr-2">📈</span>
                                <div className="font-medium text-sm text-blue-800">Hold Cash</div>
                              </div>
                              {invoice.rateType === 'INVESTMENT' && invoice.investmentReturn ? (
                                <div className="text-sm font-bold text-blue-600">
                                  Earn: {formatCurrency(invoice.investmentReturn)}
                                </div>
                              ) : (
                                <div className="text-sm text-blue-600">
                                  Pay on due date
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="btn-ghost-blue"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Detail Drawer */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border shadow-lg">
            <CardHeader className="bg-white dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <CardTitle>Invoice Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="bg-white dark:bg-gray-900">
              {(() => {
                const invoice = invoices.find(inv => inv.id === selectedInvoice);
                if (!invoice) return null;
                
                return (
                  <div className="space-y-6 text-gray-900 dark:text-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                        <p className="text-lg font-medium">{invoice.vendor}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Invoice Number</label>
                        <p className="text-lg font-medium">{invoice.invoiceNumber}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Amount</label>
                        <p className="text-lg font-medium">{formatCurrency(invoice.amount)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Terms</label>
                        <p className="text-lg font-medium">{invoice.terms}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Invoice Date</label>
                        <p className="text-lg font-medium">{formatDate(invoice.invoiceDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                        <p className="text-lg font-medium">{formatDate(invoice.dueDate)}</p>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium mb-4">Calculation Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Benchmark Rate:</span>
                          <span className="font-medium">5.1%</span>
                        </div>
                        <div className="space-y-3">
                          <div className="font-medium">Recommended Action:</div>
                          
                          {invoice.recommendation === 'TAKE' && (
                            <div className="p-4 rounded-lg border border-green-200 bg-green-50">
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
                            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
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
                            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
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
                          
                          <div className="text-sm text-muted-foreground">
                            {invoice.reason}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex space-x-4">
                        <Button 
                          onClick={handleApprove}
                          disabled={createDecisionMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          {createDecisionMutation.isPending ? "Processing..." : "Approve"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={handleDismiss}
                          disabled={createDecisionMutation.isPending}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          {createDecisionMutation.isPending ? "Processing..." : "Dismiss"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
