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
import { useInvoices } from "@/hooks/use-api";
import { formatCurrency, formatPercentage, formatDate, calculateDaysUntil, getDeadlineStatus } from "@/lib/utils";
import { RECOMMENDATION_COLORS, DEADLINE_STATUS } from "@/lib/constants";
import { copy } from "@/lib/i18n";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recommendationFilter, setRecommendationFilter] = useState<string>("all");
  const [minAprFilter, setMinAprFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"vendor" | "amount" | "deadline" | "apr">("apr");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const { data: invoicesData, isLoading } = useInvoices({
    vendor: searchTerm || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    recommendation: recommendationFilter !== "all" ? recommendationFilter : undefined,
    minApr: minAprFilter ? parseFloat(minAprFilter) : undefined,
  });

  const invoices = invoicesData?.items || [];

  const filteredInvoices = [...invoices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "vendor":
        comparison = a.vendor.localeCompare(b.vendor);
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
      case "deadline":
        comparison = new Date(a.discountDeadline).getTime() - new Date(b.discountDeadline).getTime();
        break;
      case "apr":
        comparison = a.impliedAprPct - b.impliedAprPct;
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Min APR (%)</label>
              <Input
                type="number"
                placeholder="0"
                value={minAprFilter}
                onChange={(e) => setMinAprFilter(e.target.value)}
              />
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
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="apr">APR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
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
                    <th className="text-right p-4 font-medium">APR</th>
                    <th className="text-center p-4 font-medium">Status</th>
                    <th className="text-center p-4 font-medium">Recommendation</th>
                    <th className="text-center p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const daysUntil = calculateDaysUntil(invoice.discountDeadline);
                    const deadlineStatus = getDeadlineStatus(daysUntil);
                    
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
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{formatDate(invoice.discountDeadline)}</span>
                            <Badge 
                              variant="outline" 
                              className={DEADLINE_STATUS[deadlineStatus]}
                            >
                              {daysUntil}d
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <span className="font-medium">
                            {formatPercentage(invoice.impliedAprPct)}
                          </span>
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
                        <td className="p-4 text-center">
                          <Badge 
                            variant="outline" 
                            className={RECOMMENDATION_COLORS[invoice.recommendation]}
                          >
                            {invoice.recommendation}
                          </Badge>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(invoice.id)}
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
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
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
            <CardContent>
              {(() => {
                const invoice = invoices.find(inv => inv.id === selectedInvoice);
                if (!invoice) return null;
                
                return (
                  <div className="space-y-6">
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
                          <span>Implied APR:</span>
                          <span className="font-medium">{formatPercentage(invoice.impliedAprPct)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Benchmark Rate:</span>
                          <span className="font-medium">5.1%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recommendation:</span>
                          <Badge 
                            variant="outline" 
                            className={RECOMMENDATION_COLORS[invoice.recommendation]}
                          >
                            {invoice.recommendation}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.reason}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <div className="flex space-x-4">
                        <Button>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button variant="outline">
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
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
